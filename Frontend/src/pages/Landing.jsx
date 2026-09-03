import { Link } from "react-router-dom";
import { Sparkles, MapPin, Building2, Briefcase, Award, ArrowRight, ShieldCheck, CheckCircle2, Globe } from "lucide-react";
import StatCard from "../components/StatCard";
import BrandLogo from "../components/BrandLogo";
import { mockAnalytics } from "../api/mockData";
import { useLanguageStore } from "../store/languageStore";

export default function Landing() {
  const { language, setLanguage, t } = useLanguageStore();

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-10 w-10 shadow-md shadow-[#0E4B4C]/20" />
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-[#0E4B4C]">{t("portalBrand")}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Switcher Toggle */}
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:border-[#0E4B4C] hover:text-[#0E4B4C] transition cursor-pointer"
              title="Switch Language / भाषा बदलें"
            >
              <Globe size={14} className="text-[#0E4B4C]" />
              <span>{language === "en" ? "हिंदी" : "English"}</span>
            </button>

            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-[#0E4B4C] transition hover:bg-slate-100"
            >
              {t("signIn")}
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0E4B4C]/25 transition hover:bg-[#0b3b3c]"
            >
              {t("joinNetwork")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[#D7F5DE]/70 px-3.5 py-1 text-xs font-semibold text-[#0E4B4C]">
              <Sparkles size={14} /> {t("heroBadge")}
            </div>
            <h1 className="font-display mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.15]">
              {t("heroTitlePre")}{" "}
              <span className="text-[#0E4B4C] underline decoration-[#86C7B8] decoration-4 underline-offset-8">
                {t("heroTitleHighlight")}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0E4B4C]/20 transition hover:bg-[#0b3b3c]"
              >
                {t("reportCivicBtn")} <ArrowRight size={16} />
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                {t("loginBtn")}
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600" /> {t("heroCheck1")}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600" /> {t("heroCheck2")}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600" /> {t("heroCheck3")}
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
                    {t("liveActivity")}
                  </span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {t("liveActivitySample")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {t("liveActivitySampleSub")}
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
            <p className="text-xs font-bold uppercase tracking-widest text-[#0E4B4C]">{t("howItWorks")}</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
              {t("fromReportToResolution")}
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-6 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E4B4C] text-white">
                <MapPin size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{t("workflowStep1Title")}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {t("workflowStep1Desc")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-6 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Sparkles size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{t("workflowStep2Title")}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {t("workflowStep2Desc")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-6 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-white">
                <Building2 size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{t("workflowStep3Title")}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {t("workflowStep3Desc")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#F7F8FA] p-6 transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Briefcase size={22} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{t("workflowStep4Title")}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {t("workflowStep4Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Snapshot */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">{t("platformImpactDashboard")}</h2>
            <p className="text-sm text-slate-500">{t("realtimeIndicators")}</p>
          </div>
          <Link to="/admin/dashboard" className="text-sm font-semibold text-[#0E4B4C] hover:underline">
            {t("viewFullAnalytics")}
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
          <p>{t("copyrightFooter")}</p>
          <p className="font-medium text-[#0E4B4C]">{t("collabCivicSolving")}</p>
        </div>
      </footer>
    </div>
  );
}
