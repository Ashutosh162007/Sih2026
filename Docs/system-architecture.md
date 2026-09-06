# Sahayog — System Architecture

## 1. High-Level Overview

Sahayog follows a **layered, client-server architecture** with a React single-page application
(SPA) on the frontend, a Node.js/Express REST API as the backend, a MongoDB database, and an
AI engine (Python) that structures and scores incoming complaints. The system also integrates
Cloudinary for media storage and Google OAuth for authentication.

```
┌─────────────────────┐       ┌──────────────────────┐        ┌─────────────────┐
│   React SPA         │  HTTP │   Express Backend    │ Mongo  │   MongoDB (Atlas)│
│   (Citizen / Uni /  │ ─────►│   /api/...           │ ─────► │   sahayog_db     │
│    Industry / Admin)│  JSON  │   Controllers,       │        │  users, issues,  │
└─────────────────────┘       │   Services, Models    │        │  projects, notif │
        │                     └──────────┬───────────┘        └─────────────────┘
        │                        │       │       │
        │                  ┌─────┴─┐ ┌───┴────┐ ┌┴──────────┐
        │                  │AI Svc │ │Routing │ │Cloudinary │
        │                  │(Node) │ │Svc     │ │           │
        │                  └───────┘ └────────┘ └───────────┘
        │                          │ (optional HTTP/gRPC bridge)
        │                  ┌───────▼─────────────┐
        │                  │ Python AI Engine     │
        │                  │ (LangChain / Mistral │
        │                  │  FastAPI)            │
        └──────────────────┴─────────────────────┘
```

## 2. Component Breakdown

### 2.1 Frontend (React SPA)
- **Directory:** `Frontend/`
- **Framework:** React 19 + Vite 7, Tailwind CSS 4, React Router DOM 7.
- **State:** Zustand stores for authentication and the report wizard.
- **Data fetching:** Axios (`src/api/axiosClient`). Ships with a full in-browser mock backend
  (`src/api/mockAdapter.js`) that mirrors the Express API, letting the SPA run with or without
  the backend.
- **Key views:** Landing, split-panel auth (email/OTP + Google SSO), a 5-step issue-report
  wizard (with Leaflet map picker and file dropzone + AI preview), issue list/detail, university
  dashboards (queue, claim, team builder, 4-step proposal wizard), industry dashboards
  (proposals, funded projects), and an admin dashboard (Recharts analytics + account
  verification).

### 2.2 Backend API (Node.js / Express)
- **Directory:** `Backend/`
- **Entry point:** `Backend/server.js`
- **Model-View-Controller (MVC) layout:**
  - `models/` — Mongoose schemas: `User`, `Issue`, `Project`, `RoutingAssignment`, `Notification`.
  - `controllers/` — request handlers: auth, issue, university, project, industry, admin,
    notification.
  - `routes/` — route definitions (`/api/*`).
  - `services/` — `aiService.js` (heuristic AI), `routingService.js` (Haversine routing),
    `cloudinaryService.js` (media upload).
  - `middleware/` — `auth.js` (JWT protect + role authorize), `upload.js` (multer),
    `errorHandler.js`.
- **Security:** `helmet`, CORS, JSON body-size limits, strict password/email/name validation,
  OTP brute-force protection, failed-login account lockout, JWT role-signing.

### 2.3 Database (MongoDB)
- **Engine:** MongoDB via Mongoose 8 ODM (`sahayog_db`).
- **Collections:** `users`, `issues`, `projects`, `routingassignments`, `notifications`.
- Full schema details in `Docs/database-schema.md`.

### 2.4 AI Engine (Python)
- **Directory:** `AI/`
- **Primary module:** `AI/restructure_complain.py` — a LangChain LangGraph-ready pipeline using
  `ChatMistralAI` to convert unrestricted citizen text into a strict JSON structure (canonical
  category, severity, normalized location, routing recipient, missing info, duplicate detection,
  confidence).
- `AI/requirements.txt` pins langchain, langchain-openai, langchain-google-genai,
  langchain-groq, langchain-mistralai, langgraph, fastapi, uvicorn, faiss-cpu, tiktoken.
