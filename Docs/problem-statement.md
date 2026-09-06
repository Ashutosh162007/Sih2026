# SIH 2026 Problem Statement — Sahayog

## 1. Background & Context

India's grassroots civic and societal challenges — contaminated drinking water, deteriorating
urban infrastructure, unmanaged waste, gaps in education and healthcare access, and stagnating
rural livelihoods — are often reported in informal, unstructured, and fragmented ways. When a
citizen notices a problem, there is rarely a single trusted channel that:

1. Captures the issue in a structured, machine-readable form.
2. Assesses its true severity and urgency.
3. Routes it to the right institution that can actually solve it.
4. Carries the problem through to a funded, implemented, and verifiable solution.

The result is a disconnect between **who sees problems** (citizens on the ground), **who can
innovate** (universities and research institutions), and **who can fund and scale** (industry and
CSR partners). Promising grassroots issues are either never reported, get lost in form-filling
bureaucracy, or are impossible to prioritize because their severity is never assessed.

## 2. Core Problem

> Citizens report societal challenges in messy, informal language with no standard structure, and
> there is no end-to-end pipeline that **understands** the problem, **prioritizes** it, **routes**
> it to the right solvers, and tracks it through to a **funded, implemented, and verified
> resolution**.

Specifically, the following gaps exist:

- **No structured intake:** Complaints arrive as free text and are never normalized into a
  consistent schema (category, severity, location, affected population, required expertise).
- **No severity intelligence:** Authorities cannot objectively prioritize which of thousands of
  issues demand urgent, high-resource intervention versus those that are low-impact.
- **No smart routing:** There is no systematic way to route a problem to the higher-education
  institution (HEI) with the right academic disciplines and nearest geographic presence.
- **No innovation-to-funding bridge:** University teams capable of designing solutions have no
  structured channel to present proposals to industry/CSR partners willing to finance and adopt
  them.
- **No transparent impact tracking:** Once a solution is funded, there is no milestone-based
  mechanism to confirm it was actually deployed and that the original issue was resolved.

## 3. Proposed Solution — Sahayog

**Sahayog** (Sanskrit, "Collaboration") is a societal innovation collaboration platform that
closes the loop between community reporters, universities, and industry through an AI-powered
pipeline:

1. **Report (Citizen / Community Reporter):** A citizen submits a challenge through a guided
   5-step wizard (title, description, category, map-based location, photo evidence).
2. **Understand & Structure (AI):** An LLM-based engine restructures the informal complaint into
   a standardized JSON record — canonical category, secondary category, severity
   (LOW/MEDIUM/HIGH/CRITICAL), normalized location, affected group, missing-information flags,
   recommended routing recipient, and duplicate detection.
3. **Prioritize & Route (AI):** A severity engine assigns a composite risk score, and a Haversine
   geodesic + academic-discipline routing service ranks the nearest and most relevant HEIs.
4. **Innovate (University / HEI):** The university claims the issue, assembles a multidisciplinary
   team, and submits a structured solution proposal with methodology, milestones, and expected
   impact.
5. **Fund (Industry / CSR):** Industry and CSR partners review proposals, commit funding, set
   completion deadlines, and provide mentorship notes.
6. **Track & Resolve (All + Admin):** Projects progress through milestones; when all milestones are
   completed, the issue is marked Resolved and the citizen is notified. An admin layer verifies
   institutional accounts and views state-wide analytics.

## 4. Primary Objectives

- Enable citizens to report societal challenges in their own words with minimal friction.
- Convert unstructured complaints into structured, actionable, and machine-readable records.
- Objectively assess severity so urgent issues surface first.
- Smartly route challenges to universities with the nearest location and most relevant disciplines.
- Give universities a clear path from problem to funded, multi-disciplinary solution.
- Let industry/CSR discover, fund, and track high-impact grassroots solutions.
- Notify citizens and all stakeholders at every stage, from report to resolution.
- Provide an admin/government analytics dashboard over the entire state (Jharkhand pilot).

## 5. Scope

**In scope (Pilot — Jharkhand, India):**

- 10 canonical issue categories (Education, Agriculture, Healthcare, Water Resources,
  Environment, Energy, Urban Development, Accessibility, Public Administration,
  Rural Livelihoods) for AI classification, mapped to UI-facing categories.
- 24 Jharkhand districts supported via map picker and routing.
- A registry of prominent Jharkhand HEIs (BIT Mesra, NIT Jamshedpur, IIT ISM Dhanbad, BAU Ranchi,
  Ranchi University, VBU Hazaribagh, Kolhan University, AIIMS Deoghar).
- Four actor roles: citizen, university, industry, and admin.
- Severity scoring, Haversine routing, LLM-based structuring, proposal/milestone tracking.

**Out of scope:**

- Physical on-ground verification and disbursement of actual funds.
- Integration with external government grievance portals (e.g., CPGRAMS).
- Nationwide deployment beyond the Jharkhand pilot.

## 6. Expected Impact

- **Citizens:** A trustworthy channel to report issues and receive end-to-end status updates.
- **Universities:** A pipeline of real, geo-tagged, severity-ranked problems to drive applied
  research, student innovation, and funded proof-of-concepts.
- **Industry/CSR:** A transparent, vetted pipeline of impactful, fundable societal innovations
  with measurable milestones.
- **Government/Admin:** State-wide visibility into the volume, severity, and resolution of
  grassroots challenges.

## 7. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, Tailwind CSS 4, Zustand, React Router, Leaflet, Recharts |
| Backend | Node.js, Express 4, Mongoose 8 (MongoDB), JWT, bcryptjs |
| AI Engine | Python, LangChain / LangGraph, Mistral (LLM), FAISS, FastAPI |
| Database | MongoDB (Atlas / local `sahayog_db`) |
| Storage | Cloudinary (with local base64 fallback) |
| Auth | Email + OTP (email) & Google OAuth |

## 8. Success Criteria

- A citizen can submit an issue in under ~5 minutes and immediately see the AI-structured
  problem statement, severity score, and nearest candidate universities.
- The LLM reliably classifies complaints into canonical categories with a confidence score and
  flags missing information.
- Issues are routed to HEIs by proximity and discipline fit.
- Universities can form teams and submit proposals; industry can fund and set deadlines.
- Milestone completion automatically advances issues to Resolved and notifies the reporter.
