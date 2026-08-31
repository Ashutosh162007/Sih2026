import { Link } from "react-router-dom";
import { Sparkles, MapPin, Building2, Briefcase, Award, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import StatCard from "../components/StatCard";
import { mockAnalytics } from "../api/mockData";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E4B4C] text-white shadow-md shadow-[#0E4B4C]/20">
              <Sparkles size={22} className="text-[#D7F5DE]" />
            </div>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-[#0E4B4C]">Sahayog</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-[#0E4B4C] transition hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0E4B4C]/25 transition hover:bg-[#0b3b3c]"
            >
              Join Network <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#D7F5DE]/70 px-3.5 py-1 text-xs font-semibold text-[#0E4B4C]">
              <Sparkles size={14} /> AI-Powered Societal Innovation Platform
            </div>
            <h1 className="font-display mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.15]">
              Connecting Community Challenges with{" "}
              <span className="text-[#0E4B4C] underline decoration-[#86C7B8] decoration-4 underline-offset-8">
                Universities & Industry
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600">
              Citizens report grassroots civic issues with a brief summary & photo. Our <strong>AI Engine</strong>{" "}
              formulates structured problem statements and computes severity scores, auto-routing them to the{" "}
              <strong>nearest universities</strong> to form multidisciplinary research teams funded by{" "}
              <strong>industry partners</strong> with tracked milestones.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0E4B4C]/20 transition hover:bg-[#0b3b3c]"
              >
                Report a Civic Issue <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                University / Industry Login
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600" /> AI Problem Structuring
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600" /> Proximity Haversine Routing
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600" /> Real-time Citizen Notification
              </span>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-3 shadow-xl">
              <img
                alt="Societal Innovation"
                className="h-80 w-full rounded-2xl object-cover"
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=80"
              />
              <div className="mt-4 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Live Platform Activity
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  Fluoride Defluoridation Pilot funded by Tata Steel CSR
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Assigned to BIT Mesra · Nearest campus (12.4 km) · 60-day completion deadline
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Ecosystem Workflow */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0E4B4C]">How Sahayog Works</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
              From Citizen Report to Ground Resolution
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-6 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E4B4C] text-white">
                <MapPin size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">1. Citizen Reporting</h3>
              <p className="mt-2 text-sm text-slate-600">
                Citizens describe local issues with a brief summary, photo, and geolocation coordinates.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-6 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Sparkles size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">2. AI Formulation & Routing</h3>
              <p className="mt-2 text-sm text-slate-600">
                AI crafts a structured research problem statement, evaluates multi-factor severity, and routes to nearest universities.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-6 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-white">
                <Building2 size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">3. University Solutions</h3>
              <p className="mt-2 text-sm text-slate-600">
                Faculty and students build multidisciplinary teams, design engineering prototypes, and submit solution proposals.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-6 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Briefcase size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">4. Industry Funding & Closure</h3>
              <p className="mt-2 text-sm text-slate-600">
                Industries sponsor proposals, set completion deadlines, track milestones, and the citizen is notified upon resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Snapshot */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Platform Impact Dashboard</h2>
            <p className="text-sm text-slate-500">Real-time indicators across districts</p>
          </div>
          <Link to="/admin/dashboard" className="text-sm font-semibold text-[#0E4B4C] hover:underline">
            View full analytics →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockAnalytics.stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Sahayog — Societal Innovation Collaboration Platform. All rights reserved.</p>
          <p className="font-medium text-[#0E4B4C]">Collaborative Civic Problem Solving</p>
        </div>
      </footer>
    </div>
  );
}
