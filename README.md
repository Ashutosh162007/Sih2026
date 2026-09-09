# Sahayog (सहयोग) — Societal Innovation Collaboration Platform

A civic-tech platform built for SIH 2026 that connects citizens, universities, industry, and government to collaboratively solve societal challenges in Jharkhand.

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 4, Zustand, React Router 7, Leaflet (GIS)
- **Backend:** Node.js, Express 4, Mongoose (MongoDB)
- **Database:** MongoDB (local or Atlas)
- **Auth:** JWT + Google OAuth 2.0

## Project Structure

```
├── Frontend/          # React SPA (Vite)
├── Backend/           # Express REST API
├── AI/                # Python FastAPI LLM service (optional)
├── Database/          # DB config
├── Scripts/           # Utility scripts
├── Docs/              # Documentation
└── Tests/             # Test suites
```

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB running locally on port 27017 (or Atlas URI)

### Setup

```bash
# Clone
git clone https://github.com/Ashutosh162007/Sih2026.git
cd Sih2026

# Backend
cd Backend
cp .env.example .env   # edit with your config
npm install
npm run dev            # starts on :5000

# Frontend (new terminal)
cd Frontend
npm install
npm run dev            # starts on :5173
```

### Environment Variables

Copy `.env.example` in both `Backend/` and `Frontend/` and fill in:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CLOUDINARY_*` | Image upload config (optional) |

## API Routes

| Prefix | Module |
|--------|--------|
| `/api/auth` | Authentication (login, signup, OTP, Google OAuth) |
| `/api/users` | User management |
| `/api/issues` | Civic issue CRUD & classification |
| `/api/university` | University dashboard & queues |
| `/api/projects` | Innovation project proposals |
| `/api/industry` | Industry CSR/ESG dashboard |
| `/api/admin` | Admin analytics & account verification |
| `/api/notifications` | Real-time notifications |

## Roles

- **Citizen/Reporter** — Report civic issues, track progress
- **University** — Review nearby issues, propose innovation projects
- **Industry** — Fund projects, CSR/ESG tracking
- **Admin** — State analytics, account verification

## Recent Changes (S_exp branch)

- Fixed sidebar persistence on Innovation Showcase and Help Center pages
- Added click-outside-to-close behavior on notification and profile popups
- Added missing `nodemailer` dependency for OTP email service
