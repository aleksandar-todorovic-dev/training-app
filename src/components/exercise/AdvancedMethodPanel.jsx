import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { isValidMethodMetricValue } from "../../utils/runtime/advancedMethodValidation.js";

const statusLabels = {
  unknown: "Not recorded", skipped: "Skipped", draft: "Not confirmed",
  partial: "Partially performed", performed: "Performed",
};
const comparisonLabels = { below: "Below target", within: "Within target", above: "Above target", unrecorded: "Measurement not recorded" };
const metricLabels = {
  reps: "Extra reps", restSeconds: "Actual rest (s, optional)", durationSeconds: "Actual stretch duration (s)",
};
const confirmationOptions = [
  ["unconfirmed", "Not confirmed"], ["partial", "Partially performed"], ["performed", "Performed"],
];

function formatTarget(target) {
  return target.min === target.max ? String(target.min) : `${target.min}–${target.max}`;
}

/** A controlled evidence form. Only disclosure and rejected-input feedback are local. */
export default function AdvancedMethodPanel({ definition, record, derived, setIndex, editable, onChange }) {
  const { t } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [errorField, setErrorField] = useState(null);
  const phase = definition.phases[0];
  const isRestPause = definition.type === "rest-pause";
  const phaseLog = record?.phases?.[phase.phaseId];
  const skipped = derived.status === "skipped";
  const available = editable && derived.valid;
  const requiredMetric = phase.requiredMetrics[0];
  const actual = phaseLog?.[requiredMetric] ?? "";
  const confirmedZero = derived.status === "performed" && actual === "0";
  const status = available ? t(confirmedZero ? "Attempt confirmed" : statusLabels[derived.status])
    : t("Method logging unavailable");
  const comparison = derived.targetComparisons[phase.phaseId]?.[requiredMetric];
  const summary = [status];
  if (available && ["partial", "performed"].includes(derived.status)) {
    summary.push(actual === "" ? t("Measurement not recorded") : t(isRestPause
      ? "Extra reps: {value}" : "Stretch duration: {value} s", { value: actual }));
    if (actual !== "") summary.push(t(comparisonLabels[comparison]));
  }

  function updateMetric(field, value) {
    if (!isValidMethodMetricValue(field, value)) {
      setErrorField(field);
      return;
    }
    setErrorField(null);
    // Focusing or clearing an already-empty initial field does not create evidence.
    if (value === (phaseLog?.[field] ?? "")) return;
    onChange({ type: "set-metric", phaseId: phase.phaseId, field, value });
  }

  return (
    <section className="min-w-0 border-t border-[#2A3138] px-3.5" data-method-set={setIndex}>
      <button type="button" aria-expanded={open} aria-controls={`${id}-body`}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8F36B]">
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-5 text-[#F4C87F]">
            {t(isRestPause ? "Rest-pause log · Set {set}" : "Iso-stretch log · Set {set}", { set: setIndex })}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#AAB2BA]" data-method-summary>{summary.join(" · ")}</span>
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#AAB2BA] transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={`${id}-body`} hidden={!open} className="space-y-3 pb-4">
        {available ? (
          <>
            <p className="text-xs leading-5 text-[#AAB2BA]">{t("Log the base set above and the optional extension here.")}</p>
            <p className="text-xs leading-5 text-[#D7DDD7]">{isRestPause
              ? t("Target: {rest} s rest, then {reps} extra reps.", {
                rest: formatTarget(phase.targets.restSeconds), reps: formatTarget(phase.targets.reps),
              })
              : t("Target: {duration} s stretch.", { duration: formatTarget(phase.targets.durationSeconds) })}</p>
            <p className="text-xs text-[#AAB2BA]">{t("Same load as the base set.")}</p>
            {/* Keep controls mounted across skip/resume so their identity is stable. */}
            <div hidden={skipped} className="space-y-3">
              {phase.metrics.map((field) => {
                const inputId = `${id}-${field}`;
                const rejected = errorField === field;
                const targetComparison = derived.targetComparisons[phase.phaseId]?.[field] ?? "unrecorded";
                return (
                  <div key={field}>
                    <label htmlFor={inputId} className="flex min-h-11 items-center justify-between gap-3 text-sm text-[#D7DDD7]">
                      <span className="min-w-0 leading-5">{t(metricLabels[field])}</span>
                      <input id={inputId} name={field} type="text" inputMode="numeric" autoComplete="off"
                        disabled={skipped} value={phaseLog?.[field] ?? ""}
                        aria-invalid={rejected || undefined} aria-describedby={`${inputId}-feedback`}
                        onChange={(event) => updateMetric(field, event.target.value)}
                        className="h-11 w-20 shrink-0 rounded-lg border border-[#3A434C] bg-[#13181D] px-2 text-center text-base font-semibold tabular-nums text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]" />
                    </label>
                    <p id={`${inputId}-feedback`} className="mt-1 text-xs leading-5 text-[#AAB2BA]">
                      {rejected ? t("Use a whole number from 0 to {max}, or leave blank.", { max: field === "reps" ? 30 : 999 }) : t(comparisonLabels[targetComparison])}
                    </p>
                  </div>
                );
              })}
              <fieldset>
                <legend className="text-xs font-semibold text-[#D7DDD7]">{t(isRestPause ? "Extension confirmation" : "Stretch confirmation")}</legend>
                <div className="mt-1">
                  {confirmationOptions.map(([execution, label]) => (
                    <label key={execution} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[#D7DDD7]">
                      <input type="radio" name={`${id}-execution`} value={execution} disabled={skipped}
                        checked={(phaseLog?.execution ?? "unconfirmed") === execution}
                        onChange={() => {
                          if (execution === (phaseLog?.execution ?? "unconfirmed")) return;
                          onChange({ type: "set-execution", phaseId: phase.phaseId, execution });
                        }}
                        className="h-4 w-4 accent-[#F1B864] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8F36B]" />
                      {t(label)}
                    </label>
                  ))}
                </div>
              </fieldset>
              {derived.numericComplete === false && derived.status !== "unknown" ? (
                <p className="text-xs leading-5 text-[#F4C87F]">{t("Required measurement missing")}</p>
              ) : null}
              {confirmedZero ? <p className="text-xs leading-5 text-[#AAB2BA]">{t("A confirmed attempt can have a zero result. The target remains separate.")}</p> : null}
            </div>
            <p hidden={!skipped} className="text-xs leading-5 text-[#AAB2BA]">{t("Resume restores your entries and their previous confirmation.")}</p>
            <button type="button" onClick={() => {
              setErrorField(null);
              onChange({ type: "set-choice", choice: skipped ? "record" : "skip" });
            }} className="min-h-11 rounded-lg border border-[#3A434C] px-3 text-sm font-semibold text-[#D7DDD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]">
              {t(skipped ? "Resume recording" : "Skip method")}
            </button>
            <p role="status" className="sr-only">{status}{errorField ? `. ${t("Invalid measurement. The previous value was kept.")}` : ""}</p>
          </>
        ) : <p className="text-sm leading-6 text-[#AAB2BA]">{t("Method logging unavailable")}</p>}
      </div>
    </section>
  );
}
