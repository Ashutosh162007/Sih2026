import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Award,
  Eye,
  Clock,
  Building2,
  Briefcase,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import CsrImpactCertificateModal from "../../components/CsrImpactCertificateModal";
import { ROLE_LABELS } from "../../lib/constants";
import axiosClient from "../../api/axiosClient";
import { useLanguageStore } from "../../store/languageStore";
import { formatDate } from "../../lib/format";

import { handleMockRequest } from "../../api/mockAdapter";

export default function VerifyAccounts() {
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState("accounts"); // 'accounts' | 'certificates'
  const [rows, setRows] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  async function load() {
    try {
      const [vRes, cRes] = await Promise.all([
        axiosClient.get("/api/admin/verifications"),
        axiosClient.get("/api/admin/certificates"),
      ]);
      let v = vRes.data || [];
      let c = cRes.data || [];
      if (v.length === 0 && c.length === 0) {
        const [mV, mC] = await Promise.all([
          handleMockRequest({ method: "get", url: "/api/admin/verifications" }),
          handleMockRequest({ method: "get", url: "/api/admin/certificates" }),
        ]);
        v = mV?.data || [];
        c = mC?.data || [];
      }
      setRows(v);
      setCertificates(c);
    } catch (e) {
      try {
        const [mV, mC] = await Promise.all([
          handleMockRequest({ method: "get", url: "/api/admin/verifications" }),
          handleMockRequest({ method: "get", url: "/api/admin/certificates" }),
        ]);
        setRows(mV?.data || []);
        setCertificates(mC?.data || []);
      } catch (_) {}
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(userId, decision) {
    await axiosClient.patch(`/api/admin/verifications/${userId}`, { decision });
    setMessage(`Account successfully ${decision === "approve" ? "Approved" : "Rejected"}.`);
    setTimeout(() => setMessage(""), 4000);
    load();
  }

  async function decideCertificate(projectId, decision) {
    await axiosClient.patch(`/api/admin/certificates/${projectId}`, { decision });
    setMessage(
      `CSR Impact Certificate for project successfully ${
        decision === "approve" ? "Authorized with Official State Digital Seal" : "Returned for Revisions"
      }.`
    );
    setTimeout(() => setMessage(""), 5000);
    load();
  }

  const pendingAccountsCount = rows.filter((u) => u.status === "pending").length;
  const pendingCertsCount = certificates.filter(
    (c) => c.certificateStatus === "pending_approval" || (!c.certificateStatus && c.status === "Completed")
  ).length;

  return (
    <div className="pb-16 space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">{t("verifyAccountsTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("verifyAccountsSubtitle")}
        </p>
      </div>

      {message && (
        <div className="rounded-2xl bg-[#D7F5DE] border border-emerald-300 p-4 text-xs font-semibold text-[#0E4B4C] flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("accounts")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === "accounts"
              ? "border-[#0E4B4C] text-[#0E4B4C] bg-teal-50/30"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <ShieldCheck size={16} />
          <span>{t("accountVerificationsTab")}</span>
          {pendingAccountsCount > 0 && (
            <span className="ml-1.5 rounded-full bg-rose-500 text-white text-[10px] px-2 py-0.5 font-bold">
              {pendingAccountsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certificates")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === "certificates"
              ? "border-[#0E4B4C] text-[#0E4B4C] bg-teal-50/30"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
          }`}
        >
          <Award size={16} />
          <span>{t("csrCertApprovalsTab")}</span>
          {pendingCertsCount > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-500 text-white text-[10px] px-2 py-0.5 font-bold">
              {pendingCertsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: User & Institution Verifications */}
      {activeTab === "accounts" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider">{t("fullName")}</th>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider">{t("organization")}</th>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider">{t("role")}</th>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider">{t("stageUpcoming")}</th>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-right">{t("verifyAccountsTitle")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id || u._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {u.name}
                    <p className="text-[11px] font-normal text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{u.org || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[u.role] || u.role}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={t("statusUnderReview")} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => decide(u.id || u._id, "approve")}
                        className="rounded-lg bg-[#0E4B4C] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#0b3b3c] cursor-pointer"
                      >
                        {t("approveBtn")}
                      </button>
                      <button
                        type="button"
                        onClick={() => decide(u.id || u._id, "reject")}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        {t("rejectBtn")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    {t("noNotifications")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CSR Impact Certificate Approvals */}
      {activeTab === "certificates" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Project / Civic Challenge</th>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider">Executing HEI</th>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider">CSR Sponsor & Grant</th>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider">{t("certStatusCol")}</th>
                <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-right">State Council Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((p) => {
                const isApproved = p.certificateStatus === "approved";
                const isPending =
                  p.certificateStatus === "pending_approval" ||
                  (!p.certificateStatus && p.status === "Completed");
                const isRejected = p.certificateStatus === "rejected";

                return (
                  <tr key={p.id || p._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>{p.title}</span>
                      </div>
                      <p className="text-[11px] font-normal text-slate-500 line-clamp-1">
                        {p.proposal || "Multi-stakeholder civic engineering deployment"}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700">
                      <div className="flex items-center gap-1 text-slate-800">
                        <Building2 size={13} className="text-blue-600 shrink-0" />
                        <span>{p.university}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700">
                      <div className="flex items-center gap-1 text-slate-800">
                        <Briefcase size={13} className="text-amber-600 shrink-0" />
                        <span>{p.industry || "CSR Partner"}</span>
                      </div>
                      <p className="text-[11px] font-bold text-emerald-700">
                        ₹{(p.fundingAmount || 350000).toLocaleString("en-IN")}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 px-2.5 py-0.5 text-[11px] font-bold border border-emerald-300">
                          <CheckCircle2 size={12} className="text-emerald-700" />
                          {t("certApproved")}
                        </span>
                      ) : isPending ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-[11px] font-bold border border-amber-300">
                          <Clock size={12} className="text-amber-700" />
                          {t("certPendingApproval")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-900 px-2.5 py-0.5 text-[11px] font-bold border border-rose-300">
                          <AlertTriangle size={12} className="text-rose-700" />
                          {t("certRejected")}
                        </span>
                      )}
                      {p.certificateApprovedAt && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatDate(p.certificateApprovedAt)}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Preview Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProject(p);
                            setShowCertModal(true);
                          }}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                          title={t("previewCertBtn")}
                        >
                          <Eye size={13} className="text-slate-500" />
                          <span>{t("previewCertBtn")}</span>
                        </button>

                        {/* Approve / Reject Buttons */}
                        {!isApproved && (
                          <>
                            <button
                              type="button"
                              onClick={() => decideCertificate(p.id || p._id, "approve")}
                              className="rounded-lg bg-[#0E4B4C] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#0b3b3c] transition cursor-pointer"
                            >
                              {t("approveCertBtn")}
                            </button>
                            <button
                              type="button"
                              onClick={() => decideCertificate(p.id || p._id, "reject")}
                              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              {t("rejectCertBtn")}
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            type="button"
                            onClick={() => decideCertificate(p.id || p._id, "reject")}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Revoke or request changes"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {certificates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                    {t("noPendingCerts")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Certificate Modal for Admin Preview */}
      <CsrImpactCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        project={selectedProject}
      />
    </div>
  );
}
