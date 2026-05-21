const CORE_CARRY_OVER_FIELDS = ["load", "reps", "time", "rir"];

/**
 * Finds the latest valid logged value for one core set field from previous cycles.
 *
 * Runtime note:
 * Core carry-over reads previous cycles only. It copies field values from
 * performed core sets, but never carries over completion or closed state.
 */
export function getLatestCoreCarryOverFieldValue({
  cycles,
  currentCycleNumber,
  dayId,
  coreExerciseId,
  setIndex,
  field,
}) {
  if (!CORE_CARRY_OVER_FIELDS.includes(field)) {
    return "";
  }

  for (
    let cycleNumber = currentCycleNumber - 1;
    cycleNumber >= 1;
    cycleNumber -= 1
  ) {
    const previousSet = cycles?.[cycleNumber]?.dayLogs?.[
      dayId
    ]?.coreBlockLog?.coreExerciseLogs?.[coreExerciseId]?.sets?.find(
      (set) => set.setIndex === setIndex,
    );

    if (!previousSet?.isDone) {
      continue;
    }

    const value = previousSet[field];

    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return "";
}

/**
 * Builds carry-over values for one new prescribed core set row.
 *
 * Runtime note:
 * Values are copied field-by-field so one missing value does not erase another
 * useful previous value.
 */
export function buildCoreCarryOverSetValues({
  cycles,
  currentCycleNumber,
  dayId,
  coreExerciseId,
  setIndex,
}) {
  return {
    load: getLatestCoreCarryOverFieldValue({
      cycles,
      currentCycleNumber,
      dayId,
      coreExerciseId,
      setIndex,
      field: "load",
    }),
    reps: getLatestCoreCarryOverFieldValue({
      cycles,
      currentCycleNumber,
      dayId,
      coreExerciseId,
      setIndex,
      field: "reps",
    }),
    time: getLatestCoreCarryOverFieldValue({
      cycles,
      currentCycleNumber,
      dayId,
      coreExerciseId,
      setIndex,
      field: "time",
    }),
    rir: getLatestCoreCarryOverFieldValue({
      cycles,
      currentCycleNumber,
      dayId,
      coreExerciseId,
      setIndex,
      field: "rir",
    }),
  };
}
