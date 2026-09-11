import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  StickyNote,
  Lock,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/languageStore";
import { handleMockRequest } from "../../api/mockAdapter";

const COLUMNS = [
  { key: "empathize", emoji: "🧠" },
  { key: "define", emoji: "🎯" },
  { key: "ideate", emoji: "💡" },
  { key: "prototype", emoji: "🛠️" },
  { key: "test", emoji: "🧪" },
];

const META = {
  empathize: { header: "bg-violet-100 text-violet-800", dot: "bg-violet-500", ring: "border-violet-200" },
  define: { header: "bg-sky-100 text-sky-800", dot: "bg-sky-500", ring: "border-sky-200" },
  ideate: { header: "bg-amber-100 text-amber-800", dot: "bg-amber-400", ring: "border-amber-200" },
  prototype: { header: "bg-orange-100 text-orange-800", dot: "bg-orange-500", ring: "border-orange-200" },
  test: { header: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", ring: "border-emerald-200" },
};

function noteId(note) {
  return note?._id || note?.id;
}

export default function ProjectWorkflow() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguageStore();

  const role = user?.role;
  const denied = role === "admin" || role === "citizen" || !user;
  const isUni = role === "university";
  const isBiz = role === "industry";
  const canCreate = isUni || isBiz;
  const canEdit = isUni;

  const [notes, setNotes] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // {type:"chooser"} | {type:"create",column} | {type:"edit",note} | {type:"view",note}
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/api/workflow/notes?projectId=${projectId}`);
        if (Array.isArray(res.data)) {
          setNotes(res.data);
          await loadProject();
          setLoading(false);
          return;
        }
      } catch (e) {}

      try {
        const mockRes = await handleMockRequest({
          method: "get",
          url: `/api/workflow/notes?projectId=${projectId}`,
        });
        if (Array.isArray(mockRes?.data)) setNotes(mockRes.data);
      } catch (_) {}

      await loadProject();
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, role]);

  async function loadProject() {
    try {
      const res = await axiosClient.get(`/api/workflow/projects/${projectId}`);
      if (res.data?.project) {
        setProject(res.data.project);
        return;
      }
    } catch (e) {}
    try {
      const mockRes = await handleMockRequest({
        method: "get",
        url: `/api/workflow/projects/${projectId}`,
        headers: { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` },
      });
      if (mockRes?.data?.project) setProject(mockRes.data.project);
    } catch (_) {}
  }

  async function reloadNotes() {
    try {
      const res = await axiosClient.get(`/api/workflow/notes?projectId=${projectId}`);
      if (Array.isArray(res.data)) {
        setNotes(res.data);
        return;
      }
    } catch (e) {}
    try {
      const mockRes = await handleMockRequest({
        method: "get",
        url: `/api/workflow/notes?projectId=${projectId}`,
      });
      if (Array.isArray(mockRes?.data)) setNotes(mockRes.data);
    } catch (_) {}
  }

  async function createNote(column, title, content) {
    setSubmitting(true);
    const payload = { title: title || content.trim().slice(0, 60), content: content.trim(), column, projectId };
    try {
      await axiosClient.post("/api/workflow/notes", payload);
    } catch (e) {
      try {
        await handleMockRequest({
          method: "post",
          url: "/api/workflow/notes",
          data: payload,
          headers: { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` },
        });
      } catch (_) {}
    }
    setSubmitting(false);
    setModal(null);
    reloadNotes();
  }

  async function updateNote(note, title, content, column) {
    setSubmitting(true);
    const nid = noteId(note);
    const payload = { title, content, column };
    try {
      await axiosClient.put(`/api/workflow/notes/${nid}`, payload);
    } catch (e) {
      try {
        await handleMockRequest({
          method: "put",
          url: `/api/workflow/notes/${nid}`,
          data: payload,
          headers: { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` },
        });
      } catch (_) {}
    }
    setSubmitting(false);
    setModal(null);
    reloadNotes();
  }

  async function deleteNote(note) {
    if (!confirm(t("boardDeleteConfirm"))) return;
    const nid = noteId(note);
    try {
      await axiosClient.delete(`/api/workflow/notes/${nid}`);
    } catch (e) {
      try {
        await handleMockRequest({
          method: "delete",
          url: `/api/workflow/notes/${nid}`,
          headers: { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` },
        });
      } catch (_) {}
    }
    setModal(null);
    reloadNotes();
  }

  function formatDate(d) {
    if (!d) return "";
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (denied) {
    return (
      <div className="pb-16">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700 transition mb-4">
          <button type="button" onClick={() => navigate("/workflow")} className="flex items-center gap-2 cursor-pointer">
            <ArrowLeft size={16} /> {t("boardBack")}
          </button>
        </div>
        <div className="mt-16 flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Lock size={32} className="mb-3 text-red-400" />
          <h2 className="font-display text-lg font-bold text-slate-900">{t("workflowAccessDenied")}</h2>
          <p className="mt-1 max-w-md text-xs text-slate-400">{t("boardDeniedHint")}</p>
        </div>
      </div>
    );
  }

  const grouped = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
  notes.forEach((n) => {
    const key = COLUMNS.some((c) => c.key === n.column) ? n.column : "ideate";
    grouped[key].push(n);
  });

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigate("/workflow")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700 transition cursor-pointer"
        >
          <ArrowLeft size={16} /> {t("boardBack")}
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-slate-900 truncate">
            {project?.title || t("boardTitle")}
          </h1>
          {(project?.university || project?.industry) && (
            <p className="mt-1 text-xs text-slate-500">
              {project?.university && <span className="font-semibold text-teal-700">{project.university}</span>}
              {project?.university && project?.industry && <span className="mx-2 text-slate-300">&middot;</span>}
              {project?.industry && <span className="font-semibold text-amber-700">{project.industry}</span>}
            </p>
          )}
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setModal({ type: "chooser" })}
            className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] cursor-pointer"
          >
            <Plus size={15} /> {isBiz ? t("boardAddGuidance") : t("boardNewNote")}
          </button>
        )}
      </div>

      {isBiz && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <Lock size={14} className="mt-0.5 shrink-0" />
          <p>{t("boardViewOnlyBiz")}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
        </div>
      ) : (
        <div className="flex items-start gap-4 overflow-x-auto pb-6 pt-1">
          {COLUMNS.map((col, ci) => {
            const meta = META[col.key];
            const cards = grouped[col.key] || [];
            return (
              <section
                key={col.key}
                className={`flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-2xl border ${meta.ring} bg-slate-50/70 shadow-sm`}
              >
                <header
                  onClick={canCreate ? () => setModal({ type: "create", column: col.key }) : undefined}
                  title={canCreate ? `${t("boardAddNote")} → ${t(`board_${col.key}`)}` : undefined}
                  className={`flex items-center gap-2 rounded-t-2xl px-4 py-3 ${meta.header} ${
                    canCreate ? "cursor-pointer transition hover:brightness-[0.96]" : ""
                  }`}
                >
                  <span className="text-base">{col.emoji}</span>
                  <h3 className="text-sm font-bold">{t(`board_${col.key}`)}</h3>
                  <span className={`ml-1 h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  <span className="ml-auto text-[11px] font-semibold opacity-70">{cards.length}</span>
                  {canCreate && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setModal({ type: "create", column: col.key }); }}
                      className="flex h-5 w-5 items-center justify-center rounded-md opacity-70 transition hover:bg-white/60 hover:opacity-100 cursor-pointer"
                      aria-label={`${t("boardAddNote")} - ${t(`board_${col.key}`)}`}
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </header>
                <div className="flex flex-col gap-3 p-3 min-h-[120px]">
                  {cards.length === 0 &&
                    (canCreate ? (
                      <button
                        type="button"
                        onClick={() => setModal({ type: "create", column: col.key })}
                        className="px-1 py-3 text-center text-[11px] text-slate-400 transition hover:text-teal-700 cursor-pointer"
                      >
                        {t("boardEmptyClickHint")}
                      </button>
                    ) : (
                      <p className="px-1 py-3 text-center text-[11px] text-slate-400">{t("boardEmptyHint")}</p>
                    ))}
                  {cards.map((note, i) => {
                    const authorBiz = note.authorType === "business";
                    return (
                      <div
                        key={noteId(note)}
                        role="button"
                        tabIndex={0}
                        onClick={() => setModal(canEdit ? { type: "edit", note } : { type: "view", note })}
                        onKeyDown={(e) => e.key === "Enter" && setModal(canEdit ? { type: "edit", note } : { type: "view", note })}
                        className={`group relative w-full cursor-pointer rounded-md bg-gradient-to-br from-[#FFF7CF] to-[#FDEFB2] p-3 text-left shadow-sm ring-1 ring-yellow-300/50 transition hover:-translate-y-0.5 hover:shadow-md ${
                          i % 2 ? "rotate-[0.8deg]" : "rotate-[-0.9deg]"
                        }`}
                      >
                        {canEdit && (
                          <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setModal({ type: "edit", note }); }}
                              className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm hover:bg-slate-50 cursor-pointer"
                              aria-label={t("boardEdit")}
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); deleteNote(note); }}
                              className="rounded-md border border-red-200 bg-white p-1.5 text-red-500 shadow-sm hover:bg-red-50 cursor-pointer"
                              aria-label={t("boardDelete")}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                        {note.title && note.title !== note.content && (
                          <p className="mb-1 pr-6 text-xs font-bold text-slate-800">{note.title}</p>
                        )}
                        <p className="text-[13px] leading-snug text-slate-700 whitespace-pre-wrap break-words">
                          {note.content}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              authorBiz
                                ? "bg-amber-500/15 text-amber-700 ring-1 ring-amber-300/60"
                                : "bg-teal-500/15 text-teal-700 ring-1 ring-teal-300/60"
                            }`}
                          >
                            {authorBiz ? "🏭" : "🎓"} {authorBiz ? t("boardAuthorBiz") : t("boardAuthorUni")}
                          </span>
                          <span className="text-[10px] text-slate-500">{formatDate(note.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => setModal({ type: "create", column: col.key })}
                      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white/60 px-3 py-2 text-[11px] font-bold text-slate-500 transition hover:border-teal-400 hover:text-teal-700 hover:bg-[#D7F5DE]/40 cursor-pointer"
                    >
                      <Plus size={13} strokeWidth={2.5} /> {isBiz ? t("boardAddGuidance") : t("boardAddNote")}
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {modal?.type === "chooser" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">{t("boardPickColumn")}</h3>
              <button type="button" onClick={() => setModal(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {COLUMNS.map((col) => {
                const meta = META[col.key];
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => setModal({ type: "create", column: col.key })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left hover:border-teal-400 hover:bg-teal-50/40 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{col.emoji}</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{t(`board_${col.key}`)}</p>
                        <p className="text-[11px] text-slate-400">{t(`board_${col.key}_hint`)}</p>
                      </div>
                      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    </div>
                  </button>
                );
              })}
              <p className="pt-1 text-[11px] text-slate-400">
                {isBiz ? t("boardPickHintBiz") : t("boardPickHintUni")}
              </p>
            </div>
          </div>
        </div>
      )}

      {modal?.type === "create" && <CreateModal column={modal.column} submitting={submitting} isBiz={isBiz} onClose={() => setModal(null)} onSubmit={(title, content) => createNote(modal.column, title, content)} />}

      {modal?.type === "edit" && (
        <EditModal
          note={modal.note}
          submitting={submitting}
          onClose={() => setModal(null)}
          onSave={(title, content, column) => updateNote(modal.note, title, content, column)}
          onDelete={() => deleteNote(modal.note)}
        />
      )}

      {modal?.type === "view" && <ViewModal note={modal.note} onClose={() => setModal(null)} />}
    </div>
  );
}

function CreateModal({ column, submitting, isBiz, onClose, onSubmit }) {
  const { t } = useLanguageStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const colMeta = META[column];
  const colObj = COLUMNS.find((c) => c.key === column);

  function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(title, content);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isBiz ? t("boardAddGuidance") : t("boardNewNote")}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <span className={`rounded-md px-2 py-0.5 ${colMeta.header}`}>
                {colObj.emoji} {t(`board_${column}`)}
              </span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("boardNoteTitle")}
          maxLength={100}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none mb-3"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isBiz ? t("boardGuidancePlaceholder") : t("boardNoteContent")}
          required
          rows={5}
          className="w-full rounded-xl border border-amber-200 bg-[#FFFDF0] px-3 py-2.5 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none mb-3"
        />
        {isBiz && (
          <p className="mb-3 text-[11px] text-slate-400">{t("boardCreateBizHint")}</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-xl bg-[#0E4B4C] px-4 py-2 text-xs font-bold text-white hover:bg-[#0b3b3c] disabled:opacity-50 cursor-pointer"
          >
            <StickyNote size={13} /> {submitting ? t("boardSaving") : t("boardAddNote")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            {t("boardCancel")}
          </button>
        </div>
      </form>
    </div>
  );
}

function EditModal({ note, submitting, onClose, onSave, onDelete }) {
  const { t } = useLanguageStore();
  const [title, setTitle] = useState(note.title || "");
  const [content, setContent] = useState(note.content || "");
  const [column, setColumn] = useState(COLUMNS.some((c) => c.key === note.column) ? note.column : "ideate");

  function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    onSave(title, content, column);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">{t("boardEditTitle")}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{t("boardEditColumn")}</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {COLUMNS.map((col) => {
            const meta = META[col.key];
            const active = column === col.key;
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => setColumn(col.key)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition cursor-pointer ${
                  active
                    ? `${meta.header} border-transparent shadow-sm`
                    : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {col.emoji} {t(`board_${col.key}`)}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("boardNoteTitle")}
          maxLength={100}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none mb-3"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
          className="w-full rounded-xl border border-amber-200 bg-[#FFFDF0] px-3 py-2.5 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none mb-3"
        />

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-xl bg-[#0E4B4C] px-4 py-2 text-xs font-bold text-white hover:bg-[#0b3b3c] disabled:opacity-50 cursor-pointer"
          >
            {submitting ? t("boardSaving") : t("boardSave")}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 cursor-pointer"
          >
            <Trash2 size={13} /> {t("boardDelete")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            {t("boardCancel")}
          </button>
        </div>
      </form>
    </div>
  );
}

function ViewModal({ note, onClose }) {
  const { t } = useLanguageStore();
  const authorBiz = note.authorType === "business";
  const colObj = COLUMNS.find((c) => c.key === note.column);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div>
            {colObj && (
              <span className="text-[11px] font-bold text-slate-400">
                {colObj.emoji} {t(`board_${colObj.key}`)}
              </span>
            )}
            {note.title && <h3 className="mt-1 text-sm font-bold text-slate-900">{note.title}</h3>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="rounded-xl bg-[#FFFDF0] p-4 min-h-[120px] whitespace-pre-wrap break-words text-sm text-slate-700 leading-relaxed">
          {note.content}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              authorBiz
                ? "bg-amber-500/15 text-amber-700 ring-1 ring-amber-300/60"
                : "bg-teal-500/15 text-teal-700 ring-1 ring-teal-300/60"
            }`}
          >
            {authorBiz ? "🏭" : "🎓"} {authorBiz ? t("boardAuthorBiz") : t("boardAuthorUni")}
          </span>
          <span className="text-[11px] text-slate-400">{note.createdByName || ""}</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          {t("boardCreated")} {note.createdAt ? new Date(note.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
        </div>
      </div>
    </div>
  );
}