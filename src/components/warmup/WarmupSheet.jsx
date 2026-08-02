import { Clock3, Flame } from "lucide-react";

import BottomSheet from "../common/BottomSheet";
import SecondaryButton from "../common/SecondaryButton";
import WarmupStepsCard from "./WarmupStepsCard";
import {
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
} from "../../styles/ui";

/**
 * Displays warm-up guidance for the selected day.
 *
 * Runtime note:
 * Warm-up is local guidance only. Opening or closing this sheet does not affect
 * day progress, exercise completion, or cycle state.
 */
export default function WarmupSheet({ dayDetails, warmup, onClose }) {
  if (!warmup) return null;

  return (
    <BottomSheet
      onClose={onClose}
      labelledBy="warmup-sheet-title"
      describedBy="warmup-sheet-description"
      closeLabel="Close warm-up"
    >
      <header className={UI_SHEET_HEADER}>
        <div className="pr-12">
          <div className="flex items-center gap-2 text-[#F1B864]">
            <Flame className="h-4 w-4" aria-hidden="true" />
            <p className="text-[0.67rem] font-semibold uppercase tracking-[0.13em]">
              Warm-up prep
            </p>
          </div>

          <h2
            id="warmup-sheet-title"
            className="mt-3 text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[#F3F5F1]"
          >
            {dayDetails.label} warm-up
          </h2>

          <p className="mt-1.5 text-sm leading-5 text-[#77818B]">
            {dayDetails.name}
          </p>
        </div>

        <div
          id="warmup-sheet-description"
          className="mt-4 grid grid-cols-[1fr_auto] items-start gap-4 border-t border-[#2A3138] pt-4"
        >
          <p className="text-sm leading-6 text-[#AAB2BA]">{warmup.goal}</p>

          <div className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#F1B864]">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            3–8 min
          </div>
        </div>
      </header>

      <div className={UI_SHEET_BODY}>
        <WarmupStepsCard steps={warmup.steps} />

        <section className="mt-5 grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 border-t border-[#2A3138] pt-4">
          <span className="text-sm font-semibold tabular-nums text-[#F1B864]">
            04
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[#E4E8E3]">
              Leave energy for the workout
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#AAB2BA]">
              Warm up until the movement feels ready, not tired. Keep ramp sets
              clean and save the real effort for working sets.
            </p>
          </div>
        </section>
      </div>

      <footer className={UI_SHEET_FOOTER}>
        <SecondaryButton
          variant="performance"
          onClick={onClose}
          className="w-full"
        >
          Done warming up
        </SecondaryButton>
      </footer>
    </BottomSheet>
  );
}
