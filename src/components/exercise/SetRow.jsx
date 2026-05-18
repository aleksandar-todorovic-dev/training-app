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

function MetricCell({ label, value, onChange }) {
  return (
    <label className="min-w-0 text-center">
      <span className="block text-[11px] uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        placeholder="—"
        className="mt-1 w-full bg-transparent text-center text-base font-semibold tabular-nums text-zinc-100 outline-none placeholder:text-zinc-100"
      />
    </label>
  );
}

/**
 * Displays one prescribed set row and forwards set-row actions upward.
 *
 * Runtime note:
 * SetRow does not update global state directly. It receives the current
 * set values and `isDone` state, then forwards input changes and done-toggle
 * intent to the parent workflow.
 */
export default function SetRow({
  setNumber,
  weight,
  reps,
  rir,
  isDone = false,
  isLast = false,
  onToggleDone,
  onSetFieldChange,
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

      <MetricCell
        label="Kg"
        value={weight}
        onChange={(value) => onSetFieldChange?.("weight", value)}
      />
      <MetricCell
        label="Reps"
        value={reps}
        onChange={(value) => onSetFieldChange?.("reps", value)}
      />
      <MetricCell
        label="RIR"
        value={rir}
        onChange={(value) => onSetFieldChange?.("rir", value)}
      />

      <button
        type="button"
        aria-label={`Mark set ${setNumber} ${isDone ? "not done" : "done"}`}
        aria-pressed={isDone}
        onClick={onToggleDone}
        className="mt-4.5 flex items-center justify-center"
      >
        <CheckBox isDone={isDone} />
      </button>
    </div>
  );
}
