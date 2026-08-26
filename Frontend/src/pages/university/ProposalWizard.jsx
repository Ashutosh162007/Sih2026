import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Stepper from "../../components/Stepper";
import TeamBuilder from "../../components/TeamBuilder";
import axiosClient from "../../api/axiosClient";

const STEPS = ["Scope", "Team", "Proposal", "Milestones"];

export default function ProposalWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [proposal, setProposal] = useState("");
  const [team, setTeam] = useState([]);
  const [milestones, setMilestones] = useState([
    { name: "Discovery", due: "2026-09-15", done: false },
    { name: "Pilot", due: "2026-10-15", done: false },
  ]);

  useEffect(() => {
    axiosClient.get(`/api/issues/${id}`).then((r) => {
      setTitle((t) => t || `Solution for ${r.data.title}`);
    });
  }, [id]);

  async function submit() {
    await axiosClient.post(`/api/projects/${id}/proposals`, { title, proposal, team, milestones });
    navigate("/university/projects");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl">Solution proposal</h1>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <Stepper steps={STEPS} currentStep={step} />
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        {step === 0 && (
          <label className="block text-sm">
            Project title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
            />
          </label>
        )}
        {step === 1 && <TeamBuilder team={team} onChange={setTeam} />}
        {step === 2 && (
          <label className="block text-sm">
            Proposal narrative
            <textarea
              rows={8}
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
            />
          </label>
        )}
        {step === 3 && (
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <input
                  value={m.name}
                  onChange={(e) =>
                    setMilestones(milestones.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
                <input
                  type="date"
                  value={m.due}
                  onChange={(e) =>
                    setMilestones(milestones.map((x, j) => (j === i ? { ...x, due: e.target.value } : x)))
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Back
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Submit to industry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
