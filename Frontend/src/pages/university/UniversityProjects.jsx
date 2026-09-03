import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, FolderKanban, PlusCircle } from "lucide-react";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";
import { useLanguageStore } from "../../store/languageStore";

export default function UniversityProjects() {
  const { t } = useLanguageStore();
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/api/university/projects").then((r) => setProjects(r.data));
  }, []);

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">{t("navProjects")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("uniDashboardSubtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/university/queue")}
          className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] cursor-pointer"
        >
          <PlusCircle size={15} /> {t("claimBtn")}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {projects.map((p) => (
          <div
            key={p.id || p._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-400 hover:shadow-sm cursor-pointer"
            onClick={() => navigate(`/university/projects/${p.issueId}/proposal`)}
          >
            <ListItemCard
              title={p.title}
              description={p.proposal}
              status={p.status}
              metadata={{
                assignee: p.industry ? `Sponsored by ${p.industry} (₹${(p.fundingAmount || 350000).toLocaleString("en-IN")})` : t("pendingProposals"),
              }}
            />
          </div>
        ))}

        {projects.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            <FolderKanban size={32} className="mx-auto mb-3 text-teal-600" />
            <p className="font-semibold text-slate-800">{t("noReportedIssues")}</p>
            <p className="mt-1 text-xs text-slate-400">{t("uniDashboardSubtitle")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
