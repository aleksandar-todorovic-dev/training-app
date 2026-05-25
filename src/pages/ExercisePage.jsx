import { useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../state/useAppState";
import { APP_ACTIONS } from "../state/appActions";
import AppShell from "../components/layout/AppShell";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import { UI_STACK_LG, UI_STACK_MD, UI_TEXT_MUTED } from "../styles/ui";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getExerciseById } from "../data/exercises";
import ExerciseWorkflowCard from "../components/exercise/ExerciseWorkflowCard";
import { sanitizeSetInputValue } from "../utils/runtime/setInputHelpers";
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
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to={planId ? `/plan/${planId}/cycle` : "/"}>
              Back
            </BackButton>
          </div>

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
      <div className={UI_STACK_LG}>
        <div className="flex justify-start">
          <BackButton to={`/plan/${planId}/day/${dayId}`}>
            Back to Day
          </BackButton>
        </div>

        <div className={UI_STACK_MD}>
          <p className={UI_TEXT_MUTED}>
            {dayDetails.label} — {dayDetails.name}
          </p>

          <div className={UI_STACK_MD}>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              {exercise.name}
            </h1>

            <p className={UI_TEXT_MUTED}>{exercise.subtitle}</p>
          </div>
        </div>

        {isUpcomingPreview ? (
          <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 p-4">
            <p className="text-sm font-semibold text-zinc-100">
              Upcoming exercise preview
            </p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-400">
              This exercise is part of an upcoming day. You can review the
              target structure, but logging unlocks when this day becomes
              current.
            </p>
          </div>
        ) : null}

        <ExerciseWorkflowCard
          exercise={exercise}
          sets={displaySets}
          isReadOnly={isUpcomingPreview}
          onToggleSetDone={handleToggleSetDone}
          onUpdateSetField={handleUpdateSetField}
          onCloseExercise={handleCloseExercise}
        />
      </div>
    </AppShell>
  );
}
