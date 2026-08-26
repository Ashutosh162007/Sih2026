import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { ROLE_LABELS } from "../../lib/constants";
import axiosClient from "../../api/axiosClient";

export default function VerifyAccounts() {
  const [rows, setRows] = useState([]);

  async function load() {
    const { data } = await axiosClient.get("/api/admin/verifications");
    setRows(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(userId, decision) {
    await axiosClient.patch(`/api/admin/verifications/${userId}`, { decision });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl">Verify accounts</h1>
      <p className="mt-1 text-sm text-slate-500">Approve University and Industry organisations before they can act.</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Organisation</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.org}</td>
                <td className="px-4 py-3">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3">
                  <StatusBadge label="Under review" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => decide(u.id, "approve")}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(u.id, "reject")}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No pending accounts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
