import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { isValidMethodMetricValue, normalizeAssistanceKg } from "../../utils/runtime/advancedMethodValidation.js";

const statusLabels = {
  unknown: "Not recorded", skipped: "Skipped", draft: "Not confirmed",
  partial: "Partially performed", performed: "Performed",
};
const comparisonLabels = { below: "Below target", within: "Within target", above: "Above target", unrecorded: "Measurement not recorded" };
const metricLabels = {
  reps: "Extra reps", restSeconds: "Actual rest (s, optional)", durationSeconds: "Actual stretch duration (s)",
};
const recordedMetricLabels = {
  reps: "Recorded extra reps", restSeconds: "Recorded rest (optional)", durationSeconds: "Recorded stretch duration",
};
const confirmationOptions = [
  ["unconfirmed", "Not confirmed"], ["partial", "Partially performed"], ["performed", "Performed"],
];

function formatTarget(target) {
  return target.min === target.max ? String(target.min) : `${target.min}–${target.max}`;
}

function assistanceLabel(t, saved) {
  if (!saved) return t("Not recorded");
  return t(saved.mode === "same" ? "Same at confirmation · {kg} kg" : "Entered · {kg} kg", { kg: saved.kg });
}

function ClusterAssistance({ baseWeight, saved, onChange, phaseId }) {
  const { t } = useTranslation();
  const id = useId();
  const baseKg = normalizeAssistanceKg(baseWeight);
  const [draft, setDraft] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [requested, setRequested] = useState(null);
  const entering = draft !== null || saved?.mode === "entered";
  const mismatch = saved?.mode === "same" && saved.kg !== baseKg;
  const buttonClass = "min-h-11 rounded-lg border border-[#3A434C] px-3 text-left text-sm aria-pressed:border-[#F1B864] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#B8F36B]";

  function save(mode, kg) {
    setRequested({ mode, kg, previous: saved });
    onChange({ type: "set-assistance", phaseId, mode, kg });
    setDraft(null);
    setInvalid(false);
  }

  function commitDraft() {
    if (draft === null) return;
    const kg = normalizeAssistanceKg(draft.replace(",", "."));
    if (kg === null) {
      setInvalid(true);
      return;
    }
    save("entered", kg);
  }

  return (
    <fieldset className="min-w-0 space-y-2 text-sm text-[#D7DDD7]">
      <legend className="font-semibold">{t("Continuation assistance")}</legend>
      <div className="grid gap-1">
        <button type="button" data-assistance="clear" className={buttonClass} aria-pressed={!saved && !entering}
          onClick={() => {
            setDraft(null); setInvalid(false); setRequested(null);
            onChange({ type: "clear-assistance", phaseId });
          }}>{t("Not recorded")}</button>
        <button type="button" data-assistance="same" className={buttonClass} disabled={baseKg === null}
          aria-pressed={!entering && saved?.mode === "same" && !mismatch}
          onClick={() => save("same", baseKg)}>{baseKg === null ? t("Same as base") : t("Same as base — {kg} kg", { kg: baseKg })}</button>
        <button type="button" data-assistance="entered" className={buttonClass} aria-pressed={entering}
          onClick={() => { setDraft(draft ?? (saved?.mode === "entered" ? saved.kg : "")); setRequested(null); }}>
          {t("Enter assistance")}
        </button>
      </div>
      {entering ? <label className="flex min-h-11 items-center justify-between gap-2">
        {t("Continuation assistance (kg)")}
        <input name="assistanceKg" inputMode="decimal" autoComplete="off" value={draft ?? saved?.kg ?? ""}
          aria-invalid={invalid || undefined} aria-describedby={id}
          onChange={(event) => { setDraft(event.target.value); setInvalid(false); }}
          onBlur={(event) => {
            // Toggling a disclosure is presentation-only, even with a pending draft.
            if (!event.relatedTarget?.closest("button[aria-expanded]")) commitDraft();
          }}
          onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
          className="h-11 w-20 rounded-lg border border-[#3A434C] bg-[#13181D] px-2 text-center text-base focus-visible:ring-2 focus-visible:ring-[#B8F36B]" />
      </label> : null}
      <div id={id} role="status" className="space-y-1 text-xs leading-5">
        <p>{t("Recorded assistance")} · {assistanceLabel(t, saved)}</p>
        {invalid && <p>{t("Enter 0–999.9 kg with up to one decimal place.")}</p>}
        {requested && saved === requested.previous && (saved?.mode !== requested.mode || saved?.kg !== requested.kg || mismatch) &&
          <p>{t("Assistance was not updated. Check the current setting and try again.")}</p>}
        {mismatch && <p>{t("The base has changed since confirmation. The recorded assistance is still {kg} kg.", { kg: saved.kg })}</p>}
      </div>
    </fieldset>
  );
}

