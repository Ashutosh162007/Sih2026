import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  ClipboardList,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Award,
  User,
  Compass,
} from "lucide-react";
import { ROLES, ROLE_LABELS } from "../lib/constants";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/languageStore";
import BrandLogo from "./BrandLogo";

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const NAV = {
    citizen: [
      { to: "/citizen/dashboard", label: t("navCitizenDashboard"), icon: LayoutDashboard },
      { to: "/my-issues", label: t("navMyIssues"), icon: ClipboardList },
      { to: "/report", label: t("navReportIssue"), icon: PlusCircle },
      { to: "/map", label: t("navGisMap"), icon: MapPin },
      { to: "/showcase", label: t("navShowcase"), icon: Award },
      { to: "/help", label: t("navHelpFaq"), icon: HelpCircle },
    ],
    govt_org: [
      { to: "/citizen/dashboard", label: t("navCitizenDashboard"), icon: LayoutDashboard },
      { to: "/my-issues", label: t("navMyIssues"), icon: ClipboardList },
      { to: "/report", label: t("navReportIssue"), icon: PlusCircle },
      { to: "/map", label: t("navGisMap"), icon: MapPin },
      { to: "/showcase", label: t("navShowcase"), icon: Award },
      { to: "/help", label: t("navHelpFaq"), icon: HelpCircle },
    ],
    community_reporter: [
      { to: "/citizen/dashboard", label: t("navCitizenDashboard"), icon: LayoutDashboard },
      { to: "/my-issues", label: t("navMyIssues"), icon: ClipboardList },
      { to: "/report", label: t("navReportIssue"), icon: PlusCircle },
      { to: "/map", label: t("navGisMap"), icon: MapPin },
      { to: "/showcase", label: t("navShowcase"), icon: Award },
      { to: "/help", label: t("navHelpFaq"), icon: HelpCircle },
    ],
    [ROLES.UNIVERSITY]: [
      { to: "/university/dashboard", label: t("navUniDashboard"), icon: LayoutDashboard },
      { to: "/university/queue", label: t("navCampusQueue"), icon: MapPin },
      { to: "/university/projects", label: t("navProjects"), icon: FolderKanban },
      { to: "/map", label: t("navGisMap"), icon: Compass },
      { to: "/showcase", label: t("navShowcase"), icon: Award },
      { to: "/help", label: t("navHelpFaq"), icon: HelpCircle },
    ],
    [ROLES.INDUSTRY]: [
      { to: "/industry/dashboard", label: t("navCsrDashboard"), icon: LayoutDashboard },
      { to: "/industry/queue", label: t("navCsrQueue"), icon: ClipboardList },
      { to: "/industry/projects", label: t("navFundedProjects"), icon: FolderKanban },
      { to: "/map", label: t("navGisMap"), icon: Compass },
      { to: "/showcase", label: t("navShowcase"), icon: Award },
      { to: "/help", label: t("navHelpFaq"), icon: HelpCircle },
    ],
    [ROLES.ADMIN]: [
      { to: "/admin/dashboard", label: t("navAdminAnalytics"), icon: LayoutDashboard },
      { to: "/admin/verify-accounts", label: t("navVerifyAccounts"), icon: ShieldCheck },
      { to: "/admin/issues", label: t("navAdminIssues") || "Master Issue Console", icon: ClipboardList },
      { to: "/admin/audit-logs", label: t("navAdminAudit") || "System Audit Logs", icon: Bell },
      { to: "/map", label: t("navGisMap"), icon: MapPin },
      { to: "/help", label: t("navHelpFaq"), icon: HelpCircle },
    ],
  };

  const items = NAV[user?.role] || NAV.citizen || [];
  const cta =
    user?.role === "citizen" || user?.role === "community_reporter" || user?.role === ROLES.REPORTER || user?.role === "govt_org"
      ? { to: "/report", label: t("ctaReportCivic") }
      : user?.role === ROLES.UNIVERSITY
        ? { to: "/university/queue", label: t("ctaExploreQueue") }
        : null;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand Header */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-3 px-5 py-5 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition"
      >
        <BrandLogo className="h-9 w-9 shadow-sm shadow-[#0E4B4C]/25" />
        <div>
          <p className="font-display text-lg font-bold text-[#0E4B4C] leading-none">{t("portalBrand")}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{t("portalSubtitle")}</p>
        </div>
      </div>

      {/* User Org Tag */}
      {user && (
        <div
          onClick={() => navigate("/profile")}
          className="mx-3 mt-3 rounded-xl bg-[#F7F8FA] border border-slate-200/70 p-2.5 hover:border-teal-300 transition cursor-pointer"
        >
          <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
          <p className="text-[11px] text-teal-700 font-medium truncate">
            {user.org || t(user.role) || ROLE_LABELS[user.role]}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-[#D7F5DE] text-[#0E4B4C] shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {cta && (
        <NavLink
          to={cta.to}
          className="mx-3 mb-3 rounded-xl bg-[#0E4B4C] px-3 py-2.5 text-center text-xs font-bold text-white shadow-sm shadow-[#0E4B4C]/25 transition hover:bg-[#0b3b3c]"
        >
          {cta.label}
        </NavLink>
      )}

      {/* Footer */}
      <div className="border-t border-slate-100 px-3 py-3">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
        >
          <LogOut size={16} /> {t("signOut")}
        </button>
        <div className="mt-2 flex items-center justify-between px-3 text-[11px] text-slate-400">
          <span>{t("networkOverview")}</span>
          <span className="rounded bg-teal-50 text-teal-800 px-1.5 py-0.5 font-medium">{t("networkActive")}</span>
        </div>
      </div>
    </aside>
  );
}
