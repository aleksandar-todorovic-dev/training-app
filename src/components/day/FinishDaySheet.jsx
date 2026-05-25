import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";
import { UI_TEXT_MUTED, UI_TITLE } from "../../styles/ui";

/**
 * Confirmation sheet for closing the active training day.
 *
 * Runtime note:
 * This component presents finish-day guidance and warning details only.
 * The actual runtime state change is delegated upward through `onConfirmFinish`.
 *
 * Warning note:
 * Missing-value warnings are informational. They do not block finishing the day.
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

  const hasWarnings = missingValueWarningSummary?.hasWarnings;
  const isNoCompletedSetsWarning =
    missingValueWarningSummary?.hasNoCompletedSetsWarning;
  const isBaselineWarning =
    missingValueWarningSummary?.warningType === "baseline";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 px-4 pb-4 pt-10">
      <div className="flex max-h-[88vh] w-full max-w-md flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-zinc-500">
              {dayDetails.label} — {dayDetails.name}
            </p>

            <h2 className={UI_TITLE}>Finish day?</h2>

            <p className={UI_TEXT_MUTED}>{progressText}</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-5">
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-100">
                Before you finish
              </h3>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                Finishing this day closes it for the current cycle and moves the
                plan forward.
              </p>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                Completed set checkboxes decide what was actually performed.
                Unchecked sets are treated as not performed, not as missing
                data.
              </p>
            </section>

            {/* Warnings explain carry-over/baseline consequences but do not block confirmation. */}
            {hasWarnings ? (
              <section className="space-y-3 border-t border-amber-500/20 pt-5">
                <h3 className="text-sm font-semibold text-amber-200">
                  {isNoCompletedSetsWarning
                    ? "No completed sets yet"
                    : isBaselineWarning
                      ? "Baseline warning"
                      : "Carry-over warning"}
                </h3>

                {isNoCompletedSetsWarning ? (
                  <p className="text-sm leading-6 text-zinc-300">
                    {isBaselineWarning
                      ? "No sets are marked as completed for this day. You can still finish it, but this day will not create a useful baseline for future carry-over."
                      : "No sets are marked as completed for this day. You can still finish it as skipped or minimal, but this cycle will not add new carry-over data for this day."}
                  </p>
                ) : (
                  <>
                    <p className="text-sm leading-6 text-zinc-300">
                      {isBaselineWarning
                        ? "Some completed sets are missing values. Reps/time and RIR help create a useful baseline for future cycles."
                        : "Some completed sets are missing values. When possible, empty fields may fall back to the latest valid value from a previous cycle."}
                    </p>

                    {missingValueWarningSummary.missingMainImportantCount >
                    0 ? (
                      <p className="text-sm leading-6 text-zinc-400">
                        Main exercise missing fields:{" "}
                        {missingValueWarningSummary.missingMainImportantCount}{" "}
                        reps or RIR field
                        {missingValueWarningSummary.missingMainImportantCount ===
                        1
                          ? ""
                          : "s"}
                        .
                      </p>
                    ) : null}

                    {missingValueWarningSummary.missingCoreImportantCount >
                    0 ? (
                      <p className="text-sm leading-6 text-zinc-400">
                        Core missing fields:{" "}
                        {missingValueWarningSummary.missingCoreImportantCount}{" "}
                        reps/time or RIR field
                        {missingValueWarningSummary.missingCoreImportantCount ===
                        1
                          ? ""
                          : "s"}
                        .
                      </p>
                    ) : null}

                    {missingValueWarningSummary.missingMainLoadCount > 0 ? (
                      <p className="text-sm leading-6 text-zinc-400">
                        Main weight fields missing:{" "}
                        {missingValueWarningSummary.missingMainLoadCount}. This
                        is only a warning because some work may be bodyweight or
                        unloaded.
                      </p>
                    ) : null}

                    {missingValueWarningSummary.missingCoreLoadCount > 0 ? (
                      <p className="text-sm leading-6 text-zinc-400">
                        Core load fields missing:{" "}
                        {missingValueWarningSummary.missingCoreLoadCount}. This
                        is only a warning because some core work may be
                        unloaded.
                      </p>
                    ) : null}
                  </>
                )}

                <p className="text-sm leading-6 text-zinc-400">
                  You can still finish the day.
                </p>
              </section>
            ) : null}

            <section className="space-y-2 border-t border-zinc-800 pt-5">
              <h3 className="text-sm font-semibold text-zinc-100">
                Partial days are okay
              </h3>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                A partial day will not break the cycle. The app keeps the order
                stable and moves you to the next training day.
              </p>
            </section>

            {hasCoreBlock ? (
              <section className="space-y-2 border-t border-zinc-800 pt-5">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Core is separate
                </h3>

                <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                  Core work is tracked separately from the main exercise count.
                  Finishing the day does not force core to count like a regular
                  exercise.
                </p>
              </section>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-800 p-4">
          <PrimaryButton type="button" onClick={onConfirmFinish}>
            Confirm finish
          </PrimaryButton>

          <SecondaryButton onClick={onClose} className="w-full">
            Keep training
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
