# Sahayog (सहयोग) — Societal Innovation Collaboration Platform

<div align="center">

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange.svg?style=for-the-badge&logo=target)](https://www.sih.gov.in/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%207%20%7C%20Tailwind%204-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%204-339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/AI%20Microservice-FastAPI%20%7C%20LangChain-009688.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![NVIDIA NIM](https://img.shields.io/badge/AI%20Engine-NVIDIA%20NIM%20%7C%20Llama%203.3%20%2F%20Nemotron-76B900.svg?style=for-the-badge&logo=nvidia&logoColor=white)](https://build.nvidia.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%7C%20Mongoose%208-47A248.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br />

**A state-wide civic innovation bridge connecting grassroots citizens, higher education research institutions (HEIs), industry/CSR sponsors, and state governance to solve societal and infrastructural challenges across Jharkhand.**

[Explore Architecture](#-system-architecture) • [Key Features](#-key-features) • [AI Reasoning Engine](#-ai-reasoning-engine-nvidia-nim) • [Getting Started](#-getting-started) • [API Reference](#-api-endpoints)

---

</div>

## 📌 Problem Context & Vision

Rural, semi-urban, and tribal communities across Jharkhand face recurring civic and infrastructural challenges—such as groundwater fluoride contamination, unmonitored road washouts, un-electrified public facilities, agricultural storage deficit, and artisanal supply chain bottlenecks. 

Traditionally:
- **Citizens** have no direct channel to translate grassroots problems into actionable technical projects.
- **Universities and Technical Institutes (NITs, IITs, BIT Mesra, State Universities)** lack structured, localized problem statements and field telemetry for engineering student capstones and applied R&D.
- **Industry & Mining Corporates (CSR/ESG)** struggle to discover verified, high-impact regional initiatives with accountable milestone tracking and measurable ESG ROI.
- **State Bodies** lack a centralized spatial dashboard to monitor ground resolution and inter-agency collaboration.

**Sahayog (सहयोग)** bridges this divide through an end-to-end quadripartite collaboration workflow powered by **NVIDIA NIM LLMs**, **Interactive GIS spatial telemetry**, and **milestone-governed CSR funding escrow**.

---

## 🏛️ The Quadripartite Collaboration Ecosystem

```
                                 +--------------------------------------------------+
                                 |              1. CITIZEN / REPORTER               |
                                 |  - Multilingual reporting (Hindi, Khortha, etc.) |
                                 |  - Real-time AI preview & problem structuring    |
                                 |  - Live status tracking & ground verification    |
                                 +------------------------+-------------------------+
                                                          |
                                                          v
+-------------------------------------------------------------------------------------------------------------------+
|                                            SAHAYOG CORE INTELLIGENCE                                              |
|  - Dual-Tier AI Moderation & Structuring Engine (NVIDIA NIM Llama-3.3-70B / Nemotron)                             |
|  - Multi-Vector Severity Calculus (Public Safety, Urgency, Hydrology) & Department Tagging                        |
|  - Haversine Geodesic Radius Matching (Routing to nearest HEIs within 50-100km)                                   |
+------------------------------------+---------------------------------------------+--------------------------------+
                                     |                                             |
                                     v                                             v
+------------------------------------+------------+             +------------------+-----------------------------+
|              2. UNIVERSITY / HEI                |             |             3. INDUSTRY / CSR PARTNER           |
| - Interactive GIS Discovery of local issues     |             | - Curated catalog of high-impact R&D proposals  |
| - Interdisciplinary Faculty & Student Teams     |             | - Milestone-based CSR funding commitment (₹)    |
| - Research-Grade Proposal Synthesis             |             | - Target completion deadlines & ESG tracking    |
| - Field Prototyping & Milestone Delivery        |             | - Direct social impact ROI certification        |
+------------------------------------+------------+             +------------------+-----------------------------+
                                     |                                             |
                                     +----------------------+----------------------+
                                                            |
                                                            v
                                 +--------------------------------------------------+
                                 |           4. ADMIN / INNOVATION COUNCIL          |
                                 |  - Institutional KYC verification & onboarding   |
                                 |  - State-wide geospatial analytics & heatmaps    |
                                 |  - Audit trails, dispute resolution & governance |
                                 +--------------------------------------------------+
```

---

## 🚀 Key Features

### 🧑‍🌾 For Citizens & Community Reporters
- **Multilingual Ingestion:** Native comprehension of Hindi (हिन्दी), Khortha (खोरठा), Santhali (संथाली), Bengali (বাংলা), Nagpuri, and Romanized Indian dialects (Hinglish/Khortha).
- **Instant AI Preview:** Live restructuring converts colloquial, emotional input into formal problem statements before submission.
- **Transparent Audit Timeline:** Full lifecycle visibility from initial intake to university team formation, CSR funding approval, and ground completion.
- **Evidence Attachments:** Image upload support powered by Cloudinary.

### 🎓 For Universities & Higher Education Institutions (HEIs)
- **GIS Proximity Radar:** Interactive Leaflet map displaying regional challenges filtered by distance (10km to 100km) and department discipline.
- **Interdisciplinary Team Assembly:** Form cross-departmental teams (e.g., Civil Engineering + IoT + Biotechnology) to tackle complex challenges.
- **Structured Proposal Builder:** Submit detailed technical methodologies, impact estimations, budget requirements, and phase-wise milestones.
- **Institutional Innovation Showcase:** Public portfolio of resolved challenges, granted patents, and community deployments.

### 🏭 For Industry & CSR Sponsors
- **Curated CSR / ESG Catalog:** Filter verified university proposals by district, SDG goals, severity rating, and funding requirements.
- **Tranche-Based Funding:** Allocate CSR capital tied to explicit milestone deliverables and university verifications.
- **Deadline & Mentorship Governance:** Set strict completion deadlines and provide technical/field mentorship notes directly to research teams.
- **ESG Impact Metrics:** Generate compliance-ready impact reports for corporate social responsibility disclosures.

### 🏛️ For State Administrators & Innovation Councils
- **Account Verification Queue:** Secure approval workflow for university credentials, faculty IDs, and corporate CSR registration documents.
- **Real-Time Geospatial Analytics:** State-level heatmaps categorizing issue density, resolution rate, active research teams, and capital deployed.
- **Dispute & Escalation Management:** System-wide audit logs and moderation controls to preserve platform integrity.

---

## 🧠 AI Reasoning Engine (NVIDIA NIM)

The Sahayog AI Engine (`AI/restructure_complain.py` and `AI/app.py`) operates as an intelligent microservice powered by **NVIDIA NIM** (`meta/llama-3.3-70b-instruct` / `nvidia/llama-3.1-nemotron-70b-instruct`):

```
[Raw Citizen Report]
"Hameen chas block me chaapakaal kharab hai, paani me peelaapan hai aaru bachhon me bimari..."
       │
       ▼
[Dual-Phase Prompt Pipeline]
 ├── Phase 1: Semantic Moderation & Spam/Gibberish Filtering
 └── Phase 2: Academic Problem Formulation & Department Routing
       │
       ▼
[Standardized Structured Output]
 ├── Category: "Water & Sanitation" (Secondary: "Healthcare")
 ├── Priority: "High" | Severity: 88/100 (Urgency: 85, Public Risk: 90, Hydrology: 20)
 ├── Structured Formulation (4-Part Academic Research Statement)
 └── Routing: "Civil & Environmental Engineering" / "Chemical Engineering"
       │
   [Fallback] ── (If Cloud LLM is offline) ──► Deterministic Heuristic NLP Engine (Zero Downtime)
```

### Why NVIDIA Nemotron / Llama-3.3-70B?
1. **Instruction Following & Schema Adherence:** Outstanding performance on IFEval benchmarks ensures 100% compliant JSON responses with zero extraneous text.
2. **Multilingual Dialectal Nuance:** Accurate semantic translation of regional vocabulary (e.g., *हमीन*, *पटवन*, *चापाकल*, *किल्लत*).
3. **Multi-Vector Severity Scoring:** Objective calculus breaking risk into Urgency, Public Safety, and Environmental vulnerability.
4. **Data Sovereignty & NIM Acceleration:** Low-latency TensorRT-LLM execution with on-premise deployment capability for sovereign government infrastructure.

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |            CLIENT BROWSER             |
                                  |  React 19 • Tailwind CSS 4 • Zustand  |
                                  +-------------------+-------------------+
                                                      |
                                       HTTPS / REST   |   OAuth 2.0
                                                      v
                                  +---------------------------------------+
                                  |         EXPRESS BACKEND (Node.js)     |
                                  |  JWT Auth • RBAC • Multer • Mongoose  |
                                  +---------+-------------------+---------+
                                            |                   |
                        Mongoose ODM Queries|                   | Internal Proxy / HTTP
                                            v                   v
+---------------------------------------------+   +---------------------------------------------+
|               MONGODB ATLAS                 |   |           FASTAPI AI MICROSERVICE           |
|  - Users (Roles & KYC Status)               |   |  - LangChain NVIDIA NIM Client              |
|  - Issues (Enriched with AI metadata)       |   |  - Llama-3.3-70B / Nemotron-70B             |
|  - Projects (Teams, Milestones & Funding)   |   |  - Deterministic Rule-Based Fallback        |
|  - Notifications & Audit Timeline           |   |  - Semantic Duplicate Detection             |
+---------------------------------------------+   +---------------------------------------------+
                                            ^                   ^
                                            |                   |
                                  +---------+-------------------+---------+
                                  |            EXTERNAL SERVICES          |
                                  |  - Cloudinary (Image Attachments)     |
                                  |  - Nodemailer (SMTP OTP Service)      |
                                  |  - Google Identity Services (OAuth)   |
                                  |  - NVIDIA NGC Cloud Endpoints         |
                                  +---------------------------------------+
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Zustand 5, React Router 7, Leaflet & React-Leaflet, Lucide React, Recharts, React Hook Form, Zod |
| **Backend API** | Node.js, Express 4.21, Mongoose 8, JWT, Google Auth Library, Multer, Cloudinary SDK, Nodemailer, Helmet, Morgan, Express-Validator |
| **AI Microservice** | Python 3.10+, FastAPI, Uvicorn, LangChain, `langchain-nvidia-ai-endpoints`, `langchain-openai`, Pydantic |
| **AI Models** | NVIDIA NIM: `meta/llama-3.3-70b-instruct`, `nvidia/llama-3.1-nemotron-70b-instruct` |
| **Database** | MongoDB Atlas / Local MongoDB 6.0+ |
| **DevOps & Tooling** | Nodemon, Dotenv, Git, ESLint |

---

## 📁 Repository Structure

```
Sih2026/
├── Frontend/                 # React SPA client application
│   ├── src/
│   │   ├── api/              # Axios API clients & interceptors
│   │   ├── components/       # Reusable UI components (Navbar, Sidebar, Modals, GIS Map)
│   │   ├── layouts/          # Role-based dashboard layouts
│   │   ├── pages/
│   │   │   ├── admin/        # Verification queue, state GIS analytics & user audits
│   │   │   ├── industry/     # CSR project discovery, milestone escrow & impact metrics
│   │   │   ├── issues/       # Issue intake, AI preview & issue detail view
│   │   │   ├── reporter/     # Citizen dashboard & tracking
│   │   │   ├── showcase/     # Innovation repository & deployed solutions
│   │   │   ├── university/   # Proximity radar, proposal builder & team management
│   │   │   └── workflow/     # Interactive system workflow diagrams
│   │   └── store/            # Zustand global state (Auth, UI, Notifications)
│   └── package.json
│
├── Backend/                  # Express REST API Server
│   ├── config/               # Database connection & Cloudinary setup
│   ├── controllers/          # Business logic (Auth, Issues, Projects, Admin, etc.)
│   ├── middleware/           # JWT auth, role authorization & file upload middleware
│   ├── models/               # Mongoose data schemas (User, Issue, Project, Notification)
│   ├── routes/               # API endpoint route declarations
│   ├── scripts/              # Database seeding scripts (`seed.js`)
│   ├── services/             # AI gateway & email OTP service
│   └── server.js             # Express application entrypoint
│
├── AI/                       # Python FastAPI AI Microservice
│   ├── app.py                # FastAPI endpoints (/api/ai/restructure, /severity, etc.)
│   ├── restructure_complain.py # NVIDIA LLM integration & deterministic fallback engine
│   └── requirements.txt      # Python dependencies
│
├── Database/                 # Database configuration reference
├── Docs/                     # In-depth architectural & API documentation
│   ├── ai-design.md          # AI prompt engineering, severity calculus & models
│   ├── api-documentation.md  # Complete REST API reference & payloads
│   ├── database-schema.md    # MongoDB collection schemas & relationships
│   └── user-flows.md         # End-to-end user journeys & role workflows
│
└── .env.example              # Consolidated environment configuration template
```

---

## ⚡ Getting Started

### Prerequisites

Ensure you have the following installed on your development machine:
- **Node.js** `>= 18.0.0` and **npm** `>= 9.0.0`
- **Python** `>= 3.10` and **pip**
- **MongoDB** running locally on port `27017` OR a **MongoDB Atlas URI**
- *(Optional)* **NVIDIA API Key** from [NVIDIA Build](https://build.nvidia.com/) for cloud LLM execution

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ashutosh162007/Sih2026.git
cd Sih2026
```

---

### Step 2: Configure & Start the Backend

```bash
cd Backend

# 1. Create environment file
cp ../.env.example .env
# Edit .env and configure MONGO_URI, JWT_SECRET, etc.

# 2. Install dependencies
npm install

# 3. (Optional) Seed the database with sample Jharkhand issues, universities, and CSR partners
npm run seed

# 4. Start the backend development server
npm run dev
# Server will run on: http://localhost:5000
```

---

### Step 3: Configure & Start the Frontend

Open a new terminal window:

```bash
cd Frontend

# 1. Configure environment
cat <<EOT > .env
VITE_API_URL=http://localhost:5000
VITE_USE_MOCK=false
EOT

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
# Frontend will run on: http://localhost:5173
```

---

### Step 4: Configure & Start the AI Microservice (Optional / Recommended)

Open a new terminal window:

```bash
cd AI

# 1. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env and supply your NVIDIA_API_KEY (optional: fallback engine runs if omitted)

# 4. Start the FastAPI microservice
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
# API Docs available at: http://localhost:8000/docs
```

> **Note:** If the Python service or NVIDIA key is not configured, the Node.js backend automatically runs its internal deterministic fallback NLP engine without failing user requests.

---

## 🔑 Environment Configuration

### Backend (`Backend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Node.js Express server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/sahayog` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `super_secret_jwt_key` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 Web Client ID | `*.apps.googleusercontent.com` |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | SMTP credentials for email OTP verification | Gmail App Password |
| `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` | Cloudinary credentials for media upload | `your_cloudinary_credentials` |
| `NVIDIA_API_KEY` | NVIDIA NIM API Key | `nvapi-xxxxxxxx` |
| `NVIDIA_MODEL` | Target NIM Model | `meta/llama-3.3-70b-instruct` |
| `AI_SERVICE_URL` | URL of the FastAPI microservice | `http://localhost:8000` |

### Frontend (`Frontend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `*.apps.googleusercontent.com` |
| `VITE_USE_MOCK` | Toggle mock data mode | `false` |

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user (Citizen, University, Industry)
- `POST /api/auth/login` — Authenticate and receive JWT token
- `POST /api/auth/google` — Google OAuth 2.0 authentication
- `POST /api/auth/send-otp` / `POST /api/auth/verify-otp` — Email verification

### 📝 Issues & Civic Challenges (`/api/issues`)
- `GET /api/issues` — Paginated issues list with category, status & district filters
- `GET /api/issues/:id` — Retrieve single issue details with AI metadata & timeline
- `POST /api/issues` — Submit a new civic complaint (with AI structuring & image upload)
- `POST /api/issues/preview` — Real-time AI structuring preview without saving
- `PATCH /api/issues/:id/status` — Update issue status (`Under review`, `Assigned`, etc.)

### 🎓 University & Proposals (`/api/university`, `/api/projects`)
- `GET /api/university/nearby-issues` — Issues within geographic radius (GIS)
- `POST /api/projects` — Submit research team formation & project proposal
- `GET /api/projects/:id` — Proposal details, team members & milestone progress
- `PATCH /api/projects/:id/milestones` — Update milestone delivery status

### 🏭 Industry & CSR Escrow (`/api/industry`)
- `GET /api/industry/projects` — Discover open proposals needing CSR funding
- `POST /api/industry/fund/:projectId` — Commit CSR funding tranche & deadline
- `GET /api/industry/impact` — Aggregate ESG impact metrics & certificates

### 🏛️ Admin Governance (`/api/admin`)
- `GET /api/admin/pending-users` — Pending university / industry KYC verification
- `PATCH /api/admin/verify-user/:id` — Approve or reject user institutional credentials
- `GET /api/admin/stats` — State-level analytics, GIS heatmaps & funding totals

### 🤖 AI Microservice (`/api/ai` on `:8000`)
- `POST /api/ai/restructure` — Convert citizen text to structured research statement
- `POST /api/ai/severity` — Compute multi-factor severity calculus
- `POST /api/ai/duplicate-check` — Semantic duplicate issue identification

---

## 👥 User Roles & Default Demo Credentials

When running `npm run seed` in `Backend/`, the following demo accounts are created:

| Role | Email | Password | Scope & Privileges |
|---|---|---|---|
| **Citizen Reporter** | `reporter@sahayog.in` | `password123` | Submit issues, view AI formulations, track timelines |
| **University Faculty** | `bit.mesra@sahayog.in` | `password123` | Claim issues, assemble research teams, submit proposals |
| **Industry / CSR** | `csr@tatasteel.com` | `password123` | Fund proposals, enforce deadlines, track ESG impact |
| **Admin / Council** | `admin@sahayog.in` | `password123` | Verify institutions, oversee state-wide GIS analytics |

---

## 🏆 Smart India Hackathon (SIH 2026)

**Project Name:** Sahayog (सहयोग)  
**Theme:** Smart Governance, Higher Education Innovation & Civic-Tech  
**Target Region:** Jharkhand, India  

---

<div align="center">
Built with ❤️ for a smarter, cleaner, and empowered Jharkhand.
</div>
