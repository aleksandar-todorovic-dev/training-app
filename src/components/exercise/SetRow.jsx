import { useTranslation } from "../../i18n/useTranslation";
import { Check } from "lucide-react";
import { motion } from "motion/react";

import { softPressTap } from "../../styles/motion";

const MotionButton = motion.button;

function MetricField({
  label,
  description,
  name,
  value,
  setNumber,
  onChange,
  isReadOnly = false,
}) {
  const { t } = useTranslation();
  const displayValue = value || "—";
  const inputValue = value === "—" ? "" : value;

  if (isReadOnly) {
    return (
      <div className="flex min-h-11 min-w-0 items-center justify-center px-1.5 text-center">
        <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-[#F3F5F1]">
          {t(displayValue)}
        </span>
      </div>
    );
  }

  return (
    <label className="flex min-h-11 min-w-0 items-center justify-center px-1.5">
      <span className="sr-only">{t("Set {value0} {value1}", { value0: setNumber, value1: label })}</span>
      <input
        aria-label={t("Set {value0} {value1}", { value0: setNumber, value1: label })}
        aria-describedby={description}
        name={name}
        value={inputValue}
        onChange={(event) => onChange?.(event.target.value)}
        inputMode="decimal"
        autoComplete="off"
        placeholder={t("—")}
        className="h-9 w-full min-w-0 rounded-lg bg-transparent px-1 text-center text-sm font-semibold tabular-nums text-[#F3F5F1] outline-none transition-colors placeholder:text-[#59636B] focus:bg-[#1C2329] focus:text-[#C8F78F] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#B8F36B]/55"
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
  bodyweight = false,
  assistanceDescription,
  weightDescription,
  setDescription,
  reps,
  rir,
  isDone = false,
  onToggleDone,
  onSetFieldChange,
  isReadOnly = false,
  showDoneControl = true,
}) {
  const { t } = useTranslation();
  const rowGridClass = showDoneControl
    ? bodyweight ? "grid-cols-[1.9rem_minmax(0,1fr)_3.25rem]" : "grid-cols-[1.9rem_minmax(0,1fr)_2.75rem]"
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

      <div className={`grid min-w-0 divide-x divide-[#2A3138] ${bodyweight
        ? "grid-cols-[minmax(4.75rem,1.15fr)_minmax(4rem,1fr)_minmax(0,0.8fr)]" : "grid-cols-3"}`}>
        {bodyweight ? (
          <div className="flex min-h-11 min-w-0 items-center justify-center px-1 text-center text-xs font-semibold leading-tight text-[#D7DDD7]">
            {t("Bodyweight")}
          </div>
        ) : (
          <MetricField
            label={assistanceDescription ? "Assistance (kg)" : "weight"}
            description={assistanceDescription ?? weightDescription ?? setDescription}
            name={`set-${setNumber}-weight`}
            setNumber={setNumber}
            value={weight}
            isReadOnly={isReadOnly}
            onChange={(value) => onSetFieldChange?.("weight", value)}
          />
        )}

        <MetricField
          label="reps"
          description={setDescription}
          name={`set-${setNumber}-reps`}
          setNumber={setNumber}
          value={reps}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("reps", value)}
        />

        <MetricField
          label="RIR"
          description={setDescription}
          name={`set-${setNumber}-rir`}
          setNumber={setNumber}
          value={rir}
          isReadOnly={isReadOnly}
          onChange={(value) => onSetFieldChange?.("rir", value)}
        />
      </div>

      {showDoneControl ? (
        <MotionButton
          type="button"
          aria-label={t("Mark set {value0} {value1}", { value0: setNumber, value1: isDone ? "not performed" : "performed" })}
          aria-pressed={isDone}
          aria-describedby={setDescription}
          disabled={isReadOnly}
          onClick={isReadOnly ? undefined : onToggleDone}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13181D] disabled:cursor-not-allowed disabled:opacity-45 ${bodyweight ? "justify-self-center" : ""}`}
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
