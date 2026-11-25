import { useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { isValidMethodMetricValue } from "../../utils/runtime/advancedMethodValidation.js";

const fields = ["loadKg", "reps"];
const fieldLabels = { loadKg: "Actual load (kg)", reps: "Actual reps" };
const dropStatusLabels = {
  unknown: "Not recorded", skipped: "Skipped", draft: "Not confirmed", partial: "In progress",
};
const buttonClass = "min-h-11 touch-manipulation rounded-lg border border-[#3A434C] px-3 py-2 text-sm font-semibold leading-5 text-[#D7DDD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] disabled:opacity-50";

function dropTitle(t, index, total) {
  return t("Drop {step}/{total}", { step: index + 1, total });
}

function attemptStatus(t, phases, record, status) {
  if (status === "performed") {
    const count = phases.findIndex(({ phaseId }) => phaseId === record.endPhaseId) + 1;
    return t("Completed · {count}/{total}", { count, total: phases.length });
  }
  return t(dropStatusLabels[status]);
}

function DropMeasurements({ entry }) {
  const { t } = useTranslation();
  return (
    <dl className="grid grid-cols-2 gap-2 text-xs leading-5 text-[#AAB2BA]">
      {fields.map((field) => (
        <div key={field} className="min-w-0">
          <dt>{t(fieldLabels[field])}</dt>
          <dd className="font-semibold text-[#F3F5F1]">{entry[field] ? entry[field] : t("Not recorded")}</dd>
        </div>
      ))}
    </dl>
  );
}

function DropEditor({ phaseId, title, entry, last, editing, onChange, acceptClick, onDone, onCancel, loadGuidanceId }) {
  const { t } = useTranslation();
  const id = useId();
  const inputs = useRef({});
  const [draft, setDraft] = useState({});
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const values = { loadKg: (draft.loadKg ?? entry?.loadKg ?? "").replace(",", "."), reps: draft.reps ?? entry?.reps ?? "" };
  const invalid = fields.find((field) => !isValidMethodMetricValue(field, values[field]));
  const empty = values.loadKg === "" && values.reps === "";

  function saveMeasurements() {
    if (invalid) {
      inputs.current[invalid]?.focus({ preventScroll: true });
      return false;
    }
    for (const field of fields) {
      if (values[field] !== (entry?.[field] ?? "")) onChange({ type: "set-metric", phaseId, field, value: values[field] });
    }
    setDraft({});
    return true;
  }

  function confirm(event, finish) {
    if (invalid) {
      inputs.current[invalid]?.focus({ preventScroll: true });
      return;
    }
    if ((empty && !confirmEmpty) || !acceptClick(event)) return;
    saveMeasurements();
    // Keep the metric edits and confirmation in the same click. Blur never
    // commits data or moves controls while a tap is being resolved.
    onChange(finish ? { type: "finish-dropset", phaseId } : { type: "set-execution", phaseId, execution: "performed" });
    onDone();
  }

  return (
    <fieldset data-drop-editor={phaseId} className="min-w-0 space-y-3 rounded-xl border border-[#3A434C] bg-[#171D23] p-3">
      <legend tabIndex={-1} className="px-1 text-sm font-semibold text-[#F4C87F]">{title}</legend>
      {fields.map((field) => {
        const inputId = `${id}-${field}`;
        const description = field === "loadKg" && loadGuidanceId
          ? `${loadGuidanceId} ${inputId}-feedback` : `${inputId}-feedback`;
        const rejected = !isValidMethodMetricValue(field, values[field]);
        const metricError = field === "loadKg" ? t("Enter 0–999.9 kg with up to one decimal place.")
          : t("Use a whole number from 0 to {max}, or leave blank.", { max: 30 });
        return (
          <div key={field}>
            <label htmlFor={inputId} className="flex min-h-11 items-center justify-between gap-2 text-sm text-[#D7DDD7]">
              {t(fieldLabels[field])}
              <input id={inputId} ref={(input) => { inputs.current[field] = input; }} name={field}
                type="text" inputMode={field === "loadKg" ? "decimal" : "numeric"} autoComplete="off"
                value={draft[field] ?? entry?.[field] ?? ""} aria-invalid={rejected || undefined} aria-describedby={description}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((previous) => ({ ...previous, [field]: value }));
                  setConfirmEmpty(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    if (!event.repeat) saveMeasurements();
                  }
                }}
                className="h-11 w-20 shrink-0 rounded-lg border border-[#3A434C] bg-[#13181D] px-2 text-center text-base tabular-nums text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] aria-invalid:border-[#F1B864]" />
            </label>
            <p id={`${inputId}-feedback`} role="status" className={`text-xs leading-5 ${rejected ? "text-[#F4C87F]" : "text-[#AAB2BA]"}`}>
              {rejected ? metricError : values[field] === "" ? t("Not recorded") : ""}
            </p>
          </div>
        );
      })}
      {!editing && empty && (
        <label className="flex min-h-11 items-center gap-3 text-sm leading-5 text-[#D7DDD7]">
          <input type="checkbox" checked={confirmEmpty} onChange={(event) => setConfirmEmpty(event.target.checked)}
            className="h-4 w-4 shrink-0 accent-[#F1B864] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8F36B]" />
          {t("I attempted this drop without recording measurements.")}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {editing ? (
          <>
            <button type="button" className={buttonClass} onClick={() => { if (saveMeasurements()) onDone(); }}>{t("Save measurements")}</button>
            <button type="button" className={buttonClass} onClick={onCancel}>{t("Cancel")}</button>
          </>
        ) : (
          <>
            {!last && <button type="button" data-drop-action="continue" disabled={empty && !confirmEmpty}
              className={buttonClass} onClick={(event) => confirm(event, false)}>{t("Save and continue")}</button>}
            <button type="button" data-drop-action="finish" disabled={empty && !confirmEmpty}
              className={`${buttonClass} border-[#F1B864]/60 bg-[#F1B864]/10`} onClick={(event) => confirm(event, true)}>{t("Finish Dropset")}</button>
          </>
        )}
      </div>
    </fieldset>
  );
}

export default function DropsetMethodPanel({ definition, record, derived, setIndex, editable, onChange, previousAttempt, loadGuidance }) {
  const { t } = useTranslation();
  const id = useId();
  const panel = useRef(null);
  const lastActivation = useRef(-Infinity);
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { phases, reductionPercent } = definition;
  const loadGuidanceId = loadGuidance ? `${id}-load` : undefined;
  const available = editable && derived.valid;
  const skipped = derived.status === "skipped";
  const end = phases.findIndex(({ phaseId }) => phaseId === record?.endPhaseId);
  const pending = phases.findIndex(({ phaseId }) => record?.phases?.[phaseId]?.execution !== "performed");
  const active = end < 0 ? (pending < 0 ? phases.length - 1 : pending) : -1;
  const activePhase = phases[active];
  const summary = available ? attemptStatus(t, phases, record, derived.status) : t("Method logging unavailable");

  function focusStep() {
    requestAnimationFrame(() => {
      const next = panel.current?.querySelector("[data-drop-editor]:not([hidden] *) legend") ?? panel.current?.firstElementChild;
      next?.focus();
    });
  }

  function acceptClick(event) {
    // A second tap can land on a different control after the editor advances.
    if (event.timeStamp - lastActivation.current < 350) return false;
    lastActivation.current = event.timeStamp;
    return true;
  }

  return (
    <section ref={panel} className="min-w-0 border-t border-[#2A3138] px-3.5" data-method-set={setIndex} data-dropset>
      <button type="button" aria-expanded={open} aria-controls={`${id}-body`} onClick={() => setOpen(!open)}
        className="flex min-h-14 w-full items-center justify-between gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8F36B]">
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#F4C87F]">{t("Dropset log · Set {set}", { set: setIndex })}</span>
          <span data-method-summary role="status" className="mt-1 block text-xs text-[#AAB2BA]">{summary}</span>
        </span>
        <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 text-[#AAB2BA] ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={`${id}-body`} hidden={!open} className="space-y-3 pb-4">
        {available ? (
          <>
            <p className="text-xs leading-5 text-[#AAB2BA]">{t("Dropset is optional and does not change main-set Done. Stop early if form declines.")}</p>
            <div hidden={skipped} className="space-y-3">
              {loadGuidance && <p id={loadGuidanceId} className="text-xs leading-5 text-[#AAB2BA]">{loadGuidance}</p>}
              {reductionPercent && <p className="text-xs leading-5 text-[#AAB2BA]">
                {t(loadGuidance
                  ? "As a guide, reduce the preceding recorded load by about {percent}% each time. Use the main set load for the first drop."
                  : "As a guide, reduce the preceding actual load by about {percent}% each time. Use the main set load for the first drop.",
                { percent: reductionPercent })}
              </p>}
              {phases.map(({ phaseId }, index) => {
                const entry = record?.phases[phaseId];
                if (entry?.execution !== "performed" || index === active) return null;
                const title = dropTitle(t, index, phases.length);
                return (
                  <div key={phaseId} className="space-y-2 rounded-lg border border-[#2A3138] px-3 py-2" data-drop-summary={phaseId}>
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h3 className="text-sm font-semibold text-[#D7DDD7]">{title}</h3>
                      <button type="button" data-drop-edit={phaseId} aria-label={t("Edit {drop}", { drop: title })}
                        disabled={editing !== null} className={buttonClass}
                        onClick={() => { setEditing(phaseId); focusStep(); }}>{t("Edit")}</button>
                    </div>
                    <DropMeasurements entry={entry} />
                  </div>
                );
              })}
              {editing && (
                <DropEditor key={editing} phaseId={editing} title={t("Edit {drop}", { drop: dropTitle(t, phases.findIndex(({ phaseId }) => phaseId === editing), phases.length) })}
                  entry={record.phases[editing]} editing loadGuidanceId={loadGuidanceId} onChange={onChange} onCancel={() => { setEditing(null); focusStep(); }}
                  onDone={() => { setEditing(null); focusStep(); }} />
              )}
              {activePhase && (
                <div hidden={editing !== null}>
                  <p className="mb-2 text-xs leading-5 text-[#AAB2BA]">{t("Log what you actually did. Leave unknown measurements blank.")}</p>
                  <DropEditor key={activePhase.phaseId} phaseId={activePhase.phaseId} title={dropTitle(t, active, phases.length)}
                    entry={record?.phases[activePhase.phaseId]} last={active === phases.length - 1} loadGuidanceId={loadGuidanceId}
                    onChange={onChange} acceptClick={acceptClick} onDone={focusStep} />
                </div>
              )}
              {end >= 0 && end < phases.length - 1 && editing === null && (
                <button type="button" data-drop-action="extend" className={buttonClass} onClick={(event) => {
                  if (!acceptClick(event)) return;
                  onChange({ type: "extend-dropset", phaseId: record.endPhaseId });
                  focusStep();
                }}>{t("Extend Dropset")}</button>
              )}
            </div>
            {skipped && <p className="text-xs leading-5 text-[#AAB2BA]">{t("Resume restores your entries and their previous confirmation.")}</p>}
            <button type="button" data-drop-action="skip" className={buttonClass}
              onClick={(event) => { if (acceptClick(event)) onChange({ type: "set-choice", choice: skipped ? "record" : "skip" }); }}>
              {t(skipped ? "Resume recording" : "Skip method")}
            </button>
            {previousAttempt && (
              <div className="border-t border-[#2A3138] pt-1" data-method-history>
                <button type="button" aria-expanded={historyOpen} aria-controls={`${id}-history`}
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="min-h-11 w-full py-2 text-left text-xs font-semibold leading-5 text-[#D7DDD7] focus-visible:ring-2 focus-visible:ring-[#B8F36B]">
                  {t(loadGuidance ? "Previous recorded attempt · Cycle {cycle}" : "Previous comparable attempt · Cycle {cycle}",
                    { cycle: previousAttempt.cycleNumber })}
                </button>
                <div id={`${id}-history`} hidden={!historyOpen} className="space-y-2 text-xs">
                  {loadGuidance && <p className="leading-5 text-[#AAB2BA]">
                    {t("Compare kg only on the same machine and using the same logging convention.")}
                  </p>}
                  <p className="text-[#AAB2BA]">{attemptStatus(t, phases, previousAttempt.methodLog, previousAttempt.derived.status)}</p>
                  {phases.map(({ phaseId }, index) => {
                    const entry = previousAttempt.methodLog.phases[phaseId];
                    if (!entry || (entry.execution === "unconfirmed" && !entry.loadKg && !entry.reps)) return null;
                    return (
                      <div key={phaseId} className="border-l border-[#3A434C] pl-3" data-drop-history={phaseId}>
                        <p className="font-semibold text-[#D7DDD7]">{dropTitle(t, index, phases.length)}</p>
                        {entry.execution !== "performed" && <p className="text-[#AAB2BA]">{t(entry.execution === "partial" ? "Partially performed" : "Not confirmed")}</p>}
                        <DropMeasurements entry={entry} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : <p className="text-sm text-[#AAB2BA]">{summary}</p>}
      </div>
    </section>
  );
}
