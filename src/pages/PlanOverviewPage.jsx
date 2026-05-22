import { useParams } from "react-router-dom";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import { getPlanById } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import { UI_ACTION_ROW, UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

const TRAINING_DAY_ORDER_LABELS_BY_PLAN = {
  "bulk-pro": {
    d1: "Chest & Triceps with Shoulder Top-up",
    d2: "Back & Biceps with Trap Top-up",
    d3: "Quads Heavy with Hamstring and Calf Support",
    d4: "Shoulders & Arms Light with Trap Work",
    d5: "Chest Pump & Rows with Triceps Support",
    d6: "Posterior Chain with Quad, Arm, and Calf Support",
  },
  "cut-pro": {
    d1: "Chest & Triceps with Shoulder Top-up",
    d2: "Back & Biceps with Trap Top-up",
    d3: "Quads Heavy with Hamstring Spark and Calf Support",
    d4: "Shoulders & Arms Light with Trap Work",
    d5: "Chest Pump & Rows with Triceps Support",
    d6: "Posterior Chain with Quad, Arm, and Calf Support",
  },
};

export default function PlanOverviewPage() {
  const { planId } = useParams();
  const { state, dispatch } = useAppState();
  const plan = getPlanById(planId);
  const days = getDaysByPlanId(planId);

  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber;
  const currentCycle = currentCycleNumber
    ? planProgress?.cycles?.[currentCycleNumber]
    : null;

  const primaryCta = !currentCycle
    ? {
        mode: "start",
        label: "Start cycle",
        to: plan ? `/plan/${plan.id}/cycle` : `/plan/${planId}/cycle`,
      }
    : currentCycle.completedAt
      ? {
          mode: "review",
          label: "Review cycle",
          to: plan ? `/plan/${plan.id}/end-cycle` : `/plan/${planId}/end-cycle`,
        }
      : {
          mode: "continue",
          label: "Continue cycle",
          to: plan ? `/plan/${plan.id}/cycle` : `/plan/${planId}/cycle`,
        };

  const dayOrderLabels = TRAINING_DAY_ORDER_LABELS_BY_PLAN[planId] ?? {};

  const trainingDayOrder = [
    `${days[0]?.label} — ${dayOrderLabels[days[0]?.id] ?? days[0]?.name}`,
    `${days[1]?.label} — ${dayOrderLabels[days[1]?.id] ?? days[1]?.name}`,
    "Rest / light recovery",
    `${days[2]?.label} — ${dayOrderLabels[days[2]?.id] ?? days[2]?.name}`,
    `${days[3]?.label} — ${dayOrderLabels[days[3]?.id] ?? days[3]?.name}`,
    "Rest / light recovery",
    `${days[4]?.label} — ${dayOrderLabels[days[4]?.id] ?? days[4]?.name}`,
    `${days[5]?.label} — ${dayOrderLabels[days[5]?.id] ?? days[5]?.name}`,
    "Rest / light recovery",
  ];

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

  function handlePrimaryCtaClick() {
    if (primaryCta.mode !== "start") {
      return;
    }

    dispatch({
      type: APP_ACTIONS.START_PLAN_CYCLE,
      payload: {
        planId: plan.id,
        startedAt: new Date().toISOString(),
      },
    });
  }

  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <div className="flex items-center justify-between gap-3">
          <BackButton to="/">Back to Home</BackButton>

          <SecondaryButton to={`/plan/${plan.id}/guide`}>
            View guide
          </SecondaryButton>
        </div>

        <ScreenHeader title={plan.name} subtitle={plan.goal} />

        <SectionCard>
          <div className={UI_STACK_LG}>
            <p className={UI_TEXT_MUTED}>{plan.intro}</p>
          </div>
        </SectionCard>

        <SectionCard>
          <div className={UI_STACK_LG}>
            <h2 className="text-lg font-semibold text-zinc-100">
              Training system
            </h2>

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
              {trainingDayOrder.map((item, index) => (
                <p key={`${item}-${index}`} className={UI_TEXT_MUTED}>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <div className={UI_ACTION_ROW}>
            <PrimaryButton to={primaryCta.to} onClick={handlePrimaryCtaClick}>
              {primaryCta.label}
            </PrimaryButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
