import { Check } from "lucide-react";
import { motion } from "motion/react";

import { softPressTap } from "../../styles/motion";

const MotionButton = motion.button;

function MetricField({
  label,
  name,
  value,
  setNumber,
  onChange,
  isReadOnly = false,
  isTarget = false,
}) {
  const displayValue = value || "—";
  const inputValue = value === "—" ? "" : value;

  if (isReadOnly || isTarget) {
    return (
      <div className="flex min-h-11 min-w-0 items-center justify-center px-1 text-center">
        <span
          className={`whitespace-nowrap font-semibold tabular-nums ${
            isTarget
              ? "text-[0.78rem] tracking-[-0.02em] text-[#AAB2BA]"
              : "text-sm text-[#F3F5F1]"
          }`}
        >
          {displayValue}
        </span>
      </div>
    );
  }

  return (
    <label className="flex min-h-11 min-w-0 items-center justify-center px-1">
      <span className="sr-only">
        Set {setNumber} {label}
      </span>
      <input
        aria-label={`Set ${setNumber} ${label}`}
        name={name}
        value={inputValue}
        onChange={(event) => onChange?.(event.target.value)}
        inputMode="decimal"
        autoComplete="off"
        placeholder="—"
        className="h-9 w-full min-w-0 rounded-lg bg-transparent px-1 text-center text-sm font-semibold tabular-nums text-[#F3F5F1] outline-none transition-colors placeholder:text-[#59636B] focus:bg-[#1C2329] focus:text-[#C8F78F] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#B8F36B]/55"
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
  isDone = false,
  showDoneControl = true,
  onToggleDone,
  onSetFieldChange,
}) {
  const loggedField = valueLabel === "Time" ? "time" : "reps";

  const rowGridClass = showDoneControl
    ? "grid-cols-[1.9rem_minmax(0,1fr)_2.75rem]"
    : "grid-cols-[1.9rem_minmax(0,1fr)]";

  return (
    <div
      className={[
        `grid ${rowGridClass} min-h-14 items-center gap-1 border-t px-2 transition-colors duration-150 motion-reduce:transition-none`,
        isDone
          ? "border-[#79C89A]/18 bg-[#79C89A]/[0.07]"
          : "border-[#2A3138] bg-transparent",
      ].join(" ")}
    >
      <p
        className={`text-center text-sm font-semibold tabular-nums ${
          isDone ? "text-[#A7DDB9]" : "text-[#77818B]"
        }`}
      >
        {setNumber}
      </p>

      <div className="grid min-w-0 grid-cols-3 divide-x divide-[#2A3138]">
        <MetricField
          label={tracksLoad ? "weight" : "target"}
          name={`core-set-${setNumber}-load`}
          setNumber={setNumber}
          value={tracksLoad ? load : target}
          isReadOnly={isReadOnly}
          isTarget={!tracksLoad}
          onChange={(value) => onSetFieldChange?.("load", value)}
        />

        <MetricField
          label={valueLabel.toLowerCase()}
          name={`core-set-${setNumber}-${loggedField}`}
          setNumber={setNumber}
          value={logged}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.(loggedField, value)}
        />

        <MetricField
          label="RIR"
          name={`core-set-${setNumber}-rir`}
          setNumber={setNumber}
          value={effort}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("rir", value)}
        />
      </div>

      {showDoneControl ? (
        <MotionButton
          type="button"
          aria-label={`Mark core set ${setNumber} ${isDone ? "not performed" : "performed"}`}
          aria-pressed={isDone}
          disabled={isReadOnly}
          onClick={isReadOnly ? undefined : onToggleDone}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13181D] disabled:cursor-not-allowed disabled:opacity-45"
          whileTap={isReadOnly ? undefined : softPressTap}
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-150 motion-reduce:transition-none ${
              isDone
                ? "border-[#79C89A] bg-[#79C89A] text-[#0B0E11]"
                : "border-[#3A434C] bg-[#171D22] text-[#77818B]"
            }`}
            aria-hidden="true"
          >
            <Check className="h-4 w-4" strokeWidth={2.4} />
          </span>
        </MotionButton>
      ) : null}
    </div>
  );
}
