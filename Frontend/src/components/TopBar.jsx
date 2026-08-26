import { useState } from "react";
import { Bell, Search, Settings } from "lucide-react";
import { ROLE_LABELS } from "../lib/constants";
import { useAuthStore } from "../store/authStore";

export default function TopBar() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          placeholder="Search issues, projects, partners..."
          className="w-full rounded-xl border border-slate-200 bg-canvas py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
            <p className="text-sm font-semibold">Notifications</p>
            <p className="mt-2 text-sm text-slate-500">AI scored a new high-priority issue in your district.</p>
            <p className="mt-2 text-sm text-slate-500">Proposal awaiting industry review.</p>
          </div>
        )}
      </div>
      <button type="button" className="rounded-xl border border-slate-200 p-2 text-slate-600" aria-label="Settings">
        <Settings size={18} />
      </button>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {user?.name?.slice(0, 1) || "C"}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold leading-tight">{user?.name}</p>
          <p className="text-xs text-slate-500">{ROLE_LABELS[user?.role]}</p>
        </div>
      </div>
    </header>
  );
}
