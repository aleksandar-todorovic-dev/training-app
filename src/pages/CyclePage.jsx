import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
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
import DayCard from "../components/cycle/DayCard";
import CycleHeader from "../components/cycle/CycleHeader";

import { getPlanById } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import { getDayDetails } from "../data/dayDetails";
import { getExercisesForDay } from "../data/exercises";
import { UI_STACK_LG } from "../styles/ui";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";
import { getDayMode, getDayModeLabel } from "../utils/runtime/dayModeHelpers";

// Screen-specific display hints for Cycle cards.
// These do not affect day completion or core runtime state.
const STATIC_CORE_HINT_MAP = {
  d2: "Core A",
  d4: "Core B",
  d5: "Core C",
};

// Screen-specific day detail hints.
// The base day data stays unchanged; this only improves CyclePage display.
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

// CyclePage display helpers.
// They derive labels from existing runtime logs without creating or mutating
// day, exercise, or core runtime state.
function getDoneSetCount(dayLog) {
  if (!dayLog) {
    return 0;
  }

  return Object.values(dayLog.mainExerciseLogs).reduce(
    (doneSetTotal, exerciseLog) => {
      const doneSets =
        exerciseLog.sets?.filter((set) => set.isDone).length ?? 0;

      return doneSetTotal + doneSets;
    },
    0,
  );
}

function getLoggedSetLabel(doneSetCount) {
  return doneSetCount === 1 ? "1 set logged" : `${doneSetCount} sets logged`;
}

function getClosedStatusLabels({
  completedExerciseCount,
  totalExerciseCount,
  doneSetCount,
}) {
  if (completedExerciseCount === totalExerciseCount && totalExerciseCount > 0) {
    return {
      statusLabel: "Closed",
      statusDetail: `${completedExerciseCount}/${totalExerciseCount} done`,
    };
  }

  if (completedExerciseCount > 0) {
    return {
      statusLabel: "Closed partial",
      statusDetail: `${completedExerciseCount}/${totalExerciseCount} done`,
    };
  }

  if (doneSetCount > 0) {
    return {
      statusLabel: "Closed partial",
      statusDetail: getLoggedSetLabel(doneSetCount),
    };
  }

  return {
    statusLabel: "Closed",
    statusDetail: "No sets logged",
  };
}

function hasDayActivity(dayLog) {
  if (!dayLog) {
    return false;
  }

  return Object.values(dayLog.mainExerciseLogs).some((exerciseLog) => {
    const hasClosedExercise = Boolean(exerciseLog.closedAt);
    const hasDoneSet = exerciseLog.sets?.some((set) => set.isDone) ?? false;

    return hasClosedExercise || hasDoneSet;
  });
}

function areAllMainExercisesClosed(dayDetails, dayLog) {
  if (!dayDetails?.exerciseIds?.length || !dayLog) {
    return false;
  }

  return dayDetails.exerciseIds.every((exerciseId) => {
    const exerciseLog = dayLog.mainExerciseLogs?.[exerciseId];

    return Boolean(exerciseLog?.closedAt);
  });
}

function getHeroCtaLabel({
  isCycleComplete,
  currentDayDetails,
  currentDayLog,
}) {
  if (isCycleComplete) {
    return "Review cycle";
  }

  if (areAllMainExercisesClosed(currentDayDetails, currentDayLog)) {
    return "Review day";
  }

  if (!hasDayActivity(currentDayLog)) {
    return "Start day";
  }

  return "Continue day";
}

// Builds the display summary used by CyclePage and DayCard.
// Day mode still comes from runtime helpers; this function only formats what
// the cycle dashboard should show.
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

  const doneSetCount = getDoneSetCount(dayLog);
  const progressLabel = `${completedExerciseCount}/${totalExerciseCount} done`;
  const dayModeLabel = getDayModeLabel(dayMode);

  if (dayMode === "finished") {
    return {
      dayMode,
      completedExerciseCount,
      totalExerciseCount,
      doneSetCount,
      ...getClosedStatusLabels({
        completedExerciseCount,
        totalExerciseCount,
        doneSetCount,
      }),
    };
  }

  if (dayMode === "active") {
    return {
      dayMode,
      completedExerciseCount,
      totalExerciseCount,
      doneSetCount,
      statusLabel: `Current · ${progressLabel}`,
      statusDetail: null,
    };
  }

  if (dayMode === "upcoming") {
    return {
      dayMode,
      completedExerciseCount,
      totalExerciseCount,
      doneSetCount,
      statusLabel: `${totalExerciseCount} exercises`,
      statusDetail: null,
    };
  }

  if (dayLog) {
    return {
      dayMode,
      completedExerciseCount,
      totalExerciseCount,
      doneSetCount,
      statusLabel: `In progress · ${progressLabel}`,
      statusDetail: null,
    };
  }

  return {
    dayMode,
    completedExerciseCount,
    totalExerciseCount,
    doneSetCount,
    statusLabel: dayModeLabel,
    statusDetail: null,
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

  const nextExerciseId = dayDetails.exerciseIds.find((exerciseId) => {
    const exerciseLog = dayLog.mainExerciseLogs?.[exerciseId];

    if (!exerciseLog) {
      return true;
    }

    if (exerciseLog.closedAt) {
      return false;
    }

    return getExerciseStatus(exerciseLog) !== "complete";
  });

  if (!nextExerciseId) {
    return "Ready to finish day";
  }

  return (
    exercises.find((exercise) => exercise.id === nextExerciseId)?.name ??
    "Open workout"
  );
}

