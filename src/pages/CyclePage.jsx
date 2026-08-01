import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ContinuityRail from "../components/cycle/ContinuityRail";
import AppShell from "../components/layout/AppShell";
import { getDayDetails } from "../data/dayDetails";
import { getDaysByPlanId } from "../data/days";
import { getExercisesForDay } from "../data/exercises";
import { getPlanById } from "../data/plans";
import { useAppState } from "../state/useAppState";
import { getDayMode, getDayModeLabel } from "../utils/runtime/dayModeHelpers";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";

const STATIC_CORE_HINT_MAP = {
  d2: "Core A branch",
  d4: "Core B branch",
  d5: "Core C branch",
};

const STATIC_DAY_DETAIL_HINT_MAP = {
  "bulk-pro": {
    d1: "Shoulder top-up",
    d2: "Trap top-up",
    d3: "Hamstring & calf support",
    d4: "Trap work",
    d5: "Triceps support",
    d6: "Quad, arm & calf support",
  },
  "cut-pro": {
    d1: "Shoulder top-up",
    d2: "Trap top-up",
    d3: "Hamstring & calf support",
    d4: "Trap work",
    d5: "Triceps support",
    d6: "Quad, arm & calf support",
  },
};

function getDoneSetCount(dayLog) {
  if (!dayLog) return 0;

  return Object.values(dayLog.mainExerciseLogs ?? {}).reduce(
    (total, exerciseLog) =>
      total + (exerciseLog.sets?.filter((set) => set.isDone).length ?? 0),
    0,
  );
}

function hasDayActivity(dayLog) {
  if (!dayLog) return false;

  return Object.values(dayLog.mainExerciseLogs ?? {}).some(
    (exerciseLog) =>
      Boolean(exerciseLog.closedAt) ||
      Boolean(exerciseLog.sets?.some((set) => set.isDone)),
  );
}

function areAllMainExercisesClosed(dayDetails, dayLog) {
  if (!dayDetails?.exerciseIds?.length || !dayLog) return false;

  return dayDetails.exerciseIds.every((exerciseId) =>
    Boolean(dayLog.mainExerciseLogs?.[exerciseId]?.closedAt),
  );
}

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
    ? Object.keys(dayLog.mainExerciseLogs ?? {}).length
    : (dayDetails?.exerciseIds.length ?? 0);
  const completedExerciseCount = dayLog
    ? Object.values(dayLog.mainExerciseLogs ?? {}).filter(
        (exerciseLog) => getExerciseStatus(exerciseLog) === "complete",
      ).length
    : 0;
  const doneSetCount = getDoneSetCount(dayLog);

  let state = "planned";
  let stateLabel = getDayModeLabel(dayMode);

  if (dayMode === "finished") {
    const isFull =
      totalExerciseCount > 0 && completedExerciseCount === totalExerciseCount;
    state = isFull ? "complete" : doneSetCount > 0 ? "partial" : "empty";
    stateLabel = isFull
      ? "Closed · full main work"
      : doneSetCount > 0
        ? "Closed · partial work"
        : "Closed · no sets checked";
  } else if (dayMode === "active") {
    state = "current";
    stateLabel = doneSetCount > 0 ? `Current · ${doneSetCount} sets` : "Current node";
  } else if (dayMode === "upcoming") {
    state = "upcoming";
    stateLabel = "Read-only preview";
  }

  return {
    day,
    dayDetails,
    dayLog,
    dayMode,
    state,
    stateLabel,
    totalExerciseCount,
    completedExerciseCount,
    doneSetCount,
  };
}

function getNextExerciseName({ planId, dayDetails, dayLog }) {
  if (!dayDetails?.exerciseIds?.length) return "Open workout";

  const exercises = getExercisesForDay(planId, dayDetails.exerciseIds);

  if (!dayLog) return exercises[0]?.name ?? "Open workout";

  const nextExerciseId = dayDetails.exerciseIds.find((exerciseId) => {
    const exerciseLog = dayLog.mainExerciseLogs?.[exerciseId];
    if (!exerciseLog) return true;
    if (exerciseLog.closedAt) return false;
    return getExerciseStatus(exerciseLog) !== "complete";
  });

  if (!nextExerciseId) return "Ready to close the day";

  return (
    exercises.find((exercise) => exercise.id === nextExerciseId)?.name ??
    "Open workout"
  );
}

function buildRailItems({ daySummaries, planId }) {
  return daySummaries.flatMap((summary) => {
    const { day, dayDetails } = summary;
    const hint = [
      STATIC_CORE_HINT_MAP[day.id],
      STATIC_DAY_DETAIL_HINT_MAP[planId]?.[day.id],
    ]
      .filter(Boolean)
      .join(" · ");

    const item = {
      id: day.id,
      kind: "day",
      label: day.label,
      title: day.name,
      detail:
        summary.dayMode === "active"
          ? dayDetails?.goal
          : summary.dayMode === "finished"
            ? `${summary.completedExerciseCount}/${summary.totalExerciseCount} main exercises checked · ${summary.doneSetCount} performed sets`
            : `${summary.totalExerciseCount} exercises · ${hint}`,
      state: summary.state,
      stateLabel: summary.stateLabel,
      meta: STATIC_CORE_HINT_MAP[day.id] ?? null,
      ariaLabel: `${day.label} ${day.name}, ${summary.stateLabel}`,
      to:
        summary.dayMode === "active"
          ? undefined
          : `/plan/${planId}/day/${day.id}`,
    };

    const items = [item];
    if (["d2", "d4", "d6"].includes(day.id)) {
      items.push({
        id: `rest-after-${day.id}`,
        kind: "rest",
        label: "Rest",
        title: "Recovery slot",
        detail: "Rhythm context only · no workout log",
        state: "rest",
        stateLabel: "Recovery",
        ariaLabel: `Recovery slot after ${day.label}`,
      });
    }
    return items;
  });
}

