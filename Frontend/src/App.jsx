import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "./lib/constants";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupPending from "./pages/SignupPending";
import ReportIssue from "./pages/reporter/ReportIssue";
import MyIssues from "./pages/reporter/MyIssues";
import IssueDetail from "./pages/issues/IssueDetail";
import UniversityDashboard from "./pages/university/UniversityDashboard";
import UniversityQueue from "./pages/university/UniversityQueue";
import UniversityProjects from "./pages/university/UniversityProjects";
import ProposalWizard from "./pages/university/ProposalWizard";
import IndustryQueue from "./pages/industry/IndustryQueue";
import IndustryProjects from "./pages/industry/IndustryProjects";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VerifyAccounts from "./pages/admin/VerifyAccounts";

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
