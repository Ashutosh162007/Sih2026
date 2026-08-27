const palettes = {
  High: "bg-rose-100 text-rose-800",
  Medium: "bg-amber-100 text-amber-800",
  Low: "bg-emerald-100 text-emerald-800",
  New: "bg-emerald-100 text-emerald-800",
  Resolved: "bg-emerald-100 text-emerald-800",
  "Under review": "bg-amber-100 text-amber-800",
  Assigned: "bg-slate-100 text-slate-700",
  "In progress": "bg-sky-100 text-sky-800",
  Funded: "bg-emerald-100 text-emerald-800",
  "Awaiting funding": "bg-amber-100 text-amber-800",
  Infrastructure: "bg-sky-100 text-sky-800",
  "Water & Sanitation": "bg-sky-100 text-sky-800",
  "Waste Management": "bg-sky-100 text-sky-800",
  "Public Safety": "bg-sky-100 text-sky-800",
  Environment: "bg-sky-100 text-sky-800",
  Mobility: "bg-sky-100 text-sky-800",
};

export default function StatusBadge({ label, variant = "status" }) {
  const cls = palettes[label] || "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}
      data-variant={variant}
    >
      {label}
    </span>
  );
}
