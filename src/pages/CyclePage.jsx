import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  Moon,
  Sparkles,
} from "lucide-react";

import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import DayCard from "../components/cycle/DayCard";
import CycleHeader from "../components/cycle/CycleHeader";
import PrimaryButton from "../components/common/PrimaryButton";

import { getPlanById } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import { getDayDetails } from "../data/dayDetails";
import { getExercisesForDay } from "../data/exercises";
import { UI_STACK_LG } from "../styles/ui";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";
import { getDayMode, getDayModeLabel } from "../utils/runtime/dayModeHelpers";

const STATIC_CORE_HINT_MAP = {
  d2: "Core A",
  d4: "Core B",
  d5: "Core C",
};

const STATIC_DAY_DETAIL_HINT_MAP = {
  "bulk-pro": {
    d1: "Shoulder top-up",
    d2: "Trap top-up",
    d3: "Hamstring + calf support",
    d4: "Trap work",
    d5: "Triceps support",
    d6: "Quad, arm, and calf support",
  },
  "cut-pro": {
    d1: "Shoulder top-up",
    d2: "Trap top-up",
    d3: "Hamstring spark + calf support",
    d4: "Trap work",
    d5: "Triceps support",
    d6: "Quad, arm, and calf support",
  },
};

const REST_SLOTS = new Set(["after-d2", "after-d4", "after-d6"]);

function getDayRuntimeSummary({
  planId,
  day,
  currentCycle,
  currentDayId,
  dayOrder,
}) {
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

  const progressLabel = `${completedExerciseCount}/${totalExerciseCount} done`;
  const dayModeLabel = getDayModeLabel(dayMode);

  if (dayMode === "finished") {
    return {
      dayMode,
      completedExerciseCount,
      totalExerciseCount,
      statusLabel: `Closed · ${progressLabel}`,
    };
  }

  if (dayMode === "active") {
    return {
      dayMode,
      completedExerciseCount,
      totalExerciseCount,
      statusLabel: `Current · ${progressLabel}`,
    };
  }

  if (dayMode === "upcoming") {
    return {
      dayMode,
      completedExerciseCount,
      totalExerciseCount,
      statusLabel: `${dayModeLabel} · ${totalExerciseCount} exercises`,
    };
  }

  if (dayLog) {
    return {
      dayMode,
      completedExerciseCount,
      totalExerciseCount,
      statusLabel: `In progress · ${progressLabel}`,
    };
  }

  return {
    dayMode,
    completedExerciseCount,
    totalExerciseCount,
    statusLabel: dayModeLabel,
  };
}

function getNextExerciseName({ planId, dayDetails, dayLog }) {
  if (!dayDetails?.exerciseIds?.length) {
    return "Open workout";
  }

  const exercises = getExercisesForDay(planId, dayDetails.exerciseIds);

  if (!dayLog) {
    return exercises[0]?.name ?? "Open workout";
  }

  const nextExerciseId =
    dayDetails.exerciseIds.find((exerciseId) => {
      const exerciseLog = dayLog.mainExerciseLogs?.[exerciseId];

      if (!exerciseLog) {
        return true;
      }

      return getExerciseStatus(exerciseLog) !== "complete";
    }) ?? dayDetails.exerciseIds[0];

  return (
    exercises.find((exercise) => exercise.id === nextExerciseId)?.name ??
    "Open workout"
  );
}

function buildRhythmSlots(days) {
  return days.flatMap((day) => {
    const slots = [{ type: "day", day }];

    if (day.id === "d2") {
      slots.push({ type: "rest", id: "after-d2" });
    }

    if (day.id === "d4") {
      slots.push({ type: "rest", id: "after-d4" });
    }

    if (day.id === "d6") {
      slots.push({ type: "rest", id: "after-d6" });
    }

    return slots;
  });
}

