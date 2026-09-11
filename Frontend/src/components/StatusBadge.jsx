import { useLanguageStore } from "../store/languageStore";
import { getCategoryLabel } from "../lib/constants";

const palettes = {
  High: "bg-rose-100 text-rose-800 border border-rose-200",
  Medium: "bg-amber-100 text-amber-800 border border-amber-200",
  Low: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  New: "bg-teal-100 text-teal-800 border border-teal-200",
  Resolved: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  "Under review": "bg-amber-100 text-amber-800 border border-amber-200",
  Assigned: "bg-slate-100 text-slate-700 border border-slate-200",
  "In progress": "bg-sky-100 text-sky-800 border border-sky-200",
  Funded: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  "Awaiting funding": "bg-amber-100 text-amber-800 border border-amber-200",
  Infrastructure: "bg-sky-100 text-sky-800",
  "Water & Sanitation": "bg-sky-100 text-sky-800",
  "Waste Management": "bg-sky-100 text-sky-800",
  "Public Safety": "bg-sky-100 text-sky-800",
  Environment: "bg-sky-100 text-sky-800",
  Mobility: "bg-sky-100 text-sky-800",
  Agriculture: "bg-emerald-100 text-emerald-800",
  Healthcare: "bg-teal-100 text-teal-800",
  Education: "bg-amber-100 text-amber-800",
  "Rural Livelihoods": "bg-emerald-100 text-emerald-800",
};

const HINDI_STATUS_MAP = {
  New: "नई समस्या",
  "Under review": "समीक्षाधीन",
  Assigned: "विश्वविद्यालय आवंटित",
  "In progress": "प्रगति पर",
  Funded: "अनुदान स्वीकृत",
  Resolved: "हल व सत्यापित",
  "Awaiting funding": "अनुदान प्रतीक्षित",
  High: "उच्च प्राथमिकता",
  Medium: "मध्यम प्राथमिकता",
  Low: "सामान्य प्राथमिकता",
};

const KHORTHA_STATUS_MAP = {
  New: "नया समस्या",
  "Under review": "जांच में",
  Assigned: "यूनिवर्सिटी देल गेल",
  "In progress": "काज चालू",
  Funded: "अनुदान पास",
  Resolved: "हल भेल",
  "Awaiting funding": "अनुदान के आस",
  High: "भारी जरूरी",
  Medium: "मंझोला जरूरी",
  Low: "साधारण जरूरी",
};

export default function StatusBadge({ label, variant = "status" }) {
  const language = useLanguageStore((s) => s.language);
  const cls = palettes[label] || "bg-slate-100 text-slate-700";
  const displayLabel =
    variant === "category"
      ? getCategoryLabel(label, language)
      : language === "hi" && HINDI_STATUS_MAP[label]
        ? HINDI_STATUS_MAP[label]
        : language === "kht" && KHORTHA_STATUS_MAP[label]
          ? KHORTHA_STATUS_MAP[label]
          : getCategoryLabel(label, language);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
      data-variant={variant}
    >
      {displayLabel}
    </span>
  );
}
