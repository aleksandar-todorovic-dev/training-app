import { useRef } from "react";
import { motion } from "motion/react";

import PrimaryButton from "../common/PrimaryButton";
import SecondaryButton from "../common/SecondaryButton";
import useDialogFocus from "../common/useDialogFocus";
import {
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
  UI_SHEET_OVERLAY,
  UI_SHEET_PANEL,
} from "../../styles/ui";
import { sheetOverlayVariants, sheetPanelVariants } from "../../styles/motion";

const MotionDiv = motion.div;

function EvidenceRow({ index, label, value, detail }) {
  return (
    <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-3 border-b border-[#D8D1C2] py-3 last:border-b-0">
      <span className="font-display text-sm font-bold text-[#66675E]">
        {index}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#191A16]">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-[#66675E]">{detail}</p>
      </div>
      <strong className="font-display text-lg font-bold tabular-nums text-[#191A16]">
        {value}
      </strong>
    </div>
  );
}

/**
 * Confirms day close intent. Warnings are informational because partial and
 * empty days remain valid cycle evidence.
 */
export default function FinishDaySheet({
  dayDetails,
  nextDayDetails,
  progressText,
  completedExerciseCount = 0,
  totalExerciseCount = 0,
  doneSetCount = 0,
  hasCoreBlock = false,
  missingValueWarningSummary,
  onClose,
  onConfirmFinish,
}) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useDialogFocus({ dialogRef, initialFocusRef: closeButtonRef, onClose });

  if (!dayDetails) return null;

  const warningSummary = missingValueWarningSummary ?? {};
  const hasWarnings = Boolean(warningSummary.hasWarnings);
  const hasNoLoggedValues = Boolean(warningSummary.hasNoCompletedSetsWarning);
  const isBaselineWarning = warningSummary.warningType === "baseline";

  const warningTitle = hasNoLoggedValues
    ? "No performed sets yet"
    : isBaselineWarning
      ? "Baseline has open fields"
      : "Carry-over has open fields";

  const warningText = hasNoLoggedValues
    ? "An empty day is still a valid closed day. Earlier references, if any, remain untouched."
    : isBaselineWarning
      ? "Some performed sets have empty fields. Reps, time, and RIR would make the next baseline more useful."
      : "Some performed sets have empty fields. The next cycle will still use the latest valid field values it can find.";

  const warningDetails = [
    warningSummary.missingMainImportantCount > 0
      ? `Main reps or RIR fields open: ${warningSummary.missingMainImportantCount}`
      : null,
    warningSummary.missingCoreImportantCount > 0
      ? `Core reps/time or RIR fields open: ${warningSummary.missingCoreImportantCount}`
      : null,
    warningSummary.missingMainLoadCount > 0
      ? `Main weight fields open: ${warningSummary.missingMainLoadCount}`
      : null,
    warningSummary.missingCoreLoadCount > 0
      ? `Core load fields open: ${warningSummary.missingCoreLoadCount}`
      : null,
  ].filter(Boolean);

  return (
    <MotionDiv
      className={UI_SHEET_OVERLAY}
      variants={sheetOverlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <MotionDiv
        ref={dialogRef}
        tabIndex={-1}
        className={UI_SHEET_PANEL}
        variants={sheetPanelVariants}
        role="dialog"
        aria-modal="true"
        aria-labelledby="finish-day-sheet-title"
        aria-describedby="finish-day-sheet-summary"
      >
        <header className={UI_SHEET_HEADER}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
                Finish day / {dayDetails.label}
              </p>
              <h2
                id="finish-day-sheet-title"
                className="mt-2 font-display text-3xl font-bold uppercase leading-none text-[#191A16]"
              >
                Close the record and move the marker?
              </h2>
              <p className="mt-2 text-sm font-medium text-[#5F6158]">
                {dayDetails.name}
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close finish-day confirmation"
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#9F9889] text-xl text-[#4E5048] transition-colors hover:bg-[#E4DECF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <p
            id="finish-day-sheet-summary"
            className="mt-4 border-l-2 border-[#FF5A3C] pl-3 text-sm leading-6 text-[#363831]"
          >
            {progressText}. Closing records what happened; it does not require a
            perfect session.
          </p>
        </header>

        <div className={UI_SHEET_BODY}>
          <section className="mb-5" aria-labelledby="finish-day-handoff-title">
            <p
              id="finish-day-handoff-title"
              className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#5F6158]"
            >
              Sequence handoff
            </p>
            <div className="mt-2 grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] items-stretch">
              <div className="border border-[#6E8B63] bg-[#6E8B63]/10 p-3">
                <p className="font-display text-xl font-bold uppercase text-[#38502F]">
                  {dayDetails.label}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#4E5048]">
                  Closed record
                </p>
              </div>
              <div className="flex items-center" aria-hidden="true">
                <span className="h-px w-full bg-[#9F9889]" />
                <span className="h-2 w-2 rotate-45 border-r border-t border-[#9F9889]" />
              </div>
              <div className="border border-[#FF5A3C] bg-[#FF5A3C]/8 p-3">
                <p className="font-display text-xl font-bold uppercase text-[#B33521]">
                  {nextDayDetails?.label ?? "Review"}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#4E5048]">
                  {nextDayDetails?.name ?? "Cycle ready to close"}
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="finish-day-evidence-title">
            <div className="flex items-end justify-between gap-3 border-b border-[#AFA796] pb-2">
              <h3
                id="finish-day-evidence-title"
                className="font-display text-xl font-bold uppercase leading-none text-[#191A16]"
              >
                Evidence to save
              </h3>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#5F6158]">
                Actual work
              </span>
            </div>

            <EvidenceRow
              index="01"
              label="Main exercises fully checked"
              detail="Only performed sets count toward completion."
              value={`${completedExerciseCount}/${totalExerciseCount}`}
            />
            <EvidenceRow
              index="02"
              label="Performed main sets"
              detail="Entered values alone never mark a set done."
              value={doneSetCount}
            />
            {hasCoreBlock ? (
              <EvidenceRow
                index="C"
                label="Core stays separate"
                detail="Its own set and close state remains in the recap."
                value="Branch"
              />
            ) : null}
          </section>

          <section
            className={`mt-5 border-l-4 px-3 py-3 ${
              hasWarnings
                ? "border-[#E5A13A] bg-[#E5A13A]/10"
                : "border-[#6E8B63] bg-[#6E8B63]/10"
            }`}
            aria-live="polite"
          >
            <p
              className={`text-[0.66rem] font-semibold uppercase tracking-[0.16em] ${
                hasWarnings ? "text-[#8A570F]" : "text-[#49623F]"
              }`}
            >
              {hasWarnings ? warningTitle : "Record is ready"}
            </p>
            <p className="mt-1.5 text-sm font-medium leading-6 text-[#363831]">
              {hasWarnings
                ? warningText
                : "The performed work has enough logged context to become useful history."}
            </p>
            {hasWarnings && !hasNoLoggedValues && warningDetails.length ? (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-[#66675E]">
                {warningDetails.map((detail) => (
                  <li key={detail}>— {detail}</li>
                ))}
              </ul>
            ) : null}
            {hasWarnings ? (
              <p className="mt-2 text-sm font-semibold text-[#7A4B09]">
                This is a heads-up, not a blocker.
              </p>
            ) : null}
          </section>

        </div>

        <footer className={UI_SHEET_FOOTER}>
          <PrimaryButton
            variant="product"
            onClick={onConfirmFinish}
            className="w-full"
          >
            Finish {dayDetails.label} and move on
          </PrimaryButton>
          <SecondaryButton
            variant="product"
            onClick={onClose}
            className="mt-2 w-full"
          >
            Keep logging
          </SecondaryButton>
        </footer>
      </MotionDiv>
    </MotionDiv>
  );
}
