function CheckBox({ isDone = false }) {
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
        isDone
          ? "border-[#C4B5FD] bg-[#7C3AED] text-white shadow-[0_0_16px_rgba(124,58,237,0.32)]"
          : "border-zinc-700/70 bg-zinc-950/20"
      }`}
    >
      {isDone ? "✓" : null}
    </span>
  );
}

function InlineMetric({
  name,
  value,
  onChange,
  isReadOnly = false,
  isTarget = false,
}) {
  const displayValue = value || "—";
  const inputValue = value === "—" ? "" : value;

  if (isReadOnly || isTarget) {
    return (
      <div className="mx-auto flex w-[82%] min-w-0 items-center justify-center border-b border-zinc-800/30 pb-1.5">
        <span
          className={`whitespace-nowrap text-base font-semibold tabular-nums ${
            isTarget ? "text-zinc-300" : "text-zinc-100"
          }`}
        >
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
      className="mx-auto w-[82%] min-w-0 border-b border-zinc-800/30 bg-transparent pb-1.5 text-center text-base font-semibold tabular-nums text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:w-full focus:border-[#A78BFA]/80"
    />
  );
}

/**
 * Displays one prescribed core set row and forwards row actions upward.
 *
 * Runtime note:
 * CoreSetRow does not update global state directly. It receives the current
 * core set values and `isDone` state, then forwards input changes and
 * done-toggle intent to the parent workflow.
 */
export default function CoreSetRow({
  setNumber,
  target,
  isReadOnly = false,
  load = "—",
  logged = "—",
  valueLabel = "Reps",
  effort = "—",
  tracksLoad = false,
  isLast = false,
  isDone = false,
  onToggleDone,
  onSetFieldChange,
}) {
  const loggedField = valueLabel === "Time" ? "time" : "reps";

  return (
    <div
      className={`grid grid-cols-[34px_1.25fr_1fr_0.85fr_32px] items-center gap-3 py-3 ${
        !isLast ? "border-b border-zinc-800/16" : ""
      }`}
    >
      <span className="flex h-9 items-center justify-center text-sm font-semibold tabular-nums text-zinc-200">
        {setNumber}
      </span>

      <InlineMetric
        name={`core-set-${setNumber}-load`}
        value={tracksLoad ? load : target}
        isReadOnly={isReadOnly}
        isTarget={!tracksLoad}
        onChange={(value) => onSetFieldChange?.("load", value)}
      />

      <InlineMetric
        name={`core-set-${setNumber}-${loggedField}`}
        value={logged}
        isReadOnly={isReadOnly}
        onChange={(value) => onSetFieldChange?.(loggedField, value)}
      />

      <InlineMetric
        name={`core-set-${setNumber}-rir`}
        value={effort}
        isReadOnly={isReadOnly}
        onChange={(value) => onSetFieldChange?.("rir", value)}
      />

      <button
        type="button"
        aria-label={`Mark core set ${setNumber} ${isDone ? "not done" : "done"}`}
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
