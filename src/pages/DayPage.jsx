import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";
import { getCoreBlockStatus } from "../utils/runtime/coreStatusHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";

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
import { getCoreBlockById, getCoreExercisesByIds } from "../data/core";
import { getMissingValueWarningSummary } from "../utils/runtime/missingValueWarningHelpers";
import { getWarmupById } from "../data/warmups";
import { UI_STACK_LG, UI_TEXT_MUTED, UI_TITLE } from "../styles/ui";

/**
 * Page-level orchestrator for one training day.
 *
 * Runtime note:
 * DayPage resolves static day content, reads the active cycle/day log, lazily
 * creates the active day log, derives progress/warnings, and delegates runtime
 * changes through reducer actions.
 */
export default function DayPage() {
  const { planId, dayId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();
  // Local sheet state only; sheet open/close does not write runtime progress.
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [isFinishDayOpen, setIsFinishDayOpen] = useState(false);

  // Lock body scroll while a DayPage sheet is open.
  useEffect(() => {
    if (!isWarmupOpen && !isFinishDayOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isWarmupOpen, isFinishDayOpen]);

  // Static source data resolved from the current route.
  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);

  // Keep resolved day exercises stable for the runtime ensure-day effect.
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

  const coreExercises = useMemo(() => {
    if (!coreBlock) {
      return [];
    }

    return getCoreExercisesByIds(coreBlock.exerciseIds);
  }, [coreBlock]);

  // Read the current runtime cycle/day state so page mode and progress can be derived.
  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber;
  const currentCycle = currentCycleNumber
    ? planProgress?.cycles?.[currentCycleNumber]
    : null;
  const dayLog = dayDetails ? currentCycle?.dayLogs?.[dayDetails.id] : null;
  const coreBlockLog = dayLog?.coreBlockLog ?? null;
  const currentDayId = currentCycle?.currentDayId ?? "d1";
  const dayOrder = plan?.dayOrder ?? [];

  const dayMode = dayDetails
    ? getDayMode({
        dayId: dayDetails.id,
        currentDayId,
        dayLog,
        dayOrder,
      })
    : "inactive";

  // Ensure only the active day creates a runtime day log.
  // Upcoming days stay static preview-only and do not create current-cycle logs.
  useEffect(() => {
    if (!plan || !dayDetails || dayMode !== "active") {
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
  }, [dispatch, plan, planId, dayDetails, exercises, dayMode]);

  // Main day progress counts required main exercises only.
  // Core, warm-up, guide/help, and optional work stay outside this fraction.
  const totalExerciseCount = dayLog
    ? Object.keys(dayLog.mainExerciseLogs).length
    : (dayDetails?.exerciseIds.length ?? 0);

  const completedExerciseCount = dayLog
    ? Object.values(dayLog.mainExerciseLogs).filter(
        (exerciseLog) => getExerciseStatus(exerciseLog) === "complete",
      ).length
    : 0;

  const progressText = `${completedExerciseCount}/${totalExerciseCount} exercises completed`;

  // Finish-day warnings are informational and do not block closing the day.
  const missingValueWarningSummary = getMissingValueWarningSummary({
    dayLog,
    coreExercises,
    currentCycleNumber,
  });

  // Convert the runtime exercise status into the label shown on the Day screen.
  function getExerciseStatusLabel(exercise) {
    const exerciseLog = dayLog?.mainExerciseLogs?.[exercise.id];
    const status = getExerciseStatus(exerciseLog);

    if (status === "complete") {
      return "Complete";
    }

    if (status === "partial") {
      return "Partial";
    }

    return "Not started";
  }

  // Convert the runtime core block status into the label shown on the Day screen.
  function getCoreStatusLabel() {
    const status = getCoreBlockStatus(coreBlockLog);

    if (status === "complete") {
      return "Complete";
    }

    if (status === "partial") {
      return "Partial";
    }

    return "Not started";
  }

  // Finish day records day-level close intent and returns to the cycle overview.
  function handleConfirmFinishDay() {
    dispatch({
      type: APP_ACTIONS.FINISH_DAY,
      payload: {
        planId,
        dayId,
        finishedAt: new Date().toISOString(),
      },
    });

    setIsFinishDayOpen(false);
    navigate(`/plan/${planId}/cycle`);
  }

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

        {/* Day mode banners explain whether the page is editable, finished, or preview-only. */}
        {dayMode === "finished" ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm font-semibold text-emerald-200">
              Finished day
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-300">
              This day has already been finished. Changes will update this saved
              log.
            </p>
          </div>
        ) : null}

        {dayMode === "upcoming" ? (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-4">
            <p className="text-sm font-semibold text-zinc-100">Upcoming day</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              This day is not active yet. You can preview the structure, but
              logging unlocks when this becomes the current day.
            </p>
          </div>
        ) : null}

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
            status={getExerciseStatusLabel(exercise)}
          />
        ))}

        {coreBlock ? (
          <CoreBlockCard
            planId={planId}
            dayId={dayId}
            coreBlock={coreBlock}
            status={getCoreStatusLabel()}
          />
        ) : null}

        {dayMode === "active" ? (
          <PrimaryButton type="button" onClick={() => setIsFinishDayOpen(true)}>
            Finish day
          </PrimaryButton>
        ) : null}
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
          missingValueWarningSummary={missingValueWarningSummary}
          onClose={() => setIsFinishDayOpen(false)}
          onConfirmFinish={handleConfirmFinishDay}
        />
      ) : null}
    </AppShell>
  );
}