/**
 * Page-level dashboard for the active plan cycle.
 *
 * Runtime note:
 * CyclePage reads current cycle progress and derives display labels only.
 * It does not create or mutate day logs directly.
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

  const daySummaries = days.map((day) => ({
    day,
    ...getDayRuntimeSummary({
      planId,
      day,
      currentCycle,
      currentDayId,
      dayOrder,
    }),
  }));

  const completedDayCount = daySummaries.filter(
    ({ dayMode }) => dayMode === "finished",
  ).length;

  const totalTrainingDays = days.length;
  const progressPercent =
    totalTrainingDays > 0 ? (completedDayCount / totalTrainingDays) * 100 : 0;

  const currentDay =
    days.find((day) => day.id === currentDayId) ?? days[0] ?? null;

  const currentDayDetails = currentDay
    ? getDayDetails(planId, currentDay.id)
    : null;

  const currentDayLog = currentCycle?.dayLogs?.[currentDayId];

  const currentDaySummary = currentDay
    ? daySummaries.find(({ day }) => day.id === currentDay.id)
    : null;

  const nextExerciseName = getNextExerciseName({
    planId,
    dayDetails: currentDayDetails,
    dayLog: currentDayLog,
  });

  const upcomingDays = daySummaries.filter(
    ({ dayMode }) => dayMode === "upcoming",
  );

  const completedDays = daySummaries.filter(
    ({ dayMode }) => dayMode === "finished",
  );

  const rhythmSlots = buildRhythmSlots(days);

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
            completedDayCount={0}
            totalTrainingDays={0}
            progressPercent={0}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8 py-2">
        <div className="flex justify-start">
          <BackButton to={`/plan/${planId}`}>Back to plan</BackButton>
        </div>

        <CycleHeader
          planName={plan.name}
          cycleLabel={`Cycle ${currentCycleNumber}`}
          statusSummary={`${completedDayCount} of ${totalTrainingDays} training days closed`}
          completedDayCount={completedDayCount}
          totalTrainingDays={totalTrainingDays}
          progressPercent={progressPercent}
        />

        <section aria-label="Cycle rhythm" className="overflow-x-auto pb-1">
          <div className="flex min-w-max items-center gap-2">
            {rhythmSlots.map((slot) => {
              if (slot.type === "rest") {
                return (
                  <div
                    key={slot.id}
                    className="flex h-[4.75rem] w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-white/[0.03] text-slate-400"
                  >
                    <span className="text-xs font-medium">Rest</span>
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  </div>
                );
              }

              const summary = daySummaries.find(
                ({ day }) => day.id === slot.day.id,
              );

              const isFinished = summary?.dayMode === "finished";
              const isCurrent = summary?.dayMode === "active";

              return (
                <Link
                  key={slot.day.id}
                  to={`/plan/${planId}/day/${slot.day.id}`}
                  className={[
                    "flex h-[4.75rem] w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border text-center transition-colors",
                    isCurrent
                      ? "border-emerald-400 bg-emerald-500/10 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.22)]"
                      : "",
                    isFinished
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                      : "",
                    !isCurrent && !isFinished
                      ? "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
                      : "",
                  ].join(" ")}
                >
                  <span className="text-sm font-semibold">
                    {slot.day.label}
                  </span>

                  {isFinished ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : isCurrent ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {currentDay ? (
          <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-950/30 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_35%,rgba(74,222,128,0.20),transparent_42%),linear-gradient(135deg,transparent,rgba(34,197,94,0.08))]" />

            <div className="relative flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  Current day
                </p>

                <div className="flex flex-col gap-2">
                  <h2 className="text-4xl font-semibold tracking-tight text-white">
                    {currentDay.label} {currentDay.name}
                  </h2>

                  <p className="max-w-sm text-base leading-7 text-slate-300">
                    {currentDayDetails?.goal ??
                      "Open the current training day and keep the cycle moving."}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 text-sm font-medium text-emerald-100">
                  <Dumbbell className="h-4 w-4" aria-hidden="true" />
                  {currentDaySummary?.totalExerciseCount ?? 0} exercises
                </span>

                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 text-sm font-medium text-amber-100">
                  <Flame className="h-4 w-4" aria-hidden="true" />
                  Warm-up ready
                </span>

                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 text-sm font-medium text-emerald-100">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  Next: {nextExerciseName}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <PrimaryButton to={`/plan/${planId}/day/${currentDay.id}`}>
                  Continue day
                </PrimaryButton>

                <Link
                  to={`/plan/${planId}/day/${currentDay.id}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-semibold text-emerald-300 transition-colors hover:text-emerald-200"
                >
                  Preview warm-up
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {currentCycle?.completedAt ? (
          <PrimaryButton to={`/plan/${planId}/end-cycle`}>
            Review cycle
          </PrimaryButton>
        ) : null}

        {upcomingDays.length > 0 ? (
          <section className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Up next
            </p>

            <div className="flex flex-col gap-2">
              {upcomingDays.map(({ day, statusLabel, totalExerciseCount }) => (
                <DayCard
                  key={day.id}
                  planId={planId}
                  day={day}
                  status={statusLabel}
                  meta={[
                    `${totalExerciseCount} exercises`,
                    STATIC_CORE_HINT_MAP[day.id],
                    STATIC_DAY_DETAIL_HINT_MAP[planId]?.[day.id],
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  mode="upcoming"
                />
              ))}
            </div>
          </section>
        ) : null}

        {completedDays.length > 0 ? (
          <section className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Completed
            </p>

            <div className="flex flex-col gap-2">
              {completedDays.map(({ day, statusLabel }) => (
                <DayCard
                  key={day.id}
                  planId={planId}
                  day={day}
                  status={statusLabel}
                  meta={[
                    STATIC_CORE_HINT_MAP[day.id],
                    STATIC_DAY_DETAIL_HINT_MAP[planId]?.[day.id],
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  mode="finished"
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex items-center gap-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>

          <p className="text-base font-medium leading-6 text-slate-100">
            Rest days are part of the cycle, not empty space.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
