import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Stepper from "../../components/Stepper";
import TeamBuilder from "../../components/TeamBuilder";
import axiosClient from "../../api/axiosClient";
import { useLanguageStore } from "../../store/languageStore";

export default function ProposalWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [proposal, setProposal] = useState("");
  const [expectedImpact, setExpectedImpact] = useState("");
  const [team, setTeam] = useState([]);
  const [milestones, setMilestones] = useState([
    { name: "Field survey, chemical sampling & baseline telemetry", due: "2026-09-15", done: false },
    { name: "Prototype fabrication & hydraulic testing in campus lab", due: "2026-10-15", done: false },
    { name: "Ground deployment & community operational handover", due: "2026-11-15", done: false },
  ]);

  const STEPS = [
    t("stepScope"),
    t("stepTeam"),
    t("stepNarrative"),
    t("stepMilestones"),
  ];

  useEffect(() => {
    axiosClient.get(`/api/issues/${id}`).then((r) => {
      setTitle((t) => t || `Solution for ${r.data.title}`);
      if (!proposal && r.data.aiProblemStatement) {
        setProposal(
          `## Executive Solution Plan\n\nIn response to the civic challenge identified in ${r.data.district}, our multidisciplinary university research team proposes the following engineering & community intervention:\n\n1. Technical Design & Methodology:\n- Deploy an integrated physical mitigation unit...\n- Configure continuous IoT telemetry...\n\n2. Community Integration:\n- Train local youth and self-help groups on maintenance.\n- Real-time performance dashboards on Sahayog.`
        );
      }
    });
  }, [id]);

  const totalTeamMembers = team.reduce((n, row) => n + (row.members?.length || 0), 0);

  function isStepValid(currentStep) {
    if (currentStep === 0) {
      return Boolean(title?.trim() && title.trim().length >= 3 && expectedImpact?.trim() && expectedImpact.trim().length >= 5);
    }
    if (currentStep === 1) {
      return totalTeamMembers >= 1;
    }
    if (currentStep === 2) {
      return Boolean(proposal?.trim() && proposal.trim().length >= 15);
    }
    if (currentStep === 3) {
      return milestones.length >= 1 && milestones.every((m) => m.name?.trim() && m.due);
    }
    return true;
  }

  async function submit() {
    if (!isStepValid(0) || !isStepValid(1) || !isStepValid(2) || !isStepValid(3)) return;
    await axiosClient.post(`/api/projects/${id}/proposals`, {
      title,
      proposal,
      expectedImpact,
      team,
      milestones,
    });
    navigate("/university/projects");
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <h1 className="font-display text-3xl font-bold text-slate-900">{t("formulateProposalTitle")}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {t("formulateProposalSubtitle")}
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center justify-between">
                <span>{t("solutionTitleLabel")}</span>
                <span className="text-xs text-rose-500 font-normal">{t("reqField")}</span>
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Community Bio-char Defluoridation & IoT Telemetry Pilot"
                className={`mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                  !title.trim() ? "border-amber-300 focus:border-rose-500" : "border-slate-200 focus:border-[#0E4B4C]"
                }`}
              />
              {!title.trim() && (
                <p className="mt-1 text-xs text-amber-600">Please provide a descriptive solution title (minimum 3 characters).</p>
              )}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="flex items-center justify-between">
                <span>{t("expectedImpactLabel")}</span>
                <span className="text-xs text-rose-500 font-normal">{t("reqField")}</span>
              </span>
              <textarea
                rows={4}
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
                placeholder={t("expectedImpactPlaceholder")}
                className={`mt-1 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition ${
                  !expectedImpact.trim() ? "border-amber-300 focus:border-rose-500" : "border-slate-200 focus:border-[#0E4B4C]"
                }`}
              />
              {!expectedImpact.trim() && (
                <p className="mt-1 text-xs text-amber-600">Please describe the expected community, societal, or environmental impact before continuing.</p>
              )}
            </label>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-slate-700">{t("teamTitle")}</p>
              <span className="text-xs text-rose-500 font-normal">{t("minTeamMemberReq")}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {t("teamSubtitle")}
            </p>
            {totalTeamMembers === 0 && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2 font-medium">
                <span>⚠️ Please select at least one faculty mentor or student researcher from the disciplines below.</span>
              </div>
            )}
            <TeamBuilder team={team} onChange={setTeam} />
          </div>
        )}

        {step === 2 && (
          <label className="block text-sm font-medium text-slate-700">
            <span className="flex items-center justify-between">
              <span>{t("methodologyLabel")}</span>
              <span className="text-xs text-rose-500 font-normal">{t("reqField")}</span>
            </span>
            <textarea
              rows={10}
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              className={`mt-1 w-full rounded-xl border px-3.5 py-2.5 text-xs font-mono outline-none transition leading-relaxed ${
                !proposal.trim() ? "border-amber-300 focus:border-rose-500" : "border-slate-200 focus:border-[#0E4B4C]"
              }`}
            />
            {!proposal.trim() && (
              <p className="mt-1 text-xs text-amber-600">Please provide the detailed technical methodology and execution narrative.</p>
            )}
          </label>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">{t("milestonesTimelineLabel")}</p>
              <span className="text-xs text-rose-500 font-normal">{t("milestonesReq")}</span>
            </div>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[70%_30%]">
                  <input
                    value={m.name}
                    placeholder={t("milestonePlaceholder")}
                    onChange={(e) =>
                      setMilestones(milestones.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                    }
                    className={`rounded-xl border px-3 py-2 text-xs outline-none ${
                      !m.name.trim() ? "border-amber-300" : "border-slate-200 focus:border-[#0E4B4C]"
                    }`}
                  />
                  <input
                    type="date"
                    value={m.due}
                    onChange={(e) =>
                      setMilestones(milestones.map((x, j) => (j === i ? { ...x, due: e.target.value } : x)))
                    }
                    className={`rounded-xl border px-3 py-2 text-xs outline-none ${
                      !m.due ? "border-amber-300" : "border-slate-200 focus:border-[#0E4B4C]"
                    }`}
                  />
                </div>
              ))}
            </div>
            {(!milestones.length || milestones.some((m) => !m.name.trim() || !m.due)) && (
              <p className="text-xs text-amber-600">Please fill out all milestone names and target due dates.</p>
            )}
            <button
              type="button"
              onClick={() =>
                setMilestones([...milestones, { name: "", due: "2026-11-30", done: false }])
              }
              className="text-xs font-semibold text-[#0E4B4C] hover:underline cursor-pointer"
            >
              {t("addMilestoneBtn")}
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40 cursor-pointer"
          >
            {t("backBtn")}
          </button>
          {step < 3 ? (
            <button
              type="button"
              disabled={!isStepValid(step)}
              onClick={() => {
                if (isStepValid(step)) setStep((s) => s + 1);
              }}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                !isStepValid(step)
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  : "bg-[#0E4B4C] text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] cursor-pointer"
              }`}
            >
              {t("continueBtn")} <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={!isStepValid(3)}
              onClick={submit}
              className={`flex items-center gap-2 rounded-xl px-7 py-2.5 text-sm font-bold transition ${
                !isStepValid(3)
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  : "bg-[#0E4B4C] text-white shadow-md shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] cursor-pointer"
              }`}
            >
              {t("submitToIndustryBtn")} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
