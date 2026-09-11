import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Activity,
  FileCheck2,
  Building2,
  Coins,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Server,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { formatDate } from "../../lib/format";
import { useLanguageStore } from "../../store/languageStore";

export default function AdminAuditLogs() {
  const { t } = useLanguageStore();
  const [logs, setLogs] = useState([
    {
      id: "log-1",
      timestamp: new Date().toISOString(),
      type: "CSR_TRANCHE_RELEASED",
      actor: "Tata Steel CSR",
      action: "Released Escrow Tranche 1 (₹1,40,000) for Fluoride Water Filtration in Tamar.",
      ip: "103.24.12.8",
      status: "SUCCESS",
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: "AI_PROBLEM_SYNTHESIS",
      actor: "Sahayog NVIDIA AI Engine",
      action: "Formulated academic research statement for Drainage overflow in Ranchi with 82% Severity.",
      ip: "127.0.0.1 (Service)",
      status: "SUCCESS",
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "USER_VERIFICATION",
      actor: "State Innovation Council Admin",
      action: "Approved accreditation credentials for Birla Institute of Technology (BIT) Mesra.",
      ip: "103.220.77.14",
      status: "AUTHORIZED",
    },
    {
      id: "log-4",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      type: "GOVT_ORG_ISSUE_FILED",
      actor: "Panchayat Samiti - Tamar",
      action: "Registered official local body challenge: 'Arsenic and turbidity in community wells'.",
      ip: "117.211.89.5",
      status: "REGISTERED",
    },
    {
      id: "log-5",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      type: "CERTIFICATE_AUTHORIZED",
      actor: "State Innovation Council Admin",
      action: "Digitally signed CSR Tax Exemption Impact Certificate for Project PRJ-4412.",
      ip: "103.220.77.14",
      status: "SEALED",
    },
  ]);

  return (
    <div className="pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold text-slate-900">{t("auditTitle")}</h1>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-800 flex items-center gap-1">
              <Activity size={13} className="text-emerald-600 animate-pulse" /> {t("liveTelemetry")}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {t("auditSubtitle")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs">
            <Server size={14} className="text-[#0E4B4C]" /> {t("nodeClusterHealthy")}
          </span>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">{t("aiThroughput")}</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1">100% Validated</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Powered by NVIDIA NIM</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">{t("escrowSecurity")}</p>
          <p className="font-display text-2xl font-bold text-[#0E4B4C] mt-1">₹1.48 Cr Protected</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Dual-signatory verification</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">{t("accreditedEntities")}</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1">42 Institutions</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Universities, Industry & Local Bodies</p>
        </div>
      </div>

      {/* Log Feed */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h2 className="font-display font-bold text-slate-800 text-sm">{t("auditStreamTitle")}</h2>
          <span className="text-[11px] text-slate-400">{t("showingLast24h")}</span>
        </div>

        <div className="divide-y divide-slate-100">
          {logs.map((item) => (
            <div key={item.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 border border-teal-200 text-[#0E4B4C] font-bold text-xs mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{item.action}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Actor: <strong className="text-slate-700">{item.actor}</strong> · IP: <span className="font-mono text-slate-600">{item.ip}</span>
                  </p>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="inline-block rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  {item.status}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{formatDate(item.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
