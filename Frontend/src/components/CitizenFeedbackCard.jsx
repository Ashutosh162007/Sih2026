import { useState } from "react";
import { Star, ShieldCheck, CheckCircle2, MessageSquare, Sparkles, Clock } from "lucide-react";
import { useLanguageStore } from "../store/languageStore";
import { useAuthStore } from "../store/authStore";
import { ROLES } from "../lib/constants";
import axiosClient from "../api/axiosClient";

export default function CitizenFeedbackCard({ issue, onFeedbackSubmitted }) {
  const t = useLanguageStore((s) => s.t);
  const user = useAuthStore((s) => s.user);

  const existingFeedback = issue?.feedback;
  const [rating, setRating] = useState(existingFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingFeedback?.comment || "");
  const [verified, setVerified] = useState(existingFeedback?.verifiedByCitizen ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingFeedback);

  // Check if current user is Citizen role
  const isCitizenRole =
    !user ||
    user.role === "citizen" ||
    user.role === "community_reporter" ||
    user.role === ROLES.CITIZEN ||
    user.role === ROLES.REPORTER;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        rating,
        comment,
        verifiedByCitizen: verified,
      };

      const { data } = await axiosClient.post(
        `/api/issues/${issue.id || issue._id}/feedback`,
        payload
      );

      setSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(data);
      }
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // If feedback already submitted or in view mode, show verified results to all roles
  if (submitted || existingFeedback) {
    const activeRating = existingFeedback?.rating || rating;
    const activeComment = existingFeedback?.comment || comment;
    const isVerified = existingFeedback?.verifiedByCitizen ?? verified;

    return (
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-teal-50/20 to-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">
                {t("verifiedByCitizenBadge")}
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                {t("citizenRatingLabel")}: {activeRating} / 5 ⭐
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-xs">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= activeRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                }
              />
            ))}
          </div>
        </div>

        {activeComment && (
          <div className="mt-4 rounded-2xl bg-white border border-emerald-100 p-4 text-xs text-slate-700 italic flex items-start gap-2 shadow-xs">
            <MessageSquare size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <span>&ldquo;{activeComment}&rdquo;</span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 size={13} /> {isVerified ? "Physical On-Ground Resolution Confirmed" : "Feedback Logged"}
          </span>
          <span>{issue.reporterName ? `Verified by ${issue.reporterName}` : "Citizen Verified"}</span>
        </div>
      </div>
    );
  }

  // If issue is not yet resolved, do not show feedback section
  if (issue.status !== "Resolved") {
    return null;
  }

  // If viewing as University, Industry, or Admin (non-citizen) and feedback hasn't been submitted yet
  if (!isCitizenRole) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-500 flex items-center justify-between shadow-xs">
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <Clock size={15} className="text-amber-600 shrink-0" />
          Awaiting Citizen Reporter Resolution Verification & 5-Star Rating
        </span>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Citizen Reporter ({issue.reporterName || "Citizen"}) will verify on-ground
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-[#D7F5DE]/30 via-white to-teal-50/20 p-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0E4B4C] text-white shadow-md shadow-[#0E4B4C]/20">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">
            {t("feedbackTitle")}
          </h3>
          <p className="text-xs text-slate-500">
            {t("feedbackSubtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            {t("rateSolution")}
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-300 hover:scale-125 transition cursor-pointer"
              >
                <Star
                  size={26}
                  className={
                    star <= (hoverRating || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }
                />
              </button>
            ))}
            <span className="ml-2 font-display text-sm font-bold text-slate-700">
              {rating} / 5
            </span>
          </div>
        </div>

        <div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("feedbackPlaceholder")}
            className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10 leading-relaxed shadow-inner"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
            className="h-4 w-4 rounded text-[#0E4B4C] focus:ring-[#0E4B4C] cursor-pointer"
          />
          <span>{t("verifyGroundCheck")}</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0E4B4C] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] transition cursor-pointer disabled:opacity-50"
        >
          <ShieldCheck size={16} />
          {submitting ? "Submitting..." : t("submitFeedbackBtn")}
        </button>
      </form>
    </div>
  );
}
