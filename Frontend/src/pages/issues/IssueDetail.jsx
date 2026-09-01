import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles, MapPin, Building2, Calendar, User, ArrowRight, CheckCircle2 } from "lucide-react";
import AssessmentSlider from "../../components/AssessmentSlider";
import StatusBadge from "../../components/StatusBadge";
import TeamBuilder from "../../components/TeamBuilder";
import TicketProgressTracker from "../../components/TicketProgressTracker";
import CitizenFeedbackCard from "../../components/CitizenFeedbackCard";
import axiosClient from "../../api/axiosClient";
import { formatDate } from "../../lib/format";
import { ROLES } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";

export default function IssueDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    axiosClient.get(`/api/issues/${id}`).then((res) => {
      setIssue(res.data);
      axiosClient
        .get(`/api/university/projects`)
        .then((pRes) => {
          const match = (pRes.data || []).find((p) => p.issueId === id || p.issueId === res.data.id || p.issueId === res.data._id);
          if (match) setProject(match);
        })
        .catch(() => {});
    });
  }, [id]);

  if (!issue) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-500 animate-pulse">Loading civic challenge details…</p>
      </div>
    );
  }

  async function saveTeam() {
    await axiosClient.post(`/api/projects/${issue.id || issue._id}/teams`, { team });
    navigate(`/university/projects/${issue.id || issue._id}/proposal`);
  }

  async function claimIssue() {
    setClaiming(true);
    try {
      await axiosClient.post(`/api/university/issues/${issue.id || issue._id}/claim`);
      const { data } = await axiosClient.get(`/api/issues/${id}`);
      setIssue(data);
    } catch {
      // fallback
    } finally {
      setClaiming(false);
    }
  }

  function handleFeedbackSubmitted(updated) {
    if (updated?.issue) {
      setIssue(updated.issue);
    } else {
      setIssue((prev) => ({
        ...prev,
        feedback: updated?.feedback || updated,
      }));
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Amazon-Style Live Ticket Progress Tracker */}
      <TicketProgressTracker issue={issue} project={project} />

      {/* Citizen Feedback & 5-Star Resolution Verification Card (when Resolved) */}
      {(issue.status === "Resolved" || issue.feedback) && (
        <CitizenFeedbackCard
          issue={issue}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[65%_35%]">
        {/* Main Content */}
        <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={issue.priority} variant="priority" />
            <StatusBadge label={issue.status} />
            <StatusBadge label={issue.category} variant="category" />
            {issue.distanceKm && (
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                📍 {issue.distanceKm} km from campus
              </span>
            )}
          </div>

          <h1 className="font-display mt-4 text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {issue.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <User size={14} className="text-teal-700" /> {issue.reporterName || "Citizen"}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {issue.district}, {issue.block} {issue.landmark ? `(${issue.landmark})` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {formatDate(issue.createdAt)}
            </span>
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Citizen Description</h3>
            <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">{issue.description}</p>
          </div>

          {/* AI Structured Problem Formulation */}
          {issue.aiProblemStatement && (
            <div className="mt-6 rounded-xl border border-teal-200 bg-[#D7F5DE]/25 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E4B4C]">
                <Sparkles size={16} /> AI-Synthesized Problem Statement
              </div>
              <div className="mt-2.5 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                {issue.aiProblemStatement}
              </div>
            </div>
          )}

          {/* Evidence Photos */}
          <div className="mt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Photographic Evidence</h3>
            {issue.images && issue.images.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {issue.images.map((img, idx) => {
                  const src = typeof img === "string" ? img : (img.url || img.preview);
                  return (
                    <div key={idx} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                      <img
                        alt={img.filename || `Evidence Photo ${idx + 1}`}
                        className="h-48 w-full object-cover transition hover:scale-105"
                        src={src}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                No photographic evidence attached for this issue.
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-900">Project & Status Timeline</h3>
          <ol className="mt-4 relative border-l border-teal-200 ml-3 space-y-4 text-xs">
            {issue.timeline?.map((t, idx) => (
              <li key={idx} className="ml-4">
                <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-[#0E4B4C]" />
                <p className="font-semibold text-slate-800">{t.label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(t.at)} {t.actor ? `· ${t.actor}` : ""}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sidebar / Actions */}
      <aside className="space-y-5">
        {/* Severity Assessment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles size={16} className="text-[#0E4B4C]" /> AI Severity Scorecard
          </h2>
          <div className="mt-4 space-y-4">
            <AssessmentSlider label="Physical / Flooding Vulnerability" value={issue.severity?.flooding || 65} />
            <AssessmentSlider label="Public Safety & Health Risk" value={issue.severity?.publicRisk || 80} />
            <AssessmentSlider label="Urgency for Intervention" value={issue.severity?.urgency || 85} />
            <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Composite Severity Score: </span>
              <span className="text-sm font-bold text-teal-800">
                {issue.severity?.score || 82} / 100 ({issue.priority} Priority)
              </span>
            </div>
          </div>
        </div>

        {/* Nearest Universities Routing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 size={16} className="text-blue-600" /> Nearest Higher Education Hubs
          </h3>
          <p className="text-xs text-slate-500 mt-1">Calculated via Geodesic Haversine algorithm</p>
          <div className="mt-3 space-y-2.5 text-xs">
            {issue.nearestUniversities && issue.nearestUniversities.length > 0 ? (
              issue.nearestUniversities.map((uni, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#F7F8FA] p-2.5">
                  <div>
                    <p className="font-semibold text-slate-800">{uni.name}</p>
                    <p className="text-[11px] text-slate-500">{uni.distanceKm} km away</p>
                  </div>
                  <span className="rounded-md bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                    {idx === 0 ? "Priority 1" : "Priority 2"}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-slate-100 bg-[#F7F8FA] p-2.5">
                <p className="font-semibold text-slate-800">Birla Institute of Technology (BIT) Mesra</p>
                <p className="text-[11px] text-slate-500">12.4 km away · Nearest Campus</p>
              </div>
            )}
          </div>
        </div>

        {/* University Team Builder Action */}
        {user?.role === ROLES.UNIVERSITY && (
          <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-900 mb-1">
              Assemble Multidisciplinary Team
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Constitute student and faculty teams across disciplines to prepare the solution proposal.
            </p>
            <TeamBuilder team={team} onChange={setTeam} />
            <button
              type="button"
              onClick={saveTeam}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B4C] py-3 text-sm font-bold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] transition"
            >
              Save Team & Draft Proposal <ArrowRight size={16} />
            </button>
          </div>
        )}
      </aside>
      </div>
    </div>
  );
}
