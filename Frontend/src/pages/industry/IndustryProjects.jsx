import { useEffect, useState } from "react";
import {
  Sparkles,
  Calendar,
  DollarSign,
  CheckCircle2,
  Building2,
  Clock,
  CheckCheck,
  Award,
  Download,
  FileText,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import StatCard from "../../components/StatCard";
import ListItemCard from "../../components/ListItemCard";
import CsrImpactCertificateModal from "../../components/CsrImpactCertificateModal";
import axiosClient from "../../api/axiosClient";
import { formatDate } from "../../lib/format";
import { useLanguageStore } from "../../store/languageStore";

import { handleMockRequest } from "../../api/mockAdapter";

export default function IndustryProjects() {
  const { t } = useLanguageStore();
  const [projects, setProjects] = useState([]);
  const [toast, setToast] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  async function load() {
    try {
      const { data } = await axiosClient.get("/api/university/projects");
      const funded = Array.isArray(data) ? data.filter((p) => p.funded) : [];
      if (funded.length > 0) {
        setProjects(funded);
        return;
      }
    } catch (e) {
      console.warn("API projects load:", e?.message);
    }
    // Fallback to mock adapter if server returned empty or failed
    try {
      const mockRes = await handleMockRequest({ method: "get", url: "/api/university/projects" });
      if (Array.isArray(mockRes?.data)) {
        setProjects(mockRes.data.filter((p) => p.funded));
      }
    } catch (e) {
      console.warn("Mock projects load:", e?.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleMilestone(project, index) {
    const targetId = project.id || project._id;
    const currentMilestones = project.milestones || [];
    const nextDone = !currentMilestones[index]?.done;

    const updatedMilestones = currentMilestones.map((m, i) =>
      i === index ? { ...m, done: nextDone, completedAt: nextDone ? new Date().toISOString() : null } : m
    );

    const allDone = updatedMilestones.length > 0 && updatedMilestones.every((m) => m.done);

    // 1. Optimistic Update: Instantly update state so checkboxes and progress bar respond with zero lag
    setProjects((prev) =>
      prev.map((p) => {
        const isMatch = (p.id && p.id === targetId) || (p._id && p._id === targetId) || (p.issueId && p.issueId === project.issueId);
        if (isMatch) {
          return {
            ...p,
            milestones: updatedMilestones,
            status: allDone ? "Completed" : (p.status === "Completed" ? "Funded" : p.status),
            certificateStatus: allDone
              ? (!p.certificateStatus || p.certificateStatus === "none" ? "pending_approval" : p.certificateStatus)
              : (p.certificateStatus === "pending_approval" ? "none" : p.certificateStatus),
          };
        }
        return p;
      })
    );

    if (allDone) {
      setToast(`All milestones for "${project.title}" completed! The issue is marked Resolved and the Citizen has been notified.`);
    } else {
      setToast(nextDone ? "Milestone marked completed." : "Milestone reopened.");
    }
    setTimeout(() => setToast(""), 4000);

    // 2. Persist to API and update state from response if returned
    try {
      const res = await axiosClient.patch(`/api/projects/${targetId}/milestones`, { milestones: updatedMilestones });
      if (res?.data?.milestones) {
        setProjects((prev) =>
          prev.map((p) => {
            const isMatch = (p.id && p.id === targetId) || (p._id && p._id === targetId) || (p.issueId && p.issueId === project.issueId);
            if (isMatch) {
              return {
                ...p,
                milestones: res.data.milestones,
                status: res.data.status || (allDone ? "Completed" : p.status),
                certificateStatus: res.data.certificateStatus !== undefined ? res.data.certificateStatus : p.certificateStatus,
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.warn("Milestone patch note:", err?.message || err);
    }
  }

  async function releaseTranche(project, trancheIndex) {
    const targetId = project.id || project._id;

    // Optimistic Update for tranche disbursement
    setProjects((prev) =>
      prev.map((p) => {
        const isMatch = (p.id && p.id === targetId) || (p._id && p._id === targetId) || (p.issueId && p.issueId === project.issueId);
        if (isMatch && p.tranches && p.tranches[trancheIndex]) {
          const newTranches = p.tranches.map((t, idx) =>
            idx === trancheIndex ? { ...t, released: true, releasedAt: new Date().toISOString() } : t
          );
          const newDisbursed = (p.disbursedAmount || 0) + (p.tranches[trancheIndex]?.amount || 0);
          return {
            ...p,
            tranches: newTranches,
            disbursedAmount: newDisbursed,
          };
        }
        return p;
      })
    );

    setToast(`CSR Grant Tranche ${trancheIndex + 1} disbursed to university research team!`);
    setTimeout(() => setToast(""), 5000);

    try {
      const res = await axiosClient.post(`/api/projects/${targetId}/tranche-release`, {
        trancheIndex,
      });
      if (res?.data?.project) {
        setProjects((prev) =>
          prev.map((p) => {
            const isMatch = (p.id && p.id === targetId) || (p._id && p._id === targetId) || (p.issueId && p.issueId === project.issueId);
            if (isMatch) {
              return {
                ...p,
                tranches: res.data.project.tranches || p.tranches,
                disbursedAmount: res.data.project.disbursedAmount ?? p.disbursedAmount,
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.warn("Tranche release note:", err?.message || err);
    }
  }

  const totalFunding = projects.reduce((acc, p) => acc + (p.fundingAmount || 350000), 0);
  const totalDisbursed = projects.reduce((acc, p) => acc + (p.disbursedAmount || 150000), 0);
  const openMilestones = projects.reduce((n, p) => n + (p.milestones?.filter((m) => !m.done).length || 0), 0);

  return (
    <div className="pb-16 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">{t("industrySponsoredProjects")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("industrySponsoredSubtitle")}
          </p>
        </div>
      </div>

      {toast && (
        <div className="rounded-2xl bg-[#D7F5DE] border border-emerald-300 p-4 text-xs font-semibold text-[#0E4B4C] flex items-center gap-2">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("fundedProjects")}
          number={projects.length}
          icon="check"
          badgeColor="green"
          trendData={[{ i: 0, v: 1 }, { i: 1, v: 3 }]}
        />
        <StatCard
          label={t("totalGrants")}
          number={`₹${(totalFunding / 100000).toFixed(1)}L`}
          icon="industry"
          badgeColor="teal"
          trendData={[{ i: 0, v: 2 }, { i: 1, v: 5 }]}
        />
        <StatCard
          label={t("disbursedViaEscrow")}
          number={`₹${(totalDisbursed / 100000).toFixed(1)}L`}
          icon="industry"
          badgeColor="amber"
          trendData={[{ i: 0, v: 1 }, { i: 1, v: 4 }]}
        />
        <StatCard
          label={t("partnerHeis")}
          number={new Set(projects.map((p) => p.university)).size}
          icon="university"
          badgeColor="blue"
          trendData={[{ i: 0, v: 1 }, { i: 1, v: 2 }]}
        />
      </div>

      <div className="mt-8 space-y-6">
        {projects.map((p) => {
          const completedCount = p.milestones?.filter((m) => m.done).length || 0;
          const totalCount = p.milestones?.length || 1;
          const progressPercent = Math.round((completedCount / totalCount) * 100);

          return (
            <div key={p.id || p._id} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 border border-emerald-200">
                    {t("sponsorship")}: ₹{(p.fundingAmount || 350000).toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {t("leadUni")}: <strong>{p.university}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {p.deadline && (
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar size={14} className="text-teal-700" /> {t("targetDeadline")}: {formatDate(p.deadline)}
                    </span>
                  )}
                  {p.certificateStatus === "approved" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProject(p);
                        setShowCertModal(true);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition cursor-pointer shadow-xs"
                    >
                      <Award size={14} className="text-emerald-700" />
                      <span>{t("downloadApprovedCertBtn")}</span>
                    </button>
                  ) : p.certificateStatus === "pending_approval" || p.status === "Completed" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProject(p);
                        setShowCertModal(true);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer shadow-xs"
                      title="Completed on ground. Awaiting State Innovation Council Admin Authorization"
                    >
                      <Clock size={14} className="text-amber-700" />
                      <span>{t("certPendingApproval")}</span>
                    </button>
                  ) : p.certificateStatus === "rejected" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProject(p);
                        setShowCertModal(true);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50/80 px-3 py-1.5 text-xs font-bold text-rose-900 hover:bg-rose-100 transition cursor-pointer shadow-xs"
                    >
                      <AlertTriangle size={14} className="text-rose-700" />
                      <span>{t("certRejected")}</span>
                    </button>
                  ) : (
                    <span
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400"
                      title="Certificate unlocked once all project deliverables are completed and approved by Admin"
                    >
                      <Lock size={13} className="text-slate-400" />
                      <span>{t("csrImpactCertBtn")} ({completedCount}/{totalCount})</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">{p.title}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{p.proposal}</p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>{t("milestoneCompletionVelocity")}</span>
                  <span>{progressPercent}% ({completedCount}/{totalCount} {t("deliverables")})</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0E4B4C] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Escrow Tranche Disbursement Status */}
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <DollarSign size={14} /> {t("csrEscrowSchedule")}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {t("disbursed")}: ₹{(p.disbursedAmount || 150000).toLocaleString("en-IN")} / ₹{(p.fundingAmount || 350000).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  {(p.tranches || [
                    { tranche: 1, percent: 40, amount: Math.round((p.fundingAmount || 350000) * 0.4), released: true },
                    { tranche: 2, percent: 40, amount: Math.round((p.fundingAmount || 350000) * 0.4), released: false },
                    { tranche: 3, percent: 20, amount: Math.round((p.fundingAmount || 350000) * 0.2), released: false },
                  ]).map((tItem, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3 text-xs flex flex-col justify-between ${
                        tItem.released
                          ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{t("tranche")} {idx + 1} ({tItem.percent}%)</span>
                        <span>₹{tItem.amount?.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        {tItem.released ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 size={13} /> {t("disbursed")}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => releaseTranche(p, idx)}
                            className="flex items-center gap-1 rounded-lg bg-[#0E4B4C] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#0b3b3c] transition cursor-pointer"
                          >
                            <Unlock size={11} /> {t("releaseTrancheBtn")}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestone Checklist */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  {t("milestoneDeliverablesHandover")}
                </p>
                <div className="space-y-2.5">
                  {p.milestones?.map((m, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs"
                    >
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(m.done)}
                          onChange={() => toggleMilestone(p, i)}
                          className="h-4 w-4 rounded text-[#0E4B4C] focus:ring-[#0E4B4C] cursor-pointer accent-[#0E4B4C]"
                        />
                        <span className={m.done ? "line-through text-slate-400 font-medium" : "font-semibold text-slate-800"}>
                          {m.name}
                        </span>
                      </label>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pl-7 sm:pl-0">
                        <span>{t("target")}: {m.due}</span>
                        {m.deliverableUrl && (
                          <a
                            href={m.deliverableUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 font-bold text-[#0E4B4C] hover:underline"
                          >
                            <FileText size={12} /> {t("viewReport")}
                          </a>
                        )}
                        {m.done && <CheckCheck size={15} className="text-emerald-600 shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            {t("noFundedProjectsYet")}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      <CsrImpactCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        project={selectedProject}
      />
    </div>
  );
}
