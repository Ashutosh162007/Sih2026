import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/authStore";

export default function MyIssues() {
  const user = useAuthStore((s) => s.user);
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/api/issues", { params: { reporterId: user.id } }).then((res) => setIssues(res.data));
  }, [user.id]);

  return (
    <div>
      <h1 className="font-display text-3xl">My issues</h1>
      <p className="mt-1 text-sm text-slate-500">Track reports you filed as a Community Reporter.</p>
      <div className="mt-6 space-y-3">
        {issues.map((issue) => (
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
        {issues.length === 0 && <p className="text-sm text-slate-500">No issues yet.</p>}
      </div>
    </div>
  );
}
