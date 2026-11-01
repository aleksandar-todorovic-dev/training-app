import { getExerciseStatus } from "./exerciseStatusHelpers.js";

function countPerformedSets(exerciseLog) {
  return exerciseLog?.sets?.filter((set) => set.isDone).length ?? 0;
}

/** Derives display counts without changing completion or workflow closure. */
export function getWorkoutProgress(dayLog, requiredExerciseIds = []) {
  const mainLogs = requiredExerciseIds.map(
    (exerciseId) => dayLog?.mainExerciseLogs?.[exerciseId],
  );

  return {
    totalExerciseCount: requiredExerciseIds.length,
    completedExerciseCount: mainLogs.filter(
      (exerciseLog) => getExerciseStatus(exerciseLog) === "complete",
    ).length,
    performedMainSetCount: mainLogs.reduce(
      (total, exerciseLog) => total + countPerformedSets(exerciseLog),
      0,
    ),
    performedCoreSetCount: Object.values(
      dayLog?.coreBlockLog?.coreExerciseLogs ?? {},
    ).reduce((total, exerciseLog) => total + countPerformedSets(exerciseLog), 0),
  };
}

export function getPerformedSetLabel(count, scope) {
  return `${count} ${scope} ${count === 1 ? "set" : "sets"} performed`;
}

/** Main completion and Core evidence stay separate in closed-day summaries. */
export function getClosedDayPresentation({
  totalExerciseCount,
  completedExerciseCount,
  performedMainSetCount,
  performedCoreSetCount,
}) {
  const isMainComplete =
    totalExerciseCount > 0 && completedExerciseCount === totalExerciseCount;
  const hasMainWork = performedMainSetCount > 0;
  const hasCoreWork = performedCoreSetCount > 0;

  return {
    evidenceState: isMainComplete ? "complete" : hasMainWork ? "partial" : "empty",
    statusLabel: isMainComplete
      ? "Closed · Main complete"
      : hasMainWork
        ? "Closed partial"
        : "Closed",
    statusDetail:
      hasMainWork || hasCoreWork
        ? getPerformedSetLabel(performedMainSetCount, "main")
        : "No sets performed",
    coreDetail: hasCoreWork
      ? getPerformedSetLabel(performedCoreSetCount, "Core")
      : null,
  };
}
