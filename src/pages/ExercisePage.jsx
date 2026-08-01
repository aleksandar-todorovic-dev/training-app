import { Link, useNavigate, useParams } from "react-router-dom";

import { useAppState } from "../state/useAppState";
import { APP_ACTIONS } from "../state/appActions";
import AppShell from "../components/layout/AppShell";
import ExerciseWorkflowCard from "../components/exercise/ExerciseWorkflowCard";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getExerciseById } from "../data/exercises";
import { sanitizeSetInputValue } from "../utils/runtime/setInputHelpers";
import {
  getLatestCarryOverFieldValue,
  hasCarryOverValuesForExercise,
} from "../utils/runtime/carryOverHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";

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

/** Page-level runtime boundary for one main exercise. */
export default function ExercisePage() {
  const { planId, dayId, exerciseId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();

  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);
  const exercise = getExerciseById(planId, exerciseId);
  const isExerciseInDay = Boolean(dayDetails?.exerciseIds?.includes(exerciseId));
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
    ? getDayMode({ dayId: dayDetails.id, currentDayId, dayLog, dayOrder })
    : "inactive";
  const isUpcomingPreview = dayMode === "upcoming";
  const isActiveExerciseRoute = dayMode === "active" && isExerciseInDay;
  const needsDayEntryFirst = isActiveExerciseRoute && !dayLog;

  const runtimeSets =
    exerciseLog?.sets.map((set) => ({
      setNumber: set.setIndex,
      weight: set.weight,
      reps: set.reps,
      rir: set.rir,
      isDone: set.isDone,
    })) ?? [];
  const displaySets = isUpcomingPreview
    ? buildStaticExerciseRows(exercise)
    : runtimeSets;
  const hasPreviousValues =
    !isUpcomingPreview &&
    hasCarryOverValuesForExercise({
      cycles: planProgress?.cycles,
      currentCycleNumber,
      dayId: dayDetails?.id,
      exerciseId,
      setCount: exercise?.setCount,
    });
  const previousSets = displaySets.map((set) => ({
    setNumber: set.setNumber,
    weight: getLatestCarryOverFieldValue({
      cycles: planProgress?.cycles,
      currentCycleNumber,
      dayId: dayDetails?.id,
      exerciseId,
      setIndex: set.setNumber,
      field: "weight",
    }),
    reps: getLatestCarryOverFieldValue({
      cycles: planProgress?.cycles,
      currentCycleNumber,
      dayId: dayDetails?.id,
      exerciseId,
      setIndex: set.setNumber,
      field: "reps",
    }),
    rir: getLatestCarryOverFieldValue({
      cycles: planProgress?.cycles,
      currentCycleNumber,
      dayId: dayDetails?.id,
      exerciseId,
      setIndex: set.setNumber,
      field: "rir",
    }),
  }));

  function handleToggleSetDone(setNumber) {
    if (isUpcomingPreview) return;
    dispatch({
      type: APP_ACTIONS.TOGGLE_EXERCISE_SET_DONE,
      payload: { planId, dayId, exerciseId, setIndex: setNumber },
    });
  }

  function handleUpdateSetField(setNumber, field, value) {
    if (isUpcomingPreview) return;
    const sanitizedValue = sanitizeSetInputValue(field, value);
    if (sanitizedValue === null) return;
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

  function handleCloseExercise() {
    if (isUpcomingPreview) return;
    dispatch({
      type: APP_ACTIONS.MARK_EXERCISE_CLOSED,
      payload: { planId, dayId, exerciseId, closedAt: new Date().toISOString() },
    });
    navigate(`/plan/${planId}/day/${dayId}`);
  }

  if (!plan || !dayDetails || !exercise || !isExerciseInDay) {
    return (
      <AppShell mode="training">
        <div className="space-y-6">
          <Link
            to={planId ? `/plan/${planId}/cycle` : "/"}
            className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#AAA99F]"
          >
            ← Back
          </Link>
          <section className="cut-corner border border-[#3B3D34] bg-[#21221D] p-5">
            <h1 className="font-display text-3xl font-bold uppercase text-[#F2EEE4]">
              Exercise not found
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#AAA99F]">
              Exercise data could not be found for this route.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  if (needsDayEntryFirst) {
    return (
      <AppShell mode="training">
        <div className="space-y-5">
          <Link
            to={`/plan/${planId}/day/${dayId}`}
            className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#AAA99F]"
          >
            ← Back to day
          </Link>
          <section className="cut-corner border border-[#3B3D34] bg-[#21221D] p-5">
            <h1 className="font-display text-3xl font-bold uppercase text-[#F2EEE4]">
              Enter the day first
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#AAA99F]">
              {currentCycle
                ? "Open the day first to prepare today’s exercise log."
                : "Start a cycle before logging this exercise."}
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mode="training" width="compact">
      <div className="space-y-5">
        <header>
          <div className="flex items-center justify-between gap-3 border-b border-[#3B3D34] pb-3">
            <Link
              to={`/plan/${planId}/day/${dayId}`}
              className="inline-flex min-h-11 shrink-0 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#AAA99F] hover:text-[#F2EEE4]"
            >
              ← Day
            </Link>
            <p className="min-w-0 truncate text-right text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#87877E]">
              {plan.name} · C{currentCycleNumber ?? 1} · {dayDetails.label}
            </p>
          </div>
          <div className="pt-5">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#FF8B73]">
              Main exercise / {String(dayDetails.exerciseIds.indexOf(exerciseId) + 1).padStart(2, "0")}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-[0.92] tracking-[-0.015em] text-[#F2EEE4] sm:text-5xl">
              {exercise.name}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#AAA99F]">
              {exercise.subtitle}
            </p>
          </div>
        </header>

        <ExerciseWorkflowCard
          exercise={exercise}
          sets={displaySets}
          previousSets={previousSets}
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
