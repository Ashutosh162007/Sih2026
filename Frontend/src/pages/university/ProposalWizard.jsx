import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Stepper from "../../components/Stepper";
import TeamBuilder from "../../components/TeamBuilder";
import axiosClient from "../../api/axiosClient";

const STEPS = ["Project Scope", "Multidisciplinary Team", "Proposal Narrative", "Milestones & Timeline"];

export default function ProposalWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosClient
      .get(`/api/issues/${id}`)
      .then((r) => {
        setTitle((t) => t || `Solution for ${r.data.title}`);
        if (!proposal && r.data.aiProblemStatement) {
          setProposal(
            `## Executive Solution Plan\n\nIn response to the civic challenge identified in ${r.data.district}, our multidisciplinary university research team proposes the following engineering & community intervention:\n\n1. Technical Design & Methodology:\n- Deploy an integrated physical mitigation unit...\n- Configure continuous IoT telemetry...\n\n2. Community Integration:\n- Train local youth and self-help groups on maintenance.\n- Real-time performance dashboards on Sahayog.`
          );
        }
      })
      .catch(() => setError("Failed to load issue details. The proposal can still be drafted manually."));
  }, [id]);

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      await axiosClient.post(`/api/projects/${id}/proposals`, {
        title,
        proposal,
        expectedImpact,
        team,
        milestones,
      });
      navigate("/university/projects");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit proposal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <h1 className="font-display text-3xl font-bold text-slate-900">Formulate Solution Proposal</h1>
      <p className="mt-1 text-sm text-slate-500">
        Draft an engineering solution and milestones for submission to Industry / CSR funding partners.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Project / Solution Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0E4B4C]"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Expected Community Impact
              <textarea
                rows={4}
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
                placeholder="e.g. Eliminates waterlogging for 40,000+ daily commuters and reduces waterborne illnesses by 85%."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0E4B4C]"
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Constitute Multidisciplinary Student & Faculty Team</p>
            <p className="text-xs text-slate-500 mb-4">
              Bring together complementary disciplines (e.g. Civil Engineering + IoT/Computer Science + Environmental Science).
            </p>
            <TeamBuilder team={team} onChange={setTeam} />
          </div>
        )}

        {step === 2 && (
          <label className="block text-sm font-medium text-slate-700">
            Solution Technical Proposal & Methodology
            <textarea
              rows={10}
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono outline-none focus:border-[#0E4B4C] leading-relaxed"
            />
          </label>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-700">Milestones & Implementation Timelines</p>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[70%_30%]">
                  <input
                    value={m.name}
                    placeholder="Milestone Deliverable"
                    onChange={(e) =>
                      setMilestones(milestones.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                  <input
                    type="date"
                    value={m.due}
                    onChange={(e) =>
                      setMilestones(milestones.map((x, j) => (j === i ? { ...x, due: e.target.value } : x)))
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setMilestones([...milestones, { name: "New Milestone", due: "2026-11-30", done: false }])
              }
              className="text-xs font-semibold text-[#0E4B4C] hover:underline"
            >
              + Add another milestone
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c]"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-7 py-2.5 text-sm font-bold text-white shadow-md shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit to Industry Partners"} <Sparkles size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
