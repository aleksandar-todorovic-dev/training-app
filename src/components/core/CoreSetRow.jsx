function CheckBox() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded border border-zinc-700 bg-zinc-950/40" />
  );
}

function MetricCell({ label, value }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
        {value}
      </p>
    </div>
  );
}

export default function CoreSetRow({
  setNumber,
  target,
  logged = "—",
  valueLabel = "Reps",
  effort = "1-2",
  isLast = false,
}) {
  return (
    <div
      className={`grid grid-cols-[40px_1fr_1fr_1fr_24px] items-center gap-2 py-3 ${
        !isLast ? "border-b border-zinc-800/80" : ""
      }`}
    >
      <span className="text-sm font-semibold tabular-nums text-zinc-100">
        S{setNumber}
      </span>

      <MetricCell label="Target" value={target} />
      <MetricCell label={valueLabel} value={logged} />
      <MetricCell label="RIR" value={effort} />

      <button
        type="button"
        aria-label={`Mark core set ${setNumber} done`}
        className="flex items-center justify-center"
      >
        <CheckBox />
      </button>
    </div>
  );
}
