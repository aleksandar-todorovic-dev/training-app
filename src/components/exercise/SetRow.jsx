function CheckBox({ isDone = false }) {
  return (
    <span
      className={`flex h-5 w-5 items-center justify-center rounded border transition ${
        isDone
          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
          : "border-zinc-700 bg-zinc-950/40"
      }`}
    >
      {isDone ? "✓" : null}
    </span>
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

/**
 * Displays one prescribed set row and forwards done-toggle actions upward.
 *
 * Runtime note:
 * SetRow does not update global state directly. It receives the current
 * `isDone` value and calls `onToggleDone` when the checkbox is clicked.
 */
export default function SetRow({
  setNumber,
  weight,
  reps,
  rir,
  isDone = false,
  isLast = false,
  onToggleDone,
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

      <MetricCell label="Kg" value={weight?.replace?.(" kg", "") ?? weight} />
      <MetricCell label="Reps" value={reps} />
      <MetricCell label="RIR" value={rir} />

      <button
        type="button"
        aria-label={`Mark set ${setNumber} ${isDone ? "not done" : "done"}`}
        aria-pressed={isDone}
        onClick={onToggleDone}
        className="flex items-center justify-center"
      >
        <CheckBox isDone={isDone} />
      </button>
    </div>
  );
}
