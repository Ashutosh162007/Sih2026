import { ChevronRight, CheckCircle2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../lib/format";

function getMiniStage(status, timeline = []) {
  const s = (status || "").toLowerCase();
  if (s === "resolved") return { stage: 5, label: "Resolved & Deployed", percent: 100 };
  if (s === "in progress" || s === "in_progress") return { stage: 4, label: "In Execution", percent: 75 };
  if (s === "funded" || timeline.some((t) => t.label?.toLowerCase().includes("funding"))) return { stage: 3, label: "Proposal & Funded", percent: 50 };
  if (s === "assigned" || timeline.some((t) => t.label?.toLowerCase().includes("team") || t.label?.toLowerCase().includes("claimed"))) return { stage: 2, label: "University Assigned", percent: 25 };
  return { stage: 1, label: "Reported & AI Triage", percent: 10 };
}

export default function ListItemCard({
  title,
  description,
  status,
  priority,
  category,
  metadata = {},
  timeline = [],
  onClick,
}) {
  const { stage, label: stageLabel, percent } = getMiniStage(status, timeline);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#0E4B4C]/40 hover:shadow-md cursor-pointer"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {priority && <StatusBadge variant="priority" label={priority} />}
            {status && <StatusBadge variant="status" label={status} />}
            {category && <StatusBadge variant="category" label={category} />}
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${stage === 5 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600"}`}>
            {stage === 5 ? "✅ Resolved & Verified" : `Stage ${stage} of 5 · ${stageLabel}`}
          </span>
        </div>

        <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-[#0E4B4C] transition">{title}</h3>
        {description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p>}

        {/* Mini Amazon-Style Progress Indicator */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-medium text-slate-600 flex items-center gap-1">
              {stage === 5 ? (
                <CheckCircle2 size={13} className="text-emerald-600" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-teal-700 animate-pulse" />
              )}
              {stageLabel}
            </span>
            <span className={`font-mono text-[10px] ${stage === 5 ? "font-bold text-emerald-700" : ""}`}>{percent}%</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full bg-transparent">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  stage === 5 || i < stage
                    ? "bg-emerald-600"
                    : i === stage
                    ? "bg-amber-500"
                    : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="mt-2.5 text-xs text-slate-400">
          {[metadata.assignee, formatDate(metadata.date)].filter(Boolean).join(" · ")}
        </p>
      </div>
      <ChevronRight className="mt-1 shrink-0 text-slate-400 group-hover:text-[#0E4B4C] group-hover:translate-x-0.5 transition" size={18} />
    </button>
  );
}
