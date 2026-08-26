import { ChevronRight } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../lib/format";

export default function ListItemCard({
  title,
  description,
  status,
  priority,
  category,
  metadata = {},
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {priority && <StatusBadge variant="priority" label={priority} />}
          {status && <StatusBadge variant="status" label={status} />}
          {category && <StatusBadge variant="category" label={category} />}
        </div>
        <h3 className="mt-2 font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{description}</p>}
        <p className="mt-2 text-xs text-slate-400">
          {[metadata.assignee, formatDate(metadata.date)].filter(Boolean).join(" · ")}
        </p>
      </div>
      <ChevronRight className="mt-1 shrink-0 text-slate-400" size={18} />
    </button>
  );
}
