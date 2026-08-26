import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../../components/Stepper";
import FileDropzone from "../../components/FileDropzone";
import MapLocationPicker from "../../components/MapLocationPicker";
import { ISSUE_CATEGORIES } from "../../lib/constants";
import { useWizardStore } from "../../store/wizardStore";
import axiosClient from "../../api/axiosClient";

const STEPS = ["Basic info", "Details", "Evidence", "Location", "Review"];

export default function ReportIssue() {
  const { step, data, setStep, next, back, update, reset } = useWizardStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function canNext() {
    if (step === 0) return data.title && data.category;
    if (step === 1) return data.description.length > 20;
    if (step === 3) return data.district && data.block;
    return true;
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        title: data.title,
        category: data.category,
        description: data.description,
        evidence: data.evidence.map((f) => ({ filename: f.filename, size: f.size })),
        district: data.district,
        block: data.block,
        landmark: data.landmark,
        lat: data.lat,
        lng: data.lng,
      };
      const { data: issue } = await axiosClient.post("/api/issues", payload);
      reset();
      navigate(`/issues/${issue.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit issue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-slate-900">Report a civic issue</h1>
      <p className="mt-1 text-sm text-slate-500">Details and evidence feed the AI problem statement and severity model.</p>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <Stepper steps={STEPS} currentStep={step} />
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        {step === 0 && (
          <div className="space-y-4">
            <label className="block text-sm">
              Short title
              <input
                value={data.title}
                onChange={(e) => update({ title: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              Category
              <select
                value={data.category}
                onChange={(e) => update({ category: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
              >
                <option value="">Select category</option>
                {ISSUE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        {step === 1 && (
          <label className="block text-sm">
            Description
            <textarea
              rows={8}
              value={data.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Describe what is happening, who is affected, and how long it has persisted."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-primary"
            />
          </label>
        )}
        {step === 2 && (
          <FileDropzone files={data.evidence} onChange={(evidence) => update({ evidence })} />
        )}
        {step === 3 && (
          <MapLocationPicker
            value={data}
            onChange={(patch) => update(patch)}
          />
        )}
        {step === 4 && (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Title</dt>
              <dd className="font-semibold">{data.title}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd>{data.category}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Details</dt>
              <dd>{data.description}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Evidence</dt>
              <dd>{data.evidence.length} file(s)</dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd>
                {data.district}, {data.block} — {data.landmark || "no landmark"}
              </dd>
            </div>
          </dl>
        )}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40"
          >
            Back
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={() => canNext() && next()}
              disabled={!canNext()}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              {submitting ? "Submitting..." : "Submit issue"}
            </button>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          {STEPS.map((_, i) => (
            <button key={i} type="button" className="sr-only" onClick={() => setStep(i)}>
              step {i}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
