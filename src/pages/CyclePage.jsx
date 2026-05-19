import { useParams } from "react-router-dom";

import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import DayCard from "../components/cycle/DayCard";
import CycleHeader from "../components/cycle/CycleHeader";
import PrimaryButton from "../components/common/PrimaryButton";

import { getPlanById } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import { UI_STACK_LG } from "../styles/ui";
import { getDayDetails } from "../data/dayDetails";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";

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

  // Show whether the active cycle is still moving or already finished.
  const cycleStatusSummary = currentCycle?.completedAt
    ? "Cycle finished"
    : `Current day: ${currentDayId.toUpperCase()}`;

  // Derive Cycle screen day-card status from runtime logs and the active day pointer.
  function getDayCardStatus(day) {
    const dayDetails = getDayDetails(planId, day.id);
    const dayLog = currentCycle?.dayLogs?.[day.id];

    const totalExerciseCount = dayLog
      ? Object.keys(dayLog.mainExerciseLogs).length
      : (dayDetails?.exerciseIds.length ?? 0);

    const completedExerciseCount = dayLog
      ? Object.values(dayLog.mainExerciseLogs).filter(
          (exerciseLog) => getExerciseStatus(exerciseLog) === "complete",
        ).length
      : 0;

    const progressLabel = `${completedExerciseCount}/${totalExerciseCount} completed`;

    if (dayLog?.finishedAt) {
      return `Finished · ${progressLabel}`;
    }

    if (day.id === currentDayId) {
      return `Current · ${progressLabel}`;
    }

    if (dayLog) {
      return `In progress · ${progressLabel}`;
    }

    return "Not started";
  }

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
          statusSummary={cycleStatusSummary}
        />

        {currentCycle?.completedAt ? (
          <PrimaryButton to={`/plan/${planId}/end-cycle`}>
            Review cycle
          </PrimaryButton>
        ) : null}

        {days.map((day) => (
          <DayCard
            key={day.id}
            planId={planId}
            day={day}
            status={getDayCardStatus(day)}
            coreHint={STATIC_CORE_HINT_MAP[day.id] ?? null}
            detailHint={STATIC_DAY_DETAIL_HINT_MAP[planId]?.[day.id] ?? null}
          />
        ))}
      </div>
    </AppShell>
  );
}
