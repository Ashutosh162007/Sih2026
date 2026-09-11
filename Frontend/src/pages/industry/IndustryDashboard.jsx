import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Building2,
  FolderKanban,
  CheckCircle2,
  Award,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
} from "lucide-react";
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
import StatCard from "../../components/StatCard";
import axiosClient from "../../api/axiosClient";
import { mockAnalytics } from "../../api/mockData";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/languageStore";

import { handleMockRequest } from "../../api/mockAdapter";

const SECTOR_COLORS = ["#0E4B4C", "#2563EB", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

export default function IndustryDashboard() {
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [projRes, propRes] = await Promise.all([
          axiosClient.get("/api/university/projects"),
          axiosClient.get("/api/industry/proposals"),
        ]);
        let projs = (projRes.data || []).filter((p) => p.funded);
        let props = propRes.data || [];
        if (projs.length === 0) {
          const mockP = await handleMockRequest({ method: "get", url: "/api/university/projects" });
          projs = (mockP?.data || []).filter((p) => p.funded);
        }
        if (props.length === 0) {
          const mockProp = await handleMockRequest({ method: "get", url: "/api/industry/proposals" });
          props = mockProp?.data || [];
        }
        setProjects(projs);
        setProposals(props);
      } catch (err) {
        try {
          const [mockP, mockProp] = await Promise.all([
            handleMockRequest({ method: "get", url: "/api/university/projects" }),
            handleMockRequest({ method: "get", url: "/api/industry/proposals" }),
          ]);
          setProjects((mockP?.data || []).filter((p) => p.funded));
          setProposals(mockProp?.data || []);
        } catch (_) {}
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCommitted = projects.reduce((acc, p) => acc + (p.fundingAmount || 350000), 0);
  const totalDisbursed = projects.reduce((acc, p) => acc + (p.disbursedAmount || 150000), 0);
  const totalMilestones = projects.reduce((acc, p) => acc + (p.milestones?.length || 0), 0);
  const completedMilestones = projects.reduce((acc, p) => acc + (p.milestones?.filter((m) => m.done).length || 0), 0);

  const sectorData = mockAnalytics.csrBreakdown.map((item) => ({
    name: item.sector,
    value: item.amount,
  }));

  const monthlyData = [
    { month: "May", amount: 1500000 },
    { month: "Jun", amount: 2800000 },
    { month: "Jul", amount: 3400000 },
    { month: "Aug", amount: 4850000 },
    { month: "Sep", amount: 2250000 },
  ];

  return (
    <div className="pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-slate-900">
              {t("csrEsgAnalytics")}
            </h1>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-800">
              {user?.org || t("industry")}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {t("csrEsgSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/industry/queue")}
            className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] transition cursor-pointer"
          >
            <FolderKanban size={15} /> {t("reviewProposalsBtn")} ({proposals.length})
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="industry"
          badgeColor="teal"
          label={t("totalGrantsCommitted")}
          number={`₹${(totalCommitted / 100000).toFixed(1)} Lakh`}
          trendData={[{ i: 0, v: 3 }, { i: 1, v: 8 }]}
        />
        <StatCard
          icon="check"
          badgeColor="green"
          label={t("activeSponsoredProjects")}
          number={projects.length}
          trendData={[{ i: 0, v: 1 }, { i: 1, v: 4 }]}
        />
        <StatCard
          icon="alert"
          badgeColor="blue"
          label={t("milestonesAchieved")}
          number={`${completedMilestones}/${totalMilestones}`}
          trendData={[{ i: 0, v: 2 }, { i: 1, v: 5 }]}
        />
        <StatCard
          icon="university"
          badgeColor="amber"
          label={t("disbursedViaEscrow")}
          number={`₹${(totalDisbursed / 100000).toFixed(1)} Lakh`}
          trendData={[{ i: 0, v: 2 }, { i: 1, v: 6 }]}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sector Breakdown */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                {t("csrAllocationDomain")}
              </h2>
              <p className="text-xs text-slate-500">{t("csrScheduleSub")}</p>
            </div>
            <span className="text-xs font-bold text-[#0E4B4C]">₹1.48 Cr Total</span>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {sectorData.map((_, i) => (
                    <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {sectorData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length]} }
                />
                <span className="text-slate-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Monthly Grant Disbursals */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                {t("grantDisbursementVelocity")}
              </h2>
              <p className="text-xs text-slate-500">{t("trancheReleasesSub")}</p>
            </div>
          </div>

          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(val) => `₹${val / 100000}L`} />
                <Tooltip formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`} />
                <Bar dataKey="amount" fill="#0E4B4C" radius={[6, 6, 0, 0]} name="Disbursed (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Quick Access to Funded Projects & Proposal Pipeline */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {t("activePortfolios")}
            </h2>
            <p className="text-xs text-slate-500">{t("liveInnovationSub")}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/industry/projects")}
            className="text-xs font-bold text-[#0E4B4C] hover:underline cursor-pointer"
          >
            {t("manageAllFunded")}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {projects.slice(0, 3).map((p) => {
            const completed = p.milestones?.filter((m) => m.done).length || 0;
            const total = p.milestones?.length || 1;
            const percent = Math.round((completed / total) * 100);

            return (
              <div
                key={p.id || p._id}
                onClick={() => navigate("/industry/projects")}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-100 bg-[#F7F8FA] p-4 hover:border-teal-300 hover:bg-white transition cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {p.university}
                  </span>
                  <h3 className="font-semibold text-sm text-slate-900 mt-1">{p.title}</h3>
                  <p className="text-xs text-slate-500">{t("grant")}: ₹{(p.fundingAmount || 350000).toLocaleString("en-IN")}</p>
                </div>

                <div className="w-full sm:w-48 text-right">
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>{t("progress")}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-[#0E4B4C]" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
