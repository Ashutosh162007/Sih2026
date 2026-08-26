import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";

export default function UniversityProjects() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/api/university/projects").then((r) => setProjects(r.data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">University projects</h1>
      <div className="mt-6 space-y-3">
        {projects.map((p) => (
          <ListItemCard
            key={p.id}
            title={p.title}
            description={p.proposal}
            status={p.status}
            metadata={{ assignee: p.industry || "No industry partner yet" }}
            onClick={() => navigate(`/university/projects/${p.issueId}/proposal`)}
          />
        ))}
      </div>
    </div>
  );
}
