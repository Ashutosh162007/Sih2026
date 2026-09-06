import { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import StatusBadge from "../../components/StatusBadge";
import { ROLE_LABELS } from "../../lib/constants";
import axiosClient from "../../api/axiosClient";
import { useLanguageStore } from "../../store/languageStore";

export default function VerifyAccounts() {
  const { t } = useLanguageStore();
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await axiosClient.get("/api/admin/verifications");
    setRows(data);
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

  return (
    <div className="pb-16">
      <h1 className="font-display text-3xl font-bold text-slate-900">{t("verifyAccountsTitle")}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {t("verifyAccountsSubtitle")}
      </p>

      {message && (
        <div className="mt-4 rounded-xl bg-[#D7F5DE] border border-emerald-300 p-3 text-xs font-semibold text-[#0E4B4C]">
          {message}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3">
                  <StatusBadge label="Under review" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => decide(u.id || u._id, "approve")}
                      className="rounded-lg bg-[#0E4B4C] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#0b3b3c] cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(u.id || u._id, "reject")}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      Reject
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
    </div>
  );
}
