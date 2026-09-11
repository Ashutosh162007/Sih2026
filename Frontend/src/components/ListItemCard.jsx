import { Check, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import UpwardButton from "./UpwardButton";
import { formatDate } from "../lib/format";

function getMiniStage(status, timeline = []) {
  const s = (status || "").toLowerCase();
  if (s === "resolved") return { stage: 5, label: "Resolved & Deployed", percent: 100 };
  if (s === "in progress" || s === "in_progress") return { stage: 4, label: "In Execution", percent: 75 };
  if (s === "funded" || timeline.some((t) => t.label?.toLowerCase().includes("funding"))) return { stage: 3, label: "Proposal & Funded", percent: 50 };
  if (s === "assigned" || timeline.some((t) => t.label?.toLowerCase().includes("team") || t.label?.toLowerCase().includes("claimed"))) return { stage: 2, label: "University Assigned", percent: 25 };
  return { stage: 1, label: "Reported & AI Triage", percent: 10 };
}

const NODE_NAMES = ["Reported", "Assigned", "Funded", "Execution", "Resolved"];

export default function ListItemCard({
  title,
  description,
  status,
  priority,
  category,
  metadata = {},
  timeline = [],
  upwards = null,
  onClick,
}) {
  const { stage, label: stageLabel, percent } = getMiniStage(status, timeline);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className="group flex w-full cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#0E4B4C]/40 hover:shadow-md"
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

        {/* Civic Progress Visualization */}
        <div className="mt-4">
          <div className="text-center">
            <p
              className={`text-center font-mono font-extrabold leading-none tracking-tight ${
                stage === 5 ? "text-emerald-700 dark:text-emerald-400" : "text-[#0E4B4C] dark:text-white"
              }`}
            >
              <span className="text-7xl">{percent}%</span>
              <span className="text-4xl"> is done</span>
            </p>
          </div>

          <div className="mt-5">
            {/* Step nodes (numbered timeline, kept) */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => {
                const done = stage === 5 || i < stage;
                const current = stage !== 5 && i === stage;
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold ${
                        done
                          ? "bg-emerald-600 text-white"
                          : current
                            ? "bg-blue-600 text-white"
                            : "border border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {done ? <Check size={15} strokeWidth={3} /> : i}
                    </div>
                    <span
                      className={`text-[10px] leading-none whitespace-nowrap ${
                        done
                          ? "font-semibold text-emerald-700 dark:text-emerald-400"
                          : current
                            ? "font-bold text-blue-700 dark:text-blue-400"
                            : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {NODE_NAMES[i - 1]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Segmented progress bar (original style) */}
            <div className="mt-3.5 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => {
                const done = stage === 5 || i < stage;
                const current = stage !== 5 && i === stage;
                const active = stage === 5 || i <= stage;
                return (
                  <div
                    key={`bar-${i}`}
                    className={`h-2 rounded-full ${
                      done
                        ? "bg-emerald-600"
                        : current
                          ? "bg-blue-600"
                          : "bg-slate-200 dark:bg-slate-700"
                    }`}
                    style={
                      active
                        ? {
                            opacity: 0,
                            animation: `wf-bar-fill 0.6s ease ${0.15 + Math.max(0, i - 1) * 0.35}s forwards`,
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            {[metadata.assignee, formatDate(metadata.date)].filter(Boolean).join(" · ")}
          </p>
          {upwards && (
            <UpwardButton
              issueId={upwards.issueId}
              count={upwards.count}
              hasUpwarded={upwards.hasUpwarded}
            />
          )}
        </div>
      </div>
      <ChevronRight className="mt-1 shrink-0 text-slate-400 group-hover:text-[#0E4B4C] group-hover:translate-x-0.5 transition" size={18} />
    </div>
  );
}