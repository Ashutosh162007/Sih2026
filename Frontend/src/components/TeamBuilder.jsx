import { Plus, Users, X } from "lucide-react";
import { DISCIPLINES } from "../lib/constants";
import { useAuthStore } from "../store/authStore";
import { rosterFor, ensureAllDisciplines } from "../lib/collegeRegistry";

export default function TeamBuilder({ team = [], onChange }) {
  const user = useAuthStore((s) => s.user);
  const selectedCount = team.reduce((n, row) => n + (row.members?.length || 0), 0);
  const roster = ensureAllDisciplines(rosterFor(user?.org));

  function toggle(discipline, name) {
    const existing = team.find((r) => r.discipline === discipline);
    let next;
    if (!existing) {
      next = [...team, { discipline, members: [name] }];
    } else {
      const members = existing.members.includes(name)
        ? existing.members.filter((m) => m !== name)
        : [...existing.members, name];
      next = team
        .map((r) => (r.discipline === discipline ? { ...r, members } : r))
        .filter((r) => r.members.length);
    }
    onChange(next);
  }

  function addDiscipline(discipline) {
    if (team.some((r) => r.discipline === discipline)) return;
    onChange([...team, { discipline, members: [] }]);
  }

  function removeDiscipline(discipline) {
    onChange(team.filter((r) => r.discipline !== discipline));
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Build team</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-highlight px-2.5 py-1 text-xs font-semibold text-primary">
          <Users size={14} /> {selectedCount} selected
        </span>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {DISCIPLINES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => addDiscipline(d)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
          >
            <Plus size={12} /> {d}
          </button>
        ))}
      </div>
      {team.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No department selected yet. Click a discipline above to start building your team.
        </div>
      ) : (
        <div className="space-y-4">
          {team.map((row) => {
            const pool = roster[row.discipline] || [];
            return (
              <div key={row.discipline}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">{row.discipline}</p>
                  <button
                    type="button"
                    onClick={() => removeDiscipline(row.discipline)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                    aria-label={`Remove ${row.discipline}`}
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pool.length === 0 && (
                    <span className="text-xs text-slate-400">No candidates available for this discipline.</span>
                  )}
                  {pool.map((name) => {
                    const on = row.members.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggle(row.discipline, name)}
                        className={`flex items-center gap-2 rounded-full border px-2 py-1 text-sm ${
                          on ? "border-primary bg-highlight text-primary" : "border-slate-200 bg-white"
                        }`}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white">
                          {name.slice(0, 1)}
                        </span>
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}