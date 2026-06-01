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
 // const nextExerciseStatus = getExerciseStatus(nextExerciseLog);
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
      <AppShell>
        <div className="flex flex-col gap-6">
          <Link
            to={plan ? `/plan/${planId}/cycle` : "/"}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-emerald-300/90 transition-colors hover:text-emerald-200"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            {plan ? "Back to Cycle" : "Back to Home"}
          </Link>

          <header className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Day not found
            </h1>
            <p className="text-base leading-6 text-slate-400">
              The selected day could not be loaded.
            </p>
          </header>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <Link
          to={`/plan/${planId}/cycle`}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-emerald-300/90 transition-colors hover:text-emerald-200"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Back to Cycle
        </Link>

        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-slate-400">
            {plan.name}
            {currentCycleNumber ? ` · Cycle ${currentCycleNumber}` : ""}
          </p>

          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
              {dayDetails.label} — {dayDetails.name}
            </h1>

            <p className="text-base leading-6 text-slate-300">
              {dayDetails.goal}
            </p>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-slate-900/45 p-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full p-1"
              style={{
                background: `conic-gradient(rgba(52, 211, 153, 0.75) ${
                  progressPercent * 3.6
                }deg, rgba(255, 255, 255, 0.12) 0deg)`,
              }}
            >
              <div className="h-full w-full rounded-full bg-slate-950" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-slate-100">
                {completedExerciseCount}/{totalExerciseCount} completed
              </p>

              <p
                className={[
                  "mt-0.5 text-sm font-medium",
                  dayMode === "active" ? "text-emerald-300" : "",
                  dayMode === "finished" ? "text-emerald-300/90" : "",
                  dayMode === "upcoming" ? "text-slate-500" : "",
                  dayMode !== "active" &&
                  dayMode !== "finished" &&
                  dayMode !== "upcoming"
                    ? "text-slate-500"
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
              className="h-full rounded-full bg-emerald-400/90 transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </section>

        {/* Day mode banners explain whether the page is editable, finished, or preview-only. */}
        {dayMode === "finished" ? (
          <section className="rounded-2xl border border-emerald-900/40 bg-emerald-950/25 p-4">
            <p className="text-sm font-semibold text-emerald-200">
              Finished day
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">
              This day has already been finished. Changes will update this saved
              log.
            </p>
          </section>
        ) : null}

        {dayMode === "upcoming" ? (
          <section className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
            <p className="text-sm font-semibold text-slate-100">Upcoming day</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">
              This day is not active yet. You can preview the structure, but
              logging unlocks when this becomes the current day.
            </p>
          </section>
        ) : null}

        {dayMode === "active" ? (
          <section className="relative overflow-hidden rounded-3xl border border-emerald-900/55 bg-emerald-950/18 p-5 shadow-[0_18px_46px_rgba(0,0,0,0.32)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_24%,rgba(22,101,52,0.16),transparent_34%),radial-gradient(circle_at_12%_100%,rgba(6,78,59,0.14),transparent_42%)]" />

            <div className="relative flex flex-col gap-4">
              {nextExercise ? (
                <>
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/85">
                      Next up
                    </p>

                    <div className="flex flex-col gap-2">
                      <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
                        {nextExercise.name}
                      </h2>

                      {nextExercise.subtitle ? (
                        <p className="text-base leading-6 text-slate-300">
                          {nextExercise.subtitle}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-medium text-slate-300">
                      <ListChecks
                        className="h-4 w-4 text-slate-400"
                        aria-hidden="true"
                      />
                      <span>{nextExercise.prescription}</span>

                      {nextExercise.details?.targetRir ? (
                        <>
                          <span className="text-slate-600">·</span>
                          <span>RIR {nextExercise.details.targetRir}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <Link
                    to={`/plan/${planId}/day/${dayId}/exercise/${nextExercise.id}`}
                    className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-emerald-700/80 px-5 text-base font-semibold text-white shadow-[0_8px_22px_rgba(6,78,59,0.2)] ring-1 ring-emerald-400/10 transition-colors hover:bg-emerald-600/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    {nextExerciseCtaLabel}
                    <ChevronRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsWarmupOpen(true)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/35 px-4 text-sm font-semibold text-slate-200 transition-colors hover:border-white/20"
                  >
                    <Flame
                      className="h-4 w-4 text-amber-300/90"
                      aria-hidden="true"
                    />
                    View warm-up
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/85">
                      Ready to finish
                    </p>

                    <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white">
                      Ready to finish day
                    </h2>

                    <p className="text-base leading-6 text-slate-300">
                      All main exercises have been closed. Review anything you
                      need, then finish the day when ready.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFinishDayOpen(true)}
                    className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-emerald-700/80 px-5 text-base font-semibold text-white shadow-[0_8px_22px_rgba(6,78,59,0.2)] ring-1 ring-emerald-400/10 transition-colors hover:bg-emerald-600/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Workout flow
          </p>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/45">
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

        {dayMode === "active" ? (
          <button
            type="button"
            onClick={() => setIsFinishDayOpen(true)}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-5 text-base font-semibold text-slate-950 shadow-[0_12px_30px_rgba(16,185,129,0.18)] transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
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
