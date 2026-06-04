import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Flame,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";
import { getCoreBlockStatus } from "../utils/runtime/coreStatusHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";

import AppShell from "../components/layout/AppShell";
import SessionInfoCard from "../components/day/SessionInfoCard";
import ExerciseListCard from "../components/day/ExerciseListCard";
import FinishDaySheet from "../components/day/FinishDaySheet";
import WarmupSheet from "../components/warmup/WarmupSheet";

import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getExercisesForDay } from "../data/exercises";
import { getCoreBlockById, getCoreExercisesByIds } from "../data/core";
import { getMissingValueWarningSummary } from "../utils/runtime/missingValueWarningHelpers";
import { getWarmupById } from "../data/warmups";

// DayPage display helpers.
// They derive labels and next-action data from existing static content and
// runtime logs without mutating workout state.
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

function getCoreStatusLabelValue(status) {
  if (status === "Complete") {
    return "Complete";
  }

  if (status === "Partial") {
    return "Partial";
  }

  return "Flexible";
}

// Core is shown as a separate movable support block.
// Its status stays separate from main exercise completion.
function CoreFlowRow({
  planId,
  dayId,
  coreBlock,
  status,
  coreExerciseCount = 3,
}) {
  return (
    <Link
      to={`/plan/${planId}/day/${dayId}/core/${coreBlock.id}`}
      className="group flex items-center gap-3 rounded-2xl px-2.5 py-3 transition-colors hover:bg-violet-300/4"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-300/18 bg-violet-300/5 text-violet-200/85">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="line-clamp-1 text-[0.93rem] font-semibold leading-snug text-[#D3D8DB]">
            {coreBlock.name}
          </h3>

          <span className="rounded-full border border-violet-300/16 bg-violet-300/4.5 px-2 py-0.5 text-[0.68rem] font-medium text-violet-200/80">
            {getCoreStatusLabelValue(status)}
          </span>
        </div>

        <p className="mt-0.5 line-clamp-1 text-xs font-medium leading-5 text-[#8B949B]">
          {coreExerciseCount} core exercises · Movable block
        </p>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-[#59636B] transition-colors group-hover:text-violet-200"
        aria-hidden="true"
      />
    </Link>
  );
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

  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [isFinishDayOpen, setIsFinishDayOpen] = useState(false);

  // Prevent background scrolling while day-level sheets are open.
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

  const nextExerciseTargetRir = formatTargetRir(
    nextExercise?.details?.targetRir,
  );

  // Finish-day warnings are informational only.
  // They do not block finishing and do not change runtime state.
  const missingValueWarningSummary = getMissingValueWarningSummary({
    dayLog,
    coreExercises,
    currentCycleNumber,
  });

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

  // Finish day records day-level close intent and returns to the cycle dashboard.
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

  const coreStatusLabel = getCoreStatusLabel();

  const isActiveDay = dayMode === "active";

  const progressAccent = isActiveDay
    ? "rgba(201, 181, 122, 0.92)"
    : "rgba(94, 199, 213, 0.9)";

  const progressBarClassName = isActiveDay
    ? "bg-linear-to-r from-[#C9B57A] via-[#D8C891] to-[#5EC7D5]"
    : "bg-[#5EC7D5]";

  return (
    <AppShell mode="training">
      <div className="relative isolate flex flex-col gap-5">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#3FA8B6]/10 blur-3xl"
          aria-hidden="true"
        />

        {isActiveDay ? (
          <div
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-52 w-52 rounded-full bg-[#C9B57A]/7 blur-3xl"
            aria-hidden="true"
          />
        ) : null}

        <Link
          to={`/plan/${planId}/cycle`}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#8FDCE5] transition-colors hover:text-[#B9EEF4]"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Back to Cycle
        </Link>

        <header className="flex flex-col gap-2.5">
          <p className="text-sm font-medium text-[#8B949B]">
            {plan.name}
            {currentCycleNumber ? ` · Cycle ${currentCycleNumber}` : ""}
          </p>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-[1.68rem] font-semibold leading-[1.04] tracking-tight text-[#F4F7F8]">
              {dayDetails.label} — {dayDetails.name}
            </h1>

            <p className="text-sm leading-6 text-[#A9B0B5]">
              {dayDetails.goal}
            </p>
          </div>
        </header>

        <section className="flex items-center gap-3 rounded-2xl bg-white/[0.018] px-3 py-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-1"
            style={{
              background: `conic-gradient(${progressAccent} ${
                progressPercent * 3.6
              }deg, rgba(255, 255, 255, 0.12) 0deg)`,
            }}
          >
            <div className="h-full w-full rounded-full bg-[#070A0B]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-base font-semibold text-[#F4F7F8]">
                {completedExerciseCount}/{totalExerciseCount} completed
              </p>

              <p
                className={[
                  "shrink-0 text-xs font-semibold",
                  dayMode === "active" ? "text-[#D8C891]" : "",
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
                    ? "Finished"
                    : dayMode === "upcoming"
                      ? "Upcoming"
                      : "Inactive"}
              </p>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all ${progressBarClassName}`}
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
          </div>
        </section>

        {dayMode === "active" ? (
          <section className="rounded-[1.75rem] bg-linear-to-b from-[#1D1C16]/28 via-[#10292E]/22 to-[#10292E]/16 p-4">
            {nextExercise ? (
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-2.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D8C891]">
                    Next exercise
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <h2 className="text-[1.62rem] font-semibold leading-tight tracking-tight text-[#F4F7F8]">
                      {nextExercise.name}
                    </h2>

                    {nextExercise.subtitle ? (
                      <p className="text-base leading-6 text-[#A9B0B5]">
                        {nextExercise.subtitle}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium leading-6 text-[#8B949B]">
                    <ListChecks
                      className="h-4 w-4 shrink-0 text-[#D8C891]/75"
                      aria-hidden="true"
                    />

                    <p>
                      <span>{nextExercise.prescription}</span>

                      {nextExerciseTargetRir ? (
                        <span className="text-[#A9B0B5]">
                          {" · RIR "}
                          {nextExerciseTargetRir}
                        </span>
                      ) : null}
                    </p>
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
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#070A0B]/32 px-4 text-sm font-semibold text-[#D3D8DB] transition-colors hover:border-white/20 hover:text-[#F4F7F8]"
                >
                  <Flame
                    className="h-4 w-4 text-[#C9B57A]"
                    aria-hidden="true"
                  />
                  View warm-up
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D8C891]">
                    Ready to finish
                  </p>

                  <h2 className="text-[1.62rem] font-semibold leading-tight tracking-tight text-[#F4F7F8]">
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
              </div>
            )}
          </section>
        ) : null}

        {dayMode === "finished" ? (
          <section className="rounded-2xl bg-[#10292E]/20 px-3 py-3">
            <p className="text-sm font-semibold text-[#B9EEF4]">Finished day</p>
            <p className="mt-1 text-sm leading-relaxed text-[#A9B0B5]">
              This day has already been finished. Changes will update this saved
              log.
            </p>
          </section>
        ) : null}

        {dayMode === "upcoming" ? (
          <section className="rounded-2xl bg-white/[0.018] px-3 py-3">
            <p className="text-sm font-semibold text-[#F4F7F8]">Upcoming day</p>
            <p className="mt-1 text-sm leading-relaxed text-[#A9B0B5]">
              You can preview the structure now. Logging opens when this day
              becomes current.
            </p>
          </section>
        ) : null}

        <SessionInfoCard
          sessionInfo={dayDetails.sessionInfo}
          dayGoal={dayDetails.goal}
          coreBlock={coreBlock}
        />

        <section className="flex flex-col gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#747D84]">
              Workout flow
            </p>

            <p className="mt-0.5 text-xs font-medium text-[#59636B]">
              {exercises.length} main exercises{coreBlock ? " & core" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-0">
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

            {coreBlock ? (
              <CoreFlowRow
                planId={planId}
                dayId={dayId}
                coreBlock={coreBlock}
                status={coreStatusLabel}
                coreExerciseCount={coreExerciseCount}
              />
            ) : null}
          </div>
        </section>

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
