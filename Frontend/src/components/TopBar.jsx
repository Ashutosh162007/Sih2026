import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  CheckCheck,
  User,
  Mail,
  Building2,
  MapPin,
  ShieldCheck,
  LogOut,
  X,
  Briefcase,
  BookOpen,
  Languages,
  Moon,
  Sun,
  ArrowRight,
  FolderKanban,
  HelpCircle,
} from "lucide-react";
import { ROLE_LABELS, ROLES } from "../lib/constants";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/languageStore";
import { useThemeStore } from "../store/themeStore";
import axiosClient from "../api/axiosClient";
import { formatDate } from "../lib/format";

export default function TopBar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { language, setLanguage, t } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const darkMode = theme === "dark";
  const navigate = useNavigate();

  const [openNotifs, setOpenNotifs] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setOpenNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfile(false);
    };
    if (openNotifs || openProfile) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openNotifs, openProfile]);

  // Live search handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await axiosClient.get("/api/search", { params: { q: searchQuery } });
        setSearchResults(data);
      } catch {
        // ignore
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3 sticky top-0 z-30">
      {/* Global Search Bar Trigger */}
      <div className="relative min-w-0 flex-1 max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpenSearch(true);
          }}
          onFocus={() => setOpenSearch(true)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl border border-slate-200 bg-[#F7F8FA] py-2 pl-9.5 pr-4 text-sm outline-none transition focus:border-[#0E4B4C] focus:bg-white"
        />

        {/* Global Search Modal / Autocomplete Dropdown */}
        {openSearch && searchQuery.trim() && (
          <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in duration-100 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Search size={14} className="text-[#0E4B4C]" /> Search Results for "{searchQuery}"
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpenSearch(false);
                  setSearchQuery("");
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {searchLoading ? (
              <p className="py-4 text-center text-xs text-slate-400 animate-pulse">Searching Sahayog database...</p>
            ) : searchResults ? (
              <div className="space-y-4 text-xs">
                {/* Issues */}
                {searchResults.issues?.length > 0 && (
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
                      Civic Challenges ({searchResults.issues.length})
                    </p>
                    <div className="space-y-1.5">
                      {searchResults.issues.map((i) => (
                        <div
                          key={i.id || i._id}
                          onClick={() => {
                            setOpenSearch(false);
                            navigate(`/issues/${i.id || i._id}`);
                          }}
                          className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{i.title}</p>
                            <p className="text-[11px] text-slate-500">📍 {i.district}, {i.block} · {i.category}</p>
                          </div>
                          <span className="text-[10px] font-bold text-[#0E4B4C] bg-[#D7F5DE] px-2 py-0.5 rounded">
                            {i.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {searchResults.projects?.length > 0 && (
                  <div>
                    <p className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1.5">
                      Research & Innovation Projects ({searchResults.projects.length})
                    </p>
                    <div className="space-y-1.5">
                      {searchResults.projects.map((p) => (
                        <div
                          key={p.id || p._id}
                          onClick={() => {
                            setOpenSearch(false);
                            navigate(`/issues/${p.issueId}`);
                          }}
                          className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{p.title}</p>
                            <p className="text-[11px] text-slate-500">🏛️ {p.university} {p.industry ? `· 🏢 ${p.industry}` : ""}</p>
                          </div>
                          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.issues?.length === 0 && searchResults.projects?.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">No matching issues or projects found.</p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Dark Mode Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
        aria-label="Toggle Theme"
        title={darkMode ? "Switch to Light Mode" : "Switch to Midnight Dark"}
      >
        {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
      </button>

      {/* Language Switcher */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-xs">
        <Languages size={14} className="ml-1.5 mr-0.5 text-[#0E4B4C] hidden sm:block" />
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
            language === "en"
              ? "bg-[#0E4B4C] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("hi")}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
            language === "hi"
              ? "bg-[#0E4B4C] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          हिंदी
        </button>
        <button
          type="button"
          onClick={() => setLanguage("kht")}
          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
            language === "kht"
              ? "bg-[#0E4B4C] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          खोरठा
        </button>
      </div>

      {/* Notifications Drawer */}
      <div ref={notifRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setOpenNotifs((v) => !v);
            setOpenProfile(false);
            if (!openNotifs && unreadCount > 0) markAllRead();
          }}
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        {openNotifs && (
          <div className="absolute right-0 z-30 mt-2 w-92 rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 px-1">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell size={16} className="text-[#0E4B4C]" /> {t("liveNotifications")}
              </p>
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-teal-700 hover:text-[#0E4B4C] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={14} /> {t("markAllRead")}
              </button>
            </div>

            <div className="mt-3 max-h-88 space-y-2.5 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div
                  key={n.id || n._id}
                  onClick={() => {
                    setOpenNotifs(false);
                    if (n.issueId) {
                      navigate(`/issues/${n.issueId}`);
                    } else if (n.type === "account_verified" || n.type === "admin_alert") {
                      navigate("/admin/verify-accounts");
                    }
                  }}
                  className={`rounded-2xl border p-3 text-xs transition cursor-pointer hover:scale-[1.01] ${
                    n.read
                      ? "border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                      : "border-teal-200 bg-[#D7F5DE]/30 text-slate-900 font-medium hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="font-bold text-slate-900 leading-snug">{n.title}</p>
                    {!n.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-teal-600 animate-ping mt-1" />
                    )}
                  </div>
                  <p className="mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{formatDate(n.createdAt || new Date())}</span>
                    {n.issueId && (
                      <span className="font-bold text-[#0E4B4C] hover:underline">
                        {t("viewProgressTracker")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="py-6 text-center text-xs text-slate-400">{t("noNotifications")}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar & Profile Trigger */}
      <div ref={profileRef} className="relative pl-2 border-l border-slate-200">
        <button
          type="button"
          onClick={() => {
            setOpenProfile((v) => !v);
            setOpenNotifs(false);
          }}
          className="flex items-center gap-3 rounded-xl p-1 hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E4B4C] text-sm font-bold text-white shadow-sm shadow-[#0E4B4C]/25 ring-2 ring-transparent hover:ring-teal-300 transition">
            {user?.name?.slice(0, 1) || "S"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold leading-tight text-slate-900">{user?.name || "User"}</p>
            <p className="text-[11px] text-slate-500 font-medium">{ROLE_LABELS[user?.role] || "User"}</p>
          </div>
        </button>

        {/* Profile Details Modal */}
        {openProfile && (
          <div className="absolute right-0 z-40 mt-2 w-88 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0E4B4C] text-lg font-bold text-white shadow-md shadow-[#0E4B4C]/20">
                  {user?.name?.slice(0, 1) || "U"}
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base">{user?.name}</h3>
                  <span className="inline-block mt-0.5 rounded-md bg-[#D7F5DE] px-2 py-0.5 text-[11px] font-semibold text-[#0E4B4C]">
                    {ROLE_LABELS[user?.role] || user?.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenProfile(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Information List */}
            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5">
                <Mail size={16} className="text-[#0E4B4C] shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-medium">{t("emailAddress")}</p>
                  <p className="font-semibold text-slate-800 truncate">{user?.email || "—"}</p>
                </div>
              </div>

              {user?.org && user?.role !== ROLES.REPORTER && user?.role !== "community_reporter" && (
                <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5">
                  <Building2 size={16} className="text-blue-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-medium">{t("organization")}</p>
                    <p className="font-semibold text-slate-800 truncate">{user.org}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5">
                <MapPin size={16} className="text-amber-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-slate-400 font-medium">{t("district")}</p>
                  <p className="font-semibold text-slate-800">
                    {user?.location?.district || user?.district || "Ranchi"}, {user?.location?.block || user?.block || "Kanke"} (Jharkhand)
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpenProfile(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-teal-300 bg-teal-50/60 py-2 text-xs font-bold text-[#0E4B4C] hover:bg-teal-100 transition cursor-pointer"
              >
                <User size={14} /> View & Edit Full Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpenProfile(false);
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              >
                <LogOut size={14} /> {t("signOut")}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
