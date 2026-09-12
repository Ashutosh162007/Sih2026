# Sahayog AI Engine — Design & Architecture Documentation

## 1. Executive Summary & Objective

The **Sahayog AI Engine** (`AI/restructure_complain.py` and `AI/app.py`) is the core intelligent reasoning layer of the Sahayog civic platform. Its primary mission is to bridge the gap between unstructured, colloquial grassroots citizen complaints and rigorous, research-grade engineering problem statements.

When citizens in Jharkhand report civic, environmental, or infrastructural failures, their input is often emotionally charged, localized, or loosely phrased. The AI Engine performs three essential functions:
1. **Automated Moderation & Scale Filtering:** Eliminates spam, random keyboard mashing, obscenities, and trivial non-civic personal issues.
2. **Standardized Academic Problem Formulation:** Translates unstructured citizen narratives into structured multidisciplinary problem formulations tailored for university faculty, student researchers, and municipal stakeholders.
3. **Multi-Factor Risk & Severity Scoring:** Computes objective numerical severity indices (public risk, urgency, environmental/hydrological hazards) to prioritize platform triage and assist CSR/industry partners in capital allocation.

---

## 2. Architecture & Design Principles

```
+--------------------------------------------------------------------------------------------------+
|                                  Sahayog Platform Integration                                    |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   +-------------------+          +--------------------+          +---------------------------+   |
|   |   Citizen User    |  ----->  |  Frontend (React)  |  ----->  |   Backend (Express/Node)  |   |
|   +-------------------+          +--------------------+          +-------------+-------------+   |
|                                                                                |                 |
|                                                                                v                 |
|                                                                  +---------------------------+   |
|                                                                  |  FastAPI AI Microservice  |   |
|                                                                  |         (app.py)          |   |
|                                                                  +-------------+-------------+   |
|                                                                                |                 |
+--------------------------------------------------------------------------------|-----------------+
                                                                                 v
+--------------------------------------------------------------------------------------------------+
|                           AI Engine Core (restructure_complain.py)                               |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   +------------------------------------+         +-------------------------------------------+   |
|   |  1. Input Ingestion & Sanitation   | ------> | 2. Model Initialization (Singleton LLM)   |   |
|   |  - Query / Title / Location / User |         | - ChatNVIDIA / ChatOpenAI (Llama-3.3-70B) |   |
|   +------------------------------------+         +---------------------+---------------------+   |
|                                                                        |                         |
|                                                                        v                         |
|   +------------------------------------+         +-------------------------------------------+   |
|   |  4. Execution & Parsing            | <------ | 3. Dual-Phase Prompt Engineering          |   |
|   |  - Robust Regex / JSON recovery    |         | - Phase 1: Moderation / Legitimacy Filter |   |
|   |  - Schema Validation               |         | - Phase 2: Structured Research Statement  |   |
|   +-----------------+------------------+         +-------------------------------------------+   |
|                     |                                                                            |
|        [Success]    |    [Exception / Offline / Missing Key]                                     |
|                     +----------------------------------+                                         |
|                     |                                  v                                         |
|                     v                   +--------------------------------------------+           |
|   +----------------------------------+  | 5. Deterministic Fallback NLP Engine       |           |
|   | Standardized Output JSON Object  |  | - Keyword domain classification (10 cats)  |           |
|   | - Legitimacy Status              |  | - Heuristic multi-factor severity calculus |           |
|   | - 4-Section Problem Statement    |  | - Template-driven Markdown formulation     |           |
|   | - Severity & Priority Metrics    |  +---------------------+----------------------+           |
|   | - University Routing / Dept      |                        |                                  |
|   +-----------------+----------------+                        |                                  |
|                     |                                         |                                  |
|                     +<----------------------------------------+                                  |
|                     v                                                                            |
|   +------------------------------------------------------------------------------------------+   |
|   | Response back to Backend -> Saved in MongoDB `issues` collection -> University Dashboard |   |
+---+------------------------------------------------------------------------------------------+---+
```

### Key Design Tenets
- **Dual-Tier Processing Architecture:** Primary execution leverages state-of-the-art Large Language Models via NVIDIA NIM endpoints (`meta/llama-3.3-70b-instruct`). If the cloud model is unreachable, unauthenticated, or fails to parse, execution seamlessly falls back to a deterministic, zero-dependency local NLP engine without failing user requests.
- **Fail-Safe Robustness:** The engine guarantees a structured, compliant schema response regardless of network conditions, model timeouts, or malformed inputs.
- **Explainable Severity Calculus:** Severity is not a black-box number; it is broken down into constituent vectors (Public Risk, Urgency, Physical/Environmental Vulnerability) paired with explicit causal factor tags.
- **Strict Guardrailing & Scale Validation:** Submissions must clear strict semantic gates (rejecting gibberish, spam, and non-societal minor issues) before consuming compute or platform research resources.

