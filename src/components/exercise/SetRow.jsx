function CheckBox({ isDone = false }) {
  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs transition ${
        isDone
          ? "border-cyan-300 bg-cyan-300 text-zinc-950 shadow-[0_0_8px_rgba(103,232,249,0.16)]"
          : "border-zinc-700/70 bg-zinc-950/20"
      }`}
    >
      {isDone ? "✓" : null}
    </span>
  );
}

function InlineMetric({ name, value, onChange, isReadOnly = false }) {
  const displayValue = value || "—";
  const inputValue = value === "—" ? "" : value;

  if (isReadOnly) {
    return (
      <div className="mx-auto flex w-[72%] min-w-0 items-center justify-center border-b border-zinc-800/30 pb-1">
        <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-zinc-100">
          {displayValue}
        </span>
      </div>
    );
  }

  return (
    <input
      name={name}
      value={inputValue}
      onChange={(event) => onChange?.(event.target.value)}
      inputMode="decimal"
      autoComplete="off"
      placeholder="—"
      className="mx-auto w-[72%] min-w-0 border-b border-zinc-800/30 bg-transparent pb-1 text-center text-sm font-semibold tabular-nums text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/70"
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
  showDoneControl = true,
}) {
  // Preview rows hide the DONE affordance entirely instead of showing a disabled checkbox.
  const rowGridClass = showDoneControl
    ? "grid-cols-[32px_1fr_1fr_1fr_30px]"
    : "grid-cols-[32px_1fr_1fr_1fr]";

  return (
    <div
      className={`grid ${rowGridClass} items-center gap-2 py-2.5 ${
        !isLast ? "border-b border-zinc-800/16" : ""
      }`}
    >
      <span className="flex h-8 items-center justify-center text-sm font-semibold tabular-nums text-zinc-200">
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

      {showDoneControl ? (
        <button
          type="button"
          aria-label={`Mark set ${setNumber} ${isDone ? "not done" : "done"}`}
          aria-pressed={isDone}
          disabled={isReadOnly}
          onClick={isReadOnly ? undefined : onToggleDone}
          className={`flex h-8 items-center justify-center ${
            isReadOnly ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <CheckBox isDone={isDone} />
        </button>
      ) : null}
    </div>
  );
}
