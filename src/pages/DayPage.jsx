import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Flame,
  ListChecks,
} from "lucide-react";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";
import { getCoreBlockStatus } from "../utils/runtime/coreStatusHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";

import AppShell from "../components/layout/AppShell";
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

function getDoneMainExerciseCount(dayLog) {
  if (!dayLog) {
    return 0;
  }

  return Object.values(dayLog.mainExerciseLogs).filter(
    (exerciseLog) => getExerciseStatus(exerciseLog) === "complete",
  ).length;
}

function getNextActionableExercise({ exercises, dayLog }) {
  if (!exercises.length) {
    return null;
  }

  if (!dayLog) {
    return {
      exercise: exercises[0],
      exerciseLog: null,
    };
  }

  const nextExercise = exercises.find((exercise) => {
    const exerciseLog = dayLog.mainExerciseLogs?.[exercise.id];

    if (!exerciseLog) {
      return true;
    }

    if (exerciseLog.closedAt) {
      return false;
    }

    return getExerciseStatus(exerciseLog) !== "complete";
  });

  if (!nextExercise) {
    return null;
  }

  return {
    exercise: nextExercise,
    exerciseLog: dayLog.mainExerciseLogs?.[nextExercise.id] ?? null,
  };
}

function getExerciseActionLabel(exerciseLog) {
  const status = getExerciseStatus(exerciseLog);

  if (status === "partial") {
    return "Continue exercise";
  }

  return "Start exercise";
}

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

  const completedExerciseCount = getDoneMainExerciseCount(dayLog);
  const progressText = `${completedExerciseCount}/${totalExerciseCount} exercises completed`;
  const progressPercent =
    totalExerciseCount > 0
      ? (completedExerciseCount / totalExerciseCount) * 100
      : 0;

  const nextAction = getNextActionableExercise({
    exercises,
    dayLog,
  });

  const nextExercise = nextAction?.exercise ?? null;
  const nextExerciseLog = nextAction?.exerciseLog ?? null;
  const nextExerciseCtaLabel = getExerciseActionLabel(nextExerciseLog);

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
      <AppShell mode="training">
        <div className="flex flex-col gap-6">
          <Link
            to={plan ? `/plan/${planId}/cycle` : "/"}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#8FDCE5] transition-colors hover:text-[#B9EEF4]"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            {plan ? "Back to Cycle" : "Back to Home"}
          </Link>

          <header className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold tracking-tight text-[#F4F7F8]">
              Day not found
            </h1>
            <p className="text-base leading-6 text-[#A9B0B5]">
              The selected day could not be loaded.
            </p>
          </header>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mode="training">
      <div className="relative isolate flex flex-col gap-5">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#3FA8B6]/10 blur-3xl"
          aria-hidden="true"
        />

        <Link
          to={`/plan/${planId}/cycle`}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#8FDCE5] transition-colors hover:text-[#B9EEF4]"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Back to Cycle
        </Link>

        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[#A9B0B5]">
            {plan.name}
            {currentCycleNumber ? ` · Cycle ${currentCycleNumber}` : ""}
          </p>

          <div className="flex flex-col gap-2">
            <h1 className="text-[2.65rem] font-semibold leading-[1.02] tracking-tight text-[#F4F7F8]">
              {dayDetails.label} — {dayDetails.name}
            </h1>

            <p className="text-base leading-7 text-[#A9B0B5]">
              {dayDetails.goal}
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-white/10 bg-[#11171A]/78 p-4 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full p-1"
              style={{
                background: `conic-gradient(rgba(94, 199, 213, 0.9) ${
                  progressPercent * 3.6
                }deg, rgba(255, 255, 255, 0.12) 0deg)`,
              }}
            >
              <div className="h-full w-full rounded-full bg-[#070A0B]" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-[#F4F7F8]">
                {completedExerciseCount}/{totalExerciseCount} completed
              </p>

              <p
                className={[
                  "mt-0.5 text-sm font-medium",
                  dayMode === "active" ? "text-[#8FDCE5]" : "",
                  dayMode === "finished" ? "text-[#8FDCE5]/90" : "",
                  dayMode === "upcoming" ? "text-[#747D84]" : "",
                  dayMode !== "active" &&
                  dayMode !== "finished" &&
                  dayMode !== "upcoming"
                    ? "text-[#747D84]"
                    : "",
                ].join(" ")}
              >
                {dayMode === "active"
                  ? "Current day"
                  : dayMode === "finished"
                    ? "Finished day"
                    : dayMode === "upcoming"
                      ? "Upcoming day"
                      : "Inactive day"}
              </p>
            </div>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#5EC7D5] transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </section>

        {/* Day mode banners explain whether the page is editable, finished, or preview-only. */}
        {dayMode === "finished" ? (
          <section className="rounded-3xl border border-[#3FA8B6]/18 bg-[#10292E]/32 p-4">
            <p className="text-sm font-semibold text-[#B9EEF4]">Finished day</p>
            <p className="mt-1 text-sm leading-relaxed text-[#A9B0B5]">
              This day has already been finished. Changes will update this saved
              log.
            </p>
          </section>
        ) : null}

        {dayMode === "upcoming" ? (
          <section className="rounded-3xl border border-white/10 bg-[#11171A]/78 p-4">
            <p className="text-sm font-semibold text-[#F4F7F8]">Upcoming day</p>
            <p className="mt-1 text-sm leading-relaxed text-[#A9B0B5]">
              This day is not active yet. You can preview the structure, but
              logging unlocks when this becomes the current day.
            </p>
          </section>
        ) : null}

        {dayMode === "active" ? (
          <section className="relative overflow-hidden rounded-3xl border border-[#3FA8B6]/20 bg-[#10292E]/42 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.28)]">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_24%,rgba(94,199,213,0.13),transparent_34%),radial-gradient(circle_at_12%_100%,rgba(63,168,182,0.1),transparent_42%)]"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-4">
              {nextExercise ? (
                <>
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8FDCE5]">
                      Next up
                    </p>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#F4F7F8]">
                        {nextExercise.name}
                      </h2>

                      {nextExercise.subtitle ? (
                        <p className="text-base leading-6 text-[#A9B0B5]">
                          {nextExercise.subtitle}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-[#070A0B]/42 px-3 py-2 text-sm font-medium text-[#D3D8DB]">
                      <ListChecks
                        className="h-4 w-4 text-[#8FDCE5]/75"
                        aria-hidden="true"
                      />
                      <span>{nextExercise.prescription}</span>

                      {nextExercise.details?.targetRir ? (
                        <>
                          <span className="text-[#59636B]">·</span>
                          <span>RIR {nextExercise.details.targetRir}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <Link
                    to={`/plan/${planId}/day/${dayId}/exercise/${nextExercise.id}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#5EC7D5] px-5 text-base font-semibold text-[#031014] shadow-[0_8px_22px_rgba(63,168,182,0.16)] transition-colors hover:bg-[#6DD6E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC7D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071012]"
                  >
                    {nextExerciseCtaLabel}
                    <ChevronRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsWarmupOpen(true)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#070A0B]/36 px-4 text-sm font-semibold text-[#D3D8DB] transition-colors hover:border-white/20 hover:text-[#F4F7F8]"
                  >
                    <Flame
                      className="h-4 w-4 text-[#C9B57A]"
                      aria-hidden="true"
                    />
                    View warm-up
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8FDCE5]">
                      Ready to finish
                    </p>

                    <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#F4F7F8]">
                      Ready to finish day
                    </h2>

                    <p className="text-base leading-6 text-[#A9B0B5]">
                      All main exercises have been closed. Review anything you
                      need, then finish the day when ready.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFinishDayOpen(true)}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#5EC7D5] px-5 text-base font-semibold text-[#031014] shadow-[0_8px_22px_rgba(63,168,182,0.16)] transition-colors hover:bg-[#6DD6E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC7D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071012]"
                  >
                    Finish day
                    <CheckCircle2 className="ml-2 h-5 w-5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </section>
        ) : null}

        <SessionInfoCard
          sessionInfo={dayDetails.sessionInfo}
          dayGoal={dayDetails.goal}
          coreBlock={coreBlock}
        />

        <section className="flex flex-col gap-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#747D84]">
            Workout flow
          </p>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#11171A]/78">
            {exercises.map((exercise, index) => (
              <ExerciseListCard
                key={exercise.id}
                planId={planId}
                dayId={dayId}
                exercise={exercise}
                status={getExerciseStatusLabel(exercise)}
                orderNumber={index + 1}
                isNext={
                  nextExercise?.id === exercise.id && dayMode === "active"
                }
              />
            ))}
          </div>
        </section>

        {coreBlock ? (
          <CoreBlockCard
            planId={planId}
            dayId={dayId}
            coreBlock={coreBlock}
            status={getCoreStatusLabel()}
          />
        ) : null}

        {dayMode === "active" && nextExercise ? (
          <button
            type="button"
            onClick={() => setIsFinishDayOpen(true)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#3FA8B6]/22 bg-[#10292E]/28 px-5 text-sm font-semibold text-[#8FDCE5] transition-colors hover:border-[#3FA8B6]/38 hover:bg-[#10292E]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC7D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#071012]"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Finish day
          </button>
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