---

## 3. Detailed Component Breakdown

### 3.1 LLM Client Initialization (`get_nvidia_llm`)

```python
def get_nvidia_llm():
    global _llm
    if _llm is not None:
        return _llm
    # Initializes ChatNVIDIA or ChatOpenAI pointing to https://integrate.api.nvidia.com/v1
```

- **Pattern:** Lazy-loaded singleton to eliminate redundant client handshakes and connection overhead across API requests.
- **Primary Provider:** `langchain_nvidia_ai_endpoints.ChatNVIDIA`.
- **Secondary Provider:** `langchain_openai.ChatOpenAI` configured with NVIDIA's OpenAI-compatible base URL (`https://integrate.api.nvidia.com/v1`).
- **Default Model:** `meta/llama-3.3-70b-instruct` (configurable via `NVIDIA_MODEL` environment variable).
- **Hyperparameters:**
  - `temperature: 0.2` (Low temperature minimizes hallucination, ensuring strict compliance with JSON structure and analytical tone).
  - `max_tokens: 1024` (Sufficient capacity for comprehensive Markdown problem statements and granular severity breakdowns).

---

### 3.2 System Prompt & Prompt Engineering

The system prompt (`SYSTEM_PROMPT`) guides the LLM through a deterministic 2-phase decision tree:

```
                          Incoming Complaint
                                  |
                                  v
                +------------------------------------+
                |  Phase 1: Evaluation & Filtering   |
                +------------------------------------+
                                  |
         +------------------------+------------------------+
         |                                                 |
[Failed Evaluation]                              [Passed Evaluation]
- Keyboard mash / gibberish                      - Genuine civic issue
- Trivial / minor personal issue                 - Meaningful societal scale
- Abusive / spam / fraudulent                              |
         |                                                 v
         v                               +------------------------------------+
+---------------------------------+      | Phase 2: Structured Formulation    |
| Rejection Schema:               |      +------------------------------------+
| {                               |                        |
|   "isLegitimate": false,        |                        v
|   "rejectionReason": "..."      |      +------------------------------------+
| }                               |      | Accepted Issue Schema:             |
+---------------------------------+      | - Primary & Secondary Category     |
                                         | - Priority & Severity Matrix       |
                                         | - Structured Complaint Formulation |
                                         | - 4-Section aiProblemStatement     |
                                         | - 1-Sentence Executive Summary     |
                                         | - Routing & University Department  |
                                         | - Location breakdown               |
                                         +------------------------------------+
```

#### Phase 1: Evaluation & Filtering Guardrails
The prompt instructs the model to actively reject:
- **Unintelligible / Keyboard Mashing:** e.g., `"adfdsafsfasf"`, `"afdafadafdasfdgadsg"`, `"djjnadlfkldfjslf"`.
- **Trivial / Minor Personal Matters:** Non-civic issues such as a lost pencil, domestic chores, or personal disputes that do not represent a community challenge.
- **Rejection Contract:**
  ```json
  {
    "isLegitimate": false,
    "rejectionReason": "Constructive, clear explanation of why this reported issue is invalid, unintelligible, or too trivial for community/institutional intervention."
  }
  ```

#### Phase 2: Standardized Research Formulation
For legitimate submissions, the prompt mandates structured extraction across 10 defined civic categories, multi-factor risk scores, and a standardized 4-section Markdown problem statement:

```markdown
**Structured Problem Formulation:**

**Context & Location:** Locality and District.

**Core Challenge:** Comprehensive formal description of the issue and societal impact.

**Severity Assessment:** Urgency and Public Risk evaluation.

**Recommended Innovation Objective:** Actionable engineering/scientific objective for university teams.
```

---

### 3.3 Main Ingestion Pipeline (`restructure_complaint`)

The primary function accepts dynamic input objects (Pydantic models, custom classes, or standard dictionaries) and executes the following workflow:

```
[Input Adapter] Extract user_id, user_name, title, description, district, block, landmark
       |
       v
[Query Normalization] Synthesize combined query: `${title}: ${description}`
       |
       v
[LLM Availability Check] Check `NVIDIA_API_KEY` and LLM instance
       |
       +------------------------------------+
       | (Missing / Unavailable)            | (Configured & Available)
       v                                    v
[Call _fallback_restructure]         [Construct HumanMessage Payload]
       |                                    |
       |                                    v
       |                             [Invoke LLM (SystemMessage + HumanMessage)]
       |                                    |
       |                                    v
       |                             [Robust JSON Sanitization & Extraction]
       |                               - Match Markdown ```json blocks
       |                               - Find outer brace boundaries { ... }
       |                               - Parse with json.loads()
       |                                    |
       |            +-----------------------+-----------------------+
       |            | (Parse Success)                               | (Exception / Error)
       |            v                                               v
       |     [Return Parsed JSON]                            [Log error to stderr &
       |            |                                         call _fallback_restructure]
       |            |                                               |
       +----------->+<----------------------------------------------+
                    |
                    v
             [Final Response]
