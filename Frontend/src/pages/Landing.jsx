import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { mockAnalytics } from "../api/mockData";

export default function Landing() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <p className="font-display text-2xl text-primary">CivicPulse</p>
        <div className="flex gap-3">
          <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-primary">
            Log in
          </Link>
          <Link to="/signup" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            Join the network
          </Link>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">Institutional. Civic. Modern.</p>
          <h1 className="font-display text-5xl leading-tight text-slate-900">Empowering Societal Innovation</h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Community Reporters surface local issues. Universities assemble teams. Industry funds solutions. Government
            sees what actually moves.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Report as a Community Reporter
            </Link>
            <Link to="/login" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold">
              Partner login
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
          <img
            alt="Civic streetscape"
            className="h-80 w-full object-cover"
            src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80"
          />
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {mockAnalytics.stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>
    </div>
  );
}
