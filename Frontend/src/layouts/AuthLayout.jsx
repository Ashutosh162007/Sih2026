import { Link } from "react-router-dom";
import { Languages, Sun, Moon } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { useLanguageStore } from "../store/languageStore";
import { useThemeStore } from "../store/themeStore";

export default function AuthLayout({ children, headline }) {
  const { language, setLanguage, t } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const darkMode = theme === "dark";

  const displayHeadline = headline || t("authHeadlineDefault");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden overflow-hidden bg-[#0E4B4C] lg:block"
        style={{
          backgroundImage:
            "linear-gradient(160deg, rgba(14,75,76,0.90), rgba(14,75,76,0.70)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1400&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2 font-display text-3xl font-bold">
            <BrandLogo className="h-10 w-10" inverted />
            Sahayog
          </Link>
          <div>
            <span className="rounded-md bg-[#D7F5DE]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D7F5DE]">
              {t("authSubHeadline")}
            </span>
            <h1 className="font-display mt-4 max-w-md text-4xl font-bold leading-tight">{displayHeadline}</h1>
            <p className="mt-4 max-w-md text-sm text-white/80 leading-relaxed">
              {t("authPortalDesc")}
            </p>
          </div>
          <div className="text-xs text-white/60">
            {t("authFooterTagline")}
          </div>
        </div>
      </div>
      <div className="relative flex flex-col items-center justify-center bg-white px-6 py-12">
        {/* Top Controls in Auth Pages */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          {/* Dark Mode Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 transition cursor-pointer shadow-xs"
            aria-label="Toggle Theme"
            title={darkMode ? "Switch to Light Mode" : "Switch to Midnight Dark"}
          >
            {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-xs">
            <Languages size={14} className="ml-1.5 mr-0.5 text-[#0E4B4C] hidden sm:block" />
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              language === "en"
                ? "bg-[#0E4B4C] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage("hi")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              language === "hi"
                ? "bg-[#0E4B4C] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            हिंदी
          </button>
            <button
              type="button"
              onClick={() => setLanguage("kht")}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                language === "kht"
                  ? "bg-[#0E4B4C] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              खोरठा
            </button>
          </div>
        </div>

        <div className="w-full max-w-md mt-6 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
