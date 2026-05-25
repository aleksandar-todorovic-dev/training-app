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
import { getDayMode, getDayModeLabel } from "../utils/runtime/dayModeHelpers";

// Display-only hints for Cycle day cards.
// Runtime day order and completion still come from plan data and app state.
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

/**
 * Page-level overview for the active plan cycle.
 *
 * Runtime note:
 * CyclePage reads current cycle progress, derives day-card display labels, and
 * links into day workflows. It does not create or mutate day logs directly.
 */
export default function CyclePage() {
  const { planId } = useParams();

  const { state } = useAppState();
  const plan = getPlanById(planId);
  const days = getDaysByPlanId(planId);

  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber ?? 1;
  const currentCycle = planProgress?.cycles?.[currentCycleNumber] ?? null;
  const currentDayId = currentCycle?.currentDayId ?? "d1";
  const dayOrder = plan?.dayOrder ?? days.map((day) => day.id);

  // Show whether the active cycle is still moving or already finished.
  const cycleStatusSummary = currentCycle?.completedAt
    ? "Cycle finished"
    : `Current day: ${currentDayId.toUpperCase()}`;

  // Derive a display label for each day card from runtime logs and day mode.
  // This is UI summary text only; completion rules stay in runtime helpers.
  function getDayCardStatus(day) {
    const dayDetails = getDayDetails(planId, day.id);
    const dayLog = currentCycle?.dayLogs?.[day.id];

    const dayMode = getDayMode({
      dayId: day.id,
      currentDayId,
      dayLog,
      dayOrder,
    });

    const totalExerciseCount = dayLog
      ? Object.keys(dayLog.mainExerciseLogs).length
      : (dayDetails?.exerciseIds.length ?? 0);

    const completedExerciseCount = dayLog
      ? Object.values(dayLog.mainExerciseLogs).filter(
          (exerciseLog) => getExerciseStatus(exerciseLog) === "complete",
        ).length
      : 0;

    const progressLabel = `${completedExerciseCount}/${totalExerciseCount} completed`;

    const dayModeLabel = getDayModeLabel(dayMode);

    if (dayMode === "finished") {
      return `${dayModeLabel} · ${progressLabel}`;
    }

    if (dayMode === "active") {
      return `${dayModeLabel} · ${progressLabel}`;
    }

    if (dayMode === "upcoming") {
      return `${dayModeLabel} · ${totalExerciseCount} exercises`;
    }

    if (dayLog) {
      return `In progress · ${progressLabel}`;
    }

    return dayModeLabel;
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
