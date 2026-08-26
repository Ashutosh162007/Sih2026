import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, MapPin, Building2, ArrowRight } from "lucide-react";
import StatCard from "../../components/StatCard";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";

export default function UniversityDashboard() {
  const [queue, setQueue] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/api/university/queue", { params: { lat: 23.4123, lng: 85.4399 } }).then((r) => setQueue(r.data));
    axiosClient.get("/api/university/projects").then((r) => setProjects(r.data));
  }, []);

  return (
    <div className="pb-16">
      <h1 className="font-display text-3xl font-bold text-slate-900">University Innovation Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Overview of nearby civic problems, multidisciplinary research projects, and industry sponsorships.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="alert" label="Queued Issues" number={queue.length} trendData={[{ i: 0, v: 4 }, { i: 1, v: 7 }]} />
        <StatCard icon="university" badgeColor="blue" label="Active Projects" number={projects.length} trendData={[{ i: 0, v: 2 }, { i: 1, v: 5 }]} />
        <StatCard icon="industry" badgeColor="amber" label="Awaiting Funding" number={projects.filter((p) => !p.funded).length} trendData={[{ i: 0, v: 3 }, { i: 1, v: 4 }]} />
        <StatCard icon="check" badgeColor="green" label="Industry Funded" number={projects.filter((p) => p.funded).length} trendData={[{ i: 0, v: 1 }, { i: 1, v: 3 }]} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">Nearest Grassroots Challenges</h2>
          <p className="text-xs text-slate-500">Auto-routed based on proximity to campus</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/university/queue")}
          className="text-xs font-bold text-[#0E4B4C] hover:underline"
        >
          View all in queue →
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {queue.slice(0, 4).map((issue) => (
          <div
            key={issue.id || issue._id}
            onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-400 hover:shadow-sm cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="rounded-md bg-[#D7F5DE] px-2 py-0.5 text-[11px] font-bold text-[#0E4B4C]">
                📍 {issue.distanceKm ? `${issue.distanceKm} km away` : "Nearby"}
              </span>
              <span className="text-[11px] text-slate-400">{issue.district}, {issue.block}</span>
            </div>
            <ListItemCard
              title={issue.title}
              description={issue.description}
              status={issue.status}
              priority={issue.priority}
              category={issue.category}
              metadata={{ assignee: issue.assignee, date: issue.createdAt }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
