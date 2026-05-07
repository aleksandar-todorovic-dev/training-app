import SectionCard from "../layout/SectionCard";
import PrimaryButton from "../common/PrimaryButton";
import { UI_STACK_MD, UI_TITLE, UI_TEXT_MUTED } from "../../styles/ui";

export default function PlanCard({ plan }) {
  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <div className={UI_STACK_MD}>
          <h2 className={UI_TITLE}>{plan.name}</h2>
          <p className="text-sm font-medium text-zinc-200">Goal: {plan.goal}</p>
        </div>

        <p className={UI_TEXT_MUTED}>{plan.shortDescription}</p>
        <p className={UI_TEXT_MUTED}>For: {plan.audience}</p>
        <p className={UI_TEXT_MUTED}>Cycle: {plan.cycleLabel}</p>

        <PrimaryButton to={`/plan/${plan.id}`}>Open plan</PrimaryButton>
      </div>
    </SectionCard>
  );
}
