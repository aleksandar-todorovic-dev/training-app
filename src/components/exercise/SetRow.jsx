function DoneControl({ isDone = false }) {
  return (
    <span
      className={`inline-flex min-h-8 w-full items-center justify-center rounded-full border px-2 text-xs font-semibold transition ${
        isDone
          ? "border-[#5EC7D5] bg-[#5EC7D5] text-[#031014]"
          : "border-white/10 bg-white/[0.028] text-[#D3D8DB]"
      }`}
    >
      Done
    </span>
  );
}

function MetricField({ label, name, value, onChange, isReadOnly = false }) {
  const displayValue = value || "—";
  const inputValue = value === "—" ? "" : value;

  if (isReadOnly) {
    return (
      <div className="min-w-0 px-1 py-1.5 text-center">
        <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-[#747D84]">
          {label}
        </span>
        <span className="mt-0.5 block whitespace-nowrap text-sm font-semibold tabular-nums text-[#F4F7F8]">
          {displayValue}
        </span>
      </div>
    );
  }

  return (
    <label className="min-w-0 px-1 py-1.5 text-center">
      <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-[#747D84]">
        {label}
      </span>
      <input
        name={name}
        value={inputValue}
        onChange={(event) => onChange?.(event.target.value)}
        inputMode="decimal"
        autoComplete="off"
        placeholder="—"
        className="mt-0.5 w-full min-w-0 bg-transparent text-center text-sm font-semibold tabular-nums text-[#F4F7F8] outline-none placeholder:text-[#59636B] focus:text-[#8FDCE5]"
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
  isReadOnly = false,
  showDoneControl = true,
}) {
  const rowGridClass = showDoneControl
    ? "grid-cols-[1.5rem_minmax(0,1fr)_3.75rem]"
    : "grid-cols-[1.5rem_minmax(0,1fr)]";

  return (
    <div
      className={[
        `grid ${rowGridClass} items-center gap-0.5 rounded-xl border px-2.5 py-2 transition-colors`,
        isDone
          ? "border-[#5EC7D5]/28 bg-[#10292E]/30"
          : "border-white/8 bg-[#0B0F11]/64",
        !isLast ? "" : "",
      ].join(" ")}
    >
      <div className="min-w-0">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#747D84]">
          Set
        </p>
        <p className="mt-0.5 text-sm font-semibold tabular-nums text-[#F4F7F8]">
          {setNumber}
        </p>
      </div>

      <div className="mr-1 grid min-w-0 grid-cols-3 divide-x divide-white/7 overflow-hidden rounded-lg bg-white/[0.024]">
        <MetricField
          label="Kg"
          name={`set-${setNumber}-weight`}
          value={weight}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("weight", value)}
        />

        <MetricField
          label="Reps"
          name={`set-${setNumber}-reps`}
          value={reps}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("reps", value)}
        />

        <MetricField
          label="RIR"
          name={`set-${setNumber}-rir`}
          value={rir}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("rir", value)}
        />
      </div>

      {showDoneControl ? (
        <button
          type="button"
          aria-label={`Mark set ${setNumber} ${isDone ? "not done" : "done"}`}
          aria-pressed={isDone}
          disabled={isReadOnly}
          onClick={isReadOnly ? undefined : onToggleDone}
          className={isReadOnly ? "cursor-not-allowed opacity-50" : ""}
        >
          <DoneControl isDone={isDone} />
        </button>
      ) : null}
    </div>
  );
}