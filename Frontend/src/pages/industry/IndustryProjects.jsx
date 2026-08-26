import { useEffect, useState } from "react";
import { Sparkles, Calendar, DollarSign, CheckCircle2, Building2, Clock, CheckCheck } from "lucide-react";
import StatCard from "../../components/StatCard";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";
import { formatDate } from "../../lib/format";

export default function IndustryProjects() {
  const [projects, setProjects] = useState([]);
  const [toast, setToast] = useState("");

  async function load() {
    const { data } = await axiosClient.get("/api/university/projects");
    setProjects(data.filter((p) => p.funded));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleMilestone(project, index) {
    const milestones = project.milestones.map((m, i) =>
      i === index ? { ...m, done: !m.done, completedAt: !m.done ? new Date().toISOString() : null } : m
    );
    await axiosClient.patch(`/api/projects/${project.id || project._id}/milestones`, { milestones });
    
    const allDone = milestones.every((m) => m.done);
    if (allDone) {
      setToast(`All milestones for "${project.title}" completed! The issue is marked Resolved and the Citizen Reporter has been notified.`);
    } else {
      setToast("Milestone updated.");
    }
    setTimeout(() => setToast(""), 6000);
    load();
  }

  const totalFunding = projects.reduce((acc, p) => acc + (p.fundingAmount || 350000), 0);
  const openMilestones = projects.reduce((n, p) => n + (p.milestones?.filter((m) => !m.done).length || 0), 0);

  return (
    <div className="pb-16">
      <h1 className="font-display text-3xl font-bold text-slate-900">Industry Sponsored Projects</h1>
      <p className="mt-1 text-sm text-slate-500">
        Monitor milestone deliverables, deadlines, and social impact of funded innovation projects.
      </p>

      {toast && (
        <div className="mt-4 rounded-xl bg-[#D7F5DE] border border-emerald-300 p-4 text-xs font-semibold text-[#0E4B4C] flex items-center gap-2">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Funded Projects"
          number={projects.length}
          icon="check"
          badgeColor="green"
          trendData={[{ i: 0, v: 1 }, { i: 1, v: 3 }]}
        />
        <StatCard
          label="Total Grants (₹)"
          number={`₹${(totalFunding / 100000).toFixed(1)}L`}
          icon="industry"
          badgeColor="teal"
          trendData={[{ i: 0, v: 2 }, { i: 1, v: 5 }]}
        />
        <StatCard
          label="Pending Milestones"
          number={openMilestones}
          icon="alert"
          badgeColor="amber"
          trendData={[{ i: 0, v: 4 }, { i: 1, v: 2 }]}
        />
        <StatCard
          label="Partner HEIs"
          number={new Set(projects.map((p) => p.university)).size}
          icon="university"
          badgeColor="blue"
          trendData={[{ i: 0, v: 1 }, { i: 1, v: 2 }]}
        />
      </div>

      <div className="mt-8 space-y-5">
        {projects.map((p) => {
          const completedCount = p.milestones?.filter((m) => m.done).length || 0;
          const totalCount = p.milestones?.length || 1;
          const progressPercent = Math.round((completedCount / totalCount) * 100);

          return (
            <div key={p.id || p._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-0.5 border border-emerald-200">
                    Sponsorship: ₹{(p.fundingAmount || 350000).toLocaleString("en-IN")}
                  </span>
                  <span className="ml-2 text-xs font-medium text-slate-500">
                    Lead: <strong>{p.university}</strong>
                  </span>
                </div>
                {p.deadline && (
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar size={14} className="text-teal-700" /> Deadline: {formatDate(p.deadline)}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-display text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{p.proposal}</p>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Milestone Completion Progress</span>
                  <span>{progressPercent}% ({completedCount}/{totalCount} Deliverables)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#0E4B4C] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Milestone Checkboxes */}
              <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Track Deliverables (Checking off all triggers Citizen Resolution Notification)
                </p>
                <div className="space-y-2">
                  {p.milestones?.map((m, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 cursor-pointer hover:border-teal-400 transition"
                    >
                      <input
                        type="checkbox"
                        checked={m.done}
                        onChange={() => toggleMilestone(p, i)}
                        className="h-4 w-4 rounded text-[#0E4B4C] focus:ring-[#0E4B4C]"
                      />
                      <span className={m.done ? "line-through text-slate-400 flex-1" : "flex-1 font-semibold text-slate-800"}>
                        {m.name}
                      </span>
                      <span className="text-[11px] text-slate-500">Target: {m.due}</span>
                      {m.done && <CheckCheck size={14} className="text-emerald-600 shrink-0" />}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {projects.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No funded projects active yet. Go to Incoming Proposals to sponsor university solutions.
          </div>
        )}
      </div>
    </div>
  );
}
