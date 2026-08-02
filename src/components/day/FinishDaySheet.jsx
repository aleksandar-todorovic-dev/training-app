import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import BottomSheet from "../common/BottomSheet";
import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";
import {
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
} from "../../styles/ui";

/**
 * Confirmation sheet for closing the active training day.
 *
 * Runtime note:
 * This component presents finish-day consequences and informational heads-up
 * details only. The actual state transition remains delegated through
 * `onConfirmFinish`.
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
    ? "No performed sets yet"
    : isBaselineWarning
      ? "Baseline heads-up"
      : "Carry-over heads-up";

  const warningText = hasNoLoggedValues
    ? "You can still close the day. Unchecked work stays unperformed and the cycle continues."
    : isBaselineWarning
      ? "Some performed sets have empty fields. Reps, time, and RIR create a more useful baseline for future cycles."
      : "Some performed sets have empty fields. The next cycle will use the latest valid values it can find.";

  const warningDetails = [
    warningSummary.missingMainImportantCount > 0
      ? `Main reps or RIR fields: ${warningSummary.missingMainImportantCount}`
      : null,
    warningSummary.missingCoreImportantCount > 0
      ? `Core reps/time or RIR fields: ${warningSummary.missingCoreImportantCount}`
      : null,
    warningSummary.missingMainLoadCount > 0
      ? `Main weight fields: ${warningSummary.missingMainLoadCount}`
      : null,
    warningSummary.missingCoreLoadCount > 0
      ? `Core load fields: ${warningSummary.missingCoreLoadCount}`
      : null,
  ].filter(Boolean);

  return (
    <BottomSheet
      onClose={onClose}
      labelledBy="finish-day-sheet-title"
      describedBy="finish-day-sheet-description"
      closeLabel="Keep logging"
    >
      <header className={UI_SHEET_HEADER}>
        <div className="pr-12">
          <div className="flex items-center gap-2 text-[#B8F36B]">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            <p className="text-[0.67rem] font-semibold uppercase tracking-[0.13em]">
              Finish day
            </p>
          </div>

          <h2
            id="finish-day-sheet-title"
            className="mt-3 text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[#F3F5F1]"
          >
            Close training day?
          </h2>

          <p className="mt-1.5 text-sm leading-5 text-[#77818B]">
            {dayDetails.label} · {dayDetails.name}
          </p>
        </div>

        <div
          id="finish-day-sheet-description"
          className="mt-4 border-t border-[#2A3138] pt-4"
        >
          <p className="text-sm font-semibold text-[#E4E8E3]">
            {progressText}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#AAB2BA]">
            Closing records this day as finished and moves the cycle to the next
            planned workout.
          </p>
        </div>
      </header>

      <div className={UI_SHEET_BODY}>
        <section>
          <p className="text-[0.67rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
            What closing means
          </p>

          <div className="mt-3 border-y border-[#2A3138]">
            {[
              "Done sets remain the performed work for this day.",
              "Unchecked sets remain unperformed, not missing.",
              "A partial or empty day does not create a punishment backlog.",
            ].map((item, index) => (
              <div
                key={item}
                className={`grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 py-3.5 ${
                  index > 0 ? "border-t border-[#2A3138]" : ""
                }`}
              >
                <span className="text-sm font-semibold tabular-nums text-[#77818B]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-6 text-[#AAB2BA]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          className={`mt-5 border-l-2 px-4 py-3.5 ${
            hasWarnings
              ? "border-[#F1B864] bg-[#F1B864]/[0.055]"
              : "border-[#79C89A] bg-[#79C89A]/[0.045]"
          }`}
        >
          <div className="flex gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                hasWarnings
                  ? "bg-[#F1B864]/12 text-[#F4C87F]"
                  : "bg-[#79C89A]/12 text-[#79C89A]"
              }`}
            >
              {hasWarnings ? (
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <h3
                className={`text-sm font-semibold ${
                  hasWarnings ? "text-[#F4C87F]" : "text-[#9FD9B5]"
                }`}
              >
                {hasWarnings ? warningTitle : "Ready to close"}
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#C1C7C2]">
                {hasWarnings
                  ? warningText
                  : "Your performed work is saved for this day."}
              </p>

              {!hasNoLoggedValues && warningDetails.length ? (
                <ul className="mt-2 space-y-1 text-xs leading-5 text-[#AAB2BA]">
                  {warningDetails.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : null}

              {hasWarnings ? (
                <p className="mt-2 text-sm font-semibold text-[#F4C87F]">
                  This does not block finishing.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {hasCoreBlock ? (
          <section className="mt-5 flex gap-3 border-t border-[#2A3138] pt-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#A7A2D8]/10 text-[#A7A2D8]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#D8D5EE]">
                Core remains separate
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#AAB2BA]">
                Main work and Core keep their own evidence in the cycle recap.
              </p>
            </div>
          </section>
        ) : null}
      </div>

      <footer className={UI_SHEET_FOOTER}>
        <PrimaryButton
          variant="performance"
          onClick={onConfirmFinish}
          className="w-full gap-2"
        >
          Finish and move on
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </PrimaryButton>

        <SecondaryButton
          variant="performance"
          onClick={onClose}
          className="mt-2 w-full"
        >
          Keep logging
        </SecondaryButton>
      </footer>
    </BottomSheet>
  );
}
