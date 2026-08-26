import { useEffect, useState } from "react";
import { Sparkles, Calendar, DollarSign, CheckCircle2, Building2, ArrowRight, X } from "lucide-react";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";

export default function IndustryQueue() {
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [fundingAmount, setFundingAmount] = useState("350000");
  const [deadline, setDeadline] = useState("2026-11-30");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await axiosClient.get("/api/industry/proposals");
    setProposals(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFundSubmit(e) {
    e.preventDefault();
    if (!selectedProposal) return;
    setSubmitting(true);
    try {
      await axiosClient.post(`/api/projects/${selectedProposal.id || selectedProposal._id}/fund`, {
        fundingAmount: Number(fundingAmount),
        deadline,
        mentorshipNotes: notes,
      });
      setMessage(`Funding of ₹${Number(fundingAmount).toLocaleString("en-IN")} committed with target deadline ${deadline}. University & Citizen notified!`);
      setSelectedProposal(null);
      load();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Incoming University Proposals</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review research and engineering solutions from Higher Education Institutions awaiting Industry & CSR funding.
          </p>
        </div>
      </div>

      {message && (
        <div className="mt-4 rounded-xl bg-[#D7F5DE] border border-emerald-300 p-4 text-sm font-semibold text-[#0E4B4C] flex items-center gap-2">
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {proposals.map((p) => (
          <div key={p.id || p._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded-md bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                <Building2 size={13} /> {p.university}
              </span>
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold">
                Awaiting Industry Partner
              </span>
            </div>

            <ListItemCard
              title={p.title}
              description={p.proposal}
              status={p.status}
              metadata={{ assignee: p.university }}
            />

            {p.team && p.team.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {p.team.map((t, idx) => (
                  <span key={idx} className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700">
                    <strong>{t.discipline}:</strong> {t.members?.join(", ")}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">
                {p.milestones?.length || 0} planned milestones
              </span>
              <button
                type="button"
                onClick={() => setSelectedProposal(p)}
                className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0b3b3c] transition"
              >
                Approve Funding & Set Deadline <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}

        {proposals.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            No pending proposals awaiting funding at this moment.
          </div>
        )}
      </div>

      {/* Funding & Deadline Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Commit Funding & Assign Deadline
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600 font-medium">
              Project: <strong>{selectedProposal.title}</strong> ({selectedProposal.university})
            </p>

            <form onSubmit={handleFundSubmit} className="mt-4 space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                Committed CSR / Innovation Grant Amount (₹ INR)
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 py-2 pl-7 pr-3 text-sm outline-none focus:border-[#0E4B4C]"
                    required
                  />
                </div>
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Target Completion Deadline (Starts Execution Timeline)
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0E4B4C]"
                  required
                />
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Mentorship & Resource Commitment Notes (Optional)
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Technical lab access, industrial components sponsorship, ground testing support."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#0E4B4C]"
                />
              </label>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#0E4B4C] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] transition"
                >
                  {submitting ? "Confirming..." : "Confirm Sponsorship & Start Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
