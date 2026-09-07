# Sahayog — RESTful API Documentation

Base URL: `http://localhost:5000/api`

All non-public endpoints require `Authorization: Bearer <jwt_token>` header.

---

## 1. Authentication & Users

### Register Account
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "name": "Dr. Kavita Rao",
    "email": "university@sahayog.in",
    "password": "password",
    "role": "university",
    "org": "BIT Mesra",
    "district": "Ranchi"
  }
  ```
- **Response**: `201 Created` with `{ token, user }`

### Login
- **POST** `/api/auth/login`
- **Body**: `{ "email": "reporter@sahayog.in", "password": "password" }`
- **Response**: `200 OK` with `{ token, user }`

### Get User Profile
- **GET** `/api/users/profile` (Protected)
- **Response**: `200 OK` with User object

---

## 2. Issues & AI Analysis

### AI Problem Synthesis Preview
- **POST** `/api/issues/ai-preview`
- **Body**:
  ```json
  {
    "title": "Broken storm drain flooding Albert Ekka Chowk",
    "description": "Drain overflows during monsoons causing water stagnation...",
    "category": "Infrastructure",
    "district": "Ranchi",
    "block": "Kanke"
  }
  ```
- **Response**: `200 OK` with `{ success: true, aiProblemStatement, severity, priority, category }`

### Submit Issue Report
- **POST** `/api/issues` (Protected, supports JSON or multipart with `image`)
- **Response**: `201 Created` with created Issue document, AI problem statement, and nearest universities calculated.

### Get Issues
- **GET** `/api/issues?reporterId=...&status=...&category=...&district=...&lat=...&lng=...`
- **Response**: `200 OK` with array of issues sorted by date or proximity.

### Get Issue by ID
- **GET** `/api/issues/:id`
- **Response**: `200 OK` with detailed issue, timeline, severity score, and nearest university hubs.

### Update Issue Status
- **PATCH** `/api/issues/:id/status` (Protected)
- **Body**: `{ "status": "Resolved", "note": "Ground verification complete" }`
- **Response**: `200 OK`

---

## 3. University Collaboration

### Get University Queue (Proximity-Ranked)
- **GET** `/api/university/queue?lat=23.4123&lng=85.4399`
- **Response**: `200 OK` with issues ordered by Haversine distance from campus.

### Claim Issue
- **POST** `/api/university/issues/:id/claim` (Protected)
- **Response**: `200 OK` with updated status `Assigned`.

### Save Multidisciplinary Team
- **POST** `/api/projects/:issueId/teams` (Protected)
- **Body**:
  ```json
  {
    "team": [
      { "discipline": "Environmental Science", "members": ["Dr. Roy", "Dev"] },
      { "discipline": "Civil Engineering", "members": ["Harsh"] }
    ]
  }
  ```

### Submit Solution Proposal
- **POST** `/api/projects/:issueId/proposals` (Protected)
- **Body**:
  ```json
  {
    "title": "Community Defluoridation Plant",
    "proposal": "Technical plan and methodology...",
    "expectedImpact": "Clean water for 350 families",
    "milestones": [
      { "name": "Field Sampling", "due": "2026-09-15", "done": false }
    ]
  }
  ```

---

## 4. Industry Partnership & CSR Funding

### Get Proposals Awaiting Funding
- **GET** `/api/industry/proposals`
- **Response**: `200 OK` with university proposals ready for funding.

### Commit Funding & Set Deadline
- **POST** `/api/projects/:projectId/fund` (Protected)
- **Body**:
  ```json
  {
    "fundingAmount": 350000,
    "deadline": "2026-11-30",
    "mentorshipNotes": "Lab access and testing equipment sponsorship"
  }
  ```
- **Response**: `200 OK` (Sets status to `Funded`, updates issue timeline, and notifies citizen reporter).

### Update Project Milestones
- **PATCH** `/api/projects/:projectId/milestones` (Protected)
- **Body**: `{ "milestones": [...] }`
- **Response**: `200 OK` (If all milestones are done, automatically marks project as `Completed`, issue as `Resolved`, and notifies citizen!).

---

## 5. Admin & Analytics

### Get Pending Account Verifications
- **GET** `/api/admin/verifications` (Protected: Admin)

### Decide Verification
- **PATCH** `/api/admin/verifications/:userId` (Protected: Admin)
- **Body**: `{ "decision": "approve" }`

### Get State-wide Analytics
- **GET** `/api/admin/analytics`
- **Response**: Total issues, resolved issues, open issues, active HEIs, CSR capital mobilized (₹), monthly trends, and domain mix.

---

## 6. Notifications

### Get Notifications
- **GET** `/api/notifications` (Protected)
- **Response**: Real-time notifications for the authenticated user/role.

### Mark All Read
- **PATCH** `/api/notifications/read-all` (Protected)
