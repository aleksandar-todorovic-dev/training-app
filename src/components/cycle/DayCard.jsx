import SectionCard from "../layout/SectionCard";
import PrimaryButton from "../common/PrimaryButton";
import { UI_ACTION_ROW, UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

export default function DayCard({ planId, day, status, coreHint, detailHint }) {
  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <div className={UI_STACK_MD}>
          <h3 className="text-base font-semibold text-slate-100">
            {day.label} — {day.name}
          </h3>

          {/* Detail and core hints stay muted so the day title remains the main scan target. */}
          {detailHint || coreHint ? (
            <p className={UI_TEXT_MUTED}>
              {detailHint}
              {detailHint && coreHint ? " · " : ""}
              {coreHint}
            </p>
          ) : null}

          <p className={UI_TEXT_MUTED}>Status: {status}</p>
        </div>

        <div className={UI_ACTION_ROW}>
          <PrimaryButton to={`/plan/${planId}/day/${day.id}`}>
            Open day
          </PrimaryButton>
        </div>
      </div>
    </SectionCard>
  );
}
