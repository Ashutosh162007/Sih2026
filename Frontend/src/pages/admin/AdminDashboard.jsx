import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatCard from "../../components/StatCard";
import axiosClient from "../../api/axiosClient";
import { useLanguageStore } from "../../store/languageStore";

const COLORS = ["#0E4B4C", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

export default function AdminDashboard() {
  const { t } = useLanguageStore();
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosClient.get("/api/admin/analytics").then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="text-sm text-slate-500 animate-pulse">{t("aiSynthesizing")}</p>;

  return (
    <div className="pb-16">
      <h1 className="font-display text-3xl font-bold text-slate-900">{t("adminDashboardTitle")}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {t("adminDashboardSubtitle")}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display font-bold text-slate-900 text-base">{t("platformImpactDashboard")}</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reported" fill="#0E4B4C" name="Reported" radius={6} />
                <Bar dataKey="resolved" fill="#86C7B8" name="Resolved" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display font-bold text-slate-900 text-base">{t("categoryLabel")}</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.categories} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {data.categories.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
