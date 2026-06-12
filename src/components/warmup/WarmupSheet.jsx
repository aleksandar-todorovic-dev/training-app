import { motion } from "motion/react";

import SecondaryButton from "../common/SecondaryButton";
import WarmupStepsCard from "./WarmupStepsCard";
import {
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
  UI_SHEET_OVERLAY,
  UI_SHEET_PANEL,
  UI_TEXT_BODY,
  UI_TEXT_BODY_STRONG,
  UI_TEXT_META,
} from "../../styles/ui";
import {
  sheetOverlayVariants,
  sheetPanelVariants,
} from "../../styles/motion";

const MotionDiv = motion.div;

/**
 * Displays the warm-up guidance sheet for the selected day.
 *
 * Runtime note:
 * Warm-up is local guidance only. Opening or closing this sheet does not affect
 * day progress, exercise completion, or cycle state.
 */
export default function WarmupSheet({ dayDetails, warmup, onClose }) {
  if (!warmup) return null;

  return (
    <MotionDiv
      className={UI_SHEET_OVERLAY}
      variants={sheetOverlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <MotionDiv
        className={UI_SHEET_PANEL}
        variants={sheetPanelVariants}
        role="dialog"
        aria-modal="true"
        aria-labelledby="warmup-sheet-title"
      >
        <div className={UI_SHEET_HEADER}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-amber-200">
                Warm-up prep
              </p>

              <h2
                id="warmup-sheet-title"
                className="mt-1.5 text-lg font-semibold leading-tight tracking-tight text-zinc-50"
              >
                {dayDetails.label} warm-up
              </h2>
              <p className={`mt-0.5 ${UI_TEXT_META}`}>{dayDetails.name}</p>
            </div>

            <p className="shrink-0 rounded-full border border-amber-300/18 bg-amber-300/8 px-2 py-0.5 text-xs font-semibold text-amber-100">
              3-8 min
            </p>
          </div>

          <p
            className={`mt-2 border-l border-amber-300/28 pl-3 ${UI_TEXT_BODY_STRONG}`}
          >
            {warmup.goal}
          </p>
        </div>

        <div className={UI_SHEET_BODY}>
          <WarmupStepsCard steps={warmup.steps} />

          <div className="mt-3 border-t border-white/8 pt-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-amber-200">
              Coach reminder
            </p>
            <p className={`mt-1.5 ${UI_TEXT_BODY}`}>
              Warm up to feel ready, not tired. Keep ramp sets clean and save
              the real effort for working sets.
            </p>
          </div>
        </div>

        <div className={UI_SHEET_FOOTER}>
          <SecondaryButton onClick={onClose} className="w-full">
            Done warming up
          </SecondaryButton>
        </div>
      </MotionDiv>
    </MotionDiv>
  );
}
