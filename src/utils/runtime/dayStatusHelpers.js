import { getExerciseStatus } from "./exerciseStatusHelpers";

/**
 * Derives the main day status from required main exercise logs.
 *
 * Product rule:
 * Required exercises come from `dayDetails.exerciseIds`. Core, warm-up,
 * guide/help content, advanced techniques, and optional work do not affect
 * the main day completion fraction.
 */
export function getDayStatus(dayLog, requiredExerciseIds = []) {
  if (!dayLog || requiredExerciseIds.length === 0) {
    return "not-started";
  }

  const exerciseStatuses = requiredExerciseIds.map((exerciseId) => {
    const exerciseLog = dayLog.mainExerciseLogs?.[exerciseId];

    return getExerciseStatus(exerciseLog);
  });

  const completedExerciseCount = exerciseStatuses.filter(
    (status) => status === "complete",
  ).length;

  const startedExerciseCount = exerciseStatuses.filter(
    (status) => status === "partial" || status === "complete",
  ).length;

  if (startedExerciseCount === 0) {
    return "not-started";
  }

  if (completedExerciseCount === requiredExerciseIds.length) {
    return "complete";
  }

  return "partial";
}
