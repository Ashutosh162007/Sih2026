import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Sparkles,
  Building2,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ExternalLink,
  Users,
  ShieldCheck,
  Star,
} from "lucide-react";
import CsrImpactCertificateModal from "../../components/CsrImpactCertificateModal";
import axiosClient from "../../api/axiosClient";
import { formatDate } from "../../lib/format";
import { ISSUE_CATEGORIES } from "../../lib/constants";
import { useLanguageStore } from "../../store/languageStore";

import { handleMockRequest } from "../../api/mockAdapter";

export default function InnovationShowcase() {
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeCert, setActiveCert] = useState({ open: false, issue: null, project: null });

  useEffect(() => {
    async function load() {
      try {
        const [issRes, projRes] = await Promise.all([
          axiosClient.get("/api/issues"),
          axiosClient.get("/api/university/projects"),
        ]);
        let iss = issRes.data || [];
        let projs = projRes.data || [];
        if (iss.length === 0 || projs.length === 0) {
          const [mockI, mockP] = await Promise.all([
            handleMockRequest({ method: "get", url: "/api/issues" }),
            handleMockRequest({ method: "get", url: "/api/university/projects" }),
          ]);
          if (iss.length === 0) iss = mockI?.data || [];
          if (projs.length === 0) projs = mockP?.data || [];
        }
        setIssues(iss);
        setProjects(projs);
      } catch (err) {
        try {
          const [mockI, mockP] = await Promise.all([
            handleMockRequest({ method: "get", url: "/api/issues" }),
            handleMockRequest({ method: "get", url: "/api/university/projects" }),
          ]);
          setIssues(mockI?.data || []);
          setProjects(mockP?.data || []);
        } catch (_) {}
      }
    }
    load();
  }, []);

  const resolvedIssues = issues.filter((i) => i.status === "Resolved" || i.feedback);
  const filtered = selectedCategory === "all"
    ? resolvedIssues
    : resolvedIssues.filter((i) => i.category === selectedCategory);

  return (
    <div className="pb-16 space-y-8">
      {/* Hero Banner */}
      <div className="rounded-3xl border border-teal-200 bg-gradient-to-br from-[#0E4B4C] to-[#082E2F] p-8 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D7F5DE]/20 border border-[#D7F5DE]/30 px-3.5 py-1 text-xs font-semibold text-[#D7F5DE] backdrop-blur-sm">
            <Sparkles size={14} /> {t("showcaseHeroBadge")}
          </div>
          <h1 className="font-display mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t("showcaseHeroTitle")}
          </h1>
          <p className="mt-3 text-sm text-teal-100/80 leading-relaxed max-w-2xl">
            {t("showcaseHeroSubtitle")}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setSelectedCategory("all")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            selectedCategory === "all"
              ? "bg-[#0E4B4C] text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {t("allShowcases")} ({resolvedIssues.length})
        </button>
        {ISSUE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#0E4B4C] text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Showcase Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((issue) => {
          const project = projects.find((p) => p.issueId === issue.id || p.issueId === issue._id);

          return (
            <div
              key={issue.id || issue._id}
              className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Image & Header Banner */}
                {issue.images && issue.images.length > 0 ? (
                  <div className="h-52 w-full overflow-hidden relative bg-slate-100">
                    <img
                      alt={issue.title}
                      className="h-full w-full object-cover transition hover:scale-105"
                      src={typeof issue.images[0] === "string" ? issue.images[0] : (issue.images[0].url || issue.images[0].preview)}
                    />
                    <span className="absolute top-3 right-3 rounded-full bg-emerald-600/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-md flex items-center gap-1">
                      <CheckCircle2 size={13} /> Deployed & Verified
                    </span>
                  </div>
                ) : (
                  <div className="h-28 bg-gradient-to-r from-teal-50 to-slate-100 p-4 flex items-center justify-between border-b border-slate-100">
                    <span className="rounded-md bg-teal-100 text-[#0E4B4C] text-xs font-bold px-2.5 py-1">
                      {issue.category}
                    </span>
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
                      <CheckCircle2 size={13} /> Verified Ground Solution
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                    {issue.category} · 📍 {issue.district}
                  </span>

                  <h2 className="font-display text-xl font-bold text-slate-900 mt-2 leading-snug">
                    {issue.title}
                  </h2>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {project?.proposal || issue.aiProblemStatement?.slice(0, 180) || issue.description}
                  </p>

                  {/* Attributions: HEI + Industry Sponsor */}
                  <div className="mt-5 rounded-2xl bg-[#F7F8FA] border border-slate-100 p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Building2 size={13} className="text-blue-600" /> Research Lead:
                      </span>
                      <strong className="text-slate-800 text-right truncate max-w-[200px]">
                        {issue.assignee || project?.university || "BIT Mesra"}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Award size={13} className="text-amber-600" /> CSR Sponsor:
                      </span>
                      <strong className="text-emerald-800 text-right truncate max-w-[200px]">
                        {project?.industry || "Tata Steel CSR"} (₹{(project?.fundingAmount || 420000).toLocaleString("en-IN")})
                      </strong>
                    </div>

                    {issue.feedback?.rating && (
                      <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                        <span className="text-slate-400 font-medium">Citizen Rating:</span>
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star size={13} className="fill-amber-400 text-amber-400" /> {issue.feedback.rating}/5.0 ({issue.feedback.comment ? `"${issue.feedback.comment.slice(0, 30)}..."` : "Verified"})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveCert({ open: true, issue, project })}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-teal-300 bg-teal-50/60 py-2.5 text-xs font-bold text-[#0E4B4C] hover:bg-teal-100/80 transition cursor-pointer shadow-xs"
                >
                  <Award size={14} className="text-teal-700" />
                  <span>CSR Impact Certificate</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/issues/${issue.id || issue._id}`)}
                  className="rounded-xl bg-[#0E4B4C] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0b3b3c] transition cursor-pointer"
                >
                  Tracker →
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
            <Award size={36} className="mx-auto mb-3 text-teal-600" />
            <p className="font-semibold text-slate-800">No resolved showcases in this category yet.</p>
            <p className="mt-1 text-xs text-slate-400">
              As university and industry projects reach 100% milestone completion and citizen rating, they will be archived here.
            </p>
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {activeCert.open && (
        <CsrImpactCertificateModal
          isOpen={activeCert.open}
          onClose={() => setActiveCert({ open: false, issue: null, project: null })}
          issue={activeCert.issue}
          project={activeCert.project}
        />
      )}
    </div>
  );
}
