# Sahayog — AI Design

## 1. Overview

Sahayog has **two complementary AI surfaces**:

1. **Backend heuristic engine** (`Backend/services/aiService.js`) — always available, no external
   keys, used by the running Express API to generate category, priority, and a composite severity
   score, plus a structured problem statement.
2. **Production LLM engine** (`AI/restructure_complain.py`) — a LangChain pipeline using Mistral
   to convert unstructured citizen text into a strict, database-ready JSON record with canonical
   classification, severity, location normalization, routing recommendation, missing-information
   detection, duplicate detection, and a confidence score.

The routing service (`Backend/services/routingService.js`) applies Haversine geodesic distance and
academic-discipline matching to rank the nearest, most relevant HEIs.

---

## 2. AI Goals

- Convert informal, multi-issue, local-language citizen text into **one canonical, structured
  problem record**.
- Objectively assess **severity/priority** so urgent issues surface first.
- **Normalize location** (district/block/lat/lng) for routing and analytics.
- Recommend an initial **recipient type** (university, industry, government, NGO, etc.).
- Detect **duplicates** and **missing information** to avoid wasted effort.
- Produce a **confidence score** so humans can spot low-confidence classifications.

---

## 3. Canonical Categories

The LLM is restricted to **10 canonical categories**:

`EDUCATION`, `AGRICULTURE`, `HEALTHCARE`, `WATER_RESOURCES`, `ENVIRONMENT`, `ENERGY`,
`URBAN_DEVELOPMENT`, `ACCESSIBILITY`, `PUBLIC_ADMINISTRATION`, `RURAL_LIVELIHOODS`.

Each has explicit examples in the system prompt. The model selects **one primary** and at most
**one secondary** category, and returns `null` when a secondary is unnecessary.

> The UI-facing set used by the Express backend is slightly different (Infrastructure,
> Water & Sanitation, Waste Management, Public Safety, Environment, Agriculture, Healthcare,
> Education, Rural Livelihoods, Mobility). The two sets must be unified in a future integration
> (see §7) so AI output maps cleanly to the UI and DB enums.

---

## 4. Severity Classification

Severity is one of `LOW | MEDIUM | HIGH | CRITICAL`, based on:
- **LOW:** minor, non-urgent, small scale.
- **MEDIUM:** noticeable group impact, not immediately dangerous.
- **HIGH:** significant impact on many, essential services affected, prolonged duration.
- **CRITICAL:** immediate threat to life/safety, major public-safety risk, or severe public-health/
  environmental emergency.

The prompt explicitly warns **not** to over-classify based on emotional language, and to flag
`needs_more_information` when data is insufficient.

**Backend composite scoring** (`aiService.js`): weights `urgency (40%) + publicRisk (40%) +
flooding/physical (20%)` into a `score` (0–100), with `priority` derived from thresholds and
keyword triggers.

---

## 5. Routing Model

- **Haversine formula** computes geodesic distance (km) between the issue and each HEI in a
  registry of prominent Jharkhand institutions (BIT Mesra, NIT Jamshedpur, IIT ISM Dhanbad, BAU
  Ranchi, Ranchi University, VBU Hazaribagh, Kolhan University, AIIMS Deoghar).
- **Scoring:** proximity (0–50) + district bonus (25) + discipline match (25) → `matchScore`.
- **LLM adds** a `routing.recipient_type` (UNIVERSITY/INDUSTRY/STARTUP/MSME/RESEARCH_INSTITUTION/
  GOVERNMENT_DEPARTMENT/LOCAL_BODY/NGO/MULTIPLE/UNKNOWN) and a `routing.recommended_department`.
- The prompt makes clear the **backend makes the final routing decision**; the LLM only recommends.

---

## 6. LLM Prompt & Output Contract

`AI/restructure_complain.py` builds a `SystemMessage` + `HumanMessage` and invokes
`ChatMistralAI(model="mistral-small-2506")`.

The model must return **valid JSON only** with this shape:

```json
{
  "primary_category": "ONE_ALLOWED_CATEGORY",
  "secondary_category": "ALLOWED_CATEGORY_OR_NULL",
  "severity": "LOW | MEDIUM | HIGH | CRITICAL",
  "structured_complaint": "Normalized professional statement",
  "original_complaint": "Original citizen text",
  "location": {
    "exact_location": null, "landmark": null, "village": null, "ward": null,
    "city": null, "district": null, "state": null, "pincode": null,
    "latitude": null, "longitude": null
  },
  "routing": {
    "recipient_type": "UNIVERSITY | INDUSTRY | ... | UNKNOWN",
    "recommended_department": "e.g. Water Management"
  },
  "affected_group": null,
  "duration": null,
  "evidence_available": { "photo": false, "video": false, "document": false },
  "missing_information": [],
  "needs_more_information": false,
  "duplicate_status": "NEW | POSSIBLE_DUPLICATE | DUPLICATE | UNKNOWN",
  "classification_confidence": 0.0
}
```

> **Note on current signature:** `restructure_complaint(data)` currently expects an object with
> `.user_id`, `.user_name`, `.complaint_query`. It should be adapted to also accept structured
> location/context fields when integrated with the Express backend (see §7).

---

## 7. Integration Roadmap (Node ↔ Python)

The two engines are not yet unified. Recommended approach:

1. Wrap `AI/restructure_complain.py` in a FastAPI endpoint (e.g., `POST /ai/structure`) in a new
   `AI/app.py` service (currently an empty stub) using `uvicorn`.
2. Expose it behind the AI keys configured in the backend environment
   (`GEMINI_API_KEY` / `AI_API_KEY`).
3. Add a provider abstraction in `Backend/services/aiService.js`:
   - **LLM mode** — call the Python service; map its canonical categories → UI categories.
   - **Fallback mode** — use the current keyword/heuristic logic when the AI service is
     unreachable or keys are absent.
4. Persist LLM fields (canonical `secondary_category`, `recommended_department`,
   `duplicate_status`, `classification_confidence`, `missing_information`) on the `Issue` model.
5. Unify the category vocabulary across `restructure_complain.py`, `aiService.js`, the `Issue`
   enum, and the frontend so the story holds end-to-end.

---

## 8. AI Dependencies & Environment

- `AI/requirements.txt`: langchain-core, langchain-openai, langchain-google-genai,
  langchain-groq, langchain-mistralai, langgraph, fastapi, uvicorn, faiss-cpu, tiktoken.
- Models referenced: `ChatMistralAI("mistral-small-2506")`; `ChatGroq` is imported (for future
  provider fallback) but not yet used.
- Keys are read from `.env` via `load_dotenv()` and must map to the backend env variables when
  integrated.
