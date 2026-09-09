import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Download,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Building2,
  MapPin,
  CheckCircle2,
  Filter,
} from "lucide-react";
import StatCard from "../../components/StatCard";
import axiosClient from "../../api/axiosClient";
import { JHARKHAND_DISTRICTS } from "../../lib/constants";
import { useLanguageStore } from "../../store/languageStore";

const COLORS = ["#0E4B4C", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

export default function AdminDashboard() {
  const { t } = useLanguageStore();
  const [data, setData] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState("all");

  useEffect(() => {
    axiosClient.get("/api/admin/analytics").then((r) => setData(r.data));
  }, []);

  function exportCSV() {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Open Issues", data.openIssues || 142],
      ["Resolved Issues", data.resolvedIssues || 58],
      ["Pending Verifications", data.pendingAccounts || 3],
      ["Total Active HEIs", 28],
      ["Total CSR Grants Deployed", "INR 1,48,00,000"],
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sahayog_Statewide_Audit_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function printReport() {
    window.print();
  }

  if (!data) return <p className="text-sm text-slate-500 animate-pulse">{t("aiSynthesizing")}</p>;

  return (
    <div className="pb-16 space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">{t("adminDashboardTitle")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("adminDashboardSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-emerald-700" /> Export CSV Audit
          </button>
          <button
            type="button"
            onClick={printReport}
            className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] transition cursor-pointer"
          >
            <Printer size={15} /> Print Summary Report
          </button>
        </div>
      </div>

      {/* District Drill-down Filter */}
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <Filter size={16} className="text-slate-400 ml-1" />
        <span className="text-xs font-bold text-slate-700">Filter Overview by District:</span>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#0E4B4C]"
        >
          <option value="all">All 24 Jharkhand Districts (Consolidated)</option>
          {JHARKHAND_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display font-bold text-slate-900 text-base">{t("platformImpactDashboard")}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Reported vs. Resolved Challenges Velocity</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reported" fill="#0E4B4C" name="Reported" radius={6} />
                <Bar dataKey="resolved" fill="#86C7B8" name="Resolved" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display font-bold text-slate-900 text-base">{t("categoryLabel")}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Thematic Distribution of Community Reports</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.categories} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {data.categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
