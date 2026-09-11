import { Link } from "react-router-dom";
import { ArrowLeft, Home, MapPin, HelpCircle } from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { useLanguageStore } from "../store/languageStore";

export default function NotFound() {
  const { t } = useLanguageStore();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F8FA] px-6 py-16 text-center">
      <BrandLogo className="h-14 w-14 shadow-md shadow-[#0E4B4C]/25" />
      <span className="font-display mt-3 text-2xl font-bold text-[#0E4B4C]">Sahayog</span>
      
      <div className="mt-8 max-w-md">
        <span className="rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
          {t("pageNotFoundBadge")}
        </span>
        <h1 className="font-display mt-4 text-3xl font-extrabold text-slate-900">
          {t("pageNotFoundTitle")}
        </h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          {t("pageNotFoundDesc")}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl bg-[#0E4B4C] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#0E4B4C]/25 hover:bg-[#0b3b3c] transition"
          >
            <Home size={15} /> {t("returnHomeBtn")}
          </Link>
          <Link
            to="/map"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <MapPin size={15} className="text-[#0E4B4C]" /> {t("exploreMapBtn")}
          </Link>
        </div>
      </div>
    </div>
  );
}
