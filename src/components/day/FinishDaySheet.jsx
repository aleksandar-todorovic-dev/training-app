import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import {
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
  UI_SHEET_OVERLAY,
  UI_SHEET_PANEL,
} from "../../styles/ui";

/**
 * Confirmation sheet for closing the active training day.
 *
 * Runtime note:
 * This component presents finish-day guidance and heads-up details only.
 * The actual runtime state change is delegated upward through `onConfirmFinish`.
 *
 * Heads-up note:
 * Missing-value and empty-day messages are informational. They do not block
 * finishing the day because partial and empty closed days are valid.
 */
export default function FinishDaySheet({
  dayDetails,
  progressText,
  hasCoreBlock = false,
  missingValueWarningSummary,
  onClose,
  onConfirmFinish,
}) {
  if (!dayDetails) return null;

  const warningSummary = missingValueWarningSummary ?? {};
  const hasWarnings = Boolean(warningSummary.hasWarnings);
  const hasNoLoggedValues = Boolean(warningSummary.hasNoCompletedSetsWarning);
  const isBaselineWarning = warningSummary.warningType === "baseline";

  const warningTitle = hasNoLoggedValues
    ? "No set values logged yet"
    : isBaselineWarning
      ? "Baseline heads-up"
      : "Carry-over heads-up";

  const warningText = hasNoLoggedValues
    ? "You can still close this day. Earlier valid references may still be used."
    : isBaselineWarning
      ? "Some logged sets have empty fields. Reps, time, and RIR help create a useful baseline for future cycles."
      : "Some logged sets have empty fields. The next cycle will use the latest valid values when it can.";

  const warningDetails = [
    warningSummary.missingMainImportantCount > 0
      ? `Main missing reps or RIR fields: ${warningSummary.missingMainImportantCount}`
      : null,
    warningSummary.missingCoreImportantCount > 0
      ? `Core missing reps/time or RIR fields: ${warningSummary.missingCoreImportantCount}`
      : null,
    warningSummary.missingMainLoadCount > 0
      ? `Main weight fields missing: ${warningSummary.missingMainLoadCount}`
      : null,
    warningSummary.missingCoreLoadCount > 0
      ? `Core load fields missing: ${warningSummary.missingCoreLoadCount}`
      : null,
  ].filter(Boolean);

  return (
    <div className={UI_SHEET_OVERLAY}>
      <div className={UI_SHEET_PANEL}>
        <header className={UI_SHEET_HEADER}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#8FDCE5]">
                Finish day
              </p>

              <h2 className="mt-1.5 text-lg font-semibold leading-tight tracking-tight text-zinc-50">
                Close training day?
              </h2>

              <p className="mt-0.5 text-xs leading-5 text-zinc-500">
                {dayDetails.label} - {dayDetails.name}
              </p>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#3FA8B6]/18 bg-[#10292E]/42 text-[#8FDCE5]">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          <p className="mt-2 rounded-xl border border-[#3FA8B6]/12 bg-[#10292E]/24 px-3 py-2 text-sm leading-5 text-zinc-400">
            {progressText}. Closing this day moves the cycle forward.
          </p>
        </header>

        <div className={UI_SHEET_BODY}>
          <div className="flex flex-col gap-3">
            <section className="rounded-xl bg-white/[0.014] px-3 py-3">
              <h3 className="text-sm font-semibold text-[#F4F7F8]">
                Before you finish
              </h3>

              <ul className="mt-2 space-y-1.5 text-sm leading-5 text-zinc-400">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8FDCE5]/65" />
                  <span>Checked sets count as performed.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8FDCE5]/65" />
                  <span>Unchecked sets stay unperformed, not missing.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8FDCE5]/65" />
                  <span>
                    Partial days are valid and the cycle order stays stable.
                  </span>
                </li>
              </ul>
            </section>

            {hasWarnings ? (
              <section className="rounded-2xl border border-amber-300/16 bg-amber-300/[0.035] px-3 py-3">
                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-300/22 bg-amber-300/8 text-amber-200">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-amber-200">
                      {warningTitle}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-zinc-300">
                      {warningText}
                    </p>

                    {!hasNoLoggedValues && warningDetails.length ? (
                      <ul className="mt-1.5 flex flex-col gap-1 text-sm leading-5 text-zinc-500">
                        {warningDetails.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}

                    <p className="mt-1.5 text-sm font-semibold text-amber-100">
                      You can still finish the day.
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-[#3FA8B6]/14 bg-[#10292E]/22 px-3 py-3">
                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#3FA8B6]/18 bg-[#10292E]/42 text-[#8FDCE5]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#8FDCE5]">
                      Ready to close
                    </p>

                    <p className="mt-1 text-sm leading-5 text-zinc-300">
                      Your logged work is saved for this day.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {hasCoreBlock ? (
              <section className="rounded-2xl border border-white/8 bg-white/[0.014] px-3 py-3">
                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/8 text-violet-200">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#F4F7F8]">
                      Core is tracked separately
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-zinc-400">
                      Main work and core work stay separate in your recap.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <footer className={UI_SHEET_FOOTER}>
          <button
            type="button"
            onClick={onConfirmFinish}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[#5EC7D5] px-4 text-sm font-semibold text-[#031014] transition hover:bg-[#6DD6E2]"
          >
            Finish and move on
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.026] px-4 text-sm font-semibold text-zinc-300 transition hover:border-white/16 hover:bg-white/[0.045]"
          >
            Keep logging
          </button>
        </footer>
      </div>
    </div>
  );
}
