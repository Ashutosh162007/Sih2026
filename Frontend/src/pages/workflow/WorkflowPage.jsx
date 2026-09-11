import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  CheckCircle2,
  FolderKanban,
  Workflow,
  Loader2,
  MessageSquare,
  MessagesSquare,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { ROLES } from "../../lib/constants";
import { formatDate } from "../../lib/format";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/languageStore";
import WhiteboardCanvas from "./WhiteboardCanvas";

function StatusPill({ status }) {
  const palette = {
    Pending: "bg-amber-50 text-amber-800 border-amber-300",
    Reviewed: "bg-sky-50 text-sky-800 border-sky-300",
    Accepted: "bg-emerald-50 text-emerald-800 border-emerald-300",
    Rejected: "bg-rose-50 text-rose-800 border-rose-300",
  };
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold ${palette[status] || "bg-slate-100 text-slate-700 border-slate-300"}`}>
      {status}
    </span>
  );
}

function SuggestionCard({ suggestion, manage, onUpdateStatus, busy, statusLabels }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
          <Building2 size={12} className="text-teal-700" />
          {statusLabels.suggestedBy} <span className="text-slate-800">{suggestion.businessName || "CSR Partner"}</span>
        </p>
        <StatusPill status={suggestion.status} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-700">{suggestion.message}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] text-slate-400">
          {suggestion.createdAt ? formatDate(suggestion.createdAt) : ""}
        </span>
        {manage && (
          <div className="flex flex-wrap items-center gap-1.5">
            {suggestion.status !== "Reviewed" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onUpdateStatus(suggestion.id || suggestion._id, "Reviewed")}
                className="flex items-center gap-1 rounded-lg border border-sky-300 bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-800 hover:bg-sky-100 transition cursor-pointer disabled:opacity-50"
              >
                {busy ? <Loader2 size={11} className="animate-spin" /> : <MessageSquare size={11} />}
                {statusLabels.markReviewed}
              </button>
            )}
            {suggestion.status !== "Accepted" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onUpdateStatus(suggestion.id || suggestion._id, "Accepted")}
                className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
              >
                {busy ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                {statusLabels.approve}
              </button>
            )}
            {suggestion.status !== "Rejected" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onUpdateStatus(suggestion.id || suggestion._id, "Rejected")}
                className="flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50"
              >
                {busy ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                {statusLabels.reject}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkflowPage() {
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguageStore();

  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("canvas");
  const [suggestMessage, setSuggestMessage] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4500);
  };

  const statusLabels = useMemo(
    () => ({
      suggestedBy: t("workflowSuggestedBy"),
      markReviewed: t("workflowMarkReviewed"),
      approve: t("workflowApprove"),
      reject: t("workflowReject"),
    }),
    [t]
  );

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const { data } = await axiosClient.get("/api/workflow/projects");
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("Workflow projects load:", e?.message || e);
      setError(t("workflowErrorLoad"));
    } finally {
      setLoading(false);
    }
  }

  async function openProject(p) {
    const targetId = p.id || p._id;
    setLoadingDetail(true);
    setError("");
    try {
      const { data } = await axiosClient.get(`/api/workflow/projects/${targetId}`);
      setSelected({
        project: data.project || {},
        access: data.access || {},
        canvas: data.canvas || { objects: [], updatedAt: null },
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      });
      setTab("canvas");
      setSuggestMessage("");
    } catch (e) {
      console.warn("Workflow project detail:", e?.message || e);
      setError(t("workflowErrorLoad"));
    } finally {
      setLoadingDetail(false);
    }
  }

  async function saveCanvas(objects) {
    if (!selected) return;
    const targetId = selected.project?.id || selected.project?._id;
    try {
      const { data } = await axiosClient.put(`/api/workflow/projects/${targetId}/canvas`, { objects });
      if (data?.canvas) {
        setSelected((prev) => ({
          ...prev,
          canvas: { objects: data.canvas.objects || [], updatedAt: data.canvas.updatedAt },
        }));
        showToast(t("workflowCanvasSaved"));
        setTimeout(() => setToast(""), 2500);
      }
    } catch (e) {
      console.warn("Workflow canvas save:", e?.message || e);
      showToast(t("workflowErrorLoad"));
    }
  }

  async function submitSuggestion() {
    const message = suggestMessage.trim();
    if (!message) return;
    if (!selected) return;
    const targetId = selected.project?.id || selected.project?._id;
    setBusy(true);
    try {
      const { data } = await axiosClient.post(
        `/api/workflow/projects/${targetId}/suggestions`,
        { message }
      );
      if (data?.suggestion) {
        setSelected((prev) => ({
          ...prev,
          suggestions: [data.suggestion, ...(prev.suggestions || [])],
        }));
      }
      setSuggestMessage("");
      showToast(t("workflowSuggestionSent"));
    } catch (e) {
      console.warn("Workflow suggestion:", e?.message || e);
      showToast(t("workflowErrorLoad"));
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(suggestionId, status) {
    setBusy(true);
    try {
      const { data } = await axiosClient.patch(`/api/workflow/suggestions/${suggestionId}`, {
        status,
      });
      if (data?.suggestion) {
        const updated = data.suggestion;
        setSelected((prev) => ({
          ...prev,
          suggestions: (prev.suggestions || []).map((s) =>
            String(s.id || s._id) === String(suggestionId)
              ? { ...s, status: updated.status, statusUpdatedAt: updated.statusUpdatedAt }
              : s
          ),
        }));
      }
      showToast(t("workflowStatusUpdated"));
    } catch (e) {
      console.warn("Workflow suggestion status:", e?.message || e);
      showToast(t("workflowErrorLoad"));
    } finally {
      setBusy(false);
    }
  }

  const isUniversity = user?.role === ROLES.UNIVERSITY;
  const isIndustry = user?.role === ROLES.INDUSTRY;
  const isAdmin = user?.role === ROLES.ADMIN;

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-500">
        <Loader2 className="animate-spin text-[#0E4B4C]" size={28} />
        <p className="mt-3 text-xs font-semibold">{t("workflowLoading")}</p>
      </div>
    );
  }

  if (!loading && !isUniversity && !isIndustry && !isAdmin) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center text-sm font-semibold text-rose-700">
        {t("workflowAccessDenied")}
      </div>
    );
  }

  const suggestionCount = (selected?.suggestions || []).length;

  return (
    <div className="pb-16 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">{t("workflowPageTitle")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("workflowPageSubtitle")}</p>
        </div>
        {selected && (
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              loadProjects();
              setToast("");
            }}
            className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft size={14} /> {t("workflowBackToProjects")}
          </button>
        )}
      </div>

      {toast && (
        <div className="rounded-2xl bg-[#D7F5DE] border border-emerald-300 p-4 text-xs font-semibold text-[#0E4B4C] flex items-center gap-2">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <X size={16} /> {error}
        </div>
      )}

      {/* ---------------------- Project list ---------------------- */}
      {!selected && (
        <div>
          {projects.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <FolderKanban className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">{t("workflowNoProjects")}</p>
              <p className="mt-1 text-xs text-slate-500">{t("workflowNoProjectsHint")}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((p) => (
                <button
                  type="button"
                  key={p.id || p._id}
                  onClick={() => openProject(p)}
                  className="group flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        p.status === "Completed"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : p.status === "Funded"
                            ? "bg-sky-50 text-sky-800 border border-sky-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className="rounded-md bg-[#0E4B4C]/5 border border-[#0E4B4C]/10 px-2 py-0.5 text-[10px] font-bold text-[#0E4B4C]">
                      {p.canvasBuilt ? `${p.objectCount || 0} ${t("workflowObjects")}` : t("workflowEmptyCanvas")}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug group-hover:text-[#0E4B4C] transition">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Building2 size={12} className="text-teal-700 shrink-0" />
                      <span className="truncate">{p.university}</span>
                    </p>
                    {p.industry && (
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <ShieldCheck size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{p.industry}</span>
                      </p>
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Workflow size={12} className="text-[#0E4B4C]" />
                      {p.objectCount || 0} {t("workflowObjects")} · {p.suggestionCount || 0} {t("workflowSuggestionsTab")}
                    </span>
                    <span className="text-[#0E4B4C] group-hover:underline">Open →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------------- Project detail ---------------------- */}
      {selected && (
        <div className="space-y-6">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-20 text-slate-500">
              <Loader2 className="animate-spin text-[#0E4B4C]" size={24} />
            </div>
          ) : (
            <>
              {/* Project header + access banner */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide border ${
                      selected.project?.status === "Completed"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : selected.project?.status === "Funded"
                          ? "bg-sky-50 text-sky-800 border-sky-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {selected.project?.status}
                  </span>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <span className="flex items-center gap-1.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 text-[11px] font-bold">
                        <ShieldCheck size={12} /> {t("workflowAdminBadge")}
                      </span>
                    )}
                    {selected.access?.canEdit && (
                      <span className="flex items-center gap-1.5 rounded-md bg-[#0E4B4C]/5 text-[#0E4B4C] border border-[#0E4B4C]/15 px-2.5 py-1 text-[11px] font-bold">
                        <Building2 size={12} /> {t("workflowUniBadge")}
                      </span>
                    )}
                    {selected.access?.canSuggest && (
                      <span className="flex items-center gap-1.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 text-[11px] font-bold">
                        <Building2 size={12} /> {t("workflowBizBadge")}
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="mt-3 font-display text-2xl font-bold text-slate-900">{selected.project?.title}</h2>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-teal-700" /> {selected.project?.university}
                  </span>
                  {selected.project?.industry && (
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={13} className="text-slate-400" /> {selected.project?.industry}
                    </span>
                  )}
                </div>

                <div
                  className={`mt-4 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
                    isAdmin
                      ? "border-slate-200 bg-slate-50 text-slate-600"
                      : selected.access?.canSuggest && !selected.access?.canEdit
                        ? "border-teal-200 bg-teal-50/60 text-teal-900"
                        : "border-[#0E4B4C]/15 bg-[#0E4B4C]/5 text-[#0E4B4C]"
                  }`}
                >
                  {isAdmin
                    ? t("workflowViewOnly")
                    : selected.access?.canEdit
                      ? t("workflowYouOwn")
                      : selected.access?.canSuggest
                        ? t("workflowYouSponsor")
                        : t("workflowViewOnly")}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTab("canvas")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                    tab === "canvas"
                      ? "bg-[#0E4B4C] text-white shadow-sm shadow-[#0E4B4C]/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Workflow size={14} /> {t("workflowCanvasTab")}
                </button>
                <button
                  type="button"
                  onClick={() => setTab("suggestions")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                    tab === "suggestions"
                      ? "bg-[#0E4B4C] text-white shadow-sm shadow-[#0E4B4C]/25"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <MessagesSquare size={14} />
                  {t("workflowSuggestionsTab")} ({suggestionCount})
                </button>
              </div>

              {tab === "canvas" && (
                <div>
                  {selected.canvas?.updatedAt && (
                    <p className="mb-2 text-[11px] text-slate-400">
                      {t("workflowUpdatedAt")}: {formatDate(selected.canvas.updatedAt)}
                    </p>
                  )}
                  <WhiteboardCanvas
                    objects={selected.canvas?.objects || []}
                    editable={Boolean(selected.access?.canEdit)}
                    onSave={saveCanvas}
                    suggested={suggestionCount}
                  />
                </div>
              )}

              {tab === "suggestions" && (
                <div id="workflow-suggestions" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                  {selected.access?.canSuggest && (
                    <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                        {t("workflowSuggestChange")}
                      </p>
                      <textarea
                        value={suggestMessage}
                        onChange={(e) => setSuggestMessage(e.target.value)}
                        placeholder={t("workflowSuggestionPlaceholder")}
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 resize-y"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={busy || !suggestMessage.trim()}
                          onClick={submitSuggestion}
                          className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition cursor-pointer disabled:opacity-50"
                        >
                          {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                          {busy ? t("workflowSubmitting") : t("workflowSubmitSuggestion")}
                        </button>
                      </div>
                    </div>
                  )}

                  {suggestionCount === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-10 text-center">
                      <MessageSquare className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-2.5 text-sm font-semibold text-slate-600">
                        {selected.access?.canEdit
                          ? t("workflowNoSuggestionsHintUni")
                          : selected.access?.canSuggest
                            ? t("workflowNoSuggestionsHintBiz")
                            : t("workflowNoSuggestions")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {(selected.suggestions || []).map((s) => (
                        <SuggestionCard
                          key={s.id || s._id}
                          suggestion={s}
                          manage={Boolean(selected.access?.canManageSuggestions)}
                          onUpdateStatus={updateStatus}
                          busy={busy}
                          statusLabels={statusLabels}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}