- **Note:** The backend currently exposes a lightweight heuristic classifier
  (`Backend/services/aiService.js`) and Haversine router (`routingService.js`) so the full
  pipeline is runnable without external LLM keys. The Python modules are the production LLM
  path and can be wired in via the AI service layer (see `Docs/ai-design.md`).

## 3. Request Lifecycle — End-to-End

### 3.1 Report an Issue (Citizen)
1. Frontend captures title, description, category, map location, and photo evidence.
2. `POST /api/issues` (JWT-protected) → `issueController.createIssue`.
3. `aiService.analyzeProblemWithAI()` produces category, priority, severity (composite score),
   and AI problem statement.
4. `routingService.rankUniversitiesForIssue()` computes Haversine distances and discipline match
   scores to rank the nearest/relevant HEIs.
5. Evidence is uploaded to Cloudinary (with base64 fallback).
6. An `Issue` document is persisted with a timeline; a `RoutingAssignment` log is created; a
   notification is broadcast to universities.
7. The created issue (with AI statement, severity, and nearest universities) is returned.

### 3.2 University Claims & Proposes
1. `GET /api/university/queue` lists open issues ranked by distance from the university.
2. `POST /api/university/issues/:id/claim` sets status to `Assigned` and records the assignee.
3. `POST /api/projects/:issueId/teams` saves the multidisciplinary team.
4. `POST /api/projects/:issueId/proposals` persists the proposal, sets status to
   `Awaiting funding`, and notifies industry partners.

### 3.3 Industry Funds
1. `GET /api/industry/proposals` lists proposals awaiting funding.
2. `POST /api/projects/:projectId/fund` marks the project `Funded`, records the amount, deadline,
   and mentorship notes, advances the issue to `In progress`, and notifies the citizen.

### 3.4 Milestones & Resolution
1. `PATCH /api/projects/:projectId/milestones` updates milestone states.
2. When all milestones are done, the project becomes `Completed` and the linked issue is
   `Resolved`, and the citizen is notified.

### 3.5 Admin Governance
1. Registering as a university/industry sets `status: 'pending'` and notifies admins.
2. `GET /api/admin/verifications` lists pending accounts; `PATCH /api/admin/verifications/:id`
   approves/rejects (status `active`/`rejected`).
3. `GET /api/admin/analytics` aggregates issues, HEIs, industry partners, funding, category mix,
   and monthly trends.

## 4. Role-Based Access Control

| Role | Capabilities |
|---|---|
| `citizen` | Report issues, view own issues, receive resolution notifications |
| `university` | View queue, claim issues, form teams, submit proposals, update milestones |
| `industry` | View proposals, fund projects, set deadlines |
| `admin` | Verify institutional accounts, view state-wide analytics |

JWT payload carries `{ id, role }`; `protect` middleware validates the token and loads the user;
`authorize(...roles)` gates admin-only endpoints.

## 5. Security Considerations
- All passwords hashed with bcrypt; password fields excluded from serialization by default.
- OTP: 10-minute expiry, max 5 attempts, 60-second resend cooldown, per-account lockout.
- Login: 5 failed attempts → 15-minute lockout.
- Email and name validation reject disposable domains, placeholder names, and weak passwords.
- `helmet` sets secure HTTP headers; CORS restricted to trusted origins in production.
- JWT secrets must be supplied via environment variables (never commit real keys).

## 6. Deployment & Environments
- **Environment variables:** `Backend/.env.example` documents `MONGO_URI`, `JWT_SECRET`,
  `PORT`, `CLOUDINARY_*`, `GOOGLE_CLIENT_ID`, and AI keys.
- **Local dev:** `npm run dev` → `nodemon server.js` (port 5000); `npm run seed` populates demo
  users, issues, projects, and notifications. Frontend: `npm run dev` → Vite (port 5173).
- **Frontend env:** `Frontend/.env` sets `VITE_API_URL` and `VITE_USE_MOCK`.
- CI/CD and containerization are planned follow-ups (see `Repo Roadmap` in README).
