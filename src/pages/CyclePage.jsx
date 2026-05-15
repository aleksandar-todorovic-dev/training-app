import { useParams } from "react-router-dom";

import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import DayCard from "../components/cycle/DayCard";
import CycleHeader from "../components/cycle/CycleHeader";

import { getPlanById } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import { UI_STACK_LG } from "../styles/ui";

const STATIC_DAY_STATUS_MAP = {
  d1: "Completed 7/7",
  d2: "Completed 5/7",
  d3: "Not started",
  d4: "Not started",
  d5: "Not started",
  d6: "Not started",
};

const STATIC_CORE_HINT_MAP = {
  d2: "Core A",
  d4: "Core B",
  d5: "Core C",
};

const STATIC_DAY_DETAIL_HINT_MAP = {
  "bulk-pro": {
    d1: "Includes shoulder top-up",
    d2: "Includes trap top-up",
    d3: "Includes hamstring and calf support",
    d4: "Includes trap work",
    d5: "Includes triceps support",
    d6: "Includes quad, arm, and calf support",
  },
  "cut-pro": {
    d1: "Includes shoulder top-up",
    d2: "Includes trap top-up",
    d3: "Includes hamstring spark and calf support",
    d4: "Includes trap work",
    d5: "Includes triceps support",
    d6: "Includes quad, arm, and calf support",
  },
};

export default function CyclePage() {
  const { planId } = useParams();

  const { state } = useAppState();
  const plan = getPlanById(planId);
  const days = getDaysByPlanId(planId);

  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber ?? 1;
  const currentCycle = planProgress?.cycles?.[currentCycleNumber] ?? null;
  const currentDayId = currentCycle?.currentDayId ?? "d1";

  if (!plan) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to={`/plan/${planId}`}>
              Back to Plan Overview
            </BackButton>
          </div>

          <CycleHeader
            planName="Plan not found"
            cycleLabel=""
            statusSummary="The selected plan could not be loaded."
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <div className="flex justify-start">
          <BackButton to="/">Back to Home</BackButton>
        </div>

        <CycleHeader
          planName={plan.name}
          cycleLabel={`Cycle ${currentCycleNumber}`}
          statusSummary={`Current day: ${currentDayId.toUpperCase()}`}
        />

        {days.map((day) => (
          <DayCard
            key={day.id}
            planId={planId}
            day={day}
            status={STATIC_DAY_STATUS_MAP[day.id] ?? "Not started"}
            coreHint={STATIC_CORE_HINT_MAP[day.id] ?? null}
            detailHint={STATIC_DAY_DETAIL_HINT_MAP[planId]?.[day.id] ?? null}
          />
        ))}
      </div>
    </AppShell>
  );
}
