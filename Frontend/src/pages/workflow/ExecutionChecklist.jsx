import { useEffect, useState } from "react";
import {
  ClipboardList,
  Loader2,
  PackagePlus,
  PenLine,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  PackageCheck,
  Send,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useLanguageStore } from "../../store/languageStore";
import { handleMockRequest } from "../../api/mockAdapter";

function itemId(item) {
  return item?._id || item?.id;
}

export default function ExecutionChecklist({ projectId, user }) {
  const { t } = useLanguageStore();
  const isUni = user?.role === "university";
  const isBiz = user?.role === "industry";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // item being edited
  const [form, setForm] = useState({ item: "", why: "" });

  const authHeaders = { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function load() {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/api/workflow/projects/${projectId}/checklist`);
      if (Array.isArray(res.data?.items)) {
        setItems(res.data.items);
        setLoading(false);
        return;
      }
    } catch (e) {}
    try {
      const mockRes = await handleMockRequest({
        method: "get",
        url: `/api/workflow/projects/${projectId}/checklist`,
        headers: authHeaders,
      });
      if (Array.isArray(mockRes?.data?.items)) setItems(mockRes.data.items);
    } catch (_) {}
    setLoading(false);
  }

  async function createItem(e) {
    e.preventDefault();
    if (!form.item.trim() || busy) return;
    setBusy(true);
    const payload = { item: form.item.trim(), why: form.why.trim() };
    try {
      await axiosClient.post(`/api/workflow/projects/${projectId}/checklist`, payload, { headers: authHeaders });
    } catch (err) {
      try {
        await handleMockRequest({ method: "post", url: `/api/workflow/projects/${projectId}/checklist`, data: payload, headers: authHeaders });
      } catch (_) {}
    }
    setBusy(false);
    setForm({ item: "", why: "" });
    setShowForm(false);
    load();
  }

  async function editItem(e) {
    e.preventDefault();
    if (!form.item.trim() || busy || !editing) return;
    setBusy(true);
    const nid = itemId(editing);
    const payload = { item: form.item.trim(), why: form.why.trim() };
    try {
      await axiosClient.put(`/api/workflow/checklist/${nid}`, payload, { headers: authHeaders });
    } catch (err) {
      try {
        await handleMockRequest({ method: "put", url: `/api/workflow/checklist/${nid}`, data: payload, headers: authHeaders });
      } catch (_) {}
    }
    setBusy(false);
    setEditing(null);
    setForm({ item: "", why: "" });
    load();
  }

  async function deleteItem(item) {
    if (!confirm(t("execChecklistDeleteConfirm"))) return;
    const nid = itemId(item);
    try {
      await axiosClient.delete(`/api/workflow/checklist/${nid}`, { headers: authHeaders });
    } catch (err) {
      try {
        await handleMockRequest({ method: "delete", url: `/api/workflow/checklist/${nid}`, headers: authHeaders });
      } catch (_) {}
    }
    load();
  }

  async function provideItem(item) {
    if (busy) return;
    setBusy(true);
    const nid = itemId(item);
    try {
      await axiosClient.patch(`/api/workflow/checklist/${nid}/provide`, {}, { headers: authHeaders });
    } catch (err) {
      try {
        await handleMockRequest({ method: "patch", url: `/api/workflow/checklist/${nid}/provide`, headers: authHeaders });
      } catch (_) {}
    }
    setBusy(false);
    load();
  }

  function openAdd() {
    setEditing(null);
    setForm({ item: "", why: "" });
    setShowForm(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ item: item.item || "", why: item.why || "" });
    setShowForm(true);
  }

  const provided = items.filter((i) => i.status === "provided").length;
  const total = items.length;
  const progress = total === 0 ? 0 : Math.round((provided / total) * 100);

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0E4B4C]/10 text-[#0E4B4C]">
              <ClipboardList size={16} />
            </span>
            <h3 className="font-display text-xl font-bold text-slate-900">{t("execChecklistTitle")}</h3>
          </div>
          <p className="mt-1.5 max-w-2xl text-xs text-slate-500">{t("execChecklistSubtitle")}</p>
        </div>
        {isUni && (
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs font-bold text-teal-800 hover:bg-teal-100 cursor-pointer"
          >
            <PackagePlus size={15} /> {t("execChecklistAdd")}
          </button>
        )}
      </div>

      {total > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600">{t("execChecklistProgress")}</span>
              <span className="text-[11px] font-bold text-[#0E4B4C]">
                {provided} / {total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <PackageCheck size={18} className="text-emerald-500 shrink-0" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm">
          <Loader2 className="animate-spin text-[#0E4B4C]" size={22} />
        </div>
      ) : total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <ClipboardList className="mx-auto mb-3 h-8 w-8 text-slate-300" />
          <p className="text-sm font-bold text-slate-600">{t("execChecklistEmpty")}</p>
          <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">
            {isUni ? t("execChecklistEmptyUni") : t("execChecklistEmptyBiz")}
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => {
            const done = item.status === "provided";
            return (
              <li
                key={itemId(item)}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition ${
                  done ? "border-emerald-200" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {done ? (
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle size={20} className="mt-0.5 shrink-0 text-slate-300" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold ${done ? "text-slate-500 line-through decoration-emerald-300/80" : "text-slate-800"}`}>
                      {item.item}
                    </p>
                    {item.why && (
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                        <span className="font-semibold text-slate-600">{t("execChecklistWhy")} </span>
                        {item.why}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span>
                        🏛 {t("execChecklistRequestedBy")} <span className="font-semibold text-slate-500">{item.requestedByName || "—"}</span>
                      </span>
                      {done && (
                        <span className="font-semibold text-emerald-600">
                          ✓ {t("execChecklistProvidedBy")} {item.providedByName || "—"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isBiz && !done && (
                      <button
                        type="button"
                        onClick={() => provideItem(item)}
                        disabled={busy}
                        className="flex items-center gap-1.5 rounded-xl bg-[#0E4B4C] px-3 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-[#0b3b3c] disabled:opacity-50 cursor-pointer"
                      >
                        <Send size={13} /> {t("execChecklistProvide")}
                      </button>
                    )}
                    {done && (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        {t("execChecklistProvided")}
                      </span>
                    )}
                    {isUni && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 cursor-pointer"
                          aria-label={t("execChecklistEdit")}
                        >
                          <PenLine size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item)}
                          className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50 cursor-pointer"
                          aria-label={t("execChecklistDelete")}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {showForm && (
        <form
          onSubmit={editing ? editItem : createItem}
          className="mt-4 rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50/40 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              {editing ? t("execChecklistEditTitle") : t("execChecklistAddTitle")}
            </h4>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
          <input
            type="text"
            value={form.item}
            onChange={(e) => setForm((f) => ({ ...f, item: e.target.value }))}
            placeholder={t("execChecklistItemPh")}
            maxLength={200}
            required
            autoFocus
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm placeholder:text-slate-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none mb-3"
          />
          <textarea
            value={form.why}
            onChange={(e) => setForm((f) => ({ ...f, why: e.target.value }))}
            placeholder={t("execChecklistWhyPh")}
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm placeholder:text-slate-300 focus:border-teal-400 focus:ring-1 focus:ring-teal-400 outline-none resize-none mb-3"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={busy || !form.item.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-[#0E4B4C] px-4 py-2 text-xs font-bold text-white hover:bg-[#0b3b3c] disabled:opacity-50 cursor-pointer"
            >
              <PackagePlus size={14} /> {busy ? t("execChecklistSaving") : editing ? t("execChecklistSave") : t("execChecklistAddItem")}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {t("execChecklistCancel")}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}