// Rest slots are display-only rhythm markers.
// They do not create rest-day routes, logs, completion state, or persistence.
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
 * Runtime-aware cycle dashboard for one selected plan.
 *
 * Runtime boundary:
 * CyclePage reads the current cycle, derives day display states, and routes the
 * user toward the current day or cycle review. It does not create day logs for
 * upcoming preview days.
 */
export default function CyclePage() {
  const { planId } = useParams();
  const currentRhythmItemRef = useRef(null);

  const { state } = useAppState();
  const plan = getPlanById(planId);
  const days = getDaysByPlanId(planId);

  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber ?? 1;
  const currentCycle = planProgress?.cycles?.[currentCycleNumber] ?? null;
  const currentDayId = currentCycle?.currentDayId ?? "d1";
  const dayOrder = plan?.dayOrder ?? days.map((day) => day.id);
  const isCycleComplete = Boolean(currentCycle?.completedAt);

  // Keep the current day visible inside the horizontal rhythm strip.
  useEffect(() => {
    currentRhythmItemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentDayId]);

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

  const currentDayLog = currentDay
    ? currentCycle?.dayLogs?.[currentDay.id]
    : null;

  const currentDaySummary = currentDay
    ? daySummaries.find(({ day }) => day.id === currentDay.id)
    : null;

  const nextExerciseName = getNextExerciseName({
    planId,
    dayDetails: currentDayDetails,
    dayLog: currentDayLog,
  });

  const heroCtaLabel = getHeroCtaLabel({
    isCycleComplete,
    currentDayDetails,
    currentDayLog,
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
      <AppShell mode="training">
        <div className={UI_STACK_LG}>
          <Link
            to={`/plan/${planId}`}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#5EC7D5]/85 transition-colors hover:text-[#8FDCE5]"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Back to plan
          </Link>

          <CycleHeader
            planName="Plan not found"
            cycleLabel=""
            statusSummary="The selected plan could not be loaded."
            progressPercent={0}
          />
        </div>
      </AppShell>
    );
  }

  // CyclePage is a runtime dashboard, not a pre-start preview.
  // If the cycle has not been created yet, send the user back to Plan Overview
  // where the explicit Start Cycle action lives.
  if (!currentCycle) {
    return (
      <AppShell mode="training">
        <div className="flex flex-col gap-6 py-0">
          <Link
            to={`/plan/${planId}`}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#5EC7D5]/85 transition-colors hover:text-[#8FDCE5]"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            Back to plan
          </Link>

          <section className="rounded-3xl border border-white/10 bg-[#151A1D] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8FDCE5]/78">
              Cycle not started
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#F4F7F8]">
              Start your cycle first
            </h1>

            <p className="mt-3 text-base leading-7 text-[#A9B0B5]">
              This dashboard becomes active after you start the plan cycle from
              the plan overview screen.
            </p>

            <Link
              to={`/plan/${planId}`}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#5EC7D5] px-4 text-sm font-semibold text-[#031014] shadow-[0_8px_20px_rgba(63,168,182,0.13)] transition-colors hover:bg-[#6DD6E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC7D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151A1D]"
            >
              Go to plan overview
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mode="training">
      <div className="flex flex-col gap-5 py-0">
        <Link
          to={`/plan/${planId}`}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#5EC7D5]/85 transition-colors hover:text-[#8FDCE5]"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          Back to plan
        </Link>

        <CycleHeader
          planName={plan.name}
          cycleLabel={`Cycle ${currentCycleNumber}`}
          statusSummary={`${completedDayCount} of ${totalTrainingDays} training days closed`}
          progressPercent={progressPercent}
        />

        <section
          aria-label="Cycle rhythm"
          className="mt-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex min-w-max items-center gap-2">
            {rhythmSlots.map((slot) => {
              if (slot.type === "rest") {
                return (
                  <div
                    key={slot.id}
                    className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-white/8 bg-white/5 text-zinc-500"
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
                  ref={isCurrent ? currentRhythmItemRef : null}
                  to={`/plan/${planId}/day/${slot.day.id}`}
                  className={[
                    "flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border text-center transition-colors",
                    isCurrent
                      ? "border-[#3FA8B6]/70 bg-[#10292E] text-[#DDF8FB]"
                      : "",
                    isFinished
                      ? "border-[#24515A] bg-[#0D2227] text-[#9CE2EA]"
                      : "",
                    !isCurrent && !isFinished
                      ? "border-white/8 bg-white/5 text-zinc-500 hover:border-[#3FA8B6]/30"
                      : "",
                  ].join(" ")}
                >
                  <span className="text-sm font-semibold">
                    {slot.day.label}
                  </span>

                  {isFinished ? (
                    <CheckCircle2
                      className="h-4 w-4 text-[#8FDCE5]"
                      aria-hidden="true"
                    />
                  ) : isCurrent ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-[#5EC7D5]" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-white/14" />
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {currentDay ? (
          <section className="relative overflow-hidden rounded-3xl border border-[#3FA8B6]/18 bg-[#10292E] p-5 shadow-[0_18px_46px_rgba(0,0,0,0.36)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(95,199,213,0.12),transparent_34%),radial-gradient(circle_at_10%_100%,rgba(63,168,182,0.09),transparent_42%)]" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-2/5 bg-[linear-gradient(135deg,transparent,rgba(255,255,255,0.045))]" />

            <div className="relative flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FDCE5]/90">
                  {isCycleComplete ? "Current cycle" : "Current day"}
                </p>

                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-semibold leading-tight tracking-tight text-[#F4F7F8] sm:text-4xl">
                    {isCycleComplete
                      ? "Cycle complete"
                      : `${currentDay.label} ${currentDay.name}`}
                  </h2>

                  <p className="max-w-sm text-base leading-6 text-[#C7D0D4]">
                    {isCycleComplete
                      ? `All ${totalTrainingDays} training days are closed. Review your cycle before starting the next one.`
                      : (currentDayDetails?.goal ??
                        "Open the current training day and keep the cycle moving.")}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                {isCycleComplete ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-[#C7D0D4]">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-[#8FDCE5]"
                      aria-hidden="true"
                    />
                    <span>
                      {completedDayCount}/{totalTrainingDays} training days
                      closed
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-[#C7D0D4]">
                      <span className="inline-flex items-center gap-1.5">
                        <Dumbbell
                          className="h-4 w-4 text-[#5EC7D5]"
                          aria-hidden="true"
                        />
                        {currentDaySummary?.totalExerciseCount ?? 0} exercises
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Flame
                          className="h-4 w-4 text-amber-300"
                          aria-hidden="true"
                        />
                        Warm-up ready
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2 text-sm">
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-[#5EC7D5]"
                        aria-hidden="true"
                      />

                      <p className="min-w-0 text-[#C7D0D4]">
                        <span className="font-medium text-[#8FDCE5]">
                          Next up:
                        </span>{" "}
                        <span className="font-semibold text-[#F4F7F8]">
                          {nextExerciseName}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={
                  isCycleComplete
                    ? `/plan/${planId}/end-cycle`
                    : `/plan/${planId}/day/${currentDay.id}`
                }
                className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-[#5EC7D5] px-5 text-base font-semibold text-[#031014] shadow-[0_10px_24px_rgba(63,168,182,0.17)] transition-colors hover:bg-[#6DD6E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC7D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10292E]"
              >
                {heroCtaLabel}
                <ChevronRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </section>
        ) : null}

        {upcomingDays.length > 0 ? (
          <section className="mt-1 flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A9B0B5]">
              Up next
            </p>

            <div className="flex flex-col gap-2">
              {upcomingDays.map(({ day, statusLabel, statusDetail }) => (
                <DayCard
                  key={day.id}
                  planId={planId}
                  day={day}
                  status={statusLabel}
                  statusDetail={statusDetail}
                  meta={[
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
          <section className="mt-1 flex flex-col gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A9B0B5]">
              Completed
            </p>

            <div className="flex flex-col gap-2">
              {completedDays.map(({ day, statusLabel, statusDetail }) => (
                <DayCard
                  key={day.id}
                  planId={planId}
                  day={day}
                  status={statusLabel}
                  statusDetail={statusDetail}
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

        <section className="mt-1 flex items-center gap-4 rounded-3xl border border-white/8 bg-[#171C1F] p-4">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-[#3FA8B6]/20 bg-[#10292E] text-[#8FDCE5]">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>

          <p className="text-base font-medium leading-6 text-[#F4F7F8]">
            Rest days keep the cycle moving.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
