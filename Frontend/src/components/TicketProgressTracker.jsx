import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  CircleDot,
  Building2,
  Briefcase,
  User,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "../lib/format";
import { useLanguageStore } from "../store/languageStore";

const STAGES = [
  {
    id: 1,
    key: "reported",
    labelKey: "stageReported",
    shortLabel: "Reported",
    shortLabelHi: "दर्ज",
    icon: Sparkles,
  },
  {
    id: 2,
    key: "assigned",
    labelKey: "stageAssigned",
    shortLabel: "HEI Assigned",
    shortLabelHi: "टीम गठित",
    icon: Building2,
  },
  {
    id: 3,
    key: "funded",
    labelKey: "stageFunded",
    shortLabel: "Funded",
    shortLabelHi: "स्वीकृत",
    icon: Briefcase,
  },
  {
    id: 4,
    key: "in_progress",
    labelKey: "stageExecution",
    shortLabel: "In Execution",
    shortLabelHi: "क्रियान्वयन",
    icon: Flame,
  },
  {
    id: 5,
    key: "resolved",
    labelKey: "stageResolved",
    shortLabel: "Resolved",
    shortLabelHi: "सत्यापित",
    icon: ShieldCheck,
  },
];

export function getStageFromIssue(issue) {
  if (!issue) return 1;
  const status = (issue.status || "").toLowerCase();
  const timeline = issue.timeline || [];

  if (status === "resolved") return 5;
  if (status === "in progress" || status === "in_progress") return 4;
  if (status === "funded" || timeline.some((t) => t.label?.toLowerCase().includes("funding") || t.label?.toLowerCase().includes("grant"))) return 3;
  if (status === "assigned" || issue.assignee || timeline.some((t) => t.label?.toLowerCase().includes("team") || t.label?.toLowerCase().includes("claimed"))) return 2;
  return 1;
}

