# Sahayog — Societal Innovation Collaboration Platform

**SIH 2026** • A civic-tech platform that closes the loop between **community reporters**,
**universities**, and **industry** through an AI-powered pipeline for solving grassroots societal
challenges (water contamination, infrastructure, waste, education, healthcare, rural livelihoods).

> **Sahayog** (Sanskrit, "Collaboration"): citizens report → AI understands, prioritizes, routes →
> universities innovate → industry funds → milestone-tracked → citizen notified on resolution.

## Problem in One Line

Grassroots issues are reported in messy, unstructured language, and there is no end-to-end channel
that **structures** the problem, **prioritizes** it, **routes** it to the right solvers, and
**tracks** it through to a funded, implemented, verified resolution.

## How It Works

```
Citizen reports ──► AI structure + severity ──► Route (Haversine + discipline)
      ──► University claims + team ──► Proposal ──► Industry funds ──► Milestones
      ──► Resolved ──► Citizen notified
```

## Repository Layout

| Path | Description |
|---|---|
| `Frontend/` | React 19 + Vite SPA (citizen wizard, uni/industry dashboards, admin analytics) |
| `Backend/` | Node.js + Express REST API (Mongoose/MongoDB, JWT auth, uploads) |
| `AI/` | Python AI engine (LangChain / Mistral complaint structuring & classification) |
| `Database/` | MongoDB schemas & initialization (see also `Docs/database-schema.md`) |
| `Docs/` | Problem statement, architecture, user flows, AI design, API, DB schema |
| `Tests/` | Automated tests (planned) |
| `Scripts/` | Utility scripts (planned) |
| `Storage/` | Media / artifacts (planned) |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Zustand, React Router, Leaflet, Recharts |
| Backend | Node.js, Express 4, Mongoose 8, JWT, bcryptjs |
| AI | Python, LangChain, Mistral, FastAPI, FAISS |
| Database | MongoDB (Atlas / local `sahayog_db`) |
| Storage | Cloudinary |
| Auth | Email + OTP & Google OAuth |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local, or an Atlas connection string)
- Python 3.11+ (only for the AI engine)

### 1. Backend

```bash
cd Backend
npm install
cp .env.example .env        # set MONGO_URI, JWT_SECRET, etc.
npm run seed                # optional: load demo users/issues/projects
npm run dev                 # starts nodemon on http://localhost:5000
```

Demo accounts (seeded): `citizen@sahayog.in`, `university@sahayog.in`,
`nitjamshedpur@sahayog.in`, `bau@sahayog.in`, `vinoba@sahayog.in`,
`industry@sahayog.in`, `admin@sahayog.in` — password `password` (pre-verified).

### 2. Frontend

```bash
cd Frontend
npm install
npm run dev                 # Vite on http://localhost:5173
```

Set `VITE_API_URL` (default `http://localhost:5000`) and `VITE_USE_MOCK` in `Frontend/.env`.
The app ships with a full in-browser **mock backend** (`src/api/mockAdapter.js`), so it can run
even without the backend.

### 3. AI Engine (optional, for LLM structuring)

```bash
cd AI
pip install -r requirements.txt
# configure LLM keys in .env, then run the FastAPI service (see Docs/ai-design.md)
```

## Environment Variables

**Backend (`.env`):** `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`,
`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `GOOGLE_CLIENT_ID`,
optional AI keys.

**Frontend (`.env`):** `VITE_API_URL`, `VITE_USE_MOCK`, `VITE_GOOGLE_CLIENT_ID`.

> Never commit real secrets. The `.gitignore` excludes `.env` files.

## Documentation

- [Problem Statement](Docs/problem-statement.md)
- [System Architecture](Docs/system-architecture.md)
- [User Flows](Docs/user-flows.md)
- [AI Design](Docs/ai-design.md)
- [API Reference](Docs/api-documentation.md)
- [Database Schema](Docs/database-schema.md)

## Roles

- **Citizen / Community Reporter** — report issues, track to resolution.
- **University / HEI** — claim issues, build multidisciplinary teams, submit proposals.
- **Industry / CSR** — fund and mentor high-impact proposals, set deadlines.
- **Admin / Government** — verify institutional accounts, view state-wide analytics.

## Roadmap (coming)
- Wire the Python LLM engine into the Express backend (provider abstraction + category mapping).
- Add automated tests (`Tests/`).
- Containerization (Docker) and CI/CD.
- External storage/artifacts pipeline (`Storage/`), utility scripts (`Scripts/`).
