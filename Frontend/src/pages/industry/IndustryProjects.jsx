import { useEffect, useState } from "react";
import StatCard from "../../components/StatCard";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";

export default function IndustryProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axiosClient.get("/api/university/projects").then((r) => setProjects(r.data.filter((p) => p.funded)));
  }, []);

  async function toggleMilestone(project, index) {
    const milestones = project.milestones.map((m, i) => (i === index ? { ...m, done: !m.done } : m));
    await axiosClient.patch(`/api/projects/${project.id}/milestones`, { milestones });
    const { data } = await axiosClient.get("/api/university/projects");
    setProjects(data.filter((p) => p.funded));
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Funded projects</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Funded" number={projects.length} icon="check" badgeColor="green" trendData={[{ i: 0, v: 1 }, { i: 1, v: 3 }]} />
        <StatCard label="Open milestones" number={projects.reduce((n, p) => n + p.milestones.filter((m) => !m.done).length, 0)} icon="industry" badgeColor="amber" trendData={[{ i: 0, v: 4 }, { i: 1, v: 2 }]} />
      </div>
      <div className="mt-8 space-y-4">
        {projects.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <ListItemCard title={p.title} description={p.proposal} status={p.status} metadata={{ assignee: p.university }} />
            <ul className="mt-3 space-y-2 text-sm">
              {p.milestones.map((m, i) => (
                <li key={m.name}>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={m.done} onChange={() => toggleMilestone(p, i)} />
                    {m.name} — {m.due}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