export default function AdvancedMethodPanel({ definition, record, derived, setIndex, editable, onChange, previousAttempt, baseWeight, machineAssistance }) {
  const { t } = useTranslation();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [errorField, setErrorField] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const phase = definition.phases[0];
  const isRestPause = definition.type === "rest-pause";
  const usesReps = phase.requiredMetrics.includes("reps");
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
    summary.push(actual === "" ? t("Measurement not recorded") : t(usesReps
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
            {t(definition.type === "cluster" ? "Cluster log · Set {set}" : isRestPause ? "Rest-pause log · Set {set}" : "Iso-stretch log · Set {set}", { set: setIndex })}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#AAB2BA]" data-method-summary>{summary.join(" · ")}</span>
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#AAB2BA] transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={`${id}-body`} hidden={!open} className="space-y-3 pb-4">
        {available ? (
          <>
            <p className="text-xs leading-5 text-[#AAB2BA]">{t("Log the base set above and the optional extension here.")}</p>
            <p className="text-xs leading-5 text-[#D7DDD7]">{usesReps
              ? t("Target: {rest} s rest, then {reps} extra reps.", {
                rest: formatTarget(phase.targets.restSeconds), reps: formatTarget(phase.targets.reps),
              })
              : t("Target: {duration} s stretch.", { duration: formatTarget(phase.targets.durationSeconds) })}</p>
            {!machineAssistance && <p className="text-xs text-[#AAB2BA]">{t("Same load as the base set.")}</p>}
            {/* Keep controls mounted across skip/resume so their identity is stable. */}
            <div hidden={skipped} className="space-y-3">
              {phase.metrics.map((field) => {
                const inputId = `${id}-${field}`;
                const rejected = errorField === field;
                const targetComparison = derived.targetComparisons[phase.phaseId]?.[field] ?? "unrecorded";
                const optionalBlank = !phase.requiredMetrics.includes(field) && targetComparison === "unrecorded";
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
                    <p id={`${inputId}-feedback`} hidden={optionalBlank && !rejected} className="mt-1 text-xs leading-5 text-[#AAB2BA]">
                      {rejected ? t("Use a whole number from 0 to {max}, or leave blank.", { max: field === "reps" ? 30 : 999 }) : optionalBlank ? null : t(comparisonLabels[targetComparison])}
                    </p>
                  </div>
                );
              })}
              {machineAssistance && !skipped && <ClusterAssistance baseWeight={baseWeight} saved={phaseLog?.assistance}
                phaseId={phase.phaseId} onChange={onChange} />}
              <fieldset>
                <legend className="text-xs font-semibold text-[#D7DDD7]">{t(usesReps ? "Extension confirmation" : "Stretch confirmation")}</legend>
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
            {previousAttempt ? (
              <div className="border-t border-[#2A3138] pt-1" data-method-history>
                <button type="button" aria-expanded={historyOpen} aria-controls={`${id}-history`}
                  onClick={() => setHistoryOpen((value) => !value)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left text-xs font-semibold leading-5 text-[#D7DDD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8F36B]">
                  <span className="min-w-0">{t("Previous comparable attempt · Cycle {cycle}", { cycle: previousAttempt.cycleNumber })}</span>
                  <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#AAB2BA] transition-transform motion-reduce:transition-none ${historyOpen ? "rotate-180" : ""}`} />
                </button>
                <div id={`${id}-history`} hidden={!historyOpen} className="space-y-3 border-l border-[#3A434C] py-2 pl-3 text-xs leading-5 text-[#AAB2BA]">
                  <p>{t("Read-only reference")}</p>
                  <p className="font-semibold text-[#D7DDD7]">{t("Method: {status}", { status: statusLabels[previousAttempt.derived.status] })}</p>
                  <dl className="space-y-2">
                    {phase.metrics.map((field) => {
                      const value = previousAttempt.methodLog.phases[phase.phaseId]?.[field] ?? "";
                      const recorded = value !== "";
                      const optionalBlank = !recorded && !phase.requiredMetrics.includes(field);
                      const targetComparison = previousAttempt.derived.targetComparisons[phase.phaseId][field];
                      return (
                        <div key={field} className={optionalBlank ? "flex flex-wrap justify-between gap-x-3" : undefined}>
                          <dt>{t(recordedMetricLabels[field])}</dt>
                          <dd className={optionalBlank ? undefined : "font-semibold text-[#D7DDD7]"}>{!recorded ? t(optionalBlank ? "Not recorded" : "Measurement not recorded")
                            : field === "reps" ? value : t("{value} s", { value })}</dd>
                          {recorded ? <dd>{t(comparisonLabels[targetComparison])}{" · "}{t("Target: {target}", {
                            target: field === "reps" ? formatTarget(phase.targets[field]) : t("{value} s", { value: formatTarget(phase.targets[field]) }),
                          })}</dd> : null}
                        </div>
                      );
                    })}
                  </dl>
                  {machineAssistance && <p>{t("Recorded assistance")} · {assistanceLabel(t, previousAttempt.methodLog.phases[phase.phaseId]?.assistance)}</p>}
                  {previousAttempt.derived.numericComplete === false ? <p>{t("Required measurement missing")}</p> : null}
                  {previousAttempt.derived.status === "performed" && previousAttempt.methodLog.phases[phase.phaseId]?.[requiredMetric] === "0"
                    ? <p>{t("A confirmed attempt can have a zero result. The target remains separate.")}</p> : null}
                  <div className="border-t border-[#2A3138] pt-2">
                    <p className="font-semibold text-[#D7DDD7]">{t("Base set")}</p>
                    {machineAssistance && <p>{t("Saved base values may include carry-over.")}</p>}
                    <dl className="mt-1 space-y-1">
                      {[["weight", machineAssistance ? "Assistance (kg)" : "Kg"], ["reps", "Reps"], ["rir", "RIR"]].map(([field, label]) => (
                        <div key={field} className="flex flex-wrap justify-between gap-x-3">
                          <dt>{t(label)}</dt><dd className={previousAttempt.baseSet[field] === "" ? undefined : "font-semibold text-[#D7DDD7]"}>{previousAttempt.baseSet[field] === ""
                            ? t("Not recorded") : previousAttempt.baseSet[field]}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-2">{t(previousAttempt.baseSet.isDone ? "Base set marked performed" : "Base set not marked performed")}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : <p className="text-sm leading-6 text-[#AAB2BA]">{t("Method logging unavailable")}</p>}
      </div>
    </section>
  );
}
