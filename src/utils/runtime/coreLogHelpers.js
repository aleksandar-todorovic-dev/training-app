/**
 * Builds prescribed runtime set rows for one core exercise.
 *
 * Runtime note:
 * Core set rows use a flexible shape because core exercises can track reps,
 * time, and optionally load.
 */
export function buildInitialCoreSetRows(coreExercise) {
  const hasValidSetCount =
    Number.isInteger(coreExercise?.setCount) && coreExercise.setCount > 0;

  const setCount = hasValidSetCount ? coreExercise.setCount : 0;

  return Array.from({ length: setCount }, (_, index) => ({
    setIndex: index + 1,
    load: "",
    reps: "",
    time: "",
    rir: "",
    isDone: false,
  }));
}

/**
 * Creates the initial runtime log for one core exercise.
 *
 * Runtime note:
 * `closedAt` tracks whether the user intentionally closed the core exercise;
 * completion will still be derived from core set rows.
 */
export function buildInitialCoreExerciseLog(coreExercise) {
  if (!coreExercise?.id) {
    return null;
  }

  return {
    coreExerciseId: coreExercise.id,
    sets: buildInitialCoreSetRows(coreExercise),
    closedAt: null,
  };
}

/**
 * Builds the core exercise log map for one core block.
 *
 * Runtime note:
 * Logs are keyed by `coreExerciseId` for direct runtime lookup.
 */
export function buildInitialCoreExerciseLogs(coreExercises = []) {
  return coreExercises.reduce((logs, coreExercise) => {
    const coreExerciseLog = buildInitialCoreExerciseLog(coreExercise);

    if (!coreExerciseLog) {
      return logs;
    }

    return {
      ...logs,
      [coreExerciseLog.coreExerciseId]: coreExerciseLog,
    };
  }, {});
}

/**
 * Creates the initial runtime log for one core block.
 *
 * Runtime note:
 * Core block progress stays separate from main exercise progress and does not
 * affect the main day completion fraction.
 */
export function buildInitialCoreBlockLog(coreBlock, coreExercises = []) {
  if (!coreBlock?.id) {
    return null;
  }

  return {
    coreBlockId: coreBlock.id,
    coreExerciseLogs: buildInitialCoreExerciseLogs(coreExercises),
    closedAt: null,
  };
}
