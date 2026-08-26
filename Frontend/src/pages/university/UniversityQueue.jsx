import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";

export default function UniversityQueue() {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("/api/university/queue", { params: { lat: 18.52, lng: 73.85 } })
      .then((r) => setIssues(r.data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">Issue queue</h1>
      <p className="mt-1 text-sm text-slate-500">Sorted by proximity and domain relevance for your campus.</p>
      <div className="mt-6 space-y-3">
        {issues.map((issue) => (
          <ListItemCard
            key={issue.id}
            title={issue.title}
            description={issue.description}
            status={issue.status}
            priority={issue.priority}
            category={issue.category}
            metadata={{ assignee: `${issue.district} · ${issue.block}`, date: issue.createdAt }}
            onClick={() => navigate(`/issues/${issue.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
