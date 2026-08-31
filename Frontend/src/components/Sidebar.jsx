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
  Sparkles,
  Users,
} from "lucide-react";
import { ROLES, ROLE_LABELS } from "../lib/constants";
import { useAuthStore } from "../store/authStore";

const NAV = {
  citizen: [
    { to: "/my-issues", label: "My Reported Issues", icon: ClipboardList },
    { to: "/report", label: "Report New Issue", icon: PlusCircle },
  ],
  community_reporter: [
    { to: "/my-issues", label: "My Reported Issues", icon: ClipboardList },
    { to: "/report", label: "Report New Issue", icon: PlusCircle },
  ],
  [ROLES.UNIVERSITY]: [
    { to: "/university/dashboard", label: "University Dashboard", icon: LayoutDashboard },
    { to: "/university/queue", label: "Nearest Issue Queue", icon: MapPin },
    { to: "/university/projects", label: "Innovation Projects", icon: FolderKanban },
  ],
  [ROLES.INDUSTRY]: [
    { to: "/industry/queue", label: "Incoming Proposals", icon: ClipboardList },
    { to: "/industry/projects", label: "Funded Projects", icon: FolderKanban },
  ],
  [ROLES.ADMIN]: [
    { to: "/admin/dashboard", label: "State Analytics", icon: LayoutDashboard },
    { to: "/admin/verify-accounts", label: "Verify Accounts", icon: ShieldCheck },
  ],
};

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const items = NAV[user?.role] || NAV.citizen || [];
  const cta =
    user?.role === "citizen" || user?.role === "community_reporter" || user?.role === ROLES.REPORTER
      ? { to: "/report", label: "+ Report Civic Issue" }
      : user?.role === ROLES.UNIVERSITY
        ? { to: "/university/queue", label: "Explore Issue Queue" }
        : null;

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E4B4C] text-white shadow-sm shadow-[#0E4B4C]/25">
          <Sparkles size={18} className="text-[#D7F5DE]" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-[#0E4B4C] leading-none">Sahayog</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Societal Innovation Portal</p>
        </div>
      </div>

      {/* User Org Tag */}
      {user && (
        <div className="mx-3 mt-3 rounded-xl bg-[#F7F8FA] border border-slate-200/70 p-2.5">
          <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
          <p className="text-[11px] text-teal-700 font-medium truncate">
            {user.org || ROLE_LABELS[user.role]}
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#D7F5DE] text-[#0E4B4C] shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
          className="mx-3 mb-3 rounded-xl bg-[#0E4B4C] px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm shadow-[#0E4B4C]/25 transition hover:bg-[#0b3b3c]"
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
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <LogOut size={18} /> Sign out
        </button>
        <div className="mt-2 flex items-center justify-between px-3 text-[11px] text-slate-400">
          <span>Sahayog Network</span>
          <span className="rounded bg-teal-50 text-teal-800 px-1.5 py-0.5 font-medium">Active</span>
        </div>
      </div>
    </aside>
  );
}
