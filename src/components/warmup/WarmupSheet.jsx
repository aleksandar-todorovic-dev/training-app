import { useRef } from "react";
import { motion } from "motion/react";

import SecondaryButton from "../common/SecondaryButton";
import useDialogFocus from "../common/useDialogFocus";
import WarmupStepsCard from "./WarmupStepsCard";
import {
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
  UI_SHEET_OVERLAY,
  UI_SHEET_PANEL,
} from "../../styles/ui";
import {
  sheetOverlayVariants,
  sheetPanelVariants,
} from "../../styles/motion";

const MotionDiv = motion.div;

/** Warm-up is local guidance only and never changes workout progress. */
export default function WarmupSheet({ dayDetails, warmup, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useDialogFocus({ dialogRef, initialFocusRef: closeButtonRef, onClose });

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
        ref={dialogRef}
        tabIndex={-1}
        className={UI_SHEET_PANEL}
        variants={sheetPanelVariants}
        role="dialog"
        aria-modal="true"
        aria-labelledby="warmup-sheet-title"
        aria-describedby="warmup-sheet-purpose"
      >
        <header className={UI_SHEET_HEADER}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9A6418]">
                Warm-up / {dayDetails.label}
              </p>
              <h2
                id="warmup-sheet-title"
                className="mt-2 font-display text-3xl font-bold uppercase leading-none text-[#191A16]"
              >
                Prepare, don&apos;t perform
              </h2>
              <p className="mt-2 text-sm font-medium text-[#5F6158]">
                {dayDetails.name} · 3–8 min
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close warm-up guidance"
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#9F9889] text-xl text-[#4E5048] transition-colors hover:bg-[#E4DECF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <p
            id="warmup-sheet-purpose"
            className="mt-4 border-l-2 border-[#E5A13A] pl-3 text-sm font-medium leading-6 text-[#363831]"
          >
            {warmup.goal}
          </p>
        </header>

        <div className={UI_SHEET_BODY}>
          <WarmupStepsCard steps={warmup.steps} />

          <aside className="mt-5 border-y border-[#C9C1AF] bg-[#E7E1D2]/65 px-3 py-3">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#9A6418]">
              Coach reminder
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[#4E5048]">
              Warm up to feel ready, not tired. Keep ramp sets clean and save
              the real effort for working sets.
            </p>
          </aside>
        </div>

        <footer className={UI_SHEET_FOOTER}>
          <SecondaryButton
            variant="product"
            onClick={onClose}
            className="w-full"
          >
            Done warming up
          </SecondaryButton>
        </footer>
      </MotionDiv>
    </MotionDiv>
  );
}
