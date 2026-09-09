import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  Building2,
  Calendar,
  User,
  ArrowRight,
  CheckCircle2,
  Award,
  ThumbsUp,
  MessageSquare,
  Send,
  Edit3,
  AlertTriangle,
  X,
  Share2,
  RotateCcw,
} from "lucide-react";
import AssessmentSlider from "../../components/AssessmentSlider";
import StatusBadge from "../../components/StatusBadge";
import TeamBuilder from "../../components/TeamBuilder";
import TicketProgressTracker from "../../components/TicketProgressTracker";
import CitizenFeedbackCard from "../../components/CitizenFeedbackCard";
import CsrImpactCertificateModal from "../../components/CsrImpactCertificateModal";
import axiosClient from "../../api/axiosClient";
import { formatDate } from "../../lib/format";
import { ROLES } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/languageStore";

export default function IssueDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState([]);
  const [claiming, setClaiming] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Discussion & Comments state
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Upvote state
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Edit / Withdraw / Dispute modals
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLandmark, setEditLandmark] = useState("");
  const [openDisputeModal, setOpenDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const loadIssue = async () => {
    try {
      const res = await axiosClient.get(`/api/issues/${id}`);
      setIssue(res.data);
      setUpvotes(res.data.upvotes || 0);
      setHasUpvoted(res.data.upvoters?.includes(user?.id) || false);
      setEditTitle(res.data.title || "");
      setEditDesc(res.data.description || "");
      setEditLandmark(res.data.landmark || "");

      const pRes = await axiosClient.get(`/api/university/projects`);
      const match = (pRes.data || []).find(
        (p) => p.issueId === id || p.issueId === res.data.id || p.issueId === res.data._id
      );
      if (match) setProject(match);
    } catch (err) {
      console.warn("Failed to load issue:", err);
    }
  };

  useEffect(() => {
    loadIssue();
  }, [id, user]);

  if (!issue) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-500 animate-pulse">{t("aiSynthesizing")}</p>
      </div>
    );
  }

  async function handleUpvote() {
    try {
      const { data } = await axiosClient.post(`/api/issues/${issue.id || issue._id}/upvote`);
      setUpvotes(data.upvotes);
      setHasUpvoted(data.hasUpvoted);
    } catch (err) {
      console.warn("Upvote error:", err);
    }
  }

  async function handlePostComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostingComment(true);
    try {
      const { data } = await axiosClient.post(`/api/issues/${issue.id || issue._id}/comments`, {
        text: newComment,
      });
      setIssue((prev) => ({
        ...prev,
        comments: data.comments || [...(prev.comments || []), data.comment],
      }));
      setNewComment("");
    } catch (err) {
      console.warn("Comment error:", err);
    } finally {
      setPostingComment(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await axiosClient.post(`/api/issues/${issue.id || issue._id}/edit`, {
        title: editTitle,
        description: editDesc,
        landmark: editLandmark,
      });
      setIssue(data.issue);
      setOpenEditModal(false);
      setActionMsg("Issue details updated successfully.");
      setTimeout(() => setActionMsg(""), 4000);
    } catch {
      // ignore
    }
  }

  async function handleWithdraw() {
    if (!window.confirm("Are you sure you want to withdraw this issue report?")) return;
    try {
      const { data } = await axiosClient.post(`/api/issues/${issue.id || issue._id}/withdraw`, {
        reason: "Withdrawn by reporter",
      });
      setIssue(data.issue);
      setActionMsg("Issue report withdrawn.");
      setTimeout(() => setActionMsg(""), 4000);
    } catch {
      // ignore
    }
  }

  async function handleDisputeSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await axiosClient.post(`/api/issues/${issue.id || issue._id}/dispute`, {
        reason: disputeReason,
      });
      setIssue(data.issue);
      setOpenDisputeModal(false);
      setDisputeReason("");
      setActionMsg("Issue reopened for university on-site re-inspection.");
      setTimeout(() => setActionMsg(""), 5000);
    } catch {
      // ignore
    }
  }

  async function saveTeam() {
    await axiosClient.post(`/api/projects/${issue.id || issue._id}/teams`, { team });
    navigate(`/university/projects/${issue.id || issue._id}/proposal`);
  }

  async function claimIssue() {
    setClaiming(true);
    try {
      await axiosClient.post(`/api/university/issues/${issue.id || issue._id}/claim`);
      await loadIssue();
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

  const isAuthor = user?.id === issue.reporterId || user?.role === ROLES.REPORTER;
  const isFundedOrResolved = issue.status === "Resolved" || issue.status === "Funded" || project?.funded;

  return (
    <div className="space-y-6 pb-16">
      {/* Action Notification */}
      {actionMsg && (
        <div className="rounded-2xl bg-[#D7F5DE] border border-emerald-300 p-4 text-xs font-semibold text-[#0E4B4C] flex items-center gap-2">
          <CheckCircle2 size={16} /> {actionMsg}
        </div>
      )}

      {/* Progress Tracker */}
      <TicketProgressTracker issue={issue} project={project} />

      {/* Citizen Feedback Card */}
      {(issue.status === "Resolved" || issue.feedback) && (
        <CitizenFeedbackCard
          issue={issue}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[65%_35%]">
        {/* Main Content */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            {/* Badges & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge label={issue.priority} variant="priority" />
                <StatusBadge label={issue.status} />
                <StatusBadge label={issue.category} variant="category" />
                {issue.distanceKm && (
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    📍 {issue.distanceKm} {t("kmFromCampus")}
                  </span>
                )}
              </div>

              {/* Citizen Upvote Button & Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUpvote}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    hasUpvoted
                      ? "border-teal-400 bg-[#D7F5DE] text-[#0E4B4C] shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  title="Upvote if you are also affected by this issue"
                >
                  <ThumbsUp size={14} className={hasUpvoted ? "fill-[#0E4B4C]" : ""} />
                  <span>{upvotes} Upvotes</span>
                </button>

                {isFundedOrResolved && (
                  <button
                    type="button"
                    onClick={() => setShowCertModal(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-teal-300 bg-teal-50/60 px-3 py-1.5 text-xs font-bold text-[#0E4B4C] hover:bg-teal-100/80 transition cursor-pointer shadow-xs"
                  >
                    <Award size={14} className="text-teal-700" />
                    <span>{t("exportCsrCert")}</span>
                  </button>
                )}

                {isAuthor && issue.status !== "Resolved" && (
                  <button
                    type="button"
                    onClick={() => setOpenEditModal(true)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition cursor-pointer"
                    title="Edit issue details"
                  >
                    <Edit3 size={15} />
                  </button>
                )}
              </div>
            </div>

            <h1 className="font-display mt-4 text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {issue.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <User size={14} className="text-teal-700" /> {issue.reporterName || t("citizen")}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {issue.district}, {issue.block} {issue.landmark ? `(${issue.landmark})` : ""}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {formatDate(issue.createdAt)}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("citizenDescription")}</h3>
              <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">{issue.description}</p>
            </div>

            {/* AI Structured Problem Statement */}
            {issue.aiProblemStatement && (
              <div className="mt-6 rounded-2xl border border-teal-200 bg-[#D7F5DE]/25 p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0E4B4C]">
                  <Sparkles size={16} /> {t("aiSynthesizedTitle")}
                </div>
                <div className="mt-2.5 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                  {issue.aiProblemStatement}
                </div>
              </div>
            )}

            {/* Evidence Photos */}
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">{t("evidencePhotos")}</h3>
              {issue.images && issue.images.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {issue.images.map((img, idx) => {
                    const src = typeof img === "string" ? img : (img.url || img.preview);
                    return (
                      <div key={idx} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
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
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                  No photographic evidence attached for this issue.
                </div>
              )}
            </div>

            {/* Dispute Reopen Button (if Resolved) */}
            {issue.status === "Resolved" && (
              <div className="mt-6 border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-500">
                <span>Ground issue not fully resolved?</span>
                <button
                  type="button"
                  onClick={() => setOpenDisputeModal(true)}
                  className="flex items-center gap-1.5 font-bold text-rose-600 hover:underline cursor-pointer"
                >
                  <RotateCcw size={13} /> Reopen Ticket & Dispute Resolution
                </button>
              </div>
            )}
          </div>

          {/* Live Multilateral Discussion / Project Comments */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare size={18} className="text-[#0E4B4C]" /> Live Multilateral Collaboration Feed
            </h3>

            {/* Comments List */}
            <div className="mt-4 space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {issue.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className={`rounded-2xl p-4 text-xs border ${
                    comment.authorRole === "university"
                      ? "border-blue-200 bg-blue-50/40"
                      : comment.authorRole === "industry"
                        ? "border-amber-200 bg-amber-50/40"
                        : "border-slate-100 bg-[#F7F8FA]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900">{comment.authorName}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        comment.authorRole === "university"
                          ? "bg-blue-100 text-blue-800"
                          : comment.authorRole === "industry"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-[#D7F5DE] text-[#0E4B4C]"
                      }`}>
                        {comment.authorOrg || comment.authorRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed mt-1">{comment.text}</p>
                </div>
              ))}

              {(!issue.comments || issue.comments.length === 0) && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No discussion comments yet. Start the conversation with university researchers and CSR mentors.
                </div>
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post a field update, technical inquiry, or community message..."
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#0E4B4C]"
                required
              />
              <button
                type="submit"
                disabled={postingComment}
                className="flex items-center gap-1.5 rounded-xl bg-[#0E4B4C] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0b3b3c] transition disabled:opacity-50 cursor-pointer"
              >
                <Send size={14} /> {postingComment ? "..." : "Send"}
              </button>
            </form>
          </div>

          {/* Timeline */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900">{t("liveActivityFeed")}</h3>
            <ol className="mt-4 relative border-l border-teal-200 ml-3 space-y-4 text-xs">
              {issue.timeline?.map((timelineItem, idx) => (
                <li key={idx} className="ml-4">
                  <span className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white bg-[#0E4B4C]" />
                  <p className="font-semibold text-slate-800">{timelineItem.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatDate(timelineItem.at)} {timelineItem.actor ? `· ${timelineItem.actor}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Sidebar / Actions */}
        <aside className="space-y-5">
          {/* Severity Assessment */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-[#0E4B4C]" /> {t("compositeScore")}
            </h2>
            <div className="mt-4 space-y-4">
              <AssessmentSlider label="Hydrological / Hazard Vulnerability" value={issue.severity?.flooding || 65} />
              <AssessmentSlider label={t("publicRisk")} value={issue.severity?.publicRisk || 80} />
              <AssessmentSlider label={t("urgencyLevel")} value={issue.severity?.urgency || 85} />
              <div className="rounded-xl bg-slate-50 p-3 text-center border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">{t("compositeScore")}: </span>
                <span className="text-sm font-bold text-teal-800">
                  {issue.severity?.score || 82} / 100 ({issue.priority})
                </span>
              </div>
            </div>
          </div>

          {/* Nearest Universities Routing */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" /> {t("nearestRoutingTitle")}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Calculated via Geodesic Haversine algorithm</p>
            <div className="mt-3 space-y-2.5 text-xs">
              {issue.nearestUniversities && issue.nearestUniversities.length > 0 ? (
                issue.nearestUniversities.map((uni, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#F7F8FA] p-3">
                    <div>
                      <p className="font-semibold text-slate-800">{uni.name}</p>
                      <p className="text-[11px] text-slate-500">{uni.distanceKm} {t("kmFromCampus")}</p>
                    </div>
                    <span className="rounded-md bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                      {idx === 0 ? t("priority1") : t("priority2")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-slate-100 bg-[#F7F8FA] p-3">
                  <p className="font-semibold text-slate-800">Birla Institute of Technology (BIT) Mesra</p>
                  <p className="text-[11px] text-slate-500">8.5 km · {t("nearestCampus")}</p>
                </div>
              )}
            </div>
          </div>

          {/* University Team Builder Action */}
          {user?.role === ROLES.UNIVERSITY && (
            <div className="rounded-3xl border border-teal-200 bg-white p-6 shadow-sm">
              <h3 className="font-display text-base font-bold text-slate-900 mb-1">
                {t("assembleTeamTitle")}
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                {t("assembleTeamSubtitle")}
              </p>
              <TeamBuilder team={team} onChange={setTeam} />
              <button
                type="button"
                onClick={saveTeam}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E4B4C] py-3 text-sm font-bold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] transition cursor-pointer"
              >
                {t("saveTeamDraftProposal")} <ArrowRight size={16} />
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Edit Issue Modal */}
      {openEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-slate-900">Edit Challenge Details</h3>
              <button type="button" onClick={() => setOpenEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 text-xs">
              <label className="block font-semibold text-slate-700">
                Issue Title
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#0E4B4C]"
                  required
                />
              </label>
              <label className="block font-semibold text-slate-700">
                Description
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#0E4B4C]"
                  required
                />
              </label>
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleWithdraw}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Withdraw Report
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenEditModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0E4B4C] px-5 py-2 text-xs font-bold text-white hover:bg-[#0b3b3c]"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Resolution Modal */}
      {openDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="text-rose-600" size={18} /> Dispute Resolution & Reopen
              </h3>
              <button type="button" onClick={() => setOpenDisputeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleDisputeSubmit} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600">
                Please explain why this issue is not yet resolved. Your report will notify the university innovation team and state oversight council.
              </p>
              <label className="block font-semibold text-slate-700">
                Ground Reality Description
                <textarea
                  rows={4}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="e.g. The water filter was installed but flow stopped after 2 days..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#0E4B4C]"
                  required
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenDisputeModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Confirm & Reopen Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      <CsrImpactCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        issue={issue}
        project={project}
      />
    </div>
  );
}
