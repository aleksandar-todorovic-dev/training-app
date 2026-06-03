function CheckBox({ isDone = false }) {
  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
        isDone
          ? "border-cyan-300 bg-cyan-300 text-zinc-950 shadow-[0_0_22px_rgba(103,232,249,0.35)]"
          : "border-zinc-700 bg-zinc-950/60"
      }`}
    >
      {isDone ? "✓" : null}
    </span>
  );
}

function MetricCell({ name, value, onChange, isReadOnly = false }) {
  if (isReadOnly) {
    return (
      <div className="min-w-0 rounded-lg border border-zinc-800 bg-zinc-950/50 px-2 py-2 text-center">
        <p className="text-base font-semibold tabular-nums text-zinc-100">
          {value || "—"}
        </p>
      </div>
    );
  }

  return (
    <input
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      inputMode="decimal"
      autoComplete="off"
      placeholder="—"
      className="w-full rounded-lg border border-zinc-800 bg-zinc-950/55 px-2 py-2 text-center text-base font-semibold tabular-nums text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/70 focus:bg-zinc-950"
    />
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
  isReadOnly = false,
}) {
  return (
    <div
      className={`grid grid-cols-[34px_1fr_1fr_1fr_32px] items-center gap-2 py-2.5 ${
        !isLast ? "border-b border-zinc-800/70" : ""
      }`}
    >
      <span className="flex h-full items-center justify-center text-sm font-semibold tabular-nums text-zinc-100">
        {setNumber}
      </span>

      <MetricCell
        name={`set-${setNumber}-weight`}
        value={weight}
        isReadOnly={isReadOnly}
        onChange={(value) => onSetFieldChange?.("weight", value)}
      />

      <MetricCell
        name={`set-${setNumber}-reps`}
        value={reps}
        isReadOnly={isReadOnly}
        onChange={(value) => onSetFieldChange?.("reps", value)}
      />

      <MetricCell
        name={`set-${setNumber}-rir`}
        value={rir}
        isReadOnly={isReadOnly}
        onChange={(value) => onSetFieldChange?.("rir", value)}
      />

      <button
        type="button"
        aria-label={`Mark set ${setNumber} ${isDone ? "not done" : "done"}`}
        aria-pressed={isDone}
        disabled={isReadOnly}
        onClick={isReadOnly ? undefined : onToggleDone}
        className={`flex items-center justify-center ${
          isReadOnly ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <CheckBox isDone={isDone} />
      </button>
    </div>
  );
}
