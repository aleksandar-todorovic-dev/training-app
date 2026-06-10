import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/85 px-4 pb-4 pt-10 backdrop-blur-sm">
      <div className="flex h-[88vh] max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50">
        <header className="shrink-0 border-b border-zinc-800/80 px-5 py-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
                Finish day
              </p>

              <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-zinc-50">
                Close training day?
              </h2>

              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                {dayDetails.label} - {dayDetails.name}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_22px_rgba(103,232,249,0.08)]">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          <p className="mt-3 border-l border-cyan-300/35 pl-3 text-sm leading-relaxed text-zinc-400">
            {progressText}. Closing this day moves the cycle forward.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-4">
          <div className="flex flex-col gap-4">
            <section>
              <h3 className="text-sm font-semibold text-zinc-100">
                Before you finish
              </h3>

              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                Checked sets count as performed. Unchecked sets are simply not
                performed, not missing data.
              </p>

              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Partial days are valid. The app keeps the cycle order stable.
              </p>
            </section>

            {hasWarnings ? (
              <section className="border-t border-amber-300/20 pt-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-300/25 bg-amber-300/10 text-amber-200">
                    <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300/80">
                      {warningTitle}
                    </p>

                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                      {warningText}
                    </p>

                    {!hasNoLoggedValues && warningDetails.length ? (
                      <ul className="mt-2 flex flex-col gap-1 text-sm leading-relaxed text-zinc-500">
                        {warningDetails.map((detail) => (
                          <li key={detail}>• {detail}</li>
                        ))}
                      </ul>
                    ) : null}

                    <p className="mt-2 text-sm font-semibold text-amber-100">
                      You can still finish the day.
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <section className="border-t border-cyan-300/20 pt-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                      Ready to close
                    </p>

                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                      Your logged work is saved for this day.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {hasCoreBlock ? (
              <section className="border-t border-violet-500/25 pt-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-400/35 bg-violet-500/15 text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Core is tracked separately
                    </h3>

                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                      Main work and core work stay separate in your recap.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <footer className="shrink-0 border-t border-zinc-800/80 bg-zinc-950/95 px-5 py-3.5">
          <button
            type="button"
            onClick={onConfirmFinish}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-cyan-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200"
          >
            Finish and move on
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-2.5 inline-flex min-h-10 w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 text-sm font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            Keep logging
          </button>
        </footer>
      </div>
    </div>
  );
}
