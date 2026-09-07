# CivicPulse — Frontend Build Specification

## 1. Project Overview
CivicPulse is a responsive web platform designed to connect **Community Reporters** (citizens), **Universities**, and **Industries** to solve civic issues, overseen by an **Admin/Government** analytics layer. 

*   **Design Language:** Institutional-but-modern.
*   **Key Traits:** Deep teal accents, card-based dashboards, serif display headings for trust signaling.
*   **Role Label Decision:** Use **"Community Reporter"** in UI copy (replaces generic "Citizen").

## 2. Tech Stack
*   **Framework:** React + Vite (Use standard React SPA architecture)
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM
*   **API Client:** Axios (Centralized at `src/api/axiosClient.js` with JWT interceptors)
*   **State Management:** Zustand (preferred for auth/user/wizard state)
*   **Forms & Validation:** React Hook Form + Zod
*   **Charts:** Recharts
*   **Mapping:** Leaflet (or Google Maps JS SDK)

---

## 3. Visual Design System

### Colors & Tokens
| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| **Primary/Accent** | `#0E4B4C` | Primary buttons, active nav text, progress bars, stepper circles |
| **Active Highlight** | `#D7F5DE` | Background pill behind the active sidebar item |
| **Background** | `#F7F8FA` | App background (off-white gray) |
| **Surface (Cards)** | `#FFFFFF` | 12–16px border-radius, subtle 1px border OR soft shadow |

### Status & Priority Badges (Constants)
*Design Rule: Soft pastel fill + matching dark text. Always pair color with a text label.*
*   **Red/Coral:** High priority
*   **Amber:** Medium priority / Under review
*   **Green:** New / Resolved
*   **Blue:** Category tags (e.g., Infrastructure)
*   **Gray:** Neutral / Assigned states

### Typography
*   **Display:** Serif/Slab font (e.g., Merriweather, Roboto Slab) for page titles and hero headings (e.g., "Empowering Societal Innovation").
*   **Body:** Clean Sans-Serif (e.g., Inter, Roboto) for body text, labels, nav, and buttons.
*   *Constraint: Maximum two weights per font family.*

---

## 4. Core Components to Build First

| Component | Props/Notes |
| :--- | :--- |
| `StatCard` | `icon`, `badgeColor`, `label`, `number`, `trendData` (Recharts sparkline) |
| `StatusBadge` | `variant` (priority, category, status), `label` |
| `ListItemCard` | `title`, `description`, `status`, `priority`, `metadata` (assignee/date), `onClick` (chevron) |
| `Stepper` | `steps` (array), `currentStep`, visual states: completed (teal+check), active, upcoming |
| `FileDropzone` | Drag-drop area, thumbnail preview row with `filename`, `size`, `onRemove` |
| `MapLocationPicker`| Draggable pin, "use current location" button, inputs: District, Block, Landmark |
| `AssessmentSlider` | `label`, `value`, `readOnly` (boolean) |
| `TeamBuilder` | Discipline rows, avatar stack, "N selected" counter, Add button |
| `Sidebar` | Logo, nav items, pinned CTA, help/logout at bottom |
| `TopBar` | Search input, notifications dropdown, settings, user avatar |

---

## 5. Layout Patterns
*   **Auth Pages:** 50/50 split. Left side: Full-bleed photo + logo/headline. Right side: White form panel, Google SSO button, divider, email/password fields, primary submit button.
*   **Authenticated Shell:** Fixed left `Sidebar` + `TopBar` + Scrollable main content area.
*   **Dashboard Grids:** `StatCard` grid is 4-per-row on desktop, stacking 1-per-row on mobile.
*   **Detail Pages:** Two-column split. Main content (65%) for description, image gallery, reporter attribution. Right sidebar (35%) for Assessment sliders or Build Team panels.

---

## 6. Issue Submission Wizard (Community Reporter)
*Note to AI: State should be collected across all steps before submitting the final payload. Ensure `Details` and `Evidence` payloads match backend AI-processor requirements.*

1.  **Basic Info:** Short title, Category select.
2.  **Details:** Free-text description (Feeds AI problem-statement generator).
3.  **Evidence:** Photo/video upload via `FileDropzone` (Feeds AI severity assessment).
4.  **Location:** `MapLocationPicker` + District/Block/Landmark text fields.
5.  **Review:** Read-only summary of steps 1-4 before final submit.

---

## 7. Frontend Routes (`react-router`)

| Route | Access | Key Components Used |
| :--- | :--- | :--- |
| `/` | Public | Landing hero, `StatCard` |
| `/login` | Public | Split-screen Auth |
| `/signup` | Public | Split-screen Auth |
| `/signup/pending` | Public | Waiting verification screen |
| `/report` | Reporter | `Stepper`, `FileDropzone`, `MapLocationPicker` |
| `/my-issues` | Reporter | `ListItemCard` |
| `/issues/:id` | All Roles | Two-column detail, `AssessmentSlider` |
| `/university/dashboard` | University | `StatCard`, `ListItemCard`, `TeamBuilder` |
| `/university/queue` | University | `ListItemCard` (Sorted by distance/domain) |
| `/university/projects` | University | `ListItemCard` |
| `/university/projects/:id/proposal` | University | `Stepper` |
| `/industry/queue` | Industry | `ListItemCard` (Incoming proposals) |
| `/industry/projects` | Industry | `StatCard`, `ListItemCard` (Funded projects) |
| `/admin/dashboard` | Admin | Cross-cutting analytics charts |
| `/admin/verify-accounts`| Admin | Account approval queue |

---

## 8. API Routes Specification (`axiosClient`)
Configure the `src/api/axiosClient.js` to handle the following RESTful endpoints. Ensure the client automatically attaches the JWT Bearer token to all non-public routes.

### Auth & User APIs
*   `POST /api/auth/login` — Authenticate user, return JWT.
*   `POST /api/auth/register` — Register new user (University/Industry flagged as `status: pending`).
*   `GET /api/users/profile` — Fetch current user details & role.

### Issue (Report) APIs
*   `POST /api/issues` — Submit completed 4-step wizard payload.
*   `GET /api/issues` — Fetch issues (Supports query params: `?reporterId=`, `?status=`, `?lat=`, `?lng=`).
*   `GET /api/issues/:id` — Fetch specific issue details, timeline, and AI severity score.
*   `PATCH /api/issues/:id/status` — Update issue status.

### University APIs
*   `GET /api/university/queue` — Fetch issues matching university domain/proximity.
*   `POST /api/projects/:issueId/teams` — Save team formation data from `TeamBuilder`.
*   `POST /api/projects/:issueId/proposals` — Submit a solution proposal.
*   `GET /api/university/projects` — Fetch active/past university projects.

### Industry APIs
*   `GET /api/industry/proposals` — Fetch proposals awaiting funding.
*   `POST /api/projects/:projectId/fund` — Approve funding for a proposal.
*   `PATCH /api/projects/:projectId/milestones` — Set deadlines and track project milestones.

### Admin APIs
*   `GET /api/admin/verifications` — Fetch pending University/Industry accounts.
*   `PATCH /api/admin/verifications/:userId` — Approve or reject account.
*   `GET /api/admin/analytics` — Fetch platform-wide stats for dashboard.
