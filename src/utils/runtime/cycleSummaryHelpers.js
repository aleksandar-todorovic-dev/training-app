import { getDayStatus } from "./dayStatusHelpers";

const MAIN_LOG_FIELDS = ["weight", "reps", "rir"];
const CORE_LOG_FIELDS = ["load", "reps", "time", "rir"];

function hasLoggedFieldValue(set, fields) {
  return fields.some(
    (field) => typeof set?.[field] === "string" && set[field].trim() !== "",
  );
}

function hasLoggedMainExerciseValues(exerciseLog) {
  return (
    exerciseLog?.sets?.some(
      (set) => set.isDone && hasLoggedFieldValue(set, MAIN_LOG_FIELDS),
    ) ?? false
  );
}

function hasLoggedCoreBlockValues(coreBlockLog) {
  const coreExerciseLogs = Object.values(coreBlockLog?.coreExerciseLogs ?? {});

  return coreExerciseLogs.some((coreExerciseLog) =>
    coreExerciseLog?.sets?.some(
      (set) => set.isDone && hasLoggedFieldValue(set, CORE_LOG_FIELDS),
    ),
  );
}

/**
 * Builds a minimal runtime-derived summary for a training cycle.
 *
 * Runtime note:
 * This is intentionally not an analytics layer. It only summarizes values
 * already derived from day, exercise, and core runtime logs.
 *
 * Closed days represent cycle lifecycle progress.
 * Logged work represents saved/performed values that can inform future cycles.
 */
export function getCycleSummary({ cycle, dayDetailsList = [] }) {
  const totalTrainingDaysCount = dayDetailsList.length;

  let finishedTrainingDaysCount = 0;
  let loggedMainExercisesCount = 0;
  let totalMainExercisesCount = 0;
  let partialDaysCount = 0;
  let loggedCoreBlocksCount = 0;
  let totalCoreBlocksCount = 0;

  dayDetailsList.forEach((dayDetails) => {
    const dayLog = cycle?.dayLogs?.[dayDetails.id];

    if (dayLog?.finishedAt) {
      finishedTrainingDaysCount += 1;
    }

    const requiredExerciseIds = dayDetails.exerciseIds ?? [];

    totalMainExercisesCount += requiredExerciseIds.length;

    // Recap wording uses "logged" because this counts useful saved work,
    // not full exercise completion or perfect plan adherence.
    const loggedExerciseCount = requiredExerciseIds.filter((exerciseId) => {
      const exerciseLog = dayLog?.mainExerciseLogs?.[exerciseId];

      return hasLoggedMainExerciseValues(exerciseLog);
    }).length;

    loggedMainExercisesCount += loggedExerciseCount;

    const dayStatus = getDayStatus(dayLog, requiredExerciseIds);

    if (dayLog?.finishedAt && dayStatus === "partial") {
      partialDaysCount += 1;
    }

    if (dayDetails.coreBlockId) {
      totalCoreBlocksCount += 1;

      // Core recap tracks whether useful core values were logged, not whether
      // the support block reached a complete status.
      if (hasLoggedCoreBlockValues(dayLog?.coreBlockLog)) {
        loggedCoreBlocksCount += 1;
      }
    }
  });

  return {
    finishedTrainingDaysCount,
    totalTrainingDaysCount,
    loggedMainExercisesCount,
    totalMainExercisesCount,
    partialDaysCount,
    loggedCoreBlocksCount,
    totalCoreBlocksCount,
  };
}
