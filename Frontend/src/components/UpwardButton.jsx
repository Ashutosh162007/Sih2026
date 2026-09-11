import { useState } from "react";
import { ArrowUp } from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function UpwardButton({ issueId, count, hasUpwarded, size = "sm" }) {
  const [upwardsCount, setUpwardsCount] = useState(count || 0);
  const [active, setActive] = useState(hasUpwarded || false);
  const [busy, setBusy] = useState(false);

  async function toggle(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (busy) return;
    setBusy(true);
    // Optimistic update
    const prevCount = upwardsCount;
    const prevActive = active;
    setUpwardsCount(prevCount + (prevActive ? -1 : 1));
    setActive(!prevActive);
    try {
      const method = prevActive ? "delete" : "post";
      const { data } = await axiosClient[method](`/api/issues/${issueId}/upward`);
      setUpwardsCount(data.upwardsCount);
      setActive(data.hasUpwarded);
    } catch (err) {
      // Revert on failure
      setUpwardsCount(prevCount);
      setActive(prevActive);
      console.warn("Upward error:", err);
    } finally {
      setBusy(false);
    }
  }

  const pad = size === "lg" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1.5 text-[11px]";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 rounded-xl border font-bold transition cursor-pointer ${pad} ${
        active
          ? "border-teal-400 bg-[#D7F5DE] text-[#0E4B4C] shadow-xs"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      } disabled:opacity-60`}
      title="Upward if you support this problem statement"
    >
      <ArrowUp size={size === "lg" ? 16 : 13} className={active ? "fill-[#0E4B4C]" : ""} />
      <span>
        {upwardsCount} {upwardsCount === 1 ? "Upward" : "Upwards"}
      </span>
    </button>
  );
}