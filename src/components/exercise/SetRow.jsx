function CheckBox() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-950/40" />
  );
}

function MetricCell({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-zinc-100">{value}</p>
    </div>
  );
}

export default function SetRow({
  setNumber,
  weight,
  reps,
  rir,
  isLast = false,
}) {
  return (
    <div
      className={`grid grid-cols-[40px_1fr_1fr_1fr_24px] items-center gap-3 py-3 ${
        !isLast ? "border-b border-zinc-800/80" : ""
      }`}
    >
      <span className="text-sm font-semibold text-zinc-100">S{setNumber}</span>

      <MetricCell label="Kg" value={weight?.replace?.(" kg", "") ?? weight} />
      <MetricCell label="Reps" value={reps} />
      <MetricCell label="RIR" value={rir} />

      <button
        type="button"
        aria-label={`Mark set ${setNumber} done`}
        className="flex items-center justify-center"
      >
        <CheckBox />
      </button>
    </div>
  );
}