```

#### Robust JSON Parsing Logic
To prevent failures from LLMs that prepend introductory text or wrap outputs in markdown backticks, `restructure_complain.py` applies a three-stage sanitization ladder:
1. **Regex Fence Extraction:** `re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)`
2. **Boundary Trimming:** Direct detection of starting `{` and trailing `}`.
3. **Substring Locator:** Finds the first `{` index and last `}` index in the raw string.

---

### 3.4 Deterministic Fallback Engine (`_fallback_restructure`)

When cloud LLM services are inaccessible, the engine uses a rule-based Natural Language Processing module. This guarantees **zero downtime** and deterministic behavior.

#### 1. Category Classification Mapping (10 Civic Domains)
The fallback engine matches complaint keywords against pre-indexed domain dictionaries:

| Domain | Key Indicator Terms | Target HEI Department |
|---|---|---|
| **Water & Sanitation** | `water`, `drain`, `borewell`, `fluoride`, `contamination`, `pipeline`, `leakage`, `sewage`, `drinking` | Civil & Environmental Engineering |
| **Waste Management** | `garbage`, `dump`, `trash`, `plastic`, `waste`, `landfill`, `litter`, `compost` | Environmental Engineering |
| **Infrastructure** | `road`, `bridge`, `pothole`, `culvert`, `crack`, `collapse`, `footpath`, `pavement`, `drainage` | Civil & Structural Engineering |
| **Public Safety** | `light`, `dark`, `accident`, `women`, `school`, `hazard`, `cctv`, `danger`, `electrocution`, `safety` | Electrical & IoT Engineering / Urban Planning |
| **Agriculture** | `crop`, `farmer`, `storage`, `harvest`, `spoilage`, `irrigation`, `soil`, `pest`, `mandi` | Agricultural Engineering & Biotechnology |
| **Healthcare** | `hospital`, `clinic`, `medicine`, `doctor`, `disease`, `malaria`, `dengue`, `fluorosis`, `health` | Biomedical Engineering & Public Health |
| **Environment** | `pollution`, `dust`, `smoke`, `flyash`, `air`, `mining`, `forest`, `wildlife`, `tree` | Environmental Science & Mining Engineering |
| **Rural Livelihoods** | `artisan`, `tribal`, `weaving`, `handicraft`, `employment`, `shg`, `self help` | Rural Management & Industrial Design |
| **Education** | `school`, `college`, `hostel`, `teacher`, `classroom`, `books`, `student` | Educational Technology & Social Sciences |
| **Mobility** | `bus`, `transport`, `traffic`, `auto`, `roadway` | Transportation Engineering & Logistics |

#### 2. Composite Severity Scoring Formula
The fallback engine calculates risk vectors using heuristic triggers:

```
Urgency Score (U)       = Base(50) + AlertBoost(+25) + VulnerableGroupBoost(+15) [Clamped 20-96]
Public Risk Score (R)   = Base(45) + AlertBoost(+30) + VulnerableGroupBoost(+30) [Clamped 20-96]
Flooding/Hazard (F)     = Base(25) + WaterHydrologyBoost(+45)                    [Clamped 15-96]

