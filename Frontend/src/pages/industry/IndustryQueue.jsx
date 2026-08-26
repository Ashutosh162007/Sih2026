import { useEffect, useState } from "react";
import ListItemCard from "../../components/ListItemCard";
import axiosClient from "../../api/axiosClient";

export default function IndustryQueue() {
  const [proposals, setProposals] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await axiosClient.get("/api/industry/proposals");
    setProposals(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function fund(id) {
    await axiosClient.post(`/api/projects/${id}/fund`);
    setMessage("Funding approved.");
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Incoming proposals</h1>
      <p className="mt-1 text-sm text-slate-500">Review university solutions awaiting industry funding.</p>
      {message && <p className="mt-3 text-sm text-primary">{message}</p>}
      <div className="mt-6 space-y-3">
        {proposals.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <ListItemCard
              title={p.title}
              description={p.proposal}
              status={p.status}
              metadata={{ assignee: p.university }}
            />
            <button
              type="button"
              onClick={() => fund(p.id)}
              className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
            >
              Approve funding
            </button>
          </div>
        ))}
        {proposals.length === 0 && <p className="text-sm text-slate-500">No pending proposals.</p>}
      </div>
    </div>
  );
}
