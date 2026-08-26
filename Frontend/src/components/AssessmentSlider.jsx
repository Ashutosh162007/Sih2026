export default function AssessmentSlider({ label, value = 0, readOnly = true, onChange }) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-primary">{value}</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-primary disabled:opacity-90"
      />
    </label>
  );
}
