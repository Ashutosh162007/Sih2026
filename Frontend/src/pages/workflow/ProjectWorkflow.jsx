import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Plus,
  Pencil,
  Trash2,
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/authStore";
import { useLanguageStore } from "../../store/languageStore";
import { handleMockRequest } from "../../api/mockAdapter";

export default function ProjectWorkflow() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { t } = useLanguageStore();

  const [notes, setNotes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(null);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [suggestionMsg, setSuggestionMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canEdit = user?.role === "university" || user?.role === "admin";
  const canSuggest = user?.role === "industry";
  const canViewSuggestions = user?.role === "university" || user?.role === "admin";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/api/workflow/notes?projectId=${projectId}`);
        if (Array.isArray(res.data)) {
          setNotes(res.data);
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

      setLoading(false);
    }
    load();
  }, [projectId]);

  useEffect(() => {
    if (!selectedNote || !canViewSuggestions) return;
    async function loadSuggestions() {
      try {
        const res = await axiosClient.get(`/api/workflow/suggestions?noteId=${selectedNote._id || selectedNote.id}`);
        if (Array.isArray(res.data)) setSuggestions(res.data);
      } catch (e) {
        try {
          const mockRes = await handleMockRequest({
            method: "get",
            url: `/api/workflow/suggestions?noteId=${selectedNote._id || selectedNote.id}`,
          });
          if (Array.isArray(mockRes?.data)) setSuggestions(mockRes.data);
        } catch (_) {}
      }
    }
    loadSuggestions();
  }, [selectedNote, canViewSuggestions]);

  async function handleCreateNote(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post("/api/workflow/notes", {
        title: noteTitle,
        content: noteContent,
        projectId,
      });
    } catch (e) {
      try {
        await handleMockRequest({
          method: "post",
          url: "/api/workflow/notes",
          data: { title: noteTitle, content: noteContent, projectId },
          headers: { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` },
        });
      } catch (_) {}
    }
    setNoteTitle("");
    setNoteContent("");
    setShowCreateForm(false);
    setSubmitting(false);
    reloadNotes();
  }

  async function handleUpdateNote(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.put(`/api/workflow/notes/${editingNote._id || editingNote.id}`, {
        title: noteTitle,
        content: noteContent,
      });
    } catch (e) {
      try {
        await handleMockRequest({
          method: "put",
          url: `/api/workflow/notes/${editingNote._id || editingNote.id}`,
          data: { title: noteTitle, content: noteContent },
          headers: { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` },
        });
      } catch (_) {}
    }
    setNoteTitle("");
    setNoteContent("");
    setEditingNote(null);
    setSubmitting(false);
    reloadNotes();
  }

  async function handleDeleteNote(noteId) {
    if (!confirm("Delete this note?")) return;
    try {
      await axiosClient.delete(`/api/workflow/notes/${noteId}`);
    } catch (e) {
      try {
        await handleMockRequest({
          method: "delete",
          url: `/api/workflow/notes/${noteId}`,
          headers: { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` },
        });
      } catch (_) {}
    }
    if (selectedNote && (selectedNote._id === noteId || selectedNote.id === noteId)) {
      setSelectedNote(null);
    }
    reloadNotes();
  }

  async function handleCreateSuggestion(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post("/api/workflow/suggestions", {
        noteId: selectedNote._id || selectedNote.id,
        message: suggestionMsg,
      });
    } catch (e) {
      try {
        await handleMockRequest({
          method: "post",
          url: "/api/workflow/suggestions",
          data: { noteId: selectedNote._id || selectedNote.id, message: suggestionMsg },
          headers: { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` },
        });
      } catch (_) {}
    }
    setSuggestionMsg("");
    setShowSuggestionForm(null);
    setSubmitting(false);
  }

  async function handleSuggestionStatus(suggestionId, status) {
    try {
      await axiosClient.patch(`/api/workflow/suggestions/${suggestionId}/status`, { status });
    } catch (e) {
      try {
        await handleMockRequest({
          method: "patch",
          url: `/api/workflow/suggestions/${suggestionId}/status`,
          data: { status },
          headers: { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` },
        });
      } catch (_) {}
    }
    setSuggestions((prev) =>
      prev.map((s) => (s._id === suggestionId || s.id === suggestionId ? { ...s, status } : s))
    );
  }

  function reloadNotes() {
    async function load() {
      try {
        const res = await axiosClient.get(`/api/workflow/notes?projectId=${projectId}`);
        if (Array.isArray(res.data)) setNotes(res.data);
      } catch (e) {
        try {
          const mockRes = await handleMockRequest({
            method: "get",
            url: `/api/workflow/notes?projectId=${projectId}`,
          });
          if (Array.isArray(mockRes?.data)) setNotes(mockRes.data);
        } catch (_) {}
      }
    }
    load();
  }

  function startEdit(note) {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowCreateForm(false);
  }

  function formatDate(d) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const statusColor = {
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Reviewed: "bg-blue-50 text-blue-700 border-blue-200",
    Accepted: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="pb-16">
      <button
        type="button"
        onClick={() => navigate("/workflow")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-teal-700 transition mb-4 cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">{t("workflowNotes")}</h1>
        {canEdit && (
          <button
            type="button"
            onClick={() => { setShowCreateForm(true); setEditingNote(null); setNoteTitle(""); setNoteContent(""); }}
            className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] cursor-pointer"
          >
            <Plus size={15} /> {t("workflowCreateNote")}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
        </div>
      )}

      {!loading && notes.length === 0 && !showCreateForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          <FileText size={32} className="mx-auto mb-3 text-teal-600" />
          <p className="font-semibold text-slate-800">{t("workflowNoNotes")}</p>
          <p className="mt-1 text-xs text-slate-400">{t("workflowNoNotesHint")}</p>
        </div>
      )}

      {(showCreateForm || editingNote) && (
        <form
          onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
          className="mb-6 rounded-2xl border border-teal-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            {editingNote ? t("workflowEditNote") : t("workflowCreateNote")}
          </h3>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder={t("workflowNoteTitle")}
            required
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none mb-3"
          />
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder={t("workflowNoteContent")}
            required
            rows={6}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none resize-none mb-3"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#0E4B4C] px-4 py-2 text-xs font-bold text-white hover:bg-[#0b3b3c] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : editingNote ? t("workflowSave") : t("workflowCreate")}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreateForm(false); setEditingNote(null); setNoteTitle(""); setNoteContent(""); }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {t("workflowCancel")}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notes List */}
        <div className="lg:col-span-1 space-y-2">
          {notes.map((note) => (
            <div
              key={note._id || note.id}
              onClick={() => setSelectedNote(note)}
              className={`rounded-xl border p-4 cursor-pointer transition ${
                selectedNote && (selectedNote._id === note._id || selectedNote.id === note.id)
                  ? "border-teal-400 bg-teal-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm"
              }`}
            >
              <h4 className="text-sm font-bold text-slate-900 truncate">{note.title}</h4>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{note.content}</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>{note.universityId?.name || note.createdByName || "University"}</span>
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Note Detail */}
        <div className="lg:col-span-2">
          {!selectedNote && notes.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">
              <Eye size={28} className="mx-auto mb-2" />
              <p>{t("workflowSelectNote")}</p>
            </div>
          )}

          {selectedNote && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedNote.title}</h2>
                  <p className="mt-1 text-xs text-slate-400">
                    by {selectedNote.universityId?.name || selectedNote.createdByName || "University"} &middot; {formatDate(selectedNote.createdAt)}
                  </p>
                </div>
                {canEdit && (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(selectedNote)}
                      className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(selectedNote._id || selectedNote.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                {selectedNote.content}
              </div>

              {/* Business Suggest Change */}
              {canSuggest && (
                <div className="mt-6 border-t border-slate-100 pt-4">
                  {showSuggestionForm === (selectedNote._id || selectedNote.id) ? (
                    <form onSubmit={handleCreateSuggestion} className="space-y-3">
                      <p className="text-xs font-semibold text-slate-700">{t("workflowSuggestChange")}</p>
                      <textarea
                        value={suggestionMsg}
                        onChange={(e) => setSuggestionMsg(e.target.value)}
                        placeholder={t("workflowSuggestPlaceholder")}
                        required
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                        >
                          <Send size={13} /> {t("workflowSubmitSuggestion")}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowSuggestionForm(null); setSuggestionMsg(""); }}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          {t("workflowCancel")}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSuggestionForm(selectedNote._id || selectedNote.id)}
                      className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100 cursor-pointer"
                    >
                      <MessageSquare size={14} /> {t("workflowSuggestChange")}
                    </button>
                  )}
                </div>
              )}

              {/* Suggestions (for university/admin) */}
              {canViewSuggestions && suggestions.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                    <MessageSquare size={13} /> {t("workflowSuggestions")} ({suggestions.length})
                  </h4>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <div key={s._id || s.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800">
                              {s.businessName || s.businessId?.name || "Industry Partner"}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">{s.message}</p>
                            <p className="mt-1 text-[11px] text-slate-400">{formatDate(s.createdAt)}</p>
                          </div>
                          <span className={`shrink-0 ml-2 rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${statusColor[s.status] || "bg-slate-100 text-slate-600"}`}>
                            {s.status}
                          </span>
                        </div>
                        {(s.status === "Pending" || s.status === "Reviewed") && canEdit && (
                          <div className="mt-2 flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSuggestionStatus(s._id || s.id, "Accepted")}
                              className="flex items-center gap-1 rounded-lg bg-green-50 border border-green-200 px-2.5 py-1 text-[11px] font-semibold text-green-700 hover:bg-green-100 cursor-pointer"
                            >
                              <CheckCircle size={11} /> Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSuggestionStatus(s._id || s.id, "Rejected")}
                              className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                            >
                              <XCircle size={11} /> Reject
                            </button>
                            {s.status === "Pending" && (
                              <button
                                type="button"
                                onClick={() => handleSuggestionStatus(s._id || s.id, "Reviewed")}
                                className="flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer"
                              >
                                <Clock size={11} /> Mark Reviewed
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
