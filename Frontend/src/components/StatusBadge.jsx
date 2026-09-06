import { useLanguageStore } from "../store/languageStore";

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
  Agriculture: "bg-lime-100 text-lime-800",
  Healthcare: "bg-rose-100 text-rose-800",
  Education: "bg-violet-100 text-violet-800",
  "Rural Livelihoods": "bg-orange-100 text-orange-800",
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
  Infrastructure: "बुनियादी ढांचा",
  "Water & Sanitation": "जल एवं स्वच्छता",
  "Waste Management": "कचरा प्रबंधन",
  "Public Safety": "सार्वजनिक सुरक्षा",
  Environment: "पर्यावरण",
  Mobility: "यातायात",
  Agriculture: "कृषि",
  Healthcare: "स्वास्थ्य सेवा",
  Education: "शिक्षा",
  "Rural Livelihoods": "ग्रामीण आजीविका",
};

export default function StatusBadge({ label, variant = "status" }) {
  const language = useLanguageStore((s) => s.language);
  const cls = palettes[label] || "bg-slate-100 text-slate-700";
  const displayLabel =
    language === "hi" || language === "kht"
      ? HINDI_STATUS_MAP[label] || label
      : label;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
      data-variant={variant}
    >
      {displayLabel}
    </span>
  );
}
