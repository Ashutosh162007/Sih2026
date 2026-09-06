# BOX — Common Bugs Found in Soumils-Experiment

Day-to-day bugs found during the code audit of the `Soumils-Experiment` branch.
Each entry gives the exact file, what is wrong, and a quick fix. This list only
covers common bugs (data loss, wrong permissions, broken UI flows, secrets in
the repo). It does NOT cover advanced/architectural issues.

> **Fix status:** Bugs #1–#13, #15, #16 have been fixed. Bug #14 (demo accounts
> sharing `password`) is intentional demo data and was left untouched so the
> documented demo logins still work.

---

## 1. Anyone can log into any account with password `password`

- **File:** `Backend/controllers/authController.js` (login, ~line 100)
- **Bug:** `if (!isMatch && password !== 'password')` — when the password is
  exactly `password`, login succeeds for the *first matching account* even
  though the real password is wrong. Comment says "support easy demo password
  in dev", but there is no environment check — it is live in production too.
- **Fix:** Gate the demo password behind `process.env.NODE_ENV !== 'production'`
  (or remove it entirely). Demo accounts from `Backend/scripts/seed.js` already
  use `password`, so the seed alone is enough for testing.

## 2. `Frontend/.env` is committed to the repo

- **File:** `Frontend/.env` (tracked, listed by `git ls-files`)
- **Bug:** The real Google OAuth Client ID is committed even though
  `Frontend/.gitignore` ignores `.env`. Anyone cloning the repo gets the real
  client ID.
- **Fix:** `git rm --cached Frontend/.env` and commit the removal; keep a
  `Frontend/.env.example` with placeholders.

## 3. Hardcoded / example secrets committed in backend

- **Files:** `Backend/.env.example` (JWT secret `sahayog_secret_jwt_key_2026`,
  real Google Client ID), `Backend/middleware/auth.js` and
  `Backend/controllers/authController.js` (fallback JWT secret
  `sahayog_sih2026_jwt_secret_dev_key_2026`).
- **Bug:** A fallback JWT secret is used whenever `JWT_SECRET` env var is
  unset, so tokens are signed with a public, hardcoded value. The `.env.example`
  ships a working secret + real Google Client ID.
- **Fix:** Remove the hardcoded fallback; throw a clear startup error if
  `JWT_SECRET` is missing. Empty the `.env.example` values with placeholders.

## 4. Admin analytics endpoint is public

- **File:** `Backend/routes/adminRoutes.js`
- **Bug:** `router.get('/analytics', getAnalytics)` has no `protect` /
  `authorize('admin')`, while the other admin routes (`/verifications`,
  `PATCH /verifications/:userId`) are protected. Analytics is exposed to anyone.
- **Fix:** `router.get('/analytics', protect, authorize('admin'), getAnalytics);`

## 5. Reported issue location and photos are silently lost

- **File:** `Frontend/src/pages/reporter/ReportIssue.jsx` (submit, ~line 85) and
  `Backend/controllers/issueController.js` (createIssue)
- **Bug:** The frontend sends location nested:
  `payload.location = { district, block, landmark, lat, lng }`. The backend
  `createIssue` reads **top-level** `req.body.district / block / landmark /
  lat / lng`. So every issue is stored with the default "Ranchi / Kanke"
  coordinates — the citizen's real pin never reaches the database. The photo
  evidence collected by `FileDropzone` is also never included in the payload,
  so uploaded pictures are dropped too (both real API and mock adapter ignore
  them → "No photographic evidence attached").
- **Fix:** Send top-level fields in the payload:
  `{ ..., district, block, landmark, lat, lng, evidence }`, or read the nested
  `req.body.location` on the backend. Always pass `data.evidence` along with the
  photos.

## 6. Citizen feedback endpoint is not mounted — 404 on live backend

- **Files:** `Backend/routes/issueRoutes.js`,
  `Backend/controllers/issueController.js` (submitFeedback)
- **Bug:** `submitFeedback` is written and exported, and
  `Frontend/src/components/CitizenFeedbackCard.jsx` does
  `POST /api/issues/:id/feedback`, but the route is **never registered** in
  `issueRoutes.js` (it imports the controller, then only registers
  `/ai-preview`, `/`, `/:id`, `/:id/status`). The feedback form works in mock
  mode only; against the live backend it returns 404 and the error is just
  `console.error`-ed, so the citizen has no idea the rating was rejected.
- **Fix:** Add `router.post('/:id/feedback', protect, authorize(...), submitFeedback);`

## 7. Industry milestone toggle returns 403

- **Files:** `Backend/routes/projectRoutes.js` (`PATCH /:projectId/milestones`
  is `authorize('university')`) and
  `Frontend/src/pages/industry/IndustryProjects.jsx`
- **Bug:** The Industry page renders milestone checkboxes and calls that
  endpoint as an `industry` user → 403 every time. The toggle code has no
  try/catch either, so it throws an unhandled rejection.
- **Fix:** Allow `industry` in the authorize list (e.g.
  `authorize('university', 'industry')`), and wrap the toggle call in
  try/catch.

## 8. Issue detail page has no error handling → infinite spinner

