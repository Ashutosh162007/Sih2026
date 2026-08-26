import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AssessmentSlider from "../../components/AssessmentSlider";
import StatusBadge from "../../components/StatusBadge";
import TeamBuilder from "../../components/TeamBuilder";
import axiosClient from "../../api/axiosClient";
import { formatDate } from "../../lib/format";
import { ROLES } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";

export default function IssueDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    axiosClient.get(`/api/issues/${id}`).then((res) => setIssue(res.data));
  }, [id]);

  if (!issue) return <p className="text-sm text-slate-500">Loading issue…</p>;

  async function saveTeam() {
    await axiosClient.post(`/api/projects/${issue.id}/teams`, { team });
    navigate(`/university/projects/${issue.id}/proposal`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[65%_35%]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={issue.priority} variant="priority" />
          <StatusBadge label={issue.status} />
          <StatusBadge label={issue.category} variant="category" />
        </div>
        <h1 className="font-display mt-3 text-3xl">{issue.title}</h1>
        <p className="mt-4 text-slate-600">{issue.description}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <img
            alt=""
            className="h-40 w-full rounded-xl object-cover"
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80"
          />
          <img
            alt=""
            className="h-40 w-full rounded-xl object-cover"
            src="https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=800&q=80"
          />
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Reported by <span className="font-semibold text-slate-800">{issue.reporterName}</span> ·{" "}
          {formatDate(issue.createdAt)} · {issue.district}, {issue.block}
        </p>
        <ol className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm">
          {issue.timeline?.map((t) => (
            <li key={t.at} className="text-slate-600">
              <span className="text-slate-400">{formatDate(t.at)}</span> — {t.label}
            </li>
          ))}
        </ol>
      </section>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">AI severity assessment</h2>
          <div className="mt-4 space-y-4">
            <AssessmentSlider label="Flooding / physical damage" value={issue.severity?.flooding} />
            <AssessmentSlider label="Public risk" value={issue.severity?.publicRisk} />
            <AssessmentSlider label="Urgency" value={issue.severity?.urgency} />
          </div>
        </div>
        {user?.role === ROLES.UNIVERSITY && (
          <div>
            <TeamBuilder team={team} onChange={setTeam} />
            <button
              type="button"
              onClick={saveTeam}
              className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white"
            >
              Save team & draft proposal
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
