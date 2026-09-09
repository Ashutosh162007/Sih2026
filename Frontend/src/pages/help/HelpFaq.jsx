import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Send,
  CheckCircle2,
  BookOpen,
  Building2,
  Users,
  Award,
} from "lucide-react";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/authStore";

const FAQS = [
  {
    category: "Citizens & Community Reporters",
    items: [
      {
        q: "What kind of civic issues can I report on Sahayog?",
        a: "You can report any grassroots challenge affecting your locality or village—including broken roads/culverts, contaminated drinking water, unlit streets, post-harvest agriculture spoilage, or school infrastructure issues.",
      },
      {
        q: "How does the AI Engine analyze my problem?",
        a: "Our AI model takes your brief description, photo evidence, and location to automatically formulate a formal research statement, estimate public safety risk and urgency scores, and route the issue to the nearest capable universities.",
      },
      {
        q: "How do I know when my issue is resolved?",
        a: "You receive real-time notifications when a university claims the ticket, when industry CSR funding is approved, and when deliverables are completed. You will be prompted to give a 5-star rating and on-ground verification.",
      },
    ],
  },
  {
    category: "Universities & Researchers",
    items: [
      {
        q: "How are issues routed to our campus?",
        a: "Issues are sorted and matched using a Haversine proximity algorithm based on geographic distance from your campus and mapped to your department disciplines (e.g. Civil, IoT, Environmental Science).",
      },
      {
        q: "How do we receive funding for prototypes?",
        a: "After assembling a multidisciplinary team and drafting a technical proposal with milestones, it is published to the CSR Industry Queue. Industry partners review and commit grant tranches directly to your project.",
      },
    ],
  },
  {
    category: "Industry & CSR Partners",
    items: [
      {
        q: "How does CSR grant disbursement and escrow work?",
        a: "CSR grants are committed under statutory CSR Schedule VII heads. Funds are released in milestone-based tranches (e.g., 40% on advance, 40% on prototype calibration, 20% on citizen verification).",
      },
      {
        q: "Can we download Section 80G CSR impact certificates?",
        a: "Yes! Every completed and verified project automatically generates a printable 1-page A4 CSR Impact Certificate complete with beneficiary impact data and municipal verification stamps.",
      },
    ],
  },
];

export default function HelpFaq() {
  const user = useAuthStore((s) => s.user);
  const [openIndex, setOpenIndex] = useState("0-0");
  const [subject, setSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState("");

  async function handleTicketSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosClient.post("/api/support/tickets", {
        name: user?.name || "Guest",
        email: user?.email || "guest@sahayog.in",
        subject,
        category: ticketCategory,
        message,
      });
      setSubmittedMsg("Support inquiry submitted successfully! Our support desk will reach out within 24 hours.");
      setSubject("");
      setMessage("");
      setTimeout(() => setSubmittedMsg(""), 6000);
    } catch (err) {
      setSubmittedMsg("Failed to submit support inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#D7F5DE] border border-emerald-300 px-3.5 py-1 text-xs font-semibold text-[#0E4B4C]">
          <HelpCircle size={14} /> Help Center & Knowledgebase
        </div>
        <h1 className="font-display mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
          How can we help you today?
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Find answers regarding problem reporting, university team formation, CSR grant escrow, and ground verification.
        </p>
      </div>

      {/* 4-Step Quick Visual Guide */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E4B4C] text-white font-bold text-sm">
            1
          </div>
          <h3 className="mt-3 font-display font-bold text-slate-900 text-sm">Citizen Reports</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Citizens describe issues with photo & GPS location. AI synthesizes a formal engineering problem statement.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
            2
          </div>
          <h3 className="mt-3 font-display font-bold text-slate-900 text-sm">Campus Claims</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Nearest university faculty and students assemble a multidisciplinary team and submit solution proposals.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-sm">
            3
          </div>
          <h3 className="mt-3 font-display font-bold text-slate-900 text-sm">CSR Funds</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Corporate industry partners evaluate budgets, sponsor projects, and release milestone-linked grant tranches.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-sm">
            4
          </div>
          <h3 className="mt-3 font-display font-bold text-slate-900 text-sm">Citizen Verified</h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Upon ground deployment, the reporting citizen tests the fix, rates satisfaction, and generates CSR certificates.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-slate-900 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {FAQS.map((group, gIdx) => (
            <div key={group.category} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-display text-base font-bold text-[#0E4B4C] mb-4">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((item, iIdx) => {
                  const key = `${gIdx}-${iIdx}`;
                  const isOpen = openIndex === key;

                  return (
                    <div
                      key={item.q}
                      className="rounded-2xl border border-slate-100 bg-[#F7F8FA] overflow-hidden transition"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-slate-900 hover:bg-slate-100/60 transition cursor-pointer"
                      >
                        <span>{item.q}</span>
                        {isOpen ? <ChevronUp size={16} className="text-teal-700" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </button>
                      {isOpen && (
                        <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/50 bg-white">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Ticket Submission */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E4B4C] text-white">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">Still have questions? Contact Support</h2>
            <p className="text-xs text-slate-500">Submit an inquiry to the Sahayog Help Desk & Innovation Council.</p>
          </div>
        </div>

        {submittedMsg && (
          <div className="mt-4 rounded-xl bg-[#D7F5DE] border border-emerald-300 p-4 text-xs font-semibold text-[#0E4B4C] flex items-center gap-2">
            <CheckCircle2 size={18} /> {submittedMsg}
          </div>
        )}

        <form onSubmit={handleTicketSubmit} className="mt-6 space-y-4 text-xs">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block font-bold uppercase tracking-wider text-slate-600">
              Inquiry Subject
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question regarding university proposal verification"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs normal-case text-slate-900 outline-none focus:border-[#0E4B4C]"
                required
              />
            </label>

            <label className="block font-bold uppercase tracking-wider text-slate-600">
              Topic Category
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs normal-case text-slate-900 outline-none focus:border-[#0E4B4C] bg-white"
              >
                <option value="General">General Platform Inquiry</option>
                <option value="Reporting">Issue Reporting & AI Synthesis</option>
                <option value="University">University Proposals & Team Formation</option>
                <option value="CSR">CSR Funding & Escrow Tranches</option>
                <option value="Verification">Institution Account Verification</option>
              </select>
            </label>
          </div>

          <label className="block font-bold uppercase tracking-wider text-slate-600">
            Message / Description
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your inquiry in detail..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs normal-case text-slate-900 outline-none focus:border-[#0E4B4C] leading-relaxed"
              required
            />
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] transition cursor-pointer"
            >
              <Send size={14} /> {submitting ? "Submitting..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