- **File:** `Frontend/src/pages/issues/IssueDetail.jsx`
- **Bug:** `useEffect` calls `axiosClient.get('/api/issues/'+id).then(...)` with
  **no `.catch`**. If the fetch fails (or `id` is bad) the promise rejects
  unhandled and the page spins on "AI synthesizing…" forever.
- **Fix:** Add `.catch` that sets an error state and renders a retry UI.

## 9. Severity sliders show duplicated labels / wrong value source

- **File:** `Frontend/src/pages/issues/IssueDetail.jsx` (~line 202)
- **Bug:** The first slider is
  `<AssessmentSlider label={t("publicRisk")} value={issue.severity?.flooding} />`
  — it both reuses the `publicRisk` label (duplicate next to the real
  `publicRisk` slider on line 203) and pulls a value (`flooding`) that may not
  exist in the stored severity object (createIssue seeds `{ score, publicRisk,
  urgency }`, no `flooding`). Result: two sliders both titled "Public Risk" and
  one shows a default 65 that is never persisted.
- **Fix:** Use a distinct key (e.g. `flooding`/`t("floodRisk")` or a stored
  value), matching what `AssessmentSlider`/backend actually persist.

## 10. "Overall Resolution" always shows 100%

- **File:** `Frontend/src/components/TicketProgressTracker.jsx` (~line 150)
- **Bug:** The header badge "Overall Resolution **100%**" is hardcoded and
  shown even on brand-new issues at Stage 1. `progressPercent` is computed but
  never displayed.
- **Fix:** Use `project?.progress`/computed progress, or hide the number until
  the issue is resolved.

## 11. Unauthenticated users can't reach "View full analytics"

- **File:** `Frontend/src/pages/Landing.jsx` (link to `/admin/dashboard`)
- **Bug:** The public landing page links to a route inside the admin-only
  protected area. Clicking it bounces to `/login` for logged-out visitors —
  the link is a dead end.
- **Fix:** Gate that section on `user?.role === 'admin'`, or point to a public
  analytics page.

## 12. API client does not redirect on 401

- **File:** `Frontend/src/api/axiosClient.js`
- **Bug:** On a 401 response the interceptor clears the token but does not
  redirect to `/login` or clear the auth store. The user keeps staring at a
  page that renders with empty data. Network errors also silently fall back to
  the mock adapter, which hides real API breakage in production.
- **Fix:** After clearing tokens, redirect to `/login` (and reset auth state);
  disable the mock fallback when `NODE_ENV === 'production'`.

## 13. Signup performs a redundant double login

- **File:** `Frontend/src/pages/Signup.jsx`
- **Bug:** After `registerUser` already sets the auth session, the citizen path
  also calls `login()` again with the same credentials — two logins in a row,
  extra network round trip, and second window for a race.
- **Fix:** Drop the second `login()` call; rely on the register response.

## 14. Mock mode seeds accounts that all share password `password`

- **Files:** `Frontend/src/api/mockData.js`, `Backend/scripts/seed.js`
- **Bug:** In both mock mode and the real seed, every demo account (citizen,
  reporter, university, industry, admin) uses password `password`. Combined
  with bug #1 this means any demo user can be logged into by typing
  `password`. Fine for demo, dangerous if the seed/setup is copied to a real
  environment.
- **Fix:** Use unique random passwords in seed and print them, or only when
  explicitly run with a `SEED_DEMO=1` flag.

## 15. Several action buttons have no error handling

- **Files:** `Frontend/src/pages/admin/VerifyAccounts.jsx` (decide),
  `Frontend/src/pages/industry/ProposalWizard.jsx` (fetch + submit),
  `Frontend/src/pages/industry/IndustryProjects.jsx` (milestone toggle),
  `Frontend/src/components/CitizenFeedbackCard.jsx` (submit — errors only logged)
- **Bug:** All of these call the API without try/catch (or swallow errors).
  On any server error the user gets no feedback and, for unhandled promises, a
  console rejection.
- **Fix:** Wrap every async handler in try/catch and surface
  `err.response?.data?.message` to the UI.

## 16. Language support is inconsistent (hi vs kht vs en)

- **File:** `Frontend/src/components/StatusBadge.jsx`
- **Bug:** The Hindi map (हिंदी) is implemented, but the store also supports
  Khortha (`kht`) in some screens — this component only translates `hi`,
  so Khortha users see English status pills, and categories outside the map
  (e.g. Agriculture, Healthcare, Education) get the default gray pill at all
  times.
- **Fix:** Route unknown labels through the shared `t()` translator instead of
  a hardcoded map, or add the missing keys.

---

## Quick-win summary (easiest fixes first)

1. Un-harden the "password = password" login bypass (bug #1).
2. Add `protect, authorize('admin')` to `/api/admin/analytics` (bug #4).
3. Mount the missing `/api/issues/:id/feedback` route (bug #6).
4. Flatten the ReportIssue location payload + send evidence/photos (bug #5).
5. Allow `industry` on the milestones endpoint (bug #7).
6. Remove committed secrets/env files from git tracking (bugs #2, #3).
7. Add `.catch`/try-catch blocks on async flows (bugs #8, #12, #15).
8. Fix the cosmetic labels/metrics (bugs #9, #10, #16).