/** The defining operational map for the current six-day/nine-slot cycle. */
export default function CyclePage() {
  const { planId } = useParams();
  const { state } = useAppState();
  const plan = getPlanById(planId);
  const days = getDaysByPlanId(planId);
  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber ?? 1;
  const currentCycle = planProgress?.cycles?.[currentCycleNumber] ?? null;

  if (!plan) {
    return (
      <AppShell mode="product">
        <div className="flex flex-col gap-7">
          <Link
            to="/"
            className="inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Home
          </Link>
          <section className="cut-corner border border-[#C9C1AF] bg-[#F8F5EB] p-5">
            <h1 className="font-display text-4xl font-bold uppercase leading-none text-[#191A16]">
              Plan not found
            </h1>
          </section>
        </div>
      </AppShell>
    );
  }

  if (!currentCycle) {
    return (
      <AppShell mode="product">
        <div className="flex flex-col gap-7">
          <Link
            to={`/plan/${planId}`}
            className="inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Plan overview
          </Link>
          <section className="cut-corner border border-[#C9C1AF] bg-[#F8F5EB] p-5">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
              Cycle instrument offline
            </p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.9] text-[#191A16]">
              Start the cycle first
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#5B5D54]">
              The cycle view becomes a runtime map only after the explicit start
              action on Plan Overview.
            </p>
            <Link
              to={`/plan/${planId}`}
              className="cut-corner-sm mt-5 inline-flex min-h-12 w-full items-center justify-between border border-[#191A16] bg-[#191A16] px-4 text-sm font-semibold text-[#F8F5EB]"
            >
              Go to plan overview
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </AppShell>
    );
  }

  const currentDayId = currentCycle.currentDayId;
  const dayOrder = plan.dayOrder ?? days.map((day) => day.id);
  const isCycleComplete = Boolean(currentCycle.completedAt);
  const daySummaries = days.map((day) =>
    getDayRuntimeSummary({
      planId,
      day,
      currentCycle,
      currentDayId,
      dayOrder,
    }),
  );
  const completedDayCount = daySummaries.filter(
    ({ dayMode }) => dayMode === "finished",
  ).length;
  const partialDayCount = daySummaries.filter(
    ({ dayMode, doneSetCount, completedExerciseCount, totalExerciseCount }) =>
      dayMode === "finished" &&
      doneSetCount > 0 &&
      completedExerciseCount < totalExerciseCount,
  ).length;
  const emptyDayCount = daySummaries.filter(
    ({ dayMode, doneSetCount }) => dayMode === "finished" && doneSetCount === 0,
  ).length;
  const currentSummary = daySummaries.find(
    ({ day }) => day.id === currentDayId,
  );
  const nextExerciseName = getNextExerciseName({
    planId,
    dayDetails: currentSummary?.dayDetails,
    dayLog: currentSummary?.dayLog,
  });
  const railItems = buildRailItems({
    daySummaries,
    planId,
  });

  return (
    <AppShell mode="product" width="wide">
      <div className="flex flex-col gap-7 pb-3">
        <Link
          to={`/plan/${planId}`}
          className="inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E] transition-colors hover:text-[#191A16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Plan overview
        </Link>

        <header className="grid gap-5 border-b border-[#C9C1AF] pb-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
              {plan.name} · Continuity map
            </p>
            <h1 className="mt-2 font-display text-6xl font-extrabold uppercase leading-[0.84] tracking-[-0.035em] text-[#191A16] min-[390px]:text-7xl">
              Cycle {currentCycleNumber}
              <span className="block text-[#6F7068]">
                {isCycleComplete ? "Path closed" : "In motion"}
              </span>
            </h1>
          </div>

          <div className="border-l-2 border-[#FF5A3C] pl-4 sm:min-w-48">
            <p className="font-display text-4xl font-bold leading-none tabular-nums text-[#191A16]">
              {String(completedDayCount).padStart(2, "0")}
              <span className="text-[#6F7068]">/06</span>
            </p>
            <p className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#5F6158]">
              Days closed
            </p>
            <p className="mt-2 text-xs leading-5 text-[#66675E]">
              {partialDayCount > 0
                ? `${partialDayCount} closed with partial main work`
                : emptyDayCount > 0
                  ? `${emptyDayCount} closed without performed main sets`
                  : "Performed work remains separate from closure"}
            </p>
          </div>
        </header>

        {!isCycleComplete && currentSummary ? (
          <section className="cut-corner grid gap-4 border border-[#34362E] bg-[#1B1C17] p-5 text-[#F2EEE4] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#FF8B73]">
                Current marker · {currentSummary.day.label}
              </p>
              <h2 className="mt-2 font-display text-4xl font-bold uppercase leading-none">
                {nextExerciseName}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#AAA99F]">
                {hasDayActivity(currentSummary.dayLog)
                  ? "Continue from the evidence already saved in this day."
                  : "Open the day to create its prescribed logging rows."}
              </p>
            </div>
            <Link
              to={`/plan/${planId}/day/${currentSummary.day.id}`}
              className="cut-corner-sm inline-flex min-h-12 items-center justify-between gap-5 border border-[#FF795F] bg-[#FF5A3C] px-4 text-sm font-semibold text-[#171814] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B1C17]"
            >
              {areAllMainExercisesClosed(
                currentSummary.dayDetails,
                currentSummary.dayLog,
              )
                ? "Review day"
                : hasDayActivity(currentSummary.dayLog)
                  ? "Continue day"
                  : "Start day"}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        {isCycleComplete ? (
          <section className="cut-corner grid gap-4 border border-[#34362E] bg-[#1B1C17] p-5 text-[#F2EEE4] sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B8CB70]">
                Handoff ready
              </p>
              <h2 className="mt-2 font-display text-4xl font-bold uppercase leading-none">
                Six days closed. Evidence preserved.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#AAA99F]">
                Review the actual path before explicitly starting another cycle.
              </p>
            </div>
            <Link
              to={`/plan/${planId}/end-cycle`}
              className="cut-corner-sm inline-flex min-h-12 items-center justify-between gap-5 border border-[#B8CB70] bg-[#B8CB70] px-4 text-sm font-semibold text-[#171814]"
            >
              Review cycle
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        <section aria-labelledby="cycle-path-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#5F6158]">
                {isCycleComplete
                  ? "Closed → review → next cycle"
                  : "Performed → current → next → rest"}
              </p>
              <h2
                id="cycle-path-heading"
                className="mt-1 font-display text-4xl font-bold uppercase leading-none text-[#191A16]"
              >
                One connected path
              </h2>
            </div>
            <p className="hidden max-w-52 text-right text-xs leading-5 text-[#66675E] sm:block">
              Select a closed day to review it or an upcoming day to preview it.
            </p>
          </div>

          <ContinuityRail
            items={railItems}
            orientation="vertical"
            tone="paper"
            animate
            ariaLabel={`${plan.name}, cycle ${currentCycleNumber}, nine-slot continuity map`}
            className="border-y border-[#C9C1AF]"
          />
        </section>

        <footer className="grid gap-2 border-t border-[#C9C1AF] pt-4 text-xs text-[#66675E] min-[390px]:grid-cols-3">
          <p><span className="font-semibold text-[#38502F]">Closed</span> records lifecycle.</p>
          <p><span className="font-semibold text-[#7A4B09]">Partial</span> keeps work honest.</p>
          <p>
            {isCycleComplete ? (
              <><span className="font-semibold text-[#5F6158]">Empty</span> remains a valid record.</>
            ) : (
              <><span className="font-semibold text-[#A72F1D]">Current</span> owns the next action.</>
            )}
          </p>
        </footer>
      </div>
    </AppShell>
  );
}
