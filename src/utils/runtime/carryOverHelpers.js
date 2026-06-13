const CARRY_OVER_FIELDS = ["weight", "reps", "rir"];

/**
 * Finds the latest valid logged value for one exercise set field from previous cycles.
 *
 * Runtime note:
 * Carry-over reads previous cycles only. It copies field values from performed
 * sets, but never carries over completion state.
 */
export function getLatestCarryOverFieldValue({
  cycles,
  currentCycleNumber,
  dayId,
  exerciseId,
  setIndex,
  field,
}) {
  if (!CARRY_OVER_FIELDS.includes(field)) {
    return "";
  }

  for (
    let cycleNumber = currentCycleNumber - 1;
    cycleNumber >= 1;
    cycleNumber -= 1
  ) {
    const previousSet = cycles?.[cycleNumber]?.dayLogs?.[
      dayId
    ]?.mainExerciseLogs?.[exerciseId]?.sets?.find(
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
 * Builds carry-over values for one new prescribed set row.
 *
 * Runtime note:
 * Values are copied field-by-field so one missing value does not erase another
 * useful previous value.
 */
export function buildCarryOverSetValues({
  cycles,
  currentCycleNumber,
  dayId,
  exerciseId,
  setIndex,
}) {
  return {
    weight: getLatestCarryOverFieldValue({
      cycles,
      currentCycleNumber,
      dayId,
      exerciseId,
      setIndex,
      field: "weight",
    }),
    reps: getLatestCarryOverFieldValue({
      cycles,
      currentCycleNumber,
      dayId,
      exerciseId,
      setIndex,
      field: "reps",
    }),
    rir: getLatestCarryOverFieldValue({
      cycles,
      currentCycleNumber,
      dayId,
      exerciseId,
      setIndex,
      field: "rir",
    }),
  };
}

/**
 * Checks whether an exercise has at least one useful previous logged value.
 *
 * Runtime note:
 * This mirrors carry-over lookup rules without building or mutating row values.
 * It reads previous cycles only and treats partial previous data as valid.
 */
export function hasCarryOverValuesForExercise({
  cycles,
  currentCycleNumber,
  dayId,
  exerciseId,
  setCount,
}) {
  if (
    !Number.isInteger(currentCycleNumber) ||
    currentCycleNumber <= 1 ||
    !Number.isInteger(setCount) ||
    setCount <= 0
  ) {
    return false;
  }

  for (let setIndex = 1; setIndex <= setCount; setIndex += 1) {
    const hasFieldValue = CARRY_OVER_FIELDS.some(
      (field) =>
        getLatestCarryOverFieldValue({
          cycles,
          currentCycleNumber,
          dayId,
          exerciseId,
          setIndex,
          field,
        }) !== "",
    );

    if (hasFieldValue) {
      return true;
    }
  }

  return false;
}
