import { getCoreBlockStatus } from "./coreStatusHelpers";
import { getDayStatus } from "./dayStatusHelpers";

/**
 * Builds a minimal runtime-derived summary for a training cycle.
 *
 * Runtime note:
 * This is intentionally not an analytics layer. It only summarizes values
 * already derived from day, exercise, and core runtime logs.
 */
export function getCycleSummary({ cycle, dayDetailsList = [] }) {
  const totalTrainingDaysCount = dayDetailsList.length;

  let finishedTrainingDaysCount = 0;
  let completedMainExercisesCount = 0;
  let totalMainExercisesCount = 0;
  let partialDaysCount = 0;
  let completedCoreBlocksCount = 0;
  let totalCoreBlocksCount = 0;

  dayDetailsList.forEach((dayDetails) => {
    const dayLog = cycle?.dayLogs?.[dayDetails.id];

    if (dayLog?.finishedAt) {
      finishedTrainingDaysCount += 1;
    }

    const requiredExerciseIds = dayDetails.exerciseIds ?? [];

    totalMainExercisesCount += requiredExerciseIds.length;

    const completedExerciseCount = requiredExerciseIds.filter((exerciseId) => {
      const exerciseLog = dayLog?.mainExerciseLogs?.[exerciseId];

      return exerciseLog
        ? exerciseLog.sets?.length > 0 &&
            exerciseLog.sets.every((set) => set.isDone)
        : false;
    }).length;

    completedMainExercisesCount += completedExerciseCount;

    const dayStatus = getDayStatus(dayLog, requiredExerciseIds);

    if (dayLog?.finishedAt && dayStatus === "partial") {
      partialDaysCount += 1;
    }

    if (dayDetails.coreBlockId) {
      totalCoreBlocksCount += 1;

      if (getCoreBlockStatus(dayLog?.coreBlockLog) === "complete") {
        completedCoreBlocksCount += 1;
      }
    }
  });

  return {
    finishedTrainingDaysCount,
    totalTrainingDaysCount,
    completedMainExercisesCount,
    totalMainExercisesCount,
    partialDaysCount,
    completedCoreBlocksCount,
    totalCoreBlocksCount,
  };
}
