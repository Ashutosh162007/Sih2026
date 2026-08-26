import { Line, LineChart, ResponsiveContainer } from "recharts";
import { AlertTriangle, Building2, CheckCircle2, Landmark } from "lucide-react";

const icons = {
  alert: AlertTriangle,
  university: Landmark,
  industry: Building2,
  check: CheckCircle2,
};

const badgeBg = {
  teal: "bg-highlight text-primary",
  blue: "bg-sky-100 text-sky-800",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-emerald-100 text-emerald-800",
};

export default function StatCard({ icon = "alert", badgeColor = "teal", label, number, trendData = [] }) {
  const Icon = icons[icon] || AlertTriangle;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${badgeBg[badgeColor] || badgeBg.teal}`}>
          <Icon size={18} />
        </div>
        {trendData.length > 0 && (
          <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line type="monotone" dataKey="v" stroke="#0E4B4C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="font-display mt-1 text-3xl text-primary">{number}</p>
    </article>
  );
}
