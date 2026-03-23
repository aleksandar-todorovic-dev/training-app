import { useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import { getPlanById } from "../data/plans";
import { UI_ACTION_ROW, UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

export default function PlanOverviewPage() {
  const { planId } = useParams();
  const plan = getPlanById(planId);

  if (!plan) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <BackButton to="/">Back to Home</BackButton>

          <ScreenHeader
            title="Plan not found"
            subtitle="The selected plan could not be loaded."
          />

          <SectionCard>
            <p className={UI_TEXT_MUTED}>
              Check the selected route or return to Home and choose a valid
              plan.
            </p>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <BackButton to="/">Back to Home</BackButton>

        <ScreenHeader title={plan.name} subtitle={plan.goal} />

        <SectionCard>
          <div className={UI_STACK_LG}>
            <p className={UI_TEXT_MUTED}>{plan.intro}</p>
          </div>
        </SectionCard>

        <SectionCard>
          <div className={UI_STACK_LG}>
            <h2 className="text-lg font-semibold text-zinc-100">Core system</h2>

            <div className={UI_ACTION_ROW}>
              {plan.coreSystem.map((item) => (
                <p key={item} className={UI_TEXT_MUTED}>
                  - {item}
                </p>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className={UI_STACK_LG}>
            <h2 className="text-lg font-semibold text-zinc-100">Key rules</h2>

            <div className={UI_ACTION_ROW}>
              {plan.keyRules.map((rule) => (
                <p key={rule} className={UI_TEXT_MUTED}>
                  - {rule}
                </p>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className={UI_STACK_LG}>
            <h2 className="text-lg font-semibold text-zinc-100">
              Training day order
            </h2>

            <div className={UI_ACTION_ROW}>
              {plan.dayOrder.map((dayId) => (
                <p key={dayId} className={UI_TEXT_MUTED}>
                  {dayId.toUpperCase()}
                </p>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className={UI_ACTION_ROW}>
            <PrimaryButton to={`/plan/${plan.id}/cycle`}>
              Open Cycle
            </PrimaryButton>

            <SecondaryButton to={`/plan/${plan.id}/guide`}>
              Open Guide
            </SecondaryButton>

            <SecondaryButton to={`/plan/${plan.id}/end-cycle`}>
              Open End Cycle
            </SecondaryButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
