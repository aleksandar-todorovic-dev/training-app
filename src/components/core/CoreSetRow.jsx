/**
 * Displays one prescribed core set row and forwards row actions upward.
 *
 * Runtime note:
 * CoreSetRow does not update global state directly. It receives the current
 * core set values and `isDone` state, then forwards input changes and
 * done-toggle intent to the parent workflow.
 */
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

function MetricCell({ label, name, value, onChange, isEditable = true }) {
  if (!isEditable) {
    return (
      <div className="min-w-0 text-center">
        <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
          {label}
        </p>
        <p className="mt-1 text-base font-semibold tabular-nums text-zinc-100">
          {value || "—"}
        </p>
      </div>
    );
  }

  return (
    <label className="min-w-0 text-center">
      <span className="block text-[11px] uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </span>

      <input
        name={name}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        inputMode="decimal"
        autoComplete="off"
        placeholder="—"
        className="mt-1 w-full bg-transparent text-center text-base font-semibold tabular-nums text-zinc-100 outline-none placeholder:text-zinc-100"
      />
    </label>
  );
}

export default function CoreSetRow({
  setNumber,
  target,
  isReadOnly = false,
  load = "—",
  logged = "—",
  valueLabel = "Reps",
  effort = "1-2",
  tracksLoad = false,
  isLast = false,
  isDone = false,
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

      {tracksLoad ? (
        <MetricCell
          label="Kg"
          name={`core-set-${setNumber}-load`}
          value={load}
          isEditable={!isReadOnly}
          onChange={(value) => onSetFieldChange?.("load", value)}
        />
      ) : (
        <MetricCell label="Target" value={target} isEditable={false} />
      )}
      <MetricCell
        label={valueLabel}
        name={`core-set-${setNumber}-${valueLabel.toLowerCase()}`}
        value={logged}
        isEditable={!isReadOnly}
        onChange={(value) =>
          onSetFieldChange?.(valueLabel === "Time" ? "time" : "reps", value)
        }
      />

      <MetricCell
        label="RIR"
        name={`core-set-${setNumber}-rir`}
        value={effort}
        isEditable={!isReadOnly}
        onChange={(value) => onSetFieldChange?.("rir", value)}
      />

      <button
        type="button"
        aria-label={`Mark core set ${setNumber} ${isDone ? "not done" : "done"}`}
        aria-pressed={isDone}
        disabled={isReadOnly}
        onClick={isReadOnly ? undefined : onToggleDone}
        className={`mt-4.5 flex items-center justify-center ${
          isReadOnly ? "cursor-not-allowed opacity-50" : ""
        }`}
      >
        <CheckBox isDone={isDone} />
      </button>
    </div>
  );
}
