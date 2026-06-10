import { Link, useNavigate, useParams } from "react-router-dom";

import { useAppState } from "../state/useAppState";
import { APP_ACTIONS } from "../state/appActions";
import AppShell from "../components/layout/AppShell";
import SectionCard from "../components/layout/SectionCard";
import { UI_TEXT_MUTED } from "../styles/ui";
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

  // Upcoming mode is preview-only: no input edits, done toggles, or close action.
  const isUpcomingPreview = dayMode === "upcoming";

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

  if (!plan || !dayDetails || !exercise) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Link
            to={planId ? `/plan/${planId}/cycle` : "/"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
          >
            <span aria-hidden="true">←</span>
            Back
          </Link>

          <SectionCard>
            <p className={UI_TEXT_MUTED}>
              Exercise data could not be found for this route.
            </p>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              to={`/plan/${planId}/day/${dayId}`}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
            >
              <span aria-hidden="true">←</span>
              Back to Day
            </Link>

            <p className="flex min-w-0 items-center justify-end gap-2 text-right text-xs font-medium text-zinc-500">
              <span className="min-w-0 truncate">
                {plan.name} · Cycle {currentCycleNumber ?? 1} ·
                {dayDetails.label}
              </span>

              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.55)]"
              />
            </p>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
              {exercise.name}
            </h1>

            <p className="text-sm leading-6 text-zinc-400">
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