Composite Score (S)     = round( (U * 0.40) + (R * 0.40) + (F * 0.20) )
```

- **Priority Classification:**
  - **High Priority:** `Composite Score >= 75`
  - **Medium Priority:** `50 <= Composite Score < 75`
  - **Low Priority:** `Composite Score < 50`

---

## 4. API & Microservice Specification (`AI/app.py`)

The AI engine is exposed as a high-performance **FastAPI** service with OpenAPI documentation at `/docs`.

### 4.1 Endpoints Summary

| Method | Endpoint | Description | Input Model | Output |
|---|---|---|---|---|
| `GET` | `/` | Service root & provider info | None | Service metadata |
| `GET` | `/api/ai/health` | Service health & API key status | None | Health status |
| `POST` | `/api/ai/restructure` | Full problem structuring & severity | `ComplaintInput` | Standardized structured issue |
| `POST` | `/api/ai/severity` | Multi-factor severity evaluation | `ComplaintInput` | `{ severity, priority }` |
| `POST` | `/api/ai/duplicate-check` | Semantic duplicate issue detection | `DuplicateCheckInput` | Duplicate match list & similarity scores |

---

### 4.2 Data Contracts

#### Request Payload (`ComplaintInput`)
```json
{
  "user_id": "u-12345",
  "user_name": "Citizen Reporter",
  "title": "Severe fluoride contamination in tubewell drinking water",
  "description": "The local tubewells in our block are delivering water with high fluoride levels. Multiple children and elderly people are developing dental and skeletal fluorosis. Immediate filtration intervention is required.",
  "category": "Water & Sanitation",
  "district": "Palamu",
  "block": "Daltonganj",
  "landmark": "Near Panchayat Bhawan"
}
```

#### Success Response (`POST /api/ai/restructure`)
```json
{
  "success": true,
  "isLegitimate": true,
  "primary_category": "Water & Sanitation",
  "secondary_category": "Healthcare",
  "priority": "High",
  "severity": {
    "score": 88,
    "publicRisk": 90,
    "urgency": 85,
    "flooding": 20,
    "factors": [
      "Toxic groundwater contamination with high chemical concentration",
      "Direct adverse public health outcomes in vulnerable demographic groups (children, elderly)",
      "Essential daily utility access compromise"
    ]
  },
  "structured_complaint": "Persistent fluoride contamination in community drinking tubewells in Daltonganj, Palamu, resulting in widespread fluorosis symptoms among residents.",
  "aiProblemStatement": "**Structured Problem Formulation:**\n\n**Context & Location:** Locality near Panchayat Bhawan, Daltonganj Block, Palamu District.\n\n**Core Challenge:** Ground water extraction points exhibit hazardous levels of dissolved fluoride minerals, leading to irreversible skeletal and dental fluorosis among community residents due to lack of localized adsorption filtration systems.\n\n**Severity Assessment:** High Priority (Score 88/100). Public Safety Risk: 90%, Urgency for Intervention: 85%.\n\n**Recommended Innovation Objective:** Design and deploy a low-cost, decentralized community defluoridation filtration unit utilizing locally available bio-adsorbent materials or activated alumina with solar-powered backwash capability.",
  "aiSummary": "AI identified high priority Water & Sanitation challenge in Daltonganj, Palamu with 88% severity score.",
  "routing": {
    "recipient_type": "UNIVERSITY",
    "recommended_department": "Environmental Science & Chemical Engineering"
  },
  "location": {
    "district": "Palamu",
    "block": "Daltonganj",
    "landmark": "Near Panchayat Bhawan"
  }
}
```

#### Rejection Response (`HTTP 400 Bad Request`)
```json
{
  "detail": "The AI model evaluated the submission and determined it contains unintelligible or random keyboard text. Please provide clear details about an actual community challenge."
}
```

---

## 5. End-to-End System Workflow

```
[1. Citizen Report]
    Citizen fills out title, description, location on React frontend.
    Optional: Real-time "AI Preview" button triggers instant restructuring.
            |
            v
[2. Express Backend Gate (aiService.js)]
    Backend routes the payload to:
    a) Direct NVIDIA NIM API call (if NVIDIA_API_KEY configured in Backend .env)
    b) FastAPI Microservice (if AI_SERVICE_URL configured)
    c) Local Node.js / Python Fallback Engine
            |
            v
[3. Issue Persistence (MongoDB)]
    Enriched document saved in `issues` collection with:
    - aiProblemStatement
    - aiSummary
    - severity metrics (score, publicRisk, urgency, flooding, factors)
    - priority & verified category
            |
            v
[4. Proximity & Department Matching]
    Backend calculates Haversine distance to registered universities.
    Matches recommended department against university faculty disciplines.
            |
            v
[5. University & Industry Action]
    - University: Views structured problem statement and claims issue.
    - Research Team: Submits multidisciplinary solution proposal based on AI innovation objectives.
    - Industry/CSR: Evaluates proposal severity score & risk factors to commit funding and set project milestones.
```

---

## 6. Environment Configuration & Setup

### Requirements (`AI/requirements.txt`)
- `fastapi`, `uvicorn`: High-performance asynchronous API framework.
- `langchain`, `langchain-core`, `langchain-nvidia-ai-endpoints`: NVIDIA NIM integration.
- `langchain-openai`: Fallback OpenAI-compatible endpoint client.
- `python-dotenv`: Environment configuration management.
- `pydantic`: Type safety and schema validation.

### Environment Variables (`AI/.env`)

| Variable | Type | Default Value | Description |
|---|---|---|---|
| `PORT` | Number | `8000` | Port for the FastAPI microservice |
| `NVIDIA_API_KEY` | String | *Required for LLM* | API Key from [NVIDIA NGC / Build](https://build.nvidia.com/) |
| `NVIDIA_MODEL` | String | `meta/llama-3.3-70b-instruct` | NVIDIA NIM model identifier |
| `MONGO_URI` | String | *Optional* | MongoDB connection string (if using direct scripts) |

### Starting the AI Service

```bash
# 1. Navigate to AI directory
cd AI

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your NVIDIA_API_KEY

# 5. Start the FastAPI development server
python3 app.py
# Or using uvicorn directly:
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The interactive OpenAPI documentation is accessible at `http://localhost:8000/docs`.
