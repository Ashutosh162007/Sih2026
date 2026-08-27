import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Sparkles, AlertCircle } from "lucide-react";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/authStore";

export default function MyIssues() {
  const user = useAuthStore((s) => s.user);
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id || user?._id) {
      axiosClient
        .get("/api/issues", { params: { reporterId: user.id || user._id } })
        .then((res) => setIssues(res.data));
    }
  }, [user]);

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">My Reported Challenges</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track problem evaluation, university team assignments, industry funding, and resolution milestones.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/report")}
          className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] transition"
        >
          <PlusCircle size={15} /> Report New Issue
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {issues.map((issue) => (
          <ListItemCard
            key={issue.id || issue._id}
            title={issue.title}
            description={issue.description}
            status={issue.status}
            priority={issue.priority}
            category={issue.category}
            metadata={{
              assignee: issue.assignee ? `Assigned to ${issue.assignee}` : "Routing to nearest universities",
              date: issue.createdAt,
            }}
            onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
          />
        ))}

        {issues.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            <Sparkles size={32} className="mx-auto mb-3 text-teal-600" />
            <p className="font-semibold text-slate-800">You have not reported any civic challenges yet.</p>
            <p className="mt-1 text-xs text-slate-400">
              Submit your local water, sanitation, infrastructure, or community issues with a photo.
            </p>
            <button
              type="button"
              onClick={() => navigate("/report")}
              className="mt-4 rounded-xl bg-[#0E4B4C] px-4 py-2 text-xs font-bold text-white shadow-sm"
            >
              Report Your First Issue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
