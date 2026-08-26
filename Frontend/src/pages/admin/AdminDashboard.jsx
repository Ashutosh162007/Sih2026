import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StatCard from "../../components/StatCard";
import axiosClient from "../../api/axiosClient";

const COLORS = ["#0E4B4C", "#3B82F6", "#F59E0B", "#10B981", "#94A3B8"];

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosClient.get("/api/admin/analytics").then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="text-sm text-slate-500">Loading analytics…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl">Admin analytics</h1>
      <p className="mt-1 text-sm text-slate-500">Cross-cutting view for government oversight.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Reported vs resolved</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reported" fill="#0E4B4C" radius={6} />
                <Bar dataKey="resolved" fill="#86C7B8" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Category mix</h2>
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
