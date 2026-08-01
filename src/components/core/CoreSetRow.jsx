function displayValue(value) {
  return typeof value === "string" && value.trim() ? value : "—";
}

function MetricField({
  label,
  name,
  value,
  setNumber,
  onChange,
  isReadOnly = false,
  isTarget = false,
}) {
  const shownValue = displayValue(value);
  const inputValue = value === "—" ? "" : value;

  if (isReadOnly || isTarget) {
    return (
      <div className="min-w-0 border-l border-[#465056] px-1.5 py-2.5 text-center first:border-l-0">
        <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.11em] text-[#8D989D]">
          {label}
        </span>
        <span className="mt-1 block font-display text-lg font-semibold tabular-nums text-[#E2E7E8]">
          {shownValue}
        </span>
      </div>
    );
  }

  return (
    <label className="min-w-0 border-l border-[#465056] px-1.5 py-1.5 text-center first:border-l-0">
      <span className="block text-[0.58rem] font-semibold uppercase tracking-[0.11em] text-[#8D989D]">
        {label}
      </span>
      <input
        aria-label={`Core set ${setNumber} ${label}`}
        name={name}
        value={inputValue}
        onChange={(event) => onChange?.(event.target.value)}
        inputMode="decimal"
        autoComplete="off"
        placeholder="—"
        className="mt-0.5 h-10 w-full min-w-0 border-b border-transparent bg-transparent text-center font-display text-lg font-semibold tabular-nums text-[#F2EEE4] outline-none placeholder:text-[#626B6F] focus:border-[#B7C0C4] focus:text-white"
      />
    </label>
  );
}

function PreviousCoreValue({ label, value }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-[#B7C0C4]">
        {label}
      </span>
      <span className="font-display text-sm font-semibold tabular-nums text-[#C7D0D3]">
        {displayValue(value)}
      </span>
    </span>
  );
}

/** One prescribed core set; completion is represented only by isDone. */
export default function CoreSetRow({
  setNumber,
  target,
  isReadOnly = false,
  load = "—",
  logged = "—",
  valueLabel = "Reps",
  effort = "—",
  tracksLoad = false,
  isDone = false,
  showDoneControl = true,
  previousValues,
  onToggleDone,
  onSetFieldChange,
}) {
  const loggedField = valueLabel === "Time" ? "time" : "reps";
  const previousLogged = previousValues?.[loggedField];
  const hasPreviousValues = [
    tracksLoad ? previousValues?.load : "",
    previousLogged,
    previousValues?.rir,
  ].some((value) => typeof value === "string" && value.trim());

  return (
    <li
      className={`border-t transition-colors duration-150 motion-reduce:transition-none ${
        isDone
          ? "border-[#839198] bg-[#536168]/18"
          : "border-[#465056] bg-[#202522]"
      }`}
    >
      <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tabular-nums text-[#F2EEE4]">
            {String(setNumber).padStart(2, "0")}
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#8D989D]">
            Set
          </span>
        </div>

        {showDoneControl ? (
          <button
            type="button"
            aria-label={`Mark core set ${setNumber} ${isDone ? "not done" : "done"}`}
            aria-pressed={isDone}
            disabled={isReadOnly}
            onClick={isReadOnly ? undefined : onToggleDone}
            className={`inline-flex min-h-11 min-w-[7.25rem] items-center justify-center border px-3 text-xs font-semibold uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B7C0C4] ${
              isDone
                ? "border-[#AAB6BA] bg-[#9BA7AD] text-[#111715]"
                : "border-[#5B666B] text-[#C7D0D3] hover:border-[#B7C0C4] hover:text-white"
            } ${isReadOnly ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {isDone ? "Performed" : "Mark done"}
          </button>
        ) : (
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#8D989D]">
            Preview
          </span>
        )}
      </div>

      {!isReadOnly && hasPreviousValues ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-[#465056] bg-[#29302E] px-3 py-2">
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#B7C0C4]">
            Last performed
          </span>
          {tracksLoad ? (
            <PreviousCoreValue label="load" value={previousValues.load} />
          ) : null}
          <PreviousCoreValue label={valueLabel} value={previousLogged} />
          <PreviousCoreValue label="RIR" value={previousValues.rir} />
        </div>
      ) : null}

      <div className="grid grid-cols-3 border-t border-[#465056]">
        <MetricField
          label={tracksLoad ? "Kg" : "Target"}
          name={`core-set-${setNumber}-load`}
          value={tracksLoad ? load : target}
          setNumber={setNumber}
          isReadOnly={isReadOnly}
          isTarget={!tracksLoad}
          onChange={(value) => onSetFieldChange?.("load", value)}
        />
        <MetricField
          label={valueLabel}
          name={`core-set-${setNumber}-${loggedField}`}
          value={logged}
          setNumber={setNumber}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.(loggedField, value)}
        />
        <MetricField
          label="RIR"
          name={`core-set-${setNumber}-rir`}
          value={effort}
          setNumber={setNumber}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("rir", value)}
        />
      </div>
    </li>
  );
}
