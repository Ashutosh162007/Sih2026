import { Check, ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import UpwardButton from "./UpwardButton";
import { formatDate } from "../lib/format";
import { useLanguageStore } from "../store/languageStore";

function getMiniStage(status, timeline = [], language = "en") {
  const s = (status || "").toLowerCase();
  if (s === "resolved") {
    return {
      stage: 5,
      label: language === "hi" ? "समाधान संपन्न" : language === "kht" ? "समाधान भेल" : "Resolved & Deployed",
      percent: 100,
    };
  }
  if (s === "in progress" || s === "in_progress") {
    return {
      stage: 4,
      label: language === "hi" ? "क्रियान्वयन में" : language === "kht" ? "काज चल रहल हे" : "In Execution",
      percent: 75,
    };
  }
  if (s === "funded" || timeline.some((t) => t.label?.toLowerCase().includes("funding"))) {
    return {
      stage: 3,
      label: language === "hi" ? "प्रस्ताव व अनुदान" : language === "kht" ? "प्रस्ताव व अनुदान" : "Proposal & Funded",
      percent: 50,
    };
  }
  if (s === "assigned" || timeline.some((t) => t.label?.toLowerCase().includes("team") || t.label?.toLowerCase().includes("claimed"))) {
    return {
      stage: 2,
      label: language === "hi" ? "टीम आवंटित" : language === "kht" ? "टीम देल गेल" : "University Assigned",
      percent: 25,
    };
  }
  return {
    stage: 1,
    label: language === "hi" ? "दर्ज व AI जांच" : language === "kht" ? "दर्ज व AI जांच" : "Reported & AI Triage",
    percent: 10,
  };
}

const NODE_NAMES = {
  en: ["Reported", "Assigned", "Funded", "Execution", "Resolved"],
  hi: ["दर्ज", "टीम गठित", "स्वीकृत", "क्रियान्वयन", "सत्यापित"],
  kht: ["दर्ज", "टीम बनल", "मंजूर", "काज चालू", "सत्यापित"],
};

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
  const { language, t } = useLanguageStore();
  const { stage, label: stageLabel, percent } = getMiniStage(status, timeline, language);
  const nodeNames = NODE_NAMES[language] || NODE_NAMES.en;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className="group flex w-full cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#0E4B4C]/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {priority && <StatusBadge variant="priority" label={priority} />}
            {status && <StatusBadge variant="status" label={status} />}
            {category && <StatusBadge variant="category" label={category} />}
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${stage === 5 ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-slate-100 text-slate-600"}`}>
            {stage === 5
              ? (language === "hi" ? "✅ समाधान संपन्न व सत्यापित" : language === "kht" ? "✅ समाधान भेल व जांचल" : "✅ Resolved & Verified")
              : `${language === "hi" ? "चरण" : language === "kht" ? "चरण" : "Stage"} ${stage} · ${stageLabel}`}
          </span>
        </div>

        <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-[#0E4B4C] transition dark:text-slate-100 dark:group-hover:text-teal-400">{title}</h3>
        {description && <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>}

        {/* Civic Progress Visualization */}
        <div className="mt-4">
          {/* Step nodes (numbered timeline) */}
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
                    {nodeNames[i - 1]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Segmented progress bar */}
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

        {/* Card Footer: Metadata on left, percentage and actions on right */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800/60">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {[metadata.assignee, formatDate(metadata.date)].filter(Boolean).join(" · ")}
          </p>
          <div className="flex items-center gap-2.5 ml-auto">
            {upwards && (
              <UpwardButton
                issueId={upwards.issueId}
                count={upwards.count}
                hasUpwarded={upwards.hasUpwarded}
              />
            )}
            <div
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition ${
                stage === 5
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-teal-50 text-[#0E4B4C] border border-teal-200/70 dark:bg-slate-800 dark:text-teal-300 dark:border-slate-700"
              }`}
            >
              <span className="text-sm font-extrabold">{percent}%</span>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {t("isDone", "is done")}
              </span>
            </div>
          </div>
        </div>
      </div>
      <ChevronRight className="mt-1 shrink-0 text-slate-400 group-hover:text-[#0E4B4C] group-hover:translate-x-0.5 transition" size={18} />
    </div>
  );
}