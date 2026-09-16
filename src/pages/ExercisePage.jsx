import { useNavigate, useParams } from "react-router-dom";

import { useAppState } from "../state/useAppState";
import { APP_ACTIONS } from "../state/appActions";
import AppShell from "../components/layout/AppShell";
import BackControl from "../components/common/BackControl";
import GuardState from "../components/common/GuardState";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getExerciseById } from "../data/exercises";
import ExerciseWorkflowCard from "../components/exercise/ExerciseWorkflowCard";
import { sanitizeSetInputValue } from "../utils/runtime/setInputHelpers";
import { hasCarryOverValuesForExercise } from "../utils/runtime/carryOverHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";

/**
 * Builds display-only rows for upcoming exercise previews.
 *
 * Runtime note:
 * These rows are not runtime scaffolding. Real exercise logs are created by
 * the reducer/helper layer from structured metadata such as `setCount`.
 */
function buildStaticExerciseRows(exercise) {
  const setCount =
    Number.isInteger(exercise?.setCount) && exercise.setCount > 0
      ? exercise.setCount
      : 0;

  return Array.from({ length: setCount }, (_, index) => ({
    setNumber: index + 1,
    weight: "—",
    reps: "—",
    rir: "—",
    isDone: false,
  }));
}

function getExerciseState({ dayMode, sets }) {
  if (dayMode === "upcoming") {
    return {
      label: "Preview",
      className: "text-[#AAB2BA]",
    };
  }

  if (dayMode === "finished") {
    return {
      label: "Saved log",
      className: "text-[#79C89A]",
    };
  }

  const completedSetCount = sets.filter((set) => set.isDone).length;

  if (sets.length > 0 && completedSetCount === sets.length) {
    return {
      label: "Logged",
      className: "text-[#79C89A]",
    };
  }

  if (completedSetCount > 0) {
    return {
      label: "In progress",
      className: "text-[#F1B864]",
    };
  }

  return {
    label: "Current exercise",
    className: "text-[#B8F36B]",
  };
}

/**
 * Page-level orchestrator for one exercise workflow.
 *
 * Runtime note:
 * ExercisePage chooses between read-only preview rows and runtime set rows,
 * then delegates all set updates and close intent through reducer actions.
 */
export default function ExercisePage() {
  const { planId, dayId, exerciseId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();

  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);
  const exercise = getExerciseById(planId, exerciseId);
  const isExerciseInDay = Boolean(
    dayDetails?.exerciseIds?.includes(exerciseId),
  );

  // Read the current runtime cycle/day/exercise state for this route.
  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber;
  const currentCycle = currentCycleNumber
    ? planProgress?.cycles?.[currentCycleNumber]
    : null;
  const dayLog = dayDetails ? currentCycle?.dayLogs?.[dayDetails.id] : null;
  const exerciseLog = exerciseId
    ? dayLog?.mainExerciseLogs?.[exerciseId]
    : null;

  const currentDayId = currentCycle?.currentDayId ?? null;
  const dayOrder = plan?.dayOrder ?? [];

  const dayMode = dayDetails
    ? getDayMode({
        dayId: dayDetails.id,
        currentDayId,
        dayLog,
        dayOrder,
      })
    : "inactive";

  // Upcoming mode is preview-only: no input edits, done toggles, or close action.
  const isUpcomingPreview = dayMode === "upcoming";
  const isActiveExerciseRoute = dayMode === "active" && isExerciseInDay;
  const needsDayEntryFirst = isActiveExerciseRoute && !dayLog;

  // Adapt runtime set rows to the display shape expected by ExerciseWorkflowCard.
  const runtimeSets =
    exerciseLog?.sets.map((set) => ({
      setNumber: set.setIndex,
      weight: set.weight,
      reps: set.reps,
      rir: set.rir,
      isDone: set.isDone,
    })) ?? [];

  const previewSets = buildStaticExerciseRows(exercise);

  // Upcoming days use static preview rows. Active/finished days use runtime rows.
  const displaySets = isUpcomingPreview ? previewSets : runtimeSets;

  // Previous-values UI must reflect historical carry-over availability only.
  // Today's editable rows are intentionally ignored so typing new values does not
  // turn the message into "Previous values available".
  const hasPreviousValues =
    !isUpcomingPreview &&
    hasCarryOverValuesForExercise({
      cycles: planProgress?.cycles,
      currentCycleNumber,
      dayId: dayDetails?.id,
      exerciseId,
      setCount: exercise?.setCount,
    });

  // Handler guards are a safety boundary: upcoming previews may render the
  // target structure, but they must not dispatch runtime updates.
  function handleToggleSetDone(setNumber) {
    if (isUpcomingPreview) {
      return;
    }

    dispatch({
      type: APP_ACTIONS.TOGGLE_EXERCISE_SET_DONE,
      payload: {
        planId,
        dayId,
        exerciseId,
        setIndex: setNumber,
      },
    });
  }

  // Update one editable value on one prescribed runtime set row.
  function handleUpdateSetField(setNumber, field, value) {
    if (isUpcomingPreview) {
      return;
    }

    const sanitizedValue = sanitizeSetInputValue(field, value);

    if (sanitizedValue === null) {
      return;
    }

    dispatch({
      type: APP_ACTIONS.UPDATE_EXERCISE_SET_FIELD,
      payload: {
        planId,
        dayId,
        exerciseId,
        setIndex: setNumber,
        field,
        value: sanitizedValue,
      },
    });
  }

  // Close intent is stored on the exercise log; set completion remains derived
  // from set rows.
  function handleCloseExercise() {
    if (isUpcomingPreview) {
      return;
    }

    dispatch({
      type: APP_ACTIONS.MARK_EXERCISE_CLOSED,
      payload: {
        planId,
        dayId,
        exerciseId,
        closedAt: new Date().toISOString(),
      },
    });

    navigate(`/plan/${planId}/day/${dayId}`);
  }

  if (!plan || !dayDetails || !exercise || !isExerciseInDay) {
    const fallbackTo = plan ? `/plan/${planId}/cycle` : "/";
    const fallbackLabel = plan ? "Return to cycle" : "Back to home";
    const context = plan
      ? `${plan.name}${dayDetails ? ` · ${dayDetails.label}` : ""}`
      : null;

    return (
      <GuardState
        eyebrow="Exercise unavailable"
        context={context}
        title="This exercise could not be loaded."
        description="The exercise does not belong to this training day, or its source data is unavailable. Return to a valid workout position."
        primaryTo={fallbackTo}
        primaryLabel={fallbackLabel}
      />
    );
  }

  if (!currentCycle) {
    return (
      <GuardState
        backTo="/"
        backLabel="Back to home"
        eyebrow="Exercise checkpoint"
        context={`${plan.name} · ${dayDetails.label}`}
        title="Start a cycle first."
        description="Exercise logging becomes available after you explicitly start the plan cycle from Plan Overview."
        primaryTo={`/plan/${planId}`}
        primaryLabel="Go to plan overview"
      />
    );
  }

  if (needsDayEntryFirst) {
    return (
      <GuardState
        eyebrow="Exercise checkpoint"
        context={`${plan.name} · ${dayDetails.label}`}
        title="Open the day first."
        description="Enter the current day before opening its exercise log. This keeps runtime creation inside the valid workout flow."
        backTo={`/plan/${planId}/cycle`}
        backLabel="Back to cycle"
        primaryTo={`/plan/${planId}/day/${dayId}`}
        primaryLabel="Go to day"
      />
    );
  }

  const exerciseState = getExerciseState({
    dayMode,
    sets: displaySets,
  });

  return (
    <AppShell>
      <div className="space-y-5">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <BackControl to={`/plan/${planId}/day/${dayId}`} className="shrink-0">
              Back to day
            </BackControl>

            <p className="min-w-0 truncate text-right text-xs font-medium text-[#77818B]">
              {plan.name} · Cycle {currentCycleNumber ?? 1} · {dayDetails.label}
            </p>
          </div>

          <div className="border-b border-[#2A3138] pb-5">
            <p
              className={`text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${exerciseState.className}`}
            >
              {exerciseState.label}
            </p>

            <h1 className="mt-2 max-w-[20ch] text-[2rem] font-semibold leading-[1.06] tracking-[-0.045em] text-[#F3F5F1]">
              {exercise.name}
            </h1>

            <p className="mt-2 max-w-[34rem] text-sm leading-6 text-[#AAB2BA]">
              {exercise.subtitle}
            </p>
          </div>
        </header>

        <ExerciseWorkflowCard
          exercise={exercise}
          sets={displaySets}
          isReadOnly={isUpcomingPreview}
          hasPreviousValues={hasPreviousValues}
          dayMode={dayMode}
          onToggleSetDone={handleToggleSetDone}
          onUpdateSetField={handleUpdateSetField}
          onCloseExercise={handleCloseExercise}
        />
      </div>
    </AppShell>
  );
}
