import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, MapPin, Building2, Filter, ArrowRight } from "lucide-react";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";

export default function UniversityQueue() {
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    // BIT Mesra coordinates by default
    axiosClient
      .get("/api/university/queue", { params: { lat: 23.4123, lng: 85.4399 } })
      .then((r) => setIssues(r.data));
  }, []);

  const filteredIssues = filter === "all" ? issues : issues.filter((i) => i.category === filter);

  return (
    <div className="pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Nearest Issue Queue</h1>
          <p className="mt-1 text-sm text-slate-500">
            Grassroots challenges prioritized by geodesic proximity and academic discipline relevance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value="all">All Domains ({issues.length})</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Public Safety">Public Safety</option>
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id || issue._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-400 hover:shadow-md cursor-pointer"
            onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="rounded-md bg-[#D7F5DE] px-2.5 py-0.5 text-xs font-bold text-[#0E4B4C] flex items-center gap-1">
                📍 {issue.distanceKm ? `${issue.distanceKm} km away` : "Nearest Campus"}
              </span>
              <span className="text-xs text-slate-400 font-medium">{issue.district}, {issue.block}</span>
            </div>

            <ListItemCard
              title={issue.title}
              description={issue.description}
              status={issue.status}
              priority={issue.priority}
              category={issue.category}
              metadata={{
                assignee: issue.assignee || "Open for institutional claim",
                date: issue.createdAt,
              }}
            />

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="text-slate-500 font-medium">
                AI Severity Score: <strong className="text-teal-900">{issue.severity?.score || 80}%</strong>
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/issues/${issue.id || issue._id}`);
                }}
                className="flex items-center gap-1 font-bold text-[#0E4B4C] hover:underline"
              >
                Assemble Team & Solution <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
            No issues currently in this filter.
          </div>
        )}
      </div>
    </div>
  );
}
