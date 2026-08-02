import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Moon,
} from "lucide-react";

import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import BackControl from "../components/common/BackControl";
import GuardState from "../components/common/GuardState";
import DayCard from "../components/cycle/DayCard";
import CycleHeader from "../components/cycle/CycleHeader";

import { getPlanById } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import { getDayDetails } from "../data/dayDetails";
import { getExercisesForDay } from "../data/exercises";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";
import { getDayMode, getDayModeLabel } from "../utils/runtime/dayModeHelpers";

// Screen-specific display hints for Cycle rows.
// These values do not affect day completion or core runtime state.
const STATIC_CORE_HINT_MAP = {
  d2: "Core A",
  d4: "Core B",
  d5: "Core C",
};

// The base day data stays unchanged; this layer only improves Cycle display.
const STATIC_DAY_DETAIL_HINT_MAP = {
  "bulk-pro": {
    d1: "Shoulder top-up",
    d2: "Trap top-up",
    d3: "Hamstring & calf support",
    d4: "Trap work",
    d5: "Triceps support",
    d6: "Quad, arm, and calf support",
  },
  "cut-pro": {
    d1: "Shoulder top-up",
    d2: "Trap top-up",
    d3: "Hamstring spark & calf support",
    d4: "Trap work",
    d5: "Triceps support",
    d6: "Quad, arm, and calf support",
  },
};

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
      evidenceState: "logged",
      statusLabel: "Closed",
      statusDetail: `${completedExerciseCount}/${totalExerciseCount} logged`,
    };
  }

  if (completedExerciseCount > 0) {
    return {
      evidenceState: "partial",
      statusLabel: "Closed partial",
      statusDetail: `${completedExerciseCount}/${totalExerciseCount} logged`,
    };
  }

  if (doneSetCount > 0) {
    return {
      evidenceState: "partial",
      statusLabel: "Closed partial",
      statusDetail: getLoggedSetLabel(doneSetCount),
    };
  }

  return {
    evidenceState: "empty",
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

// Builds presentation state from existing runtime logs.
// It never creates or mutates a day, exercise, or core log.
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
  const progressLabel = `${completedExerciseCount}/${totalExerciseCount} logged`;
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
      evidenceState: "current",
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
      evidenceState: "upcoming",
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
      evidenceState: "partial",
      completedExerciseCount,
      totalExerciseCount,
      doneSetCount,
      statusLabel: `In progress · ${progressLabel}`,
      statusDetail: null,
    };
  }

  return {
    dayMode,
    evidenceState: "upcoming",
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
// They do not create routes, logs, completion state, or persistence.
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

function getRhythmDayClassName(summary) {
  if (summary?.dayMode === "active") {
    return "border-[#B8F36B] bg-[#B8F36B] text-[#0B0E11] shadow-[0_8px_22px_rgba(184,243,107,0.12)]";
  }

  if (summary?.evidenceState === "logged") {
    return "border-[#79C89A]/32 bg-[#79C89A]/[0.08] text-[#A6DDB8]";
  }

  if (summary?.evidenceState === "partial") {
    return "border-[#F1B864]/34 bg-[#F1B864]/[0.08] text-[#F4C87F]";
  }

  if (summary?.dayMode === "finished") {
    return "border-[#3A434C] bg-[#171D22] text-[#8D969E]";
  }

  return "border-[#2A3138] bg-[#13181D] text-[#77818B] hover:border-[#46515B] hover:text-[#AAB2BA]";
}

function getRhythmDayAriaLabel(day, summary) {
  if (summary?.dayMode === "active") {
    return `${day.label} ${day.name}, current day`;
  }

  if (summary?.evidenceState === "logged") {
    return `${day.label} ${day.name}, closed with all exercises logged`;
  }

  if (summary?.evidenceState === "partial") {
    return `${day.label} ${day.name}, closed partial`;
  }

  if (summary?.dayMode === "finished") {
    return `${day.label} ${day.name}, closed with no sets logged`;
  }

  return `${day.label} ${day.name}, upcoming preview`;
}

function getDayMeta(planId, dayId) {
  return [
    STATIC_CORE_HINT_MAP[dayId],
    STATIC_DAY_DETAIL_HINT_MAP[planId]?.[dayId],
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Runtime-aware cycle dashboard for one selected plan.
 *
 * Runtime boundary:
 * CyclePage reads the current cycle, derives display states, and routes the
 * user toward the current day or cycle review. It does not create day logs for
 * upcoming preview days and does not mutate cycle state.
 */
export default function CyclePage() {
  const { planId } = useParams();
  const currentRhythmItemRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { state } = useAppState();
  const plan = getPlanById(planId);
  const days = getDaysByPlanId(planId);

  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber ?? 1;
  const currentCycle = planProgress?.cycles?.[currentCycleNumber] ?? null;
  const currentDayId = currentCycle?.currentDayId ?? "d1";
  const dayOrder = plan?.dayOrder ?? days.map((day) => day.id);
  const isCycleComplete = Boolean(currentCycle?.completedAt);

  useEffect(() => {
    currentRhythmItemRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [currentDayId, shouldReduceMotion]);

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
      <GuardState
        eyebrow="Cycle unavailable"
        title="This cycle does not belong to a current plan."
        description="Return home and choose a valid training plan before opening its cycle dashboard."
        primaryTo="/"
        primaryLabel="Back to home"
      />
    );
  }

  // Cycle is an operational dashboard, not a pre-start preview.
  if (!currentCycle) {
    return (
      <GuardState
        eyebrow="Cycle not started"
        context={plan.name}
        title="Start this plan cycle first."
        description="The dashboard becomes active after you explicitly start the cycle from Plan Overview."
        primaryTo={`/plan/${planId}`}
        primaryLabel="Go to plan overview"
        secondaryTo="/"
        secondaryLabel="Back to home"
      />
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-2">
        <BackControl to={`/plan/${planId}`}>Back to plan</BackControl>

        <CycleHeader
          planName={plan.name}
          cycleLabel={`Cycle ${currentCycleNumber}`}
          closedCount={completedDayCount}
          totalCount={totalTrainingDays}
        />

        <section aria-labelledby="cycle-rhythm-title">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.66rem] font-bold uppercase tracking-[0.16em] text-[#77818B]">
                System map
              </p>
              <h2
                id="cycle-rhythm-title"
                className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#DDE1DD]"
              >
                9-day rhythm
              </h2>
            </div>

            <p className="pb-0.5 text-xs text-[#68737D]">Swipe to inspect</p>
          </div>

          <div className="relative mt-3 max-w-full overflow-hidden rounded-[1.1rem] border border-[#2A3138] bg-[#11161A]">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-gradient-to-r from-[#11161A] to-transparent"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-5 bg-gradient-to-l from-[#11161A] to-transparent"
              aria-hidden="true"
            />

            <div className="overflow-x-auto px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:[scrollbar-width:thin] sm:[scrollbar-color:rgba(119,129,139,0.52)_transparent] sm:[&::-webkit-scrollbar]:block sm:[&::-webkit-scrollbar]:h-1.5 sm:[&::-webkit-scrollbar-track]:bg-transparent sm:[&::-webkit-scrollbar-thumb]:rounded-full sm:[&::-webkit-scrollbar-thumb]:bg-[#46515B]">
              <div className="flex min-w-max items-center">
                {rhythmSlots.map((slot, index) => {
                  const isLastSlot = index === rhythmSlots.length - 1;

                  if (slot.type === "rest") {
                    return (
                      <div key={slot.id} className="flex items-center">
                        <div
                          className="flex h-13 w-12 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-[#2A3138] bg-[#13181D] text-[#68737D]"
                          aria-label="Rest and recovery position"
                        >
                          <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="text-[0.58rem] font-bold uppercase tracking-[0.08em]">
                            Rest
                          </span>
                        </div>

                        {!isLastSlot ? (
                          <span
                            className="mx-1.5 h-px w-3 bg-[#2A3138]"
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                    );
                  }

                  const summary = daySummaries.find(
                    ({ day }) => day.id === slot.day.id,
                  );
                  const isCurrent = summary?.dayMode === "active";
                  const isFinished = summary?.dayMode === "finished";

                  return (
                    <div key={slot.day.id} className="flex items-center">
                      <Link
                        ref={isCurrent ? currentRhythmItemRef : null}
                        to={`/plan/${planId}/day/${slot.day.id}`}
                        aria-label={getRhythmDayAriaLabel(slot.day, summary)}
                        aria-current={isCurrent ? "step" : undefined}
                        className={`flex h-13 w-13 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11161A] ${getRhythmDayClassName(summary)}`}
                      >
                        <span className="text-sm font-bold">
                          {slot.day.label}
                        </span>

                        {isFinished ? (
                          <Check
                            className="h-3.5 w-3.5"
                            strokeWidth={2.5}
                            aria-hidden="true"
                          />
                        ) : isCurrent ? (
                          <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.08em]">
                            Now
                          </span>
                        ) : (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-current opacity-45"
                            aria-hidden="true"
                          />
                        )}
                      </Link>

                      {!isLastSlot ? (
                        <span
                          className="mx-1.5 h-px w-3 bg-[#2A3138]"
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {currentDay ? (
          <section className="relative overflow-hidden rounded-[1.4rem] border border-[#3A434C] bg-[#171D22] shadow-[0_16px_36px_rgba(0,0,0,0.22)]">
            <div
              className={`absolute inset-x-0 top-0 h-0.5 ${
                isCycleComplete ? "bg-[#79C89A]" : "bg-[#B8F36B]"
              }`}
              aria-hidden="true"
            />

            <div className="p-4.5">
              <p
                className={`text-[0.66rem] font-bold uppercase tracking-[0.17em] ${
                  isCycleComplete ? "text-[#8FCDA6]" : "text-[#C8F78F]"
                }`}
              >
                {isCycleComplete ? "Cycle closed" : "Current day"}
              </p>

              <h2 className="mt-2 text-[1.8rem] font-semibold leading-[1.08] tracking-[-0.055em] text-[#F3F5F1]">
                {isCycleComplete
                  ? "Cycle complete"
                  : `${currentDay.label} ${currentDay.name}`}
              </h2>

              <p className="mt-2.5 text-sm leading-6 text-[#AAB2BA]">
                {isCycleComplete
                  ? `All ${totalTrainingDays} training days are closed. Review the evidence before starting the next cycle.`
                  : (currentDayDetails?.goal ??
                    "Open the current training day and keep the cycle moving.")}
              </p>

              {isCycleComplete ? (
                <div className="mt-4 border-y border-[#2A3138] py-3">
                  <p className="text-xs font-semibold text-[#8FCDA6]">
                    {completedDayCount}/{totalTrainingDays} training days closed
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#77818B]">
                    Closed days preserve what was actually logged, including
                    partial work.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-2 border-y border-[#2A3138]">
                    <div className="py-3 pr-3">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.13em] text-[#68737D]">
                        Workload
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#DDE1DD] tabular-nums">
                        {currentDaySummary?.totalExerciseCount ?? 0} exercises
                      </p>
                    </div>

                    <div className="border-l border-[#2A3138] py-3 pl-3">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.13em] text-[#68737D]">
                        Logged
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#DDE1DD] tabular-nums">
                        {currentDaySummary?.completedExerciseCount ?? 0} /{" "}
                        {currentDaySummary?.totalExerciseCount ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#B8F36B]/[0.09] text-[#C8F78F]">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.13em] text-[#77818B]">
                        {nextExerciseName === "Ready to finish day"
                          ? "Next step"
                          : "Next exercise"}
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-5 text-[#F3F5F1]">
                        {nextExerciseName}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#77818B]">
                        Warm-up guidance is available inside the day.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <Link
                to={
                  isCycleComplete
                    ? `/plan/${planId}/end-cycle`
                    : `/plan/${planId}/day/${currentDay.id}`
                }
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B8F36B] px-4 text-sm font-bold text-[#0B0E11] transition duration-150 ease-out hover:bg-[#C8F78F] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171D22] motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                {heroCtaLabel}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>
        ) : null}

        {upcomingDays.length > 0 ? (
          <section aria-labelledby="upcoming-days-title">
            <div className="flex items-end justify-between gap-4">
              <h2
                id="upcoming-days-title"
                className="text-base font-semibold tracking-[-0.025em] text-[#DDE1DD]"
              >
                Up next
              </h2>
              <p className="text-xs font-semibold text-[#68737D] tabular-nums">
                {upcomingDays.length} remaining
              </p>
            </div>

            <div className="mt-2.5 overflow-hidden rounded-[1.1rem] border border-[#2A3138] bg-[#13181D]">
              {upcomingDays.map(
                ({ day, statusLabel, statusDetail, evidenceState }) => (
                  <DayCard
                    key={day.id}
                    planId={planId}
                    day={day}
                    status={statusLabel}
                    statusDetail={statusDetail}
                    meta={getDayMeta(planId, day.id)}
                    mode="upcoming"
                    evidenceState={evidenceState}
                  />
                ),
              )}
            </div>
          </section>
        ) : null}

        {completedDays.length > 0 ? (
          <section aria-labelledby="closed-days-title">
            <div className="flex items-end justify-between gap-4">
              <h2
                id="closed-days-title"
                className="text-base font-semibold tracking-[-0.025em] text-[#DDE1DD]"
              >
                Closed days
              </h2>
              <p className="text-xs font-semibold text-[#68737D] tabular-nums">
                {completedDays.length} saved
              </p>
            </div>

            <div className="mt-2.5 overflow-hidden rounded-[1.1rem] border border-[#2A3138] bg-[#13181D]">
              {completedDays.map(
                ({ day, statusLabel, statusDetail, evidenceState }) => (
                  <DayCard
                    key={day.id}
                    planId={planId}
                    day={day}
                    status={statusLabel}
                    statusDetail={statusDetail}
                    meta={getDayMeta(planId, day.id)}
                    mode="finished"
                    evidenceState={evidenceState}
                  />
                ),
              )}
            </div>
          </section>
        ) : null}

        <aside className="flex items-start gap-3 border-t border-[#2A3138] pt-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1B864]/[0.08] text-[#D9B06F]">
            <Moon className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="pt-0.5 text-xs leading-5 text-[#77818B]">
            Rest positions belong to the system. The calendar can move while
            the training order stays clear.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
