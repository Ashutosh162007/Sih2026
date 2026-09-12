# Sahayog (सहयोग) — Comprehensive User Flows & Platform Workflows

## 1. System Overview & Platform Stakeholders

The **Sahayog** platform enables a quadripartite collaboration model addressing grassroots civic and infrastructural challenges in Jharkhand:

```
                  +----------------------------------------------+
                  |               1. CITIZEN                     |
                  |  - Reports civic challenges                  |
                  |  - AI-assisted problem formulation           |
                  |  - Tracks timeline & ground-verifies fix     |
                  +----------------------+-----------------------+
                                         |
                                         v
+----------------------------------------+---------------------------------------+
|                       SAHAYOG CORE ENGINE                              |
| - AI Evaluation & Severity Scoring (NVIDIA NIM)                                |
| - Geodesic Proximity & Department Routing Engine                               |
| - State Innovation Council Governance & KYC                                    |
+-------------------+------------------------------------+-----------------------+
                    |                                    |
                    v                                    v
+------------------------------------+ +-----------------------------------------+
|          2. UNIVERSITY             | |           3. INDUSTRY / CSR             |
| - Discovers nearby issues (GIS)    | | - Discovers academic proposals          |
| - Assembles interdisciplinary team | | - Commits CSR funding & tranches        |
| - Designs technical proposals      | | - Sets deadlines & provides resources   |
| - Executes prototyping & fieldwork | | - Tracks ESG impact & certification     |
+-------------------+----------------+ +--------------------+--------------------+
                    |                                    |
                    +------------------+-----------------+
                                       |
                                       v
                  +----------------------------------------------+
                  |                4. ADMIN                      |
                  |  - Institution verification & KYC            |
                  |  - State-wide geospatial analytics           |
                  |  - CSR Impact Certificate accreditation      |
                  +----------------------------------------------+
```

---

## 2. Authentication, Onboarding & RBAC Flows

```
                                  [Landing Page /]
                                         |
                         +---------------+---------------+
                         |                               |
                 [Sign In /login]               [Sign Up /signup]
                         |                               |
                         |               +---------------+---------------+
                         |               |                               |
                         |      [Role: Citizen / Govt]     [Role: University / Industry]
                         |               |                               |
                         |        (Active Status)              (Status: 'pending')
                         |               |                               |
                         |               v                               v
                         |       [Direct Access]             [/signup/pending View]
                         |               |                               |
                         |               |                     [Admin Verifies Account]
                         |               |                               |
                         +-------------->+<------------------------------+
                                         |
                                         v
                         +---------------+---------------+
                         | Role-Based Route Redirection  |
                         +---------------+---------------+
                                         |
     +-------------------+---------------+-------------------+-------------------+
     |                   |                                   |                   |
     v                   v                                   v                   v
[Citizen Dashboard]  [University Dashboard]         [Industry Dashboard]   [Admin Dashboard]
/citizen/dashboard   /university/dashboard          /industry/dashboard    /admin/dashboard
```

### 2.1 Citizen & Local Body Onboarding
1. Citizen navigates to `/signup` and selects **Citizen / Community Reporter** or **Government / Local Body Official**.
2. Fills in `Name`, `Email`, `Password`, `District`, `Block`, and `Phone`.
3. Account is activated immediately (`status: "active"`).
4. System issues JWT token and redirects user to `/citizen/dashboard`.

### 2.2 University & Industry Institutional KYC Onboarding
1. Institutional representative navigates to `/signup` and selects **University (HEI)** or **Industry Partner / CSR**.
2. Fills in institutional affiliation (`org`), department specializations (`disciplines`), official website, contact info, and official location.
3. System assigns `status: "pending"` and displays the `/signup/pending` waiting room.
4. An Admin reviews the institutional accreditation in `/admin/verify-accounts` and approves the account.
5. Upon approval, the representative can log in and access university/industry dashboards.

---

## 3. Citizen / Community Reporter User Flow

```
                                   Citizen Journey
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 1. Issue Reporting (/report)                                                      |
|    - Enters Title, Description, Category, District, Block, Landmark               |
|    - Uploads geo-tagged photos (processed via Cloudinary)                         |
|    - Interactive "AI Preview" evaluates legitimacy and computes severity metrics  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. AI Structuring & Geodesic Routing                                              |
|    - Rejects spam / keyboard mash / petty matters                                 |
|    - Synthesizes 4-section academic problem formulation                           |
|    - Ranks nearest Higher Education Institutions (HEIs) via Haversine formula     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. Community Engagement & Upvoting (/map, /issues/:id)                            |
|    - Fellow citizens discover issue on interactive GIS State Map                  |
|    - Citizen "Upwards" the issue to boost visibility and priority                 |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. Transparent Progress Tracking (/my-issues)                                     |
|    - Real-time timeline updates on university claiming, team formation & funding  |
|    - Automated in-app notifications on every milestone transition                 |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 5. Ground Verification & Citizen Feedback (/issues/:id)                           |
|    - When status transitions to 'Resolved', citizen conducts ground check         |
|    - Submits 5-star rating, verification proof, and final remarks                 |
+-----------------------------------------------------------------------------------+
```

