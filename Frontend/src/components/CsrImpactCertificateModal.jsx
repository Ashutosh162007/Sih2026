import { useState, useRef } from "react";
import {
  Award,
  Download,
  Printer,
  X,
  ShieldCheck,
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  QrCode,
} from "lucide-react";
import { formatDate } from "../lib/format";

export default function CsrImpactCertificateModal({
  isOpen,
  onClose,
  project,
  issue,
}) {
  if (!isOpen) return null;

  const certificateRef = useRef(null);

  // Derived details
  const issueTitle = issue?.title || project?.title || "Civic Innovation Project";
  const category = issue?.category || project?.category || "Environmental & Water Systems";
  const district = issue?.district || issue?.location?.district || "Ranchi, Jharkhand";
  const university = project?.university || issue?.assignee || "Birla Institute of Technology (BIT) Mesra";
  const industry = project?.industry || "Tata Steel Foundation CSR";
  const budget = project?.budget ? `₹${project.budget.toLocaleString("en-IN")}` : "₹3,50,000";
  const rating = issue?.feedback?.rating || 5;
  const certId = `JH-CSR-2026-${(project?.id || issue?.id || "9842").toString().slice(-4).toUpperCase()}`;

  const team = project?.team || [
    { name: "Dr. A. K. Srivastava", role: "Faculty Principal Investigator", dept: "Civil & Environmental Eng." },
    { name: "Priya Sharma", role: "Lead Student Researcher", dept: "Chemical Engineering" },
    { name: "Rahul Verma", role: "Hardware & IoT Lead", dept: "Computer Science" },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Print Specific CSS to format as exact A4 single-page PDF */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #csr-certificate-print-area, #csr-certificate-print-area * {
            visibility: visible;
          }
          #csr-certificate-print-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 24px;
            box-shadow: none;
            border: none;
            background: white !important;
            z-index: 99999;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Action Header (Hidden during Print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Award className="text-[#0E4B4C]" size={20} />
            <h3 className="font-display text-sm font-bold text-slate-900">
              CSR Grant Impact & Innovation Certificate
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-[#0E4B4C] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] transition cursor-pointer"
            >
              <Printer size={15} />
              <span>Download / Print PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Body (The Printable Document) */}
        <div
          id="csr-certificate-print-area"
          ref={certificateRef}
          className="p-8 sm:p-10 bg-gradient-to-b from-white via-slate-50/30 to-teal-50/20 relative"
        >
          {/* Certificate Ornamental Border */}
          <div className="border-4 border-double border-[#0E4B4C]/40 rounded-2xl p-6 sm:p-8 bg-white relative shadow-xs">
            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
              <Award size={360} className="text-[#0E4B4C]" />
            </div>

            {/* Header / State Emblem / Portal Logo */}
            <div className="text-center space-y-1.5 border-b border-[#0E4B4C]/20 pb-5">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E4B4C] text-white shadow-sm">
                  <Sparkles size={18} className="text-[#D7F5DE]" />
                </div>
                <span className="font-display text-xl font-black text-[#0E4B4C] tracking-tight">
                  Sahayog Innovation Network
                </span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                Government of Jharkhand · State Societal Innovation Council
              </p>
              <h1 className="font-display text-2xl font-black text-slate-900 tracking-wide pt-2">
                CERTIFICATE OF SOCIETAL INNOVATION & CSR IMPACT
              </h1>
              <p className="text-xs font-mono text-teal-800 font-semibold">
                Certificate ID: {certId} · Issued under Jharkhand R&D Ecosystem Framework
              </p>
            </div>

            {/* Certificate Statement */}
            <div className="py-6 space-y-4 text-center">
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl mx-auto">
                This is to officially certify that the high-priority civic challenge formulated under the Sahayog Statewide Triage Engine has been successfully addressed through institutional research, multidisciplinary engineering, and corporate social responsibility funding.
              </p>

              {/* Highlighted Project Card */}
              <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-[#D7F5DE]/40 to-teal-50/20 p-4 text-left">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 pb-2 mb-2">
                  <span className="text-[11px] font-bold text-[#0E4B4C] uppercase tracking-wider">
                    {category} · {district}
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                    ✅ Verified on Ground
                  </span>
                </div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  {issueTitle}
                </h2>
              </div>
            </div>

            {/* Stakeholder Breakdown Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs py-2 border-t border-b border-slate-100">
              {/* Higher Education Institute */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Building2 size={14} className="text-blue-600" />
                  <span>Executing Higher Education Institute</span>
                </div>
                <p className="text-slate-800 font-semibold text-xs">{university}</p>
                <div className="pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Core Innovation Team:</p>
                  <ul className="text-[11px] text-slate-600 space-y-0.5 mt-0.5">
                    {team.slice(0, 3).map((member, idx) => (
                      <li key={idx} className="truncate">
                        • <span className="font-medium text-slate-800">{member.name}</span> ({member.dept || member.role})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Corporate CSR Sponsor */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Briefcase size={14} className="text-amber-600" />
                  <span>Corporate CSR Funding Partner</span>
                </div>
                <p className="text-slate-800 font-semibold text-xs">{industry}</p>
                <div className="pt-1 space-y-1 text-[11px] text-slate-600">
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-medium">Grant Allocation:</span>
                    <span className="font-bold text-emerald-700">{budget}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-medium">Milestones Achieved:</span>
                    <span className="font-bold text-slate-800">100% Completed</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-400 font-medium">Citizen Rating:</span>
                    <span className="font-bold text-amber-700">{rating} / 5 ⭐</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Signatures & Verification Stamp */}
            <div className="pt-6 flex items-end justify-between">
              {/* QR Code Stamp */}
              <div className="flex items-center gap-2.5">
                <div className="h-14 w-14 rounded-xl border border-slate-300 bg-white p-1.5 flex items-center justify-center shadow-xs">
                  <QrCode size={40} className="text-slate-800" />
                </div>
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <p className="font-bold text-slate-700">Digital Seal Verified</p>
                  <p>Scan to verify authenticity</p>
                  <p className="font-mono text-[9px] text-slate-400">auth.sahayog.jh.gov.in</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex gap-8 text-center text-xs">
                <div className="space-y-1">
                  <div className="h-9 border-b border-slate-300 w-28 mx-auto" />
                  <p className="font-bold text-slate-800 text-[11px]">Dean of R&D</p>
                  <p className="text-[10px] text-slate-400">Higher Education Institute</p>
                </div>

                <div className="space-y-1">
                  <div className="h-9 border-b border-slate-300 w-28 mx-auto" />
                  <p className="font-bold text-slate-800 text-[11px]">CSR Committee Head</p>
                  <p className="text-[10px] text-slate-400">Industry Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
