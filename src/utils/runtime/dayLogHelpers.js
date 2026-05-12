import { buildInitialExerciseLog } from "./exerciseLogHelpers";

/**
 * Builds the main exercise log map for a day.
 *
 * Runtime note:
 * Logs are keyed by `exerciseId` so required exercise progress can be
 * compared against `dayDetails.exerciseIds`.
 */
export function buildInitialMainExerciseLogs(exercises = []) {
  return exercises.reduce((logs, exercise) => {
    const exerciseLog = buildInitialExerciseLog(exercise);

    if (!exerciseLog) {
      return logs;
    }

    return {
      ...logs,
      [exerciseLog.exerciseId]: exerciseLog,
    };
  }, {});
}

/**
 * Creates the initial runtime shell for one training day.
 *
 * Runtime note:
 * Main exercise logs are created separately from core progress because core
 * does not affect the main day completion fraction.
 */
export function buildInitialDayLog(dayDetails, exercises = []) {
  if (!dayDetails?.id) {
    return null;
  }

  return {
    dayId: dayDetails.id,
    mainExerciseLogs: buildInitialMainExerciseLogs(exercises),
    coreBlockLog: null,
    finishedAt: null,
  };
}