### Step-by-Step Interactions:
- **`POST /api/issues/ai-preview`**: Returns real-time structured problem statement and severity preview without saving to database.
- **`POST /api/issues`**: Saves enriched issue document, initializes activity timeline, calculates nearest 4 HEIs, and broadcasts notifications.
- **`POST /api/issues/:id/upward`**: Allows community members to upward/endorse critical issues (idempotent, single upvote per user).
- **`POST /api/issues/:id/feedback`**: Allows the original reporter to provide ground truth rating and comments once resolved.

---

## 4. University / Higher Education Institution (HEI) User Flow

```
                                 University Journey
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 1. Proximity Queue & Discovery (/university/queue)                                |
|    - Explores open civic challenges sorted by Haversine distance from campus      |
|    - Filters by priority (High/Med/Low), category, and severity score             |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. Claiming Civic Challenge (POST /api/university/issues/:id/claim)               |
|    - University stakes claim on problem statement                                 |
|    - Ticket status transitions from 'New' -> 'Assigned'                           |
|    - Timeline records claiming institution; citizen is notified                   |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. Multidisciplinary Team Formation (/university/projects)                        |
|    - Faculty Lead mobilizes interdisciplinary student & faculty roster            |
|    - Maps skill requirements (e.g. Civil Engineering + IoT + Environmental Sci)   |
|    - Documented via POST /api/projects/:issueId/teams                             |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. Proposal Wizard (/university/projects/:id/proposal)                            |
|    - Synthesizes technical methodology, field survey plan, and expected impact    |
|    - Structures phased milestones with target delivery dates                      |
|    - Submits proposal to Industry CSR funding catalog ('Awaiting funding')       |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 5. Collaborative Execution (/workflow/:id)                                        |
|    - Design Thinking Kanban: Empathize -> Define -> Ideate -> Prototype -> Test   |
|    - Real-time Collaborative Whiteboard / Canvas for architectural diagrams       |
|    - Resource Requisition Checklist: Requests equipment/sensors from CSR sponsor  |
|    - Milestone Completion -> Automatic trigger to mark Issue 'Resolved'          |
+-----------------------------------------------------------------------------------+
```

### Key API Touchpoints:
- **`GET /api/university/queue?lat=...&lng=...`**: Fetches proximity-ranked open civic issues.
- **`POST /api/university/issues/:id/claim`**: Assigns issue to claiming university.
- **`POST /api/projects/:issueId/teams`**: Assembles cross-departmental research roster.
- **`POST /api/projects/:issueId/proposals`**: Submits project proposal with milestone breakdown.
- **`PATCH /api/projects/:projectId/milestones`**: Updates milestone completion status and triggers automatic project resolution when all milestones are done.

---

## 5. Industry Partner / CSR Sponsor User Flow

```
                                  Industry Journey
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 1. Proposal Catalog Exploration (/industry/queue)                                 |
|    - Reviews university solution proposals awaiting funding                       |
|    - Evaluates severity indices, expected community impact, and budget            |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. CSR Capital Commitment & Scheduling (/industry/projects)                       |
|    - Commits grant funding (e.g., ₹3,50,000)                                     |
|    - Sets hard completion deadline and attaches mentorship/technical guidelines   |
|    - Automatically sets up 3-phase tranche disbursement:                         |
|      * Tranche 1: 40% (Advance released immediately on funding)                   |
|      * Tranche 2: 40% (Released upon mid-stage milestone verification)            |
|      * Tranche 3: 20% (Released on final deployment & testing)                    |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. Active Mentorship & Workflow Collaboration (/workflow/:id)                     |
|    - Views university design thinking board and whiteboard diagrams               |
|    - Submits industry mentorship suggestions on university workflow notes         |
|    - Fulfills resource requisitions (supplying lab equipment, testing kits, etc.) |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. Tranche Disbursement & Verification (POST .../tranche-release)                 |
|    - Inspects university milestone proof                                          |
|    - Releases successive funding tranches to university team                      |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 5. CSR Impact & ESG Certification (/industry/projects)                            |
|    - Inspects real-time ESG metrics (beneficiaries impacted, CO2/waste mitigated) |
|    - Receives State Innovation Council approved CSR Impact Certificate            |
+-----------------------------------------------------------------------------------+
```

### Key API Touchpoints:
- **`GET /api/industry/proposals`**: Lists all university proposals in `Awaiting funding` state.
- **`POST /api/projects/:projectId/fund`**: Commits capital, initializes tranches, and notifies university and citizen.
- **`POST /api/projects/:projectId/tranche-release`**: Disburses scheduled capital tranches upon milestone audit.
- **`POST /api/workflow/suggestions`**: Adds industry advisory comments to university research notes.
- **`PATCH /api/workflow/checklist/:id/provide`**: Marks requested resources as sponsored/provided.

---

## 6. Admin & State Innovation Council User Flow

```
                                   Admin Journey
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 1. Institutional KYC & Account Verification (/admin/verify-accounts)              |
|    - Inspects pending university faculty and industry CSR partner registrations   |
|    - Approves or rejects accounts (`PATCH /api/admin/verifications/:userId`)      |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 2. State-Wide Geospatial & Financial Analytics (/admin/dashboard)                 |
|    - State Heatmap: Problem clusters across 24 Jharkhand districts                |
|    - Financial metrics: Total CSR capital mobilized (₹)                           |
|    - Resolution rates, monthly intake vs resolved trends, domain distribution     |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 3. Issue Oversight & Governance (/admin/issues)                                   |
|    - Cross-district issue console with status overrides and reassignment          |
|    - Direct mediation and SLA monitoring                                          |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
| 4. CSR Impact Certificate Accreditation (/admin/audit-logs)                       |
|    - Reviews completed projects and citizen verification ratings                  |
|    - Signs and authorizes official state CSR compliance certificates              |
+-----------------------------------------------------------------------------------+
```

---

## 7. Collaborative Innovation Workflow Matrix

The platform provides a dedicated collaborative workspace (`/workflow/:id`) shared between Universities and Industry Sponsors:

| Feature | University Permissions | Industry Sponsor Permissions | Citizen / Admin Access |
|---|---|---|---|
| **Design Thinking Notes** | Create, Edit, Move columns (`Empathize`, `Define`, `Ideate`, `Prototype`, `Test`), Delete | Read-only viewing of notes | Restricted |
| **Industry Suggestions** | View suggestions, Change status (`Reviewed`, `Accepted`, `Rejected`) | Submit suggestions & advisory remarks on notes | Restricted |
| **Interactive Canvas / Whiteboard** | Draw, place geometric objects, design schematics, Save canvas | View-only canvas inspection | Restricted |
| **Resource Requisition Checklist** | Create resource requests, explain technical justification | Mark item as `Provided` with fulfillment details | Restricted |
| **Milestone Tracking** | Mark milestones as `done` | Audit milestone progress and release funding tranches | Read-only in Issue detail |

---

## 8. Complete Issue & Project State Machine

```
   [Citizen Reports Issue]
              |
              v
       ( Status: 'New' )
              |
              | University Claims Issue
              v
    ( Status: 'Assigned' )
              |
              | University Submits Proposal
              v
 ( Project Status: 'Awaiting funding' )
              |
              | Industry Commits Capital
              v
    ( Issue Status: 'In progress' )
    ( Project Status: 'Funded' )
              |
              | Execution & Milestone Iterations (Tranches Released)
              v
    ( All Milestones Done )
              |
              v
    ( Issue Status: 'Resolved' )
    ( Project Status: 'Completed' )
              |
              | Citizen Ground Truth Feedback (1-5 ⭐)
              | Admin CSR Certificate Authorized
              v
        [FINAL RESOLUTION]
```

### Issue Lifecycle States:
- **`New`**: Newly submitted, validated by AI, awaiting institutional claim.
- **`Under review`**: Flagged for municipal or secondary evaluation.
- **`Assigned`**: Claimed by a university research team; multidisciplinary team in formation.
- **`In progress`**: Funded by CSR partner; solution development, field testing, or deployment underway.
- **`Resolved`**: All milestones completed; physical deployment verified on ground with citizen feedback.

### Project Lifecycle States:
- **`Team forming`**: University faculty identifying cross-departmental student/faculty researchers.
- **`Awaiting funding`**: Proposal submitted with milestones and budget, listed in industry catalog.
- **`Funded`**: CSR grant committed, first tranche disbursed, active implementation.
- **`Completed`**: All technical milestones achieved and verified.

---

## 9. Notification & Real-Time Event Dispatch

Every state change triggers automated notifications across platform stakeholders:

| Event Trigger | Recipient Role | Notification Message |
|---|---|---|
| Citizen submits new issue | University (`university`) | *"New High Priority Issue in Ranchi (4.2 km from campus) is awaiting team formation."* |
| Issue registered | Citizen (`citizen`) | *"Challenge Registered & AI Evaluated (Priority: High, Severity: 85%)."* |
| University claims issue | Citizen (`citizen`) | *"[University Name] claimed your issue and is mobilizing research teams."* |
| Proposal submitted | Industry (`industry`) | *"New Proposal Awaiting Funding: [Project Title] by [University Name]."* |
| Industry funds proposal | Citizen (`citizen`) | *"Project Funded & Execution Started! [Industry Name] approved funding."* |
| Industry funds proposal | University (`university`) | *"Funding Approved: ₹3,50,000 committed with target deadline [Date]."* |
| Milestone achieved | Citizen (`citizen`) | *"Milestone Achieved: [Milestone Name] completed by university team."* |
| All milestones done | Citizen (`citizen`) | *"Civic Issue Resolved & Verified! Please provide ground verification feedback."* |
| Citizen submits feedback | University & Admin | *"Citizen Verified Resolution! ⭐ 5/5 rating logged for [Issue Title]."* |
| Account approved by Admin | University / Industry | *"Account Verified! You can now access full platform capabilities."* |
