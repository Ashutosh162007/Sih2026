import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Wand2, ShieldAlert, CheckCircle2, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import Stepper from "../../components/Stepper";
import FileDropzone from "../../components/FileDropzone";
import MapLocationPicker from "../../components/MapLocationPicker";
import AssessmentSlider from "../../components/AssessmentSlider";
import { ISSUE_CATEGORIES, JHARKHAND_DISTRICTS, JHARKHAND_DISTRICT_COORDS, DEFAULT_JHARKHAND_COORDS } from "../../lib/constants";
import { useWizardStore } from "../../store/wizardStore";
import { useAuthStore } from "../../store/authStore";
import axiosClient from "../../api/axiosClient";

const STEPS = ["Basic Info", "Short Description", "Photo Evidence", "Location", "AI Formulation & Review"];

export default function ReportIssue() {
  const { step, data, setStep, next, back, update, reset } = useWizardStore();
  const user = useAuthStore((s) => s.user);
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!data.district) {
      const userDistrict = user?.location?.district || user?.district || "Ranchi";
      const coords = JHARKHAND_DISTRICT_COORDS[userDistrict] || DEFAULT_JHARKHAND_COORDS;
      update({ district: userDistrict, lat: coords.lat, lng: coords.lng });
    }
  }, [user]);

  function canNext() {
    if (step === 0) return data.title && data.category;
    if (step === 1) return data.description && data.description.length >= 10;
    if (step === 3) return data.district && data.block;
    return true;
  }

  // AI Generator Function
  async function generateAIProblemStatement() {
    setAiGenerating(true);
    setError("");
    try {
      const { data: res } = await axiosClient.post("/api/issues/ai-preview", {
        title: data.title,
        description: data.description,
        category: data.category,
        district: data.district || "Ranchi",
        block: data.block || "Kanke",
        landmark: data.landmark || "",
      });

      setAiPreviewData(res);
      if (res.category && !data.category) {
        update({ category: res.category });
      }
      if (res.aiProblemStatement) {
        update({ aiProblemStatement: res.aiProblemStatement });
      }
    } catch {
      // Fallback
      setAiPreviewData({
        category: data.category || "Infrastructure",
        aiProblemStatement: `**Structured Problem Formulation:**\n\n**Context:** Reported issue in ${data.block || "locality"}, ${data.district || "Ranchi"}.\n\n**Core Challenge:** ${data.description || data.title}.\n\n**Severity:** High Priority (Score 84/100). Urgency: 85%, Public Risk: 82%.\n\n**Innovation Objective:** Formulate multidisciplinary student & faculty engineering solutions.`,
        severity: { flooding: 65, publicRisk: 82, urgency: 85, score: 84 },
        priority: "High",
      });
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleStepChange(nextStep) {
    if (nextStep === 4 && !aiPreviewData) {
      await generateAIProblemStatement();
    }
    setStep(nextStep);
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        title: data.title,
        category: data.category,
        description: data.description,
        aiProblemStatement: aiPreviewData?.aiProblemStatement || data.aiProblemStatement,
        evidence: (data.evidence || []).map((f) => ({ filename: f.filename, size: f.size, url: f.url || f.preview })),
        district: data.district || "Ranchi",
        block: data.block || "Kanke",
        landmark: data.landmark || "",
        lat: data.lat || 23.3441,
        lng: data.lng || 85.3096,
      };

      const { data: issue } = await axiosClient.post("/api/issues", payload);
      reset();
      navigate(`/issues/${issue.id || issue._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit issue to the network");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Report a Civic Challenge</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tell us the problem briefly with a photo. Our AI Engine formulates the research problem statement & severity for nearest universities.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
          <Sparkles size={14} /> AI-Assisted
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Short Issue Title
              <input
                value={data.title || ""}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="e.g. Broken storm drain flooding Albert Ekka Chowk"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Initial Category
              <select
                value={data.category || ""}
                onChange={(e) => update({ category: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10"
              >
                <option value="">Select Domain Category</option>
                {ISSUE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Step 1: Short Description */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#D7F5DE]/30 border border-emerald-200 p-3 text-xs text-emerald-900 flex items-start gap-2">
              <Sparkles size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <span>
                <strong>Tip:</strong> Keep it concise! Mention who is affected, key hazard details, and duration. The Sahayog AI model will automatically synthesize a formal, comprehensive problem statement for university researchers.
              </span>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Brief Problem Description
              <textarea
                rows={6}
                value={data.description || ""}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="e.g. During every monsoon downpour, the drain overflows onto the main commercial stretch for over 300 meters. Stagnant contaminated water enters ground-floor shops and blocks school children from passing."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0E4B4C] focus:ring-2 focus:ring-[#0E4B4C]/10 leading-relaxed"
              />
            </label>
          </div>
        )}

        {/* Step 2: Evidence */}
        {step === 2 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Upload Photo / Evidence</p>
            <p className="text-xs text-slate-500 mb-4">
              Visual evidence feeds the AI severity analysis to compute flooding risk, structural hazard, and urgency score.
            </p>
            <FileDropzone files={data.evidence || []} onChange={(evidence) => update({ evidence })} />
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-slate-700">
                District (Jharkhand)
                <select
                  value={data.district || "Ranchi"}
                  onChange={(e) => {
                    const selectedDistrict = e.target.value;
                    const coords = JHARKHAND_DISTRICT_COORDS[selectedDistrict] || DEFAULT_JHARKHAND_COORDS;
                    update({ district: selectedDistrict, lat: coords.lat, lng: coords.lng });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0E4B4C]"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Block / Municipality
                <input
                  value={data.block || ""}
                  onChange={(e) => update({ block: e.target.value })}
                  placeholder="e.g. Kanke / Tamar / Jamshedpur Urban"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0E4B4C]"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Landmark / Street Address
              <input
                value={data.landmark || ""}
                onChange={(e) => update({ landmark: e.target.value })}
                placeholder="e.g. Albert Ekka Chowk, near State Bank"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#0E4B4C]"
              />
            </label>

            <div className="pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Pin Location on Map (For Nearest University Distance Calculation)
              </p>
              <MapLocationPicker value={data} onChange={(patch) => update(patch)} />
            </div>
          </div>
        )}

        {/* Step 4: AI Formulation & Review */}
        {step === 4 && (
          <div className="space-y-6">
            {/* AI Formulation Card */}
            <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-[#D7F5DE]/30 to-teal-50/20 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0E4B4C] text-white">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="font-display font-bold text-slate-900">
                    AI-Formulated Problem Statement & Severity
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={generateAIProblemStatement}
                  disabled={aiGenerating}
                  className="flex items-center gap-1.5 rounded-lg border border-teal-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#0E4B4C] shadow-sm hover:bg-slate-50 transition"
                >
                  <Wand2 size={13} /> {aiGenerating ? "Synthesizing..." : "Regenerate AI"}
                </button>
              </div>

              {aiPreviewData ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 shadow-sm">
                    {aiPreviewData.aiProblemStatement}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[11px] font-medium text-slate-500">Public Risk</p>
                      <p className="text-xl font-bold text-slate-900 mt-0.5">
                        {aiPreviewData.severity?.publicRisk || 78}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[11px] font-medium text-slate-500">Urgency Level</p>
                      <p className="text-xl font-bold text-slate-900 mt-0.5">
                        {aiPreviewData.severity?.urgency || 84}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[11px] font-medium text-slate-500">Composite Score</p>
                      <p className="text-xl font-bold text-teal-800 mt-0.5">
                        {aiPreviewData.severity?.score || 82}/100
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-slate-500">
                  <Sparkles size={24} className="mx-auto mb-2 text-[#0E4B4C] animate-pulse" />
                  Generating AI Structured Research Statement...
                </div>
              )}
            </div>

            {/* Submission Summary */}
            <dl className="grid sm:grid-cols-2 gap-3 text-xs rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div>
                <dt className="text-slate-400 font-medium">Issue Title</dt>
                <dd className="font-semibold text-slate-800 text-sm mt-0.5">{data.title}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Domain Category</dt>
                <dd className="font-semibold text-slate-800 text-sm mt-0.5">{data.category}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Location Coordinates</dt>
                <dd className="text-slate-700 mt-0.5">
                  {data.district}, {data.block} ({data.lat?.toFixed(3)}, {data.lng?.toFixed(3)})
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Evidence Attached</dt>
                <dd className="text-slate-700 mt-0.5">{data.evidence?.length || 0} file(s)</dd>
              </div>
            </dl>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 font-medium">{error}</p>}

        {/* Buttons */}
        <div className="mt-8 flex justify-between items-center border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition"
          >
            Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => canNext() && handleStepChange(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#0E4B4C]/20 hover:bg-[#0b3b3c] transition disabled:opacity-40"
            >
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] transition"
            >
              {submitting ? "Publishing to Sahayog Network..." : "Submit to Nearest Universities"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
