import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  ClipboardList,
  MapPin,
  ThumbsUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import StatCard from "../../components/StatCard";
import ListItemCard from "../../components/ListItemCard";
import UpwardButton from "../../components/UpwardButton";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/languageStore";

import { handleMockRequest } from "../../api/mockAdapter";

export default function CitizenDashboard() {
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguageStore();
  const navigate = useNavigate();
  const [myIssues, setMyIssues] = useState([]);
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const reporterId = user?.id || user?._id || "u-reporter";
        const [myRes, allRes] = await Promise.all([
          axiosClient.get("/api/issues", { params: { reporterId } }),
          axiosClient.get("/api/issues"),
        ]);
        let my = myRes.data || [];
        let all = allRes.data || [];
        if (my.length === 0 && all.length === 0) {
          const mockAll = await handleMockRequest({ method: "get", url: "/api/issues" });
          all = mockAll?.data || [];
          my = all.filter((i) => i.reporterId === reporterId);
          if (my.length === 0) my = all.slice(0, 2);
        }
        setMyIssues(my);
        setNearbyIssues(all.slice(0, 4));
      } catch (err) {
        try {
          const mockAll = await handleMockRequest({ method: "get", url: "/api/issues" });
          const all = mockAll?.data || [];
          setNearbyIssues(all.slice(0, 4));
          setMyIssues(all.slice(0, 2));
        } catch (_) {}
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const totalReported = myIssues.length;
  const inProgressCount = myIssues.filter((i) => i.status === "In progress" || i.status === "Assigned").length;
  const resolvedCount = myIssues.filter((i) => i.status === "Resolved").length;
  const totalUpwards = myIssues.reduce((acc, curr) => acc + (curr.upwardsCount || 0), 0);
  const impactScore = Math.min(100, Math.round((resolvedCount * 30) + (totalReported * 10) + (totalUpwards * 2)));

  return (
    <div className="pb-16 space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-slate-900">
              {t("citizenDashboardTitle")}
            </h1>
            <span className="rounded-full bg-[#D7F5DE] border border-emerald-300 px-2.5 py-0.5 text-xs font-bold text-[#0E4B4C]">
              {t("activeReporterBadge")}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {t("citizenWelcomePre")} <strong>{user?.name || t("citizen")}</strong>. {t("citizenWelcomeSub")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/map")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <MapPin size={15} className="text-[#0E4B4C]" /> {t("exploreMapBtn")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/report")}
            className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] transition cursor-pointer"
          >
            <PlusCircle size={15} /> {t("reportNewChallenge")}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="alert"
          label={t("totalReportedCount")}
          number={totalReported}
          trendData={[{ i: 0, v: 2 }, { i: 1, v: 4 }]}
        />
        <StatCard
          icon="industry"
          badgeColor="amber"
          label={t("statusUnderReview")}
          number={inProgressCount}
          trendData={[{ i: 0, v: 1 }, { i: 1, v: 3 }]}
        />
        <StatCard
          icon="check"
          badgeColor="green"
          label={t("statusResolved")}
          number={resolvedCount}
          trendData={[{ i: 0, v: 1 }, { i: 1, v: 2 }]}
        />
        <StatCard
          icon="university"
          badgeColor="teal"
          label={t("citizenRatingLabel")}
          number={`${impactScore}/100`}
          trendData={[{ i: 0, v: 40 }, { i: 1, v: 85 }]}
        />
      </div>

      {/* Active Reports / Quick Overview Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Recent Reports */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList size={18} className="text-[#0E4B4C]" /> {t("myReportedChallenges")}
            </h2>
            <button
              type="button"
              onClick={() => navigate("/my-issues")}
              className="text-xs font-bold text-[#0E4B4C] hover:underline cursor-pointer"
            >
              View All ({myIssues.length}) →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {myIssues.slice(0, 3).map((issue) => (
              <div
                key={issue.id || issue._id}
                onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
                className="rounded-xl border border-slate-100 bg-[#F7F8FA] p-3.5 hover:border-teal-300 hover:bg-white transition cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-xs text-slate-900 line-clamp-1">{issue.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    issue.status === "Resolved" ? "bg-emerald-100 text-emerald-800" :
                    issue.status === "In progress" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {issue.status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{issue.description}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>📍 {issue.district}, {issue.block}</span>
                  <UpwardButton
                    issueId={issue.id || issue._id}
                    count={issue.upwardsCount}
                    hasUpwarded={issue.hasUpwarded}
                  />
                </div>
              </div>
            ))}

            {myIssues.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                {t("noReportedIssues")}
              </div>
            )}
          </div>
        </section>

        {/* Nearby Community Issues */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-blue-600" /> {t("nearbyChallengesTitle")}
            </h2>
            <button
              type="button"
              onClick={() => navigate("/map")}
              className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
            >
              {t("exploreMapBtn")} →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {nearbyIssues.slice(0, 3).map((issue) => (
              <div
                key={issue.id || issue._id}
                onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
                className="rounded-xl border border-slate-100 bg-[#F7F8FA] p-3.5 hover:border-teal-300 hover:bg-white transition cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-xs text-slate-900 line-clamp-1">{issue.title}</h3>
                  <span className="text-[10px] font-bold bg-teal-50 text-[#0E4B4C] border border-teal-200 px-2 py-0.5 rounded-md shrink-0">
                    {issue.category}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>📍 {issue.district}, {issue.block}</span>
                  <span className="font-bold text-teal-800">⭐ {issue.severity?.score || 80}/100</span>
                </div>
                <div className="mt-2 flex justify-end">
                  <UpwardButton
                    issueId={issue.id || issue._id}
                    count={issue.upwardsCount}
                    hasUpwarded={issue.hasUpwarded}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Citizen Guidance Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-[#D7F5DE]/50 to-teal-50/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">How Sahayog Resolves Your Civic Reports</h3>
            <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
              When you submit a challenge, our AI Engine synthesizes a formal research statement and calculates severity. It is auto-routed to nearest universities (e.g. BIT Mesra, NIT Jamshedpur) where student-faculty teams build engineering prototypes funded by corporate CSR sponsors.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/help")}
          className="rounded-xl bg-[#0E4B4C] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0b3b3c] shrink-0 cursor-pointer"
        >
          View Full Guide
        </button>
      </div>
    </div>
  );
}
