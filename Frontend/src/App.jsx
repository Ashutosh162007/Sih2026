import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ROLES } from "./lib/constants";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./layouts/AppShell";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupPending from "./pages/SignupPending";
import CitizenDashboard from "./pages/reporter/CitizenDashboard";
import ReportIssue from "./pages/reporter/ReportIssue";
import MyIssues from "./pages/reporter/MyIssues";
import IssueDetail from "./pages/issues/IssueDetail";
import UniversityDashboard from "./pages/university/UniversityDashboard";
import UniversityQueue from "./pages/university/UniversityQueue";
import UniversityProjects from "./pages/university/UniversityProjects";
import ProposalWizard from "./pages/university/ProposalWizard";
import IndustryDashboard from "./pages/industry/IndustryDashboard";
import IndustryQueue from "./pages/industry/IndustryQueue";
import IndustryProjects from "./pages/industry/IndustryProjects";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VerifyAccounts from "./pages/admin/VerifyAccounts";
import StateMapExplorer from "./pages/map/StateMapExplorer";
import UserProfile from "./pages/profile/UserProfile";
import InnovationShowcase from "./pages/showcase/InnovationShowcase";
import HelpFaq from "./pages/help/HelpFaq";
import WorkflowProjects from "./pages/workflow/WorkflowProjects";
import ProjectWorkflow from "./pages/workflow/ProjectWorkflow";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup/pending" element={<SignupPending />} />

        <Route element={<AppShell />}>
          {/* Public / Semi-Public Views (inside shell for sidebar) */}
          <Route path="/showcase" element={<InnovationShowcase />} />
          <Route path="/help" element={<HelpFaq />} />

          <Route element={<ProtectedRoute />}>
            {/* Common Authenticated Routes */}
            <Route path="/issues/:id" element={<IssueDetail />} />
            <Route path="/map" element={<StateMapExplorer />} />
            <Route path="/profile" element={<UserProfile />} />

            {/* Citizen / Community Reporter Routes */}
            <Route element={<ProtectedRoute roles={[ROLES.REPORTER, "community_reporter", "citizen"]} />}>
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/my-issues" element={<MyIssues />} />
            </Route>

            {/* University Routes */}
            <Route element={<ProtectedRoute roles={[ROLES.UNIVERSITY]} />}>
              <Route path="/university/dashboard" element={<UniversityDashboard />} />
              <Route path="/university/queue" element={<UniversityQueue />} />
              <Route path="/university/projects" element={<UniversityProjects />} />
              <Route path="/university/projects/:id/proposal" element={<ProposalWizard />} />
            </Route>

            {/* Workflow Routes (university, industry, admin) */}
            <Route element={<ProtectedRoute roles={[ROLES.UNIVERSITY, ROLES.INDUSTRY, ROLES.ADMIN]} />}>
              <Route path="/workflow" element={<WorkflowProjects />} />
              <Route path="/workflow/:id" element={<ProjectWorkflow />} />
            </Route>

            {/* Industry Routes */}
            <Route element={<ProtectedRoute roles={[ROLES.INDUSTRY]} />}>
              <Route path="/industry/dashboard" element={<IndustryDashboard />} />
              <Route path="/industry/queue" element={<IndustryQueue />} />
              <Route path="/industry/projects" element={<IndustryProjects />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/verify-accounts" element={<VerifyAccounts />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
