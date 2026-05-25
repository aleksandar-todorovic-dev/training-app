import SectionCard from "../layout/SectionCard";
import SecondaryButton from "../common/SecondaryButton";
import { UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

/**
 * Displays the Day screen entry point for an optional core block.
 *
 * Runtime note:
 * Core status is shown separately from main exercise progress.
 */
export default function CoreBlockCard({ planId, dayId, coreBlock, status }) {
  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <div className={UI_STACK_MD}>
          <h2 className="text-base font-semibold text-slate-100">
            {coreBlock.name}
          </h2>

          <p className={UI_TEXT_MUTED}>{coreBlock.focus}</p>
          <p className={UI_TEXT_MUTED}>Status: {status}</p>
          <p className={UI_TEXT_MUTED}>{coreBlock.note}</p>
        </div>

        <SecondaryButton
          to={`/plan/${planId}/day/${dayId}/core/${coreBlock.id}`}
        >
          Open
        </SecondaryButton>
      </div>
    </SectionCard>
  );
}
