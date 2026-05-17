import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";

import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import SessionInfoCard from "../components/day/SessionInfoCard";
import ExerciseListCard from "../components/day/ExerciseListCard";
import CoreBlockCard from "../components/day/CoreBlockCard";
import FinishDaySheet from "../components/day/FinishDaySheet";
import WarmupSheet from "../components/warmup/WarmupSheet";

import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getExercisesForDay } from "../data/exercises";
import { getCoreBlockById } from "../data/core";
import { getWarmupById } from "../data/warmups";
import { UI_STACK_LG, UI_TEXT_MUTED, UI_TITLE } from "../styles/ui";

export default function DayPage() {
  const { planId, dayId } = useParams();
  const { state, dispatch } = useAppState();
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [isFinishDayOpen, setIsFinishDayOpen] = useState(false);

  useEffect(() => {
    if (!isWarmupOpen && !isFinishDayOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isWarmupOpen, isFinishDayOpen]);

  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);

  const exercises = useMemo(() => {
    if (!dayDetails) {
      return [];
    }

    return getExercisesForDay(planId, dayDetails.exerciseIds);
  }, [planId, dayDetails]);

  const coreBlock = dayDetails?.coreBlockId
    ? getCoreBlockById(dayDetails.coreBlockId)
    : null;
  const warmupId = dayDetails?.sessionInfo?.warmupId;
  const warmup = warmupId ? getWarmupById(planId, warmupId) : null;

  // Ensure the opened day has a runtime log once valid day data is loaded.
  useEffect(() => {
    if (!plan || !dayDetails) {
      return;
    }

    dispatch({
      type: APP_ACTIONS.ENSURE_DAY_LOG,
      payload: {
        planId,
        dayDetails,
        exercises,
      },
    });
  }, [dispatch, plan, planId, dayDetails, exercises]);

  // Read the current runtime day log so progress can be derived from state.
  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber;
  const currentCycle = currentCycleNumber
    ? planProgress?.cycles?.[currentCycleNumber]
    : null;
  const dayLog = dayDetails ? currentCycle?.dayLogs?.[dayDetails.id] : null;

  const totalExerciseCount = dayLog
    ? Object.keys(dayLog.mainExerciseLogs).length
    : (dayDetails?.exerciseIds.length ?? 0);

  const completedExerciseCount = dayLog
    ? Object.values(dayLog.mainExerciseLogs).filter(
        (exerciseLog) => getExerciseStatus(exerciseLog) === "complete",
      ).length
    : 0;

  const progressText = `${completedExerciseCount}/${totalExerciseCount} exercises completed`;

  if (!plan || !dayDetails) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to={plan ? `/plan/${planId}/cycle` : "/"}>
              {plan ? "Back to Cycle" : "Back to Home"}
            </BackButton>
          </div>

          <header className="flex flex-col gap-3">
            <h1 className={UI_TITLE}>Day not found</h1>
            <p className={UI_TEXT_MUTED}>
              The selected day could not be loaded.
            </p>
          </header>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <div className="flex justify-start">
          <BackButton to={`/plan/${planId}/cycle`}>Back to Cycle</BackButton>
        </div>

        <header className="flex flex-col gap-3">
          <h1 className={UI_TITLE}>
            {dayDetails.label} — {dayDetails.name}
          </h1>

          <div className="flex flex-col gap-1">
            <p className={UI_TEXT_MUTED}>Goal: {dayDetails.goal}</p>
            <p className={UI_TEXT_MUTED}>{progressText}</p>
          </div>
        </header>

        <SessionInfoCard
          sessionInfo={dayDetails.sessionInfo}
          onWarmupClick={() => setIsWarmupOpen(true)}
        />

        {exercises.map((exercise) => (
          <ExerciseListCard
            key={exercise.id}
            planId={planId}
            dayId={dayId}
            exercise={exercise}
            status="Not started"
          />
        ))}

        {coreBlock ? (
          <CoreBlockCard
            planId={planId}
            dayId={dayId}
            coreBlock={coreBlock}
            status="Not started"
          />
        ) : null}

        <PrimaryButton type="button" onClick={() => setIsFinishDayOpen(true)}>
          Finish day
        </PrimaryButton>
      </div>

      {isWarmupOpen ? (
        <WarmupSheet
          dayDetails={dayDetails}
          warmup={warmup}
          onClose={() => setIsWarmupOpen(false)}
        />
      ) : null}

      {isFinishDayOpen ? (
        <FinishDaySheet
          dayDetails={dayDetails}
          progressText={progressText}
          hasCoreBlock={Boolean(coreBlock)}
          onClose={() => setIsFinishDayOpen(false)}
        />
      ) : null}
    </AppShell>
  );
}
