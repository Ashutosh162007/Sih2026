# Sahayog — User Flows

## 1. Actor Map

| Actor | Role in App | Primary Goal |
|---|---|---|
| Citizen / Community Reporter | `citizen` | Report a grassroots issue and track it to resolution |
| University / HEI | `university` | Claim issues, build multidisciplinary teams, propose funded solutions |
| Industry / CSR Partner | `industry` | Discover and fund impactful proposals, set deadlines, track milestones |
| Admin / Government | `admin` | Verify institutional accounts, view state-wide analytics |

---

## 2. Onboarding & Authentication

### 2.1 Email Registration + OTP
1. User selects their role (citizen, university, industry).
2. Provides name, email, password (8+ chars with upper/lower/digit/special), org (uni/industry),
   and location (district/block/coordinates).
3. Frontend validates input; `POST /api/auth/register` runs server-side strict validation.
4. A 6-digit OTP is issued (10-min expiry, previewed in dev console).
5. `POST /api/auth/verify-otp` verifies; account becomes `active` (citizens) or `pending`
   (universities/industries → admin notified).
6. A JWT is returned; user is redirected to their role dashboard.

**Alt paths:** Resend OTP (`POST /api/auth/resend-otp`, 60s cooldown); re-login of an unverified
account triggers a fresh OTP.

### 2.2 Google Sign-In
1. User clicks "Continue with Google" → `@react-oauth/google`.
2. Frontend sends the credential to `POST /api/auth/google`.
3. Server verifies the ID token, creates/updates the user, and returns a JWT and profile.

### 2.3 Login
- `POST /api/auth/login` → validates credentials (account lockout after 5 failures), returns
  token + profile.

---

## 3. Citizen — Report an Issue (5-Step Wizard)

1. **Describe:** Enter a title and free-form description.
2. **Categorize:** Pick a category; an **AI preview** (`POST /api/issues/ai-preview`) returns the
   AI-structured statement, severity, and priority live.
3. **Locate:** Place a pin on the Leaflet map (lat/lng) and set district/block/landmark.
4. **Evidence:** Upload photos/documents via the file dropzone (optional).
5. **Review & Submit:** Review the AI summary and `POST /api/issues`.

**After submission:**
- The issue is created with AI problem statement, severity score, priority, and ranked nearest
  universities.
- The citizen lands on the issue detail view and sees the timeline (`Reported → AI classified →
  Routed to nearest HEIs`).
- The citizen is notified when the issue is funded, and again when it is resolved.

## 4. University — Solve an Issue

### 4.1 Browse the Queue
- University dashboard loads `GET /api/university/queue`, listing open issues (`New`, `Under
  review`, `Assigned`) ordered by Haversine distance from campus; each card shows distance, AI
  problem statement, severity, priority, and category.

### 4.2 Claim an Issue
- `POST /api/university/issues/:id/claim` sets the issue to `Assigned` and records the
  university as assignee. A timeline entry records the claim.

### 4.3 Build a Multidisciplinary Team
- The Team Builder UI groups members by discipline.
- `POST /api/projects/:issueId/teams` saves the team (creates a `Project` in `Team forming`
  state if none exists).

### 4.4 Submit a Proposal (4-Step Wizard)
1. **Overview:** title + project summary.
2. **Team:** confirm disciplines/members.
3. **Methodology:** detailed proposal + expected impact.
4. **Milestones:** define milestone names and due dates.

- `POST /api/projects/:issueId/proposals` persists the proposal, sets status to
  `Awaiting funding`, advances the issue to `Assigned`, and notifies industry partners.

## 5. Industry — Fund a Proposal

1. Industry dashboard loads `GET /api/industry/proposals` (projects with status
   `Awaiting funding`).
2. Industry reviews proposal, team, milestones, and expected impact.
3. Industry commits funding: amount (₹), deadline, mentorship notes.
4. `POST /api/projects/:projectId/fund` sets the project to `Funded` and `In progress` on the
   issue, records funding metadata, and notifies the university and citizen reporter.
5. Industry tracks progress via milestones on the funded-projects dashboard
   (`GET /api/industry/projects`).

## 6. Milestone Tracking & Resolution

- Universities update milestones via `PATCH /api/projects/:projectId/milestones`.
- When **all** milestones are `done`, the project auto-transitions to `Completed` and the linked
  issue to `Resolved`; the citizen receives a resolution notification.

## 7. Admin — Governance

### 7.1 Verify Accounts
- Admin dashboard lists pending accounts (`GET /api/admin/verifications`).
- Admin approves/rejects via `PATCH /api/admin/verifications/:userId` (sets `active`/`rejected`).

### 7.2 Analytics
- `GET /api/admin/analytics` returns stat cards (open issues, active universities, industry
  partners, resolved this month), a category mix, funding mobilized (₹), and monthly
  reported-vs-resolved trends — rendered with Recharts.

## 8. Notifications

- Role-targeted (`all`, `citizen`, `university`, `industry`, `admin`) and user-targeted
  notifications are created at each milestone (report, proposal, funding, resolution).
- `GET /api/notifications` fetches the user's feed; `PATCH /api/notifications/:id/read` and
  `PATCH /api/notifications/read-all` mark them read.

---

## 9. Decision Flow Summary

```
Report → AI structure/severity → Route (Haversine+discipline) → Claim (university)
      → Team formed → Proposal → Fund (industry) → Milestones → Resolved → Notify citizen
```
