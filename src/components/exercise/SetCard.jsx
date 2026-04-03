import SectionCard from "../layout/SectionCard";
import SecondaryButton from "../common/SecondaryButton";
import { UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

function SetInfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className={UI_TEXT_MUTED}>{label}</span>
      <span className="text-right font-medium text-zinc-100">{value}</span>
    </div>
  );
}

export default function SetCard({ setNumber, weight, reps, rir }) {
  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-zinc-100">
            Set {setNumber}
          </h3>

          <SecondaryButton type="button">Done</SecondaryButton>
        </div>

        <SetInfoRow label="Weight" value={weight} />
        <SetInfoRow label="Reps" value={reps} />
        <SetInfoRow label="RIR" value={rir} />
      </div>
    </SectionCard>
  );
}
