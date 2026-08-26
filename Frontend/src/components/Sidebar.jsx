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
  Users,
} from "lucide-react";
import { ROLES } from "../lib/constants";
import { useAuthStore } from "../store/authStore";

const NAV = {
  [ROLES.REPORTER]: [
    { to: "/my-issues", label: "My issues", icon: ClipboardList },
    { to: "/report", label: "Report issue", icon: PlusCircle },
  ],
  [ROLES.UNIVERSITY]: [
    { to: "/university/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/university/queue", label: "Issue queue", icon: MapPin },
    { to: "/university/projects", label: "Projects", icon: FolderKanban },
  ],
  [ROLES.INDUSTRY]: [
    { to: "/industry/queue", label: "Proposals", icon: ClipboardList },
    { to: "/industry/projects", label: "Funded projects", icon: FolderKanban },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin/dashboard", label: "Analytics", icon: LayoutDashboard },
    { to: "/admin/verify-accounts", label: "Verify accounts", icon: ShieldCheck },
  ],
};

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const items = NAV[user?.role] || [];
  const cta =
    user?.role === ROLES.REPORTER
      ? { to: "/report", label: "New report" }
      : user?.role === ROLES.UNIVERSITY
        ? { to: "/university/queue", label: "Review queue" }
        : null;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="px-5 py-6">
        <p className="font-display text-xl text-primary">CivicPulse</p>
        <p className="text-xs text-slate-500">Societal innovation network</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                isActive ? "bg-highlight text-primary" : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      {cta && (
        <NavLink
          to={cta.to}
          className="mx-4 mb-3 rounded-xl bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white"
        >
          {cta.label}
        </NavLink>
      )}
      <div className="border-t border-slate-100 px-3 py-4">
        <button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600">
          <HelpCircle size={18} /> Help
        </button>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <LogOut size={18} /> Log out
        </button>
        <div className="mt-2 flex items-center gap-2 px-3 text-xs text-slate-400">
          <Bell size={14} /> <Users size={14} /> Role-aware workspace
        </div>
      </div>
    </aside>
  );
}
