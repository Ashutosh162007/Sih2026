import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../components/StatCard";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";

export default function UniversityDashboard() {
  const [queue, setQueue] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/api/university/queue").then((r) => setQueue(r.data));
    axiosClient.get("/api/university/projects").then((r) => setProjects(r.data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">University dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="alert" label="Queue items" number={queue.length} trendData={[{ i: 0, v: 4 }, { i: 1, v: 7 }]} />
        <StatCard icon="university" badgeColor="blue" label="Active projects" number={projects.length} trendData={[{ i: 0, v: 2 }, { i: 1, v: 5 }]} />
        <StatCard icon="industry" badgeColor="amber" label="Awaiting funding" number={projects.filter((p) => !p.funded).length} trendData={[{ i: 0, v: 3 }, { i: 1, v: 4 }]} />
        <StatCard icon="check" badgeColor="green" label="Funded" number={projects.filter((p) => p.funded).length} trendData={[{ i: 0, v: 1 }, { i: 1, v: 3 }]} />
      </div>
      <h2 className="mt-10 font-semibold">Nearby domain matches</h2>
      <div className="mt-3 space-y-3">
        {queue.slice(0, 4).map((issue) => (
          <ListItemCard
            key={issue.id}
            title={issue.title}
            description={issue.description}
            status={issue.status}
            priority={issue.priority}
            category={issue.category}
            metadata={{ assignee: issue.assignee, date: issue.createdAt }}
            onClick={() => navigate(`/issues/${issue.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
