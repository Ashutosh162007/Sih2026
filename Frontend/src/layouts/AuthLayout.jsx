import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function AuthLayout({ children, headline = "Empowering Societal Innovation" }) {
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
            <Sparkles className="text-[#D7F5DE]" size={28} />
            Sahayog
          </Link>
          <div>
            <span className="rounded-md bg-[#D7F5DE]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D7F5DE]">
              Collaborative Innovation Portal
            </span>
            <h1 className="font-display mt-4 max-w-md text-4xl font-bold leading-tight">{headline}</h1>
            <p className="mt-4 max-w-md text-sm text-white/80 leading-relaxed">
              Crowdsourcing grassroots societal challenges, automating AI severity assessment, and enabling collaborative
              problem-solving through Higher Education Institutions and Industry partnerships.
            </p>
          </div>
          <div className="text-xs text-white/60">
            Empowering Citizen Innovation & Research Partnerships
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
