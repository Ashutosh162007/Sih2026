import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "./lib/constants";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupPending from "./pages/SignupPending";

const ReportIssue = lazy(() => import("./pages/reporter/ReportIssue"));
const MyIssues = lazy(() => import("./pages/reporter/MyIssues"));
const IssueDetail = lazy(() => import("./pages/issues/IssueDetail"));
const UniversityDashboard = lazy(() => import("./pages/university/UniversityDashboard"));
const UniversityQueue = lazy(() => import("./pages/university/UniversityQueue"));
const UniversityProjects = lazy(() => import("./pages/university/UniversityProjects"));
const ProposalWizard = lazy(() => import("./pages/university/ProposalWizard"));
const IndustryQueue = lazy(() => import("./pages/industry/IndustryQueue"));
const IndustryProjects = lazy(() => import("./pages/industry/IndustryProjects"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const VerifyAccounts = lazy(() => import("./pages/admin/VerifyAccounts"));

function PageLoader() {
  return <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">Loading…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/pending" element={<SignupPending />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/issues/:id" element={<IssueDetail />} />
            <Route element={<ProtectedRoute roles={[ROLES.REPORTER]} />}>
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/my-issues" element={<MyIssues />} />
            </Route>
            <Route element={<ProtectedRoute roles={[ROLES.UNIVERSITY]} />}>
              <Route path="/university/dashboard" element={<UniversityDashboard />} />
              <Route path="/university/queue" element={<UniversityQueue />} />
              <Route path="/university/projects" element={<UniversityProjects />} />
              <Route path="/university/projects/:id/proposal" element={<ProposalWizard />} />
            </Route>
            <Route element={<ProtectedRoute roles={[ROLES.INDUSTRY]} />}>
              <Route path="/industry/queue" element={<IndustryQueue />} />
              <Route path="/industry/projects" element={<IndustryProjects />} />
            </Route>
            <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/verify-accounts" element={<VerifyAccounts />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
