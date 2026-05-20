/**
 * Derives status for one core exercise from its runtime set rows.
 *
 * Runtime note:
 * Core exercise completion is derived from `isDone` on prescribed core set rows.
 */
export function getCoreExerciseStatus(coreExerciseLog) {
  const sets = coreExerciseLog?.sets ?? [];

  if (sets.length === 0) {
    return "not-started";
  }

  const completedSetCount = sets.filter((set) => set.isDone).length;

  if (completedSetCount === 0) {
    return "not-started";
  }

  if (completedSetCount === sets.length) {
    return "complete";
  }

  return "partial";
}

/**
 * Derives status for a core block from its core exercise logs.
 *
 * Runtime note:
 * Core block status is separate from main day completion.
 */
export function getCoreBlockStatus(coreBlockLog) {
  const coreExerciseLogs = Object.values(coreBlockLog?.coreExerciseLogs ?? {});

  if (coreExerciseLogs.length === 0) {
    return "not-started";
  }

  const startedExerciseCount = coreExerciseLogs.filter((coreExerciseLog) => {
    const status = getCoreExerciseStatus(coreExerciseLog);

    return status === "partial" || status === "complete";
  }).length;

  if (startedExerciseCount === 0) {
    return "not-started";
  }

  const completedExerciseCount = coreExerciseLogs.filter(
    (coreExerciseLog) => getCoreExerciseStatus(coreExerciseLog) === "complete",
  ).length;

  if (completedExerciseCount === coreExerciseLogs.length) {
    return "complete";
  }

  return "partial";
}