export default function TicketProgressTracker({ issue, project }) {
  const [showActivityFeed, setShowActivityFeed] = useState(true);
  const { language, t } = useLanguageStore();
  const currentStage = getStageFromIssue(issue);
  const isResolved = currentStage === 5 || issue?.status === "Resolved";
  const progressPercent = isResolved ? 100 : Math.round(((currentStage - 0.5) / 4.5) * 100);

  // Derive stage metadata & timestamps from issue timeline
  const timeline = issue?.timeline || [];
  
  function getStageTimestamp(stageId) {
    if (!timeline.length) return null;
    if (stageId === 1) return timeline[0]?.at || issue?.createdAt;
    if (stageId === 2) {
      const match = timeline.find((t) => t.role === "university" || t.label?.toLowerCase().includes("team") || t.label?.toLowerCase().includes("claimed") || t.label?.toLowerCase().includes("routed"));
      return match?.at;
    }
    if (stageId === 3) {
      const match = timeline.find((t) => t.role === "industry" || t.label?.toLowerCase().includes("funding") || t.label?.toLowerCase().includes("grant") || t.label?.toLowerCase().includes("proposal"));
      return match?.at;
    }
    if (stageId === 4) {
      const match = timeline.find((t) => t.label?.toLowerCase().includes("progress") || t.label?.toLowerCase().includes("milestone") || t.label?.toLowerCase().includes("approved"));
      return match?.at;
    }
    if (stageId === 5) {
      const match = timeline.find((t) => t.label?.toLowerCase().includes("resolved") || t.label?.toLowerCase().includes("completed"));
      return match?.at;
    }
    return null;
  }

  // Next expected action text
  const nextActionMap = {
    1: `Routing to ${issue?.nearestUniversities?.[0]?.name || "nearest Higher Education Institutions"} for multidisciplinary faculty-student team formation.`,
    2: `University team (${issue?.assignee || "Assigned Institution"}) is formulating the technical solution proposal for industry CSR sponsorship.`,
    3: `Project funded! University team is preparing field instrumentation and baseline validation.`,
    4: project?.milestones?.some((m) => !m.done)
      ? `Active Milestone: ${project.milestones.find((m) => !m.done)?.name || "Field deployment in progress"}. Target deadline: ${project?.deadline ? formatDate(project.deadline) : "Scheduled"}.`
      : "Completing final community handover and on-ground verification.",
    5: "This civic challenge has been fully resolved on the ground through university innovation and industry CSR partnership. Live tracking is now concluded.",
  };

  return (
    <div className={`rounded-3xl border bg-white p-6 shadow-sm overflow-hidden ${isResolved ? "border-emerald-200" : "border-slate-200"}`}>
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md ${isResolved ? "bg-emerald-600 shadow-emerald-600/20" : "bg-[#0E4B4C] shadow-[#0E4B4C]/20"}`}>
            {isResolved ? <ShieldCheck size={20} /> : <TrendingUp size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-bold text-slate-900">
                {isResolved ? (language === "hi" ? "समस्या समाधान संपन्न" : "Ticket Resolution Complete") : t("trackerTitle")}
              </h2>
              {isResolved ? (
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-300">
                  {language === "hi" ? "✅ ट्रैकिंग समाप्त · पूर्ण" : "✅ Tracking Concluded · Resolved"}
                </span>
              ) : (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200 animate-pulse">
                  {language === "hi" ? `चरण ${currentStage} / 5` : `Stage ${currentStage} of 5`}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isResolved ? (language === "hi" ? "नागरिक समस्या का समाधान हो चुका है और ट्रैकिंग बंद कर दी गई है।" : "Civic challenge successfully solved. Live tracking lifecycle is now closed.") : t("trackerSubtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t("overallResolution")}</p>
            <p className={`text-lg font-extrabold ${isResolved ? "text-emerald-700" : "text-[#0E4B4C]"}`}>{isResolved ? 100 : progressPercent}%</p>
          </div>
        </div>
      </div>

      {/* Progress Stepper Bar (Amazon Style) */}
      <div className="mt-8 px-2">
        <div className="relative">
          {/* Background Connecting Line */}
          <div className="absolute top-5 left-6 right-6 h-1.5 bg-slate-100 -z-0 rounded-full" />
          
          {/* Active Filled Progress Line */}
          <div
            className={`absolute top-5 left-6 h-1.5 rounded-full transition-all duration-700 -z-0 ${isResolved ? "bg-emerald-600" : "bg-gradient-to-r from-[#0E4B4C] via-teal-600 to-emerald-500"}`}
            style={{ width: isResolved ? "100%" : `${Math.min(100, Math.max(0, ((currentStage - 1) / 4) * 100))}%` }}
          />

          {/* Step Nodes */}
          <div className="relative z-10 grid grid-cols-5 gap-1 text-center">
            {STAGES.map((stage) => {
              const isCompleted = isResolved || currentStage > stage.id;
              const isCurrent = !isResolved && currentStage === stage.id;
              const isPending = !isResolved && currentStage < stage.id;
              const timestamp = getStageTimestamp(stage.id);
              const Icon = stage.icon;

              return (
                <div key={stage.id} className="flex flex-col items-center">
                  {/* Step Node Circle */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${
                      isCompleted
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                        : isCurrent
                        ? "bg-amber-500 text-white ring-4 ring-amber-100 shadow-lg shadow-amber-500/30 scale-110"
                        : "bg-white border-2 border-slate-200 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={20} className="stroke-[2.5]" />
                    ) : isCurrent ? (
                      <Icon size={19} className="stroke-[2.5]" />
                    ) : (
                      <CircleDot size={18} className="text-slate-300" />
                    )}
                  </div>

                  {/* Stage Name & Tag */}
                  <div className="mt-3 px-1">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isCurrent
                          ? "text-slate-900 font-extrabold"
                          : isCompleted
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      {language === "hi" ? stage.shortLabelHi : stage.shortLabel}
                    </p>
                    
                    {/* Status Pill */}
                    <div className="mt-1">
                      {isCompleted && (
                        <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          {t("stageCompleted")}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {t("stageInProgress")}
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-block text-[10px] font-medium text-slate-400">
                          {t("stageUpcoming")}
                        </span>
                      )}
                    </div>

                    {/* Timestamp if available */}
                    {timestamp && (
                      <p className="mt-1 text-[10px] text-slate-400 hidden sm:block">
                        {formatDate(timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Stage Status Banner */}
      <div className={`mt-8 rounded-2xl border p-4 ${isResolved ? "border-emerald-200 bg-emerald-50/60" : "border-teal-100 bg-[#D7F5DE]/30"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${isResolved ? "bg-emerald-600" : "bg-[#0E4B4C]"}`}>
              {isResolved ? <CheckCircle2 size={18} /> : <Clock size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-xs font-bold uppercase tracking-wider ${isResolved ? "text-emerald-900" : "text-[#0E4B4C]"}`}>
                  {isResolved ? (language === "hi" ? "समाधान स्थिति · सत्यापित" : "Final Status · Resolved & Verified") : `${language === "hi" ? "वर्तमान स्थिति" : "Current Status"} · ${t(STAGES[currentStage - 1]?.labelKey || "stageReported")}`}
                </p>
                {issue?.assignee && (
                  <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-900">
                    Lead: {issue.assignee}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-700 leading-relaxed font-medium">
                {nextActionMap[currentStage]}
              </p>
            </div>
          </div>

          {project?.deadline && !isResolved && (
            <div className="shrink-0 rounded-xl bg-white border border-teal-200 px-3.5 py-2 text-right">
              <p className="text-[10px] font-semibold text-slate-400 uppercase">Target Completion</p>
              <p className="text-xs font-bold text-slate-900">{formatDate(project.deadline)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapsible Facebook-Style Live Activity Stream */}
      <div className="mt-6 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => setShowActivityFeed((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-bold text-slate-700 hover:text-[#0E4B4C] transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span className={`flex h-2 w-2 rounded-full ${isResolved ? "bg-emerald-600" : "bg-emerald-500 animate-ping"}`} />
            {t("liveActivityFeed")} ({timeline.length} events)
          </span>
          {showActivityFeed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showActivityFeed && (
          <div className="mt-4 space-y-3">
            {timeline.slice().reverse().map((event, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs transition hover:bg-white hover:border-slate-200 hover:shadow-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs">
                  {event.role === "university" ? (
                    <Building2 size={15} className="text-blue-600" />
                  ) : event.role === "industry" ? (
                    <Briefcase size={15} className="text-amber-600" />
                  ) : event.role === "citizen" ? (
                    <User size={15} className="text-teal-700" />
                  ) : (
                    <Sparkles size={15} className="text-[#0E4B4C]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <p className="font-bold text-slate-900">
                      {event.label}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDate(event.at)}
                    </span>
                  </div>
                  {event.actor && (
                    <p className="mt-1 text-[11px] text-slate-500 font-medium">
                      Updated by <span className="font-semibold text-slate-700">{event.actor}</span>
                      {event.role && (
                        <span className="ml-1.5 rounded bg-slate-200/80 px-1.5 py-0.2 text-[9px] font-semibold text-slate-600 capitalize">
                          {event.role}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {timeline.length === 0 && (
              <p className="text-center py-4 text-xs text-slate-400">
                No activity logs recorded yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
