import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";
import { UI_TEXT_MUTED, UI_TITLE } from "../../styles/ui";

export default function FinishDaySheet({
  dayDetails,
  progressText,
  hasCoreBlock = false,
  onClose,
  onConfirmFinish,
}) {
  if (!dayDetails) return null;

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
                This confirmation will later decide whether the day was
                completed fully or partially.
              </p>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                For now, use it as the final checkpoint before leaving this
                training day.
              </p>
            </section>

            <section className="space-y-2 border-t border-zinc-800 pt-5">
              <h3 className="text-sm font-semibold text-zinc-100">
                Partial days are okay
              </h3>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                A partial day will not break the cycle. The app is designed to
                keep the training order stable and help you continue from the
                next meaningful step.
              </p>
            </section>

            {hasCoreBlock ? (
              <section className="space-y-2 border-t border-zinc-800 pt-5">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Core is separate
                </h3>

                <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                  Core work is tracked separately from the main exercise count.
                  Finishing the training day should not force core to behave
                  like a regular exercise.
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
