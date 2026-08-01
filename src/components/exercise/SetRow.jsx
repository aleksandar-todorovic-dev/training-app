function displayValue(value) {
  return typeof value === "string" && value.trim() ? value : "—";
}

function PreviousValue({ label, value }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-[#AAA99F]">
        {label}
      </span>
      <span className="font-display text-sm font-semibold tabular-nums text-[#B8B7AF]">
        {displayValue(value)}
      </span>
    </span>
  );
}

function MetricField({
  label,
  name,
  value,
  setNumber,
  onChange,
  isReadOnly = false,
}) {
  const shownValue = displayValue(value);
  const inputValue = value === "—" ? "" : value;

  if (isReadOnly) {
    return (
      <div className="min-w-0 border-l border-[#3B3D34] px-2 py-2.5 text-center first:border-l-0">
        <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#87877E]">
          {label}
        </span>
        <span className="mt-1 block font-display text-lg font-semibold tabular-nums text-[#E0DDD3]">
          {shownValue}
        </span>
      </div>
    );
  }

  return (
    <label className="min-w-0 border-l border-[#3B3D34] px-1.5 py-1.5 text-center first:border-l-0">
      <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#87877E]">
        {label}
      </span>
      <input
        aria-label={`Set ${setNumber} ${label}`}
        name={name}
        value={inputValue}
        onChange={(event) => onChange?.(event.target.value)}
        inputMode="decimal"
        autoComplete="off"
        placeholder="—"
        className="mt-0.5 h-10 w-full min-w-0 border-b border-transparent bg-transparent text-center font-display text-lg font-semibold tabular-nums text-[#F2EEE4] outline-none placeholder:text-[#5E6058] focus:border-[#FF5A3C] focus:text-[#FF8B73]"
      />
    </label>
  );
}

/** One prescribed set. Values never imply completion; isDone does. */
export default function SetRow({
  setNumber,
  weight,
  reps,
  rir,
  previousValues,
  isDone = false,
  onToggleDone,
  onSetFieldChange,
  isReadOnly = false,
  showDoneControl = true,
}) {
  const hasPreviousValues = [
    previousValues?.weight,
    previousValues?.reps,
    previousValues?.rir,
  ].some((value) => typeof value === "string" && value.trim());

  return (
    <li
      className={`border-t transition-colors duration-150 motion-reduce:transition-none ${
        isDone
          ? "border-[#6E8B63] bg-[#6E8B63]/8"
          : "border-[#3B3D34] bg-[#1B1C17]"
      }`}
    >
      <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-2">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="font-display text-2xl font-bold tabular-nums text-[#F2EEE4]">
            {String(setNumber).padStart(2, "0")}
          </span>
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#87877E]">
            Set
          </span>
        </div>

        {showDoneControl ? (
          <button
            type="button"
            aria-label={`Mark set ${setNumber} ${isDone ? "not done" : "done"}`}
            aria-pressed={isDone}
            disabled={isReadOnly}
            onClick={isReadOnly ? undefined : onToggleDone}
            className={`inline-flex min-h-11 min-w-[7.25rem] items-center justify-center border px-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C] ${
              isDone
                ? "border-[#809B76] bg-[#6E8B63] text-[#10130F]"
                : "border-[#55574D] text-[#C8C5BB] hover:border-[#FF795F] hover:text-[#F2EEE4]"
            } ${isReadOnly ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {isDone ? "Performed" : "Mark done"}
          </button>
        ) : (
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#87877E]">
            Preview
          </span>
        )}
      </div>

      {!isReadOnly && hasPreviousValues ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-[#34362E] bg-[#24251F] px-3 py-2">
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#9EB096]">
            Last performed
          </span>
          <PreviousValue label="kg" value={previousValues.weight} />
          <PreviousValue label="reps" value={previousValues.reps} />
          <PreviousValue label="RIR" value={previousValues.rir} />
        </div>
      ) : null}

      <div className="grid grid-cols-3 border-t border-[#34362E]">
        <MetricField
          label="Kg"
          name={`set-${setNumber}-weight`}
          value={weight}
          setNumber={setNumber}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("weight", value)}
        />
        <MetricField
          label="Reps"
          name={`set-${setNumber}-reps`}
          value={reps}
          setNumber={setNumber}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("reps", value)}
        />
        <MetricField
          label="RIR"
          name={`set-${setNumber}-rir`}
          value={rir}
          setNumber={setNumber}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("rir", value)}
        />
      </div>
    </li>
  );
}
