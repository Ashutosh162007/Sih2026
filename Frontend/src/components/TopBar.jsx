import { useState, useEffect } from "react";
import { Bell, Search, Sparkles, CheckCheck } from "lucide-react";
import { ROLE_LABELS } from "../lib/constants";
import { useAuthStore } from "../store/authStore";
import axiosClient from "../api/axiosClient";
import { formatDate } from "../lib/format";

export default function TopBar() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const { data } = await axiosClient.get("/api/notifications");
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await axiosClient.patch("/api/notifications/read-all");
      setNotifications((list) => list.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <div className="relative min-w-0 flex-1 max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          placeholder="Search issues, research projects, universities, CSR partners..."
          className="w-full rounded-xl border border-slate-200 bg-[#F7F8FA] py-2 pl-9.5 pr-4 text-sm outline-none transition focus:border-[#0E4B4C] focus:bg-white"
        />
      </div>

      <div className="flex-1" />

      {/* Notifications Drawer */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (!open && unreadCount > 0) markAllRead();
          }}
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 transition"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 z-30 mt-2 w-84 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bell size={15} className="text-[#0E4B4C]" /> Live Notifications
              </p>
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-teal-700 hover:underline flex items-center gap-1"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            </div>
            <div className="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id || n._id}
                  className={`rounded-xl border p-2.5 text-xs transition ${
                    n.read ? "border-slate-100 bg-white text-slate-600" : "border-teal-100 bg-[#D7F5DE]/20 text-slate-900 font-medium"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <p className="mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                  <p className="mt-1.5 text-[10px] text-slate-400">{formatDate(n.createdAt || new Date())}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="py-4 text-center text-xs text-slate-400">No new notifications.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E4B4C] text-sm font-bold text-white shadow-sm shadow-[#0E4B4C]/25">
          {user?.name?.slice(0, 1) || "S"}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-semibold leading-tight text-slate-900">{user?.name || "User"}</p>
          <p className="text-[11px] text-slate-500 font-medium">{ROLE_LABELS[user?.role] || "User"}</p>
        </div>
      </div>
    </header>
  );
}
