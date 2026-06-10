function DoneControl({ isDone = false }) {
  return (
    <span
      className={`inline-flex min-h-9 items-center justify-center rounded-full border px-3 text-xs font-semibold transition ${
        isDone
          ? "border-[#A78BFA]/70 bg-[#7C3AED] text-white shadow-[0_8px_18px_rgba(124,58,237,0.14)]"
          : "border-white/10 bg-white/[0.026] text-[#8B949B]"
      }`}
    >
      {isDone ? "Done" : "Mark"}
    </span>
  );
}

function MetricField({
  label,
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
      <div className="min-w-0 rounded-xl border border-white/7 bg-white/[0.018] px-2.5 py-2">
        <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#747D84]">
          {label}
        </span>
        <span
          className={`mt-1 block whitespace-nowrap text-sm font-semibold tabular-nums ${
            isTarget ? "text-[#D3D8DB]" : "text-[#F4F7F8]"
          }`}
        >
          {displayValue}
        </span>
      </div>
    );
  }

  return (
    <label className="min-w-0 rounded-xl border border-white/8 bg-[#0B1113]/72 px-2.5 py-2 transition-colors focus-within:border-[#A78BFA]/56 focus-within:bg-[#0D1118]">
      <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#747D84]">
        {label}
      </span>
      <input
        name={name}
        value={inputValue}
        onChange={(event) => onChange?.(event.target.value)}
        inputMode="decimal"
        autoComplete="off"
        placeholder="—"
        className="mt-1 w-full min-w-0 bg-transparent text-sm font-semibold tabular-nums text-[#F4F7F8] outline-none placeholder:text-[#59636B]"
      />
    </label>
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
  showDoneControl = true,
  onToggleDone,
  onSetFieldChange,
}) {
  const loggedField = valueLabel === "Time" ? "time" : "reps";

  return (
    <div
      className={[
        "rounded-2xl border px-3 py-3 transition-colors",
        isDone
          ? "border-[#A78BFA]/26 bg-[#4C1D95]/18"
          : "border-white/8 bg-white/[0.02]",
        !isLast ? "" : "",
      ].join(" ")}
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={[
              "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold tabular-nums",
              isDone
                ? "border-[#A78BFA]/32 bg-[#4C1D95]/42 text-[#DDD6FE]"
                : "border-white/10 bg-[#071012]/54 text-[#D3D8DB]",
            ].join(" ")}
          >
            {setNumber}
          </span>
          <p className="text-sm font-semibold text-[#E7ECEE]">
            Set {setNumber}
          </p>
        </div>

        {showDoneControl ? (
          <button
            type="button"
            aria-label={`Mark core set ${setNumber} ${isDone ? "not done" : "done"}`}
            aria-pressed={isDone}
            disabled={isReadOnly}
            onClick={isReadOnly ? undefined : onToggleDone}
            className={isReadOnly ? "cursor-not-allowed opacity-50" : ""}
          >
            <DoneControl isDone={isDone} />
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MetricField
          label={tracksLoad ? "Kg" : "Target"}
          name={`core-set-${setNumber}-load`}
          value={tracksLoad ? load : target}
          isReadOnly={isReadOnly}
          isTarget={!tracksLoad}
          onChange={(value) => onSetFieldChange?.("load", value)}
        />

        <MetricField
          label={valueLabel}
          name={`core-set-${setNumber}-${loggedField}`}
          value={logged}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.(loggedField, value)}
        />

        <MetricField
          label="RIR"
          name={`core-set-${setNumber}-rir`}
          value={effort}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("rir", value)}
        />
      </div>
    </div>
  );
}
