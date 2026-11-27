import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { isValidMethodMetricValue } from "../../utils/runtime/advancedMethodValidation.js";

const statusLabels = {
  unknown: "Not recorded", skipped: "Skipped", draft: "Not confirmed",
  partial: "Partially performed", performed: "Performed",
};
const confirmationOptions = [
  ["unconfirmed", "Not confirmed"], ["partial", "Partially performed"], ["performed", "Performed"],
];
const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]";

function Chevron({ open }) {
  return <ChevronDown aria-hidden="true"
    className={`h-4 w-4 shrink-0 text-[#AAB2BA] transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />;
}

export function RetainedPushUpValue({ weight }) {
  const { t } = useTranslation();
  if (weight === "") return null;
  return (
    <p data-push-up-retained-value>
      {t("Saved value of unknown meaning:")}{" "}
      <bdi className="whitespace-pre-wrap [overflow-wrap:anywhere]">{weight}</bdi>
      {" "}{t("This value is not used to compare bodyweight resistance.")}
    </p>
  );
}

function PreviousAttempt({ attempt, phaseId, continuationLabel, isPushUp }) {
  const { t } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  const phase = attempt.methodLog.phases[phaseId];
  const { baseSet } = attempt;
  const status = phase.execution === "performed" && phase.reps === "0" ? "Attempt confirmed" : statusLabels[attempt.derived.status];
  return (
    <div className="border-t border-[#2A3138] pt-1" data-method-history>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}
        className={`flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left text-xs font-semibold text-[#D7DDD7] ${focus}`}>
        {t(isPushUp ? "Previous continuation · Cycle {cycle}" : "Previous comparable attempt · Cycle {cycle}", { cycle: attempt.cycleNumber })}
        <Chevron open={open} />
      </button>
      <div id={id} hidden={!open} className="space-y-2 border-l border-[#3A434C] py-2 pl-3 text-xs leading-5 text-[#AAB2BA]">
        <p>{t("Read-only reference")}</p>
        <dl className="space-y-2">
          <div>
            <dt className="font-semibold text-[#D7DDD7]">{t(continuationLabel)}</dt>
            <dd>{t(status)} · {phase.reps ? t("Extra reps: {value}", { value: phase.reps }) : t("Measurement not recorded")}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#D7DDD7]">{t(isPushUp ? "Standard push-up base" : "Wide-grip base")}</dt>
            <dd>{isPushUp ? t("Bodyweight") : <>{t("Kg")} {baseSet.weight || t("Not recorded")}</>} · {t("Reps")} {baseSet.reps || t("Not recorded")} · {t("RIR")} {baseSet.rir || t("Not recorded")}</dd>
            <dd>{t(baseSet.isDone ? "Base set marked performed" : "Base set not marked performed")}</dd>
          </div>
        </dl>
        <p>{t("Saved base values may include carry-over.")}</p>
        {isPushUp ? <RetainedPushUpValue weight={baseSet.weight} />
          : <p>{t("Compare base kg only with the same equipment and logging convention.")}</p>}
      </div>
    </div>
  );
}

export default function MechanicalMethodPanel({ definition, record, derived, editable, onChange, previousAttempt, setIndex }) {
  const { t } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const { phaseId } = definition.phases[0];
  const phase = record?.phases?.[phaseId];
  const reps = phase?.reps ?? "";
  const execution = phase?.execution ?? "unconfirmed";
  const skipped = derived.status === "skipped";
  const available = editable && derived.valid;
  const status = derived.status === "performed" && reps === "0" ? "Attempt confirmed" : statusLabels[derived.status];
  // The router admits only the two exact supported Mechanical definitions.
  const isPushUp = phaseId === "knee-push-up";
  const continuationLabel = isPushUp ? "Knee push-up continuation" : "Narrow-grip continuation";

  function updateReps(value) {
    const valid = isValidMethodMetricValue("reps", value);
    setInvalid(!valid);
    if (valid && value !== reps) onChange({ type: "set-metric", phaseId, field: "reps", value });
  }

  return (
    <section className="min-w-0 border-t border-[#2A3138] px-3.5" data-method-set={setIndex} data-mechanical>
      <button type="button" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => setOpen(!open)}
        className={`flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left ${focus}`}>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#F4C87F]">{t(continuationLabel)}</span>
          <span className="mt-1 block text-xs leading-5 text-[#AAB2BA]" data-method-summary role="status">
            {t(available ? status : "Method logging unavailable")}
            {available && !skipped && reps !== "" ? ` · ${t("Extra reps: {value}", { value: reps })}` : ""}
          </span>
        </span>
        <Chevron open={open} />
      </button>
      <div id={`${id}-body`} hidden={!open} className="space-y-3 pb-4">
        {available ? <>
          <p className="text-xs leading-5 text-[#AAB2BA]">{t(isPushUp
            ? "Optional. Use bodyweight and record your knee push-up reps after the set."
            : "Optional. Use the same load as the wide-grip base. Record the continuation after the set.")}</p>
          <div hidden={skipped} className="space-y-2">
            <label className="flex min-h-11 items-center justify-between gap-3 text-sm text-[#D7DDD7]">
              {t(isPushUp ? "Actual knee push-up reps" : "Actual narrow-grip reps")}
              <input type="text" inputMode="numeric" autoComplete="off" name="reps" value={reps} disabled={skipped}
                aria-invalid={invalid || undefined} aria-describedby={`${id}-feedback`}
                onChange={(event) => updateReps(event.target.value)}
                className={`h-11 w-20 shrink-0 rounded-lg border border-[#3A434C] bg-[#13181D] px-2 text-center text-base font-semibold tabular-nums text-[#F3F5F1] ${focus}`} />
            </label>
            <fieldset>
              <legend className="text-xs font-semibold text-[#D7DDD7]">{t("Extension confirmation")}</legend>
              {confirmationOptions.map(([value, label]) => (
                <label key={value} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[#D7DDD7]">
                  <input type="radio" name={`${id}-execution`} value={value} checked={execution === value} disabled={skipped}
                    onChange={() => onChange({ type: "set-execution", phaseId, execution: value })}
                    className="h-4 w-4 accent-[#F1B864] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8F36B]" />
                  {t(label)}
                </label>
              ))}
            </fieldset>
          </div>
          <button type="button" data-mechanical-choice
            onClick={() => { setInvalid(false); onChange({ type: "set-choice", choice: skipped ? "record" : "skip" }); }}
            className={`min-h-11 rounded-lg border border-[#3A434C] px-3 text-sm font-semibold text-[#D7DDD7] ${focus}`}>
            {t(skipped ? "Resume recording" : "Skip continuation")}
          </button>
          {/* Feedback stays below both actions and never changes on blur. */}
          <div id={`${id}-feedback`} role="status" className="text-xs leading-5 text-[#F4C87F]">
            {invalid ? t("Use a whole number from 0 to {max}, or leave blank.", { max: 30 })
              : !skipped && execution !== "unconfirmed" && reps === "" ? t("Measurement not recorded") : ""}
          </div>
          {previousAttempt && <PreviousAttempt attempt={previousAttempt} phaseId={phaseId} continuationLabel={continuationLabel} isPushUp={isPushUp} />}
        </> : <p className="text-sm leading-6 text-[#AAB2BA]">{t("Method logging unavailable")}</p>}
      </div>
    </section>
  );
}
