import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, ArrowRight, ClipboardList, Lock } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useLanguageStore } from "../../store/languageStore";
import { useAuthStore } from "../../store/authStore";
import { handleMockRequest } from "../../api/mockAdapter";

export default function WorkflowProjects() {
  const { t } = useLanguageStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "citizen") {
      setLoading(false);
      return;
    }
    async function load() {
      setLoading(true);
      const authHeaders = { Authorization: `Bearer ${btoa(JSON.stringify({ id: user.id, role: user.role }))}` };
      try {
        const res = await axiosClient.get("/api/workflow/projects", { headers: authHeaders });
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProjects(res.data);
          setLoading(false);
          return;
        }
      } catch (e) {}

      try {
        const mockRes = await handleMockRequest({
          method: "get",
          url: "/api/workflow/projects",
          headers: authHeaders,
        });
        if (Array.isArray(mockRes?.data)) setProjects(mockRes.data);
      } catch (_) {}

      setLoading(false);
    }
    load();
  }, [user?.role]);

  if (user?.role === "admin" || user?.role === "citizen") {
    return (
      <div className="pb-16">
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("navWorkflow")}</h1>
        <div className="mt-12 flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Lock size={32} className="mb-3 text-red-400" />
          <p className="font-semibold text-slate-800">{t("workflowAccessDenied")}</p>
          <p className="mt-1 text-xs text-slate-400">{t("boardDeniedHint")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">{t("navWorkflow")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("workflowSubtitle")}</p>
        </div>
      </div>

      {loading && (
        <div className="mt-12 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
          <ClipboardList size={32} className="mx-auto mb-3 text-teal-600" />
          <p className="font-semibold text-slate-800">{t("workflowNoProjects")}</p>
          <p className="mt-1 text-xs text-slate-400">{t("workflowNoProjectsHint")}</p>
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="mt-6 space-y-3">
          {projects.map((p) => (
            <div
              key={p.id || p._id}
              onClick={() => navigate(`/workflow/${p.id || p._id}`)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-teal-400 hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FolderKanban size={16} className="text-teal-600 shrink-0" />
                    <h3 className="text-sm font-bold text-slate-900 truncate">{p.title}</h3>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {p.university && (
                      <span className="rounded-lg bg-teal-50 px-2 py-1 font-medium text-teal-700">
                        {p.university}
                      </span>
                    )}
                    {p.industry && (
                      <span className="rounded-lg bg-amber-50 px-2 py-1 font-medium text-amber-700">
                        {p.industry}
                      </span>
                    )}
                    <span className={`rounded-lg px-2 py-1 font-medium ${
                      p.status === "Completed" ? "bg-green-50 text-green-700" :
                      p.status === "Funded" ? "bg-blue-50 text-blue-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  {p.proposal && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-1">{p.proposal}</p>
                  )}
                </div>
                <ArrowRight size={18} className="ml-3 text-slate-300 group-hover:text-teal-600 transition shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
