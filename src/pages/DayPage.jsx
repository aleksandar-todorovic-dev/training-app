import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import {
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
import BackControl from "../components/common/BackControl";
import GuardState from "../components/common/GuardState";
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

// DayPage display helpers derive labels and next-action data from existing
// content and runtime logs without mutating workout state.
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

function formatTargetRir(targetRir) {
  if (!targetRir) {
    return null;
  }

  return targetRir.replace("≈", "").trim();
}

function getModeCopy(dayMode) {
  if (dayMode === "finished") {
    return {
      label: "Saved log",
      title: "This day is closed",
      body: "You can still review and update the existing exercise and Core logs.",
      className: "border-[#79C89A]/20 bg-[#79C89A]/[0.045]",
      labelClassName: "text-[#8FD0A8]",
    };
  }

  if (dayMode === "upcoming") {
    return {
      label: "Preview",
      title: "Upcoming training day",
      body: "Browse the structure now. Logging opens when this becomes the current day.",
      className: "border-[#2A3138] bg-[#13181D]/78",
      labelClassName: "text-[#8C969F]",
    };
  }

  if (dayMode === "inactive") {
    return {
      label: "Unavailable",
      title: "This day is not active",
      body: "Return to the cycle dashboard to continue from the current training position.",
      className: "border-[#2A3138] bg-[#13181D]/78",
      labelClassName: "text-[#8C969F]",
    };
  }

  return null;
}

function getExerciseStatusLabel(exercise, dayLog) {
  const exerciseLog = dayLog?.mainExerciseLogs?.[exercise.id];
  const status = getExerciseStatus(exerciseLog);

  if (status === "complete") {
    return "Logged";
  }

  if (status === "partial") {
    return "Partial";
  }

  return "Not started";
}

function getCoreStatusLabel(coreBlockLog) {
  const status = getCoreBlockStatus(coreBlockLog);

  if (status === "complete") {
    return "Logged";
  }

  if (status === "partial") {
    return "Partial";
  }

  return "Not started";
}

function getProgressSegmentClass(status, isNext) {
  if (isNext) {
    return "bg-[#B8F36B]";
  }

  if (status === "Logged") {
    return "bg-[#79C89A]";
  }

  if (status === "Partial") {
    return "bg-[#F1B864]";
  }

  return "bg-[#2A3138]";
}

/**
 * Page-level orchestrator for one training day.
 *
 * Runtime note:
 * DayPage resolves static content, reads the current cycle/day log, lazily
 * creates the active day log, derives progress and warnings, and delegates
 * mutations through reducer actions. Upcoming and finished views do not create
 * new day logs from this page.
 */
export default function DayPage() {
  const { planId, dayId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();

  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [isFinishDayOpen, setIsFinishDayOpen] = useState(false);

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

  const coreExercises = useMemo(() => {
    if (!coreBlock) {
      return [];
    }

    return getCoreExercisesByIds(coreBlock.exerciseIds);
  }, [coreBlock]);

  const coreExerciseCount = coreExercises.length || 3;

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

  // Active days lazily create their runtime day log.
  // Finished/upcoming days must not create new logs from this page.
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

  const totalExerciseCount = dayLog
    ? Object.keys(dayLog.mainExerciseLogs).length
    : (dayDetails?.exerciseIds.length ?? 0);

  const completedExerciseCount = getDoneMainExerciseCount(dayLog);
  const progressText = `${completedExerciseCount}/${totalExerciseCount} exercises logged`;

  const nextAction = getNextActionableExercise({
    exercises,
    dayLog,
  });

  const nextExercise = nextAction?.exercise ?? null;
  const nextExerciseLog = nextAction?.exerciseLog ?? null;
  const nextExerciseCtaLabel = getExerciseActionLabel(nextExerciseLog);
  const nextExerciseTargetRir = formatTargetRir(
    nextExercise?.details?.targetRir,
  );

  const exerciseStatuses = exercises.map((exercise) => ({
    exerciseId: exercise.id,
    status: getExerciseStatusLabel(exercise, dayLog),
  }));

  const coreStatusLabel = getCoreStatusLabel(coreBlockLog);
  const modeCopy = getModeCopy(dayMode);
  const isActiveDay = dayMode === "active";

  // Finish-day warnings are informational only.
  const missingValueWarningSummary = getMissingValueWarningSummary({
    dayLog,
    coreExercises,
    currentCycleNumber,
  });

  // Finish day records day-level close intent and returns to Cycle.
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
    const fallbackTo = plan ? `/plan/${planId}/cycle` : "/";
    const fallbackLabel = plan ? "Back to cycle" : "Back to home";

    return (
      <GuardState
        eyebrow="Day unavailable"
        context={plan?.name}
        title="This training day could not be loaded."
        description="Return to a valid cycle position and continue from the current planned workout."
        primaryTo={fallbackTo}
        primaryLabel={fallbackLabel}
      />
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <BackControl to={`/plan/${planId}/cycle`}>
          Back to cycle
        </BackControl>

        <header>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#77818B]">
            {plan.name}
            {currentCycleNumber ? ` · Cycle ${currentCycleNumber}` : ""}
          </p>

          <div className="mt-3 flex items-start gap-3">
            <span className="shrink-0 text-4xl font-semibold leading-none tracking-[-0.04em] text-[#B8F36B]">
              {dayDetails.label}
            </span>

            <div className="min-w-0 border-l border-[#3A434C] pl-3">
              <h1 className="text-[1.65rem] font-semibold leading-[1.08] tracking-tight text-[#F3F5F1]">
                {dayDetails.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#AAB2BA]">
                {dayDetails.goal}
              </p>
            </div>
          </div>
        </header>

        <section aria-label="Main exercise progress">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold text-[#E1E5E5]">
              {completedExerciseCount}/{totalExerciseCount} main exercises logged
            </p>
            <p
              className={[
                "shrink-0 text-[0.65rem] font-semibold uppercase tracking-[0.11em]",
                dayMode === "active"
                  ? "text-[#C8F78F]"
                  : dayMode === "finished"
                    ? "text-[#8FD0A8]"
                    : "text-[#77818B]",
              ].join(" ")}
            >
              {dayMode === "active"
                ? "Current day"
                : dayMode === "finished"
                  ? "Saved log"
                  : dayMode === "upcoming"
                    ? "Preview"
                    : "Inactive"}
            </p>
          </div>

          <div
            className="mt-3 grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${Math.max(totalExerciseCount, 1)}, minmax(0, 1fr))`,
            }}
          >
            {exerciseStatuses.length ? (
              exerciseStatuses.map(({ exerciseId, status }) => (
                <span
                  key={exerciseId}
                  className={`h-1.5 rounded-full ${getProgressSegmentClass(
                    status,
                    nextExercise?.id === exerciseId && isActiveDay,
                  )}`}
                />
              ))
            ) : (
              <span className="h-1.5 rounded-full bg-[#2A3138]" />
            )}
          </div>
        </section>

        {modeCopy ? (
          <section
            className={`rounded-2xl border px-4 py-3.5 ${modeCopy.className}`}
          >
            <p
              className={`text-[0.66rem] font-semibold uppercase tracking-[0.13em] ${modeCopy.labelClassName}`}
            >
              {modeCopy.label}
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#E9ECEB]">
              {modeCopy.title}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[#AAB2BA]">
              {modeCopy.body}
            </p>
          </section>
        ) : null}

        {isActiveDay ? (
          nextExercise ? (
            <section className="overflow-hidden rounded-[1.25rem] border border-[#3A434C] bg-[#171D22] shadow-[0_18px_38px_rgba(0,0,0,0.24)]">
              <div className="px-4 pb-4 pt-4">
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#C8F78F]">
                  Next exercise
                </p>

                <h2 className="mt-3 text-[1.55rem] font-semibold leading-tight tracking-tight text-[#F3F5F1]">
                  {nextExercise.name}
                </h2>

                {nextExercise.subtitle ? (
                  <p className="mt-2 text-sm leading-6 text-[#AAB2BA]">
                    {nextExercise.subtitle}
                  </p>
                ) : null}

                <div className="mt-4 flex items-center gap-2 border-y border-[#2A3138] py-3 text-sm font-medium text-[#AAB2BA]">
                  <ListChecks
                    className="h-4 w-4 shrink-0 text-[#B8F36B]/80"
                    aria-hidden="true"
                  />
                  <p>
                    <span className="text-[#E1E5E5]">
                      {nextExercise.prescription}
                    </span>
                    {nextExerciseTargetRir
                      ? ` · RIR ${nextExerciseTargetRir}`
                      : ""}
                  </p>
                </div>

                <Link
                  to={`/plan/${planId}/day/${dayId}/exercise/${nextExercise.id}`}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#B8F36B] px-5 text-sm font-semibold text-[#0B0E11] transition duration-150 ease-out hover:bg-[#C8F78F] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F78F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171D22] motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                  {nextExerciseCtaLabel}
                  <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setIsWarmupOpen(true)}
                className="flex min-h-12 w-full items-center justify-between gap-3 border-t border-[#2A3138] bg-[#F1B864]/[0.035] px-4 text-left transition-colors hover:bg-[#F1B864]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F1B864]/60"
              >
                <span className="flex items-center gap-2.5">
                  <Flame
                    className="h-4 w-4 text-[#F1B864]"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[#E1E5E5]">
                      View warm-up
                    </span>
                    <span className="mt-0.5 block text-xs text-[#77818B]">
                      Short preparation for this session
                    </span>
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 text-[#8B7450]" aria-hidden="true" />
              </button>
            </section>
          ) : (
            <section className="rounded-[1.25rem] border border-[#B8F36B]/24 bg-[#B8F36B]/[0.045] p-4 shadow-[0_18px_38px_rgba(0,0,0,0.22)]">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#C8F78F]">
                Main work closed
              </p>
              <h2 className="mt-3 text-[1.45rem] font-semibold leading-tight tracking-tight text-[#F3F5F1]">
                Ready to finish day
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#AAB2BA]">
                All main exercise workflows are closed. Review anything you need,
                then move the cycle forward when ready.
              </p>
              <button
                type="button"
                onClick={() => setIsFinishDayOpen(true)}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#B8F36B] px-5 text-sm font-semibold text-[#0B0E11] transition duration-150 ease-out hover:bg-[#C8F78F] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F78F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151B19] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                Finish day
                <CheckCircle2 className="ml-2 h-4 w-4" aria-hidden="true" />
              </button>
            </section>
          )
        ) : null}

        <SessionInfoCard
          sessionInfo={dayDetails.sessionInfo}
          dayGoal={dayDetails.goal}
          coreBlock={coreBlock}
        />

        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#77818B]">
                Workout flow
              </p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#F3F5F1]">
                Main work
              </h2>
            </div>

            <p className="pb-0.5 text-xs font-medium text-[#77818B]">
              {exercises.length} exercises{coreBlock ? " + Core" : ""}
            </p>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-[#2A3138] bg-[#13181D]/82">
            {exercises.map((exercise, index) => (
              <ExerciseListCard
                key={exercise.id}
                planId={planId}
                dayId={dayId}
                exercise={exercise}
                status={getExerciseStatusLabel(exercise, dayLog)}
                orderNumber={index + 1}
                isNext={nextExercise?.id === exercise.id && isActiveDay}
                isLast={!coreBlock && index === exercises.length - 1}
              />
            ))}

            {coreBlock ? (
              <CoreBlockCard
                planId={planId}
                dayId={dayId}
                coreBlock={coreBlock}
                status={coreStatusLabel}
                coreExerciseCount={coreExerciseCount}
              />
            ) : null}
          </div>
        </section>

        {isActiveDay && nextExercise ? (
          <section className="border-t border-[#2A3138] pt-4">
            <button
              type="button"
              onClick={() => setIsFinishDayOpen(true)}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#3A434C] bg-[#13181D]/65 px-5 text-sm font-semibold text-[#AAB2BA] transition duration-150 ease-out hover:border-[#56616B] hover:bg-[#171D22] hover:text-[#F3F5F1] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A0C] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Finish day
            </button>
            <p className="mt-2 text-center text-xs leading-5 text-[#77818B]">
              Partial and empty days can still be closed honestly.
            </p>
          </section>
        ) : null}
      </div>

      <AnimatePresence>
        {isWarmupOpen ? (
          <WarmupSheet
            key="warmup-sheet"
            dayDetails={dayDetails}
            warmup={warmup}
            onClose={() => setIsWarmupOpen(false)}
          />
        ) : null}

        {isFinishDayOpen ? (
          <FinishDaySheet
            key="finish-day-sheet"
            dayDetails={dayDetails}
            progressText={progressText}
            hasCoreBlock={Boolean(coreBlock)}
            missingValueWarningSummary={missingValueWarningSummary}
            onClose={() => setIsFinishDayOpen(false)}
            onConfirmFinish={handleConfirmFinishDay}
          />
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}
