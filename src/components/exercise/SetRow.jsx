function CheckBox({ isDone = false }) {
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
        isDone
          ? "border-cyan-300 bg-cyan-300 text-zinc-950 shadow-[0_0_12px_rgba(103,232,249,0.22)]"
          : "border-zinc-700/70 bg-zinc-950/20"
      }`}
    >
      {isDone ? "✓" : null}
    </span>
  );
}

function InlineMetric({ name, value, onChange, isReadOnly = false }) {
  const displayValue = value || "—";

  if (isReadOnly) {
    return (
      <div className="mx-auto flex w-[80%] min-w-0 items-center justify-center border-b border-zinc-800/35 pb-1.5">
        <span className="text-base font-semibold tabular-nums text-zinc-100">
          {displayValue}
        </span>
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
      className="mx-auto w-[80%] min-w-0 border-b border-zinc-800/35 bg-transparent pb-1.5 text-center text-base font-semibold tabular-nums text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:w-full focus:border-cyan-300/70"
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
      className={`grid grid-cols-[34px_1fr_1fr_1fr_32px] items-center gap-3 py-3 ${
        !isLast ? "border-b border-zinc-800/18" : ""
      }`}
    >
      <span className="flex h-9 items-center justify-center text-sm font-semibold tabular-nums text-zinc-200">
        {setNumber}
      </span>

      <InlineMetric
        name={`set-${setNumber}-weight`}
        value={weight}
        isReadOnly={isReadOnly}
        onChange={(value) => onSetFieldChange?.("weight", value)}
      />

      <InlineMetric
        name={`set-${setNumber}-reps`}
        value={reps}
        isReadOnly={isReadOnly}
        onChange={(value) => onSetFieldChange?.("reps", value)}
      />

      <InlineMetric
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
        className={`flex h-9 items-center justify-center ${
          isReadOnly ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <CheckBox isDone={isDone} />
      </button>
    </div>
  );
}
