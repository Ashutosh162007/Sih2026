import { Plus, Users } from "lucide-react";
import { DISCIPLINES } from "../lib/constants";

const POOL = {
  "Civil Engineering": ["Harsh", "Nisha", "Vikram"],
  "Computer Science": ["Isha", "Arjun", "Meera"],
  "Environmental Science": ["Ananya", "Dev", "Sara"],
  "Urban Planning": ["Leela", "Omar", "Priya"],
  "Public Policy": ["Kabir", "Rina"],
  Design: ["Tara", "Neil"],
};

export default function TeamBuilder({ team = [], onChange }) {
  const selectedCount = team.reduce((n, row) => n + (row.members?.length || 0), 0);

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
      <div className="space-y-4">
        {(team.length ? team : [{ discipline: "Civil Engineering", members: [] }]).map((row) => (
          <div key={row.discipline}>
            <p className="mb-2 text-sm font-semibold">{row.discipline}</p>
            <div className="flex flex-wrap gap-2">
              {(POOL[row.discipline] || []).map((name) => {
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
        ))}
      </div>
    </section>
  );
}
