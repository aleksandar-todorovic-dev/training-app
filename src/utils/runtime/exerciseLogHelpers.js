import { buildCarryOverSetValues } from "./carryOverHelpers";

/**
 * Builds the prescribed runtime set rows for a main exercise.
 *
 * Runtime note:
 * Rows are generated from explicit scaffold metadata (`setCount`), not by
 * parsing the user-facing `prescription` string.
 *
 * Empty strings are intentional for controlled input fields. A set only
 * counts as performed when `isDone` is true.
 */
export function buildInitialSetRows(exercise, carryOverContext = {}) {
  const hasValidSetCount =
    Number.isInteger(exercise?.setCount) && exercise.setCount > 0;

  const setCount = hasValidSetCount ? exercise.setCount : 0;

  return Array.from({ length: setCount }, (_, index) => {
    const setIndex = index + 1;

    const carryOverValues = buildCarryOverSetValues({
      ...carryOverContext,
      exerciseId: exercise?.id,
      setIndex,
    });

    return {
      setIndex,
      weight: carryOverValues.weight,
      reps: carryOverValues.reps,
      rir: carryOverValues.rir,
      isDone: false,
    };
  });
}

/**
 * Creates the initial runtime log for one main exercise.
 *
 * Runtime note:
 * `closedAt` tracks whether the user intentionally closed the exercise;
 * completion is still derived from the set rows.
 */
export function buildInitialExerciseLog(exercise, carryOverContext = {}) {
  if (!exercise?.id) {
    return null;
  }

  return {
    exerciseId: exercise.id,
    sets: buildInitialSetRows(exercise, carryOverContext),
    closedAt: null,
  };
}
