import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Filter,
  MapPin,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Shield,
  Sparkles,
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { JHARKHAND_DISTRICTS, ISSUE_CATEGORIES, ISSUE_STATUSES, PRIORITIES, getCategoryLabel } from "../../lib/constants";
import axiosClient from "../../api/axiosClient";
import { useLanguageStore } from "../../store/languageStore";
import { formatDate } from "../../lib/format";
import { handleMockRequest } from "../../api/mockAdapter";

export default function AdminIssuesConsole() {
  const { language, t } = useLanguageStore();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reporterFilter, setReporterFilter] = useState("all"); // 'all' | 'citizen' | 'govt_org'
  const [actionMsg, setActionMsg] = useState("");

  async function loadIssues() {
    try {
      const res = await axiosClient.get("/api/issues");
      let list = res.data || [];
      if (list.length === 0) {
        const mockRes = await handleMockRequest({ method: "get", url: "/api/issues" });
        list = mockRes?.data || [];
      }
      setIssues(list);
    } catch (e) {
      try {
        const mockRes = await handleMockRequest({ method: "get", url: "/api/issues" });
        setIssues(mockRes?.data || []);
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIssues();
  }, []);

  async function handleStatusChange(issueId, newStatus) {
    try {
      await axiosClient.patch(`/api/issues/${issueId}/status`, { status: newStatus });
      setActionMsg(`Issue status updated to "${newStatus}".`);
      setTimeout(() => setActionMsg(""), 4000);
      loadIssues();
    } catch (_) {
      try {
        await handleMockRequest({
          method: "patch",
          url: `/api/issues/${issueId}/status`,
          data: { status: newStatus },
        });
        setActionMsg(`Issue status updated to "${newStatus}".`);
        setTimeout(() => setActionMsg(""), 4000);
        loadIssues();
      } catch (err) {
        console.error(err);
      }
    }
  }

  const filtered = issues.filter((i) => {
    if (search) {
      const q = search.toLowerCase();
      const matchTitle = i.title?.toLowerCase().includes(q);
      const matchDesc = i.description?.toLowerCase().includes(q);
      const matchDistrict = i.district?.toLowerCase().includes(q);
      const matchReporter = i.reporterName?.toLowerCase().includes(q) || i.reporterOrg?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDistrict && !matchReporter) return false;
    }
    if (districtFilter !== "all" && i.district !== districtFilter) return false;
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
    if (reporterFilter === "govt_org" && i.reporterRole !== "govt_org" && !i.reporterOrg) return false;
    if (reporterFilter === "citizen" && (i.reporterRole === "govt_org" || i.reporterOrg)) return false;
    return true;
  });

  return (
    <div className="pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-slate-900">{t("masterOversightTitle")}</h1>
            <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {t("statewideAudit")}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {t("masterOversightSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs">
            {t("totalIssuesCount")} <span className="text-[#0E4B4C] font-extrabold">{issues.length}</span>
          </span>
        </div>
      </div>

      {actionMsg && (
        <div className="rounded-2xl bg-[#D7F5DE] border border-emerald-300 p-4 text-xs font-semibold text-[#0E4B4C] flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} /> {actionMsg}
        </div>
      )}

      {/* Filters Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs outline-none transition focus:border-[#0E4B4C] focus:bg-white"
            />
          </div>

          {/* District Filter */}
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full md:w-48 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0E4B4C]"
          >
            <option value="all">{t("filterAllDistricts")}</option>
            {JHARKHAND_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0E4B4C]"
          >
            <option value="all">{t("filterAllDomains")}</option>
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {getCategoryLabel(c, language)}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0E4B4C]"
          >
            <option value="all">{t("filterAllStatuses")}</option>
            {ISSUE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Reporter Filter */}
          <select
            value={reporterFilter}
            onChange={(e) => setReporterFilter(e.target.value)}
            className="w-full md:w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#0E4B4C]"
          >
            <option value="all">{t("filterAllReporters")}</option>
            <option value="govt_org">{t("filterGovtReporters")}</option>
            <option value="citizen">{t("filterCitizenReporters")}</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            <Sparkles size={24} className="mx-auto mb-2 text-[#0E4B4C] animate-pulse" />
            {t("loadingRegistry")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            <ClipboardList size={32} className="mx-auto mb-2 text-slate-400" />
            {t("noMatchingIssues")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                  <th className="px-5 py-3.5">{t("thTitleDetails")}</th>
                  <th className="px-4 py-3.5">{t("thReporterEntity")}</th>
                  <th className="px-4 py-3.5">{t("thLocation")}</th>
                  <th className="px-4 py-3.5">{t("thAiSeverity")}</th>
                  <th className="px-4 py-3.5">{t("thStatus")}</th>
                  <th className="px-4 py-3.5 text-right">{t("thAdminAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isGovt = item.reporterRole === "govt_org" || Boolean(item.reporterOrg);
                  return (
                    <tr key={item.id || item._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 max-w-xs">
                        <Link
                          to={`/issues/${item.id || item._id}`}
                          className="font-bold text-slate-900 hover:text-[#0E4B4C] hover:underline flex items-center gap-1.5 line-clamp-1"
                        >
                          {item.title}
                          <ExternalLink size={12} className="text-slate-400 shrink-0" />
                        </Link>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <StatusBadge label={item.category} variant="category" />
                          <StatusBadge label={item.priority} variant="priority" />
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {isGovt ? (
                          <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                            🏛️ {item.reporterOrg || "Panchayat Samiti"}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-slate-700 font-medium text-[11px]">
                            👤 {item.reporterName || "Citizen Reporter"}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        <p className="font-semibold text-slate-800">{item.district}</p>
                        <p className="text-[11px] text-slate-500">{item.block || "District Central"}</p>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#0E4B4C] text-sm">
                            {item.severity?.score || 65}%
                          </span>
                          <span className="text-[10px] text-slate-400">{t("scoreLabel")}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id || item._id, e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-[#0E4B4C]"
                        >
                          {ISSUE_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <Link
                          to={`/issues/${item.id || item._id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-[#0E4B4C] hover:text-white px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer"
                        >
                          {t("viewDetailsBtn")} <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
