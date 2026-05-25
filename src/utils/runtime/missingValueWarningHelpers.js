function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

// First cycle warnings focus on baseline quality; later cycles focus on carry-over quality.
function getWarningType(currentCycleNumber) {
  return currentCycleNumber === 1 ? "baseline" : "carry-over";
}

// Keep the summary shape stable so FinishDaySheet can render warnings safely.
function createEmptySummary(currentCycleNumber) {
  return {
    hasWarnings: false,
    warningType: getWarningType(currentCycleNumber),

    completedSetCount: 0,
    hasNoCompletedSetsWarning: false,
    hasMissingValueWarning: false,

    missingImportantCount: 0,
    missingLoadCount: 0,

    missingMainImportantCount: 0,
    missingCoreImportantCount: 0,
    missingMainLoadCount: 0,
    missingCoreLoadCount: 0,
  };
}

/**
 * Checks checked main/core set rows for missing values before finishing a day.
 *
 * Runtime note:
 * Missing values warn the user, but they do not block Finish day.
 * Set completion remains controlled by isDone.
 */
export function getMissingValueWarningSummary({
  dayLog,
  coreExercises = [],
  currentCycleNumber = 1,
}) {
  const summary = createEmptySummary(currentCycleNumber);

  if (!dayLog) {
    return summary;
  }

  // Only checked sets are inspected. Unchecked sets are treated as not performed,
  // not as missing data.
  Object.values(dayLog.mainExerciseLogs ?? {}).forEach((exerciseLog) => {
    exerciseLog.sets?.forEach((set) => {
      if (!set.isDone) {
        return;
      }

      summary.completedSetCount += 1;

      if (!hasValue(set.reps)) {
        summary.missingMainImportantCount += 1;
      }

      if (!hasValue(set.rir)) {
        summary.missingMainImportantCount += 1;
      }

      if (!hasValue(set.weight)) {
        summary.missingMainLoadCount += 1;
      }
    });
  });

  const coreExerciseLogs = dayLog.coreBlockLog?.coreExerciseLogs ?? {};

  // Core warnings use each exercise log type to decide whether reps or time is required.
  coreExercises.forEach((coreExercise) => {
    const coreExerciseLog = coreExerciseLogs[coreExercise.id];

    coreExerciseLog?.sets?.forEach((set) => {
      if (!set.isDone) {
        return;
      }

      summary.completedSetCount += 1;

      const valueField = coreExercise.logType === "time" ? "time" : "reps";

      if (!hasValue(set[valueField])) {
        summary.missingCoreImportantCount += 1;
      }

      if (!hasValue(set.rir)) {
        summary.missingCoreImportantCount += 1;
      }

      if (coreExercise.tracksLoad && !hasValue(set.load)) {
        summary.missingCoreLoadCount += 1;
      }
    });
  });

  summary.missingImportantCount =
    summary.missingMainImportantCount + summary.missingCoreImportantCount;

  summary.missingLoadCount =
    summary.missingMainLoadCount + summary.missingCoreLoadCount;

  summary.hasNoCompletedSetsWarning = summary.completedSetCount === 0;

  summary.hasMissingValueWarning =
    summary.completedSetCount > 0 &&
    (summary.missingImportantCount > 0 || summary.missingLoadCount > 0);

  summary.hasWarnings =
    summary.hasNoCompletedSetsWarning || summary.hasMissingValueWarning;

  return summary;
}
