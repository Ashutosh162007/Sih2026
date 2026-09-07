import { Check } from "lucide-react";

export default function Stepper({ steps, currentStep }) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {steps.map((label, index) => {
        const done = index < currentStep;
        const active = index === currentStep;
        return (
          <li key={label} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                done
                  ? "bg-primary text-white"
                  : active
                    ? "bg-highlight text-primary ring-2 ring-primary"
                    : "bg-slate-200 text-slate-500"
              }`}
            >
              {done ? <Check size={16} /> : index + 1}
            </div>
            <span className={`text-sm ${active ? "font-semibold text-primary" : "text-slate-500"}`}>
              {label}
            </span>
            {index < steps.length - 1 && <span className="mx-1 hidden h-px w-8 bg-slate-200 sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}
