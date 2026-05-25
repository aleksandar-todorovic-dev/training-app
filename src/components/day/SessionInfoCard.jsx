import SectionCard from "../layout/SectionCard";
import SecondaryButton from "../common/SecondaryButton";
import { UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

/**
 * Displays day-level session guidance.
 *
 * Runtime note:
 * Warm-up opens as local guidance from DayPage and does not affect completion.
 */
export default function SessionInfoCard({ sessionInfo, onWarmupClick }) {
  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <div className={UI_STACK_MD}>
          <h2 className="text-base font-semibold text-slate-100">
            Session info
          </h2>

          <div className={UI_STACK_MD}>
            <div className={UI_STACK_MD}>
              <p className="text-sm font-medium text-slate-200">Day RIR rule</p>
              <p className={UI_TEXT_MUTED}>{sessionInfo.rirRule}</p>
            </div>

            <div className={UI_STACK_MD}>
              <p className="text-sm font-medium text-slate-200">
                Advanced techniques
              </p>
              <p className={UI_TEXT_MUTED}>{sessionInfo.advancedTechniques}</p>
            </div>
          </div>
        </div>

        <SecondaryButton onClick={onWarmupClick}>View warm-up</SecondaryButton>
      </div>
    </SectionCard>
  );
}
