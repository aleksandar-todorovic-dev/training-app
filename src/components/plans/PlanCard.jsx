import SectionCard from "../layout/SectionCard";
import PrimaryButton from "../common/PrimaryButton";
import { UI_STACK_MD, UI_TITLE, UI_TEXT_MUTED } from "../../styles/ui";

export default function PlanCard({ plan }) {
  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <div className={UI_STACK_MD}>
          <h2 className={UI_TITLE}>{plan.name}</h2>
          <p className="text-sm font-medium text-zinc-200">{plan.goal}</p>
        </div>

        <p className={UI_TEXT_MUTED}>{plan.shortDescription}</p>
        <p className={UI_TEXT_MUTED}>{plan.audience}</p>
        <p className={UI_TEXT_MUTED}>{plan.cycleLabel}</p>

        <PrimaryButton to={`/plan/${plan.id}`}>Open {plan.name}</PrimaryButton>
      </div>
    </SectionCard>
  );
}
