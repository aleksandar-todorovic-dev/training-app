import { resolveCycleMethodBinding } from "./advancedMethodContextHelpers.js";
import { getApplicableMethodRow, getEarlierCycleNumbers } from "./advancedMethodHistoryHelpers.js";
import {
  isPreacherMechanicalAddress, isPreacherMechanicalDefinition, isPushUpMechanicalAddress, isPushUpMechanicalDefinition,
} from "./advancedMethodValidation.js";

const CARRY_OVER_FIELDS = ["weight", "reps", "rir"];
const PUSH_UP_CARRY_OVER_FIELDS = ["reps", "rir"];

function resolveMechanicalDefinition(cycle, cycleNumber, { planId, dayId, exerciseId }, matches, catalog) {
  if (cycle?.cycleNumber !== cycleNumber) return null;
  const resolved = resolveCycleMethodBinding({ planId, cycle, dayId, exerciseId }, catalog);
  return resolved.status === "resolved" && matches(resolved.definition) ? resolved.definition : null;
}

// null keeps the ordinary lookup. A supported Mechanical row never falls back to it,
// even when there are no compatible values or the requested index is invalid.
function findMechanicalCarryOverValues(context, catalog) {
  const pushUp = isPushUpMechanicalAddress(context);
  if (!pushUp && !isPreacherMechanicalAddress(context)) return null;
  const matches = pushUp ? isPushUpMechanicalDefinition : isPreacherMechanicalDefinition;
  const fields = pushUp ? PUSH_UP_CARRY_OVER_FIELDS : CARRY_OVER_FIELDS;
  const { cycles, currentCycleNumber, dayId, exerciseId, setIndex } = context;
  if (!resolveMechanicalDefinition(cycles?.[currentCycleNumber], currentCycleNumber, context, matches, catalog)) return null;
  const values = { weight: "", reps: "", rir: "" };
  if (setIndex !== 1) return values;

  for (const number of getEarlierCycleNumbers(cycles, currentCycleNumber)) {
    const previous = cycles[number];
    const definition = resolveMechanicalDefinition(previous, number, context, matches, catalog);
    if (!definition) continue;
    const row = getApplicableMethodRow(previous, definition, dayId, exerciseId, setIndex);
    if (!row?.isDone) continue;
    // The extension's presence and execution are independent of the base.
    for (const field of fields) {
      if (values[field] === "" && row[field].trim() !== "") values[field] = row[field];
    }
    if (fields.every((field) => values[field] !== "")) break;
  }
  return values;
}

/**
 * Finds the latest valid logged value for one exercise set field from previous cycles.
 *
 * Runtime note:
 * Carry-over reads previous cycles only. It copies field values from performed
 * sets, but never carries over completion state.
 */
function getLatestOrdinaryCarryOverFieldValue({
  cycles,
  currentCycleNumber,
  dayId,
  exerciseId,
  setIndex,
  field,
}) {
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

export function getLatestCarryOverFieldValue(context, catalog) {
  const { field } = context;
  if (!CARRY_OVER_FIELDS.includes(field)) return "";
  const values = findMechanicalCarryOverValues(context, catalog);
  return values ? values[field] : getLatestOrdinaryCarryOverFieldValue(context);
}

/**
 * Builds carry-over values for one new prescribed set row.
 *
 * Runtime note:
 * Values are copied field-by-field so one missing value does not erase another
 * useful previous value.
 */
export function buildCarryOverSetValues(context, catalog) {
  return findMechanicalCarryOverValues(context, catalog) ?? Object.fromEntries(CARRY_OVER_FIELDS.map((field) =>
    [field, getLatestOrdinaryCarryOverFieldValue({ ...context, field })],
  ));
}

/**
 * Checks whether an exercise has at least one useful previous logged value.
 *
 * Runtime note:
 * This mirrors carry-over lookup rules without building or mutating row values.
 * It reads previous cycles only and treats partial previous data as valid.
 */
export function hasCarryOverValuesForExercise(context, catalog) {
  const { currentCycleNumber, setCount } = context;
  if (
    !Number.isInteger(currentCycleNumber) ||
    currentCycleNumber <= 1 ||
    !Number.isInteger(setCount) ||
    setCount <= 0
  ) {
    return false;
  }

  for (let setIndex = 1; setIndex <= setCount; setIndex += 1) {
    const setContext = { ...context, setIndex };
    const values = findMechanicalCarryOverValues(setContext, catalog);
    const hasFieldValue = CARRY_OVER_FIELDS.some((field) =>
      (values ? values[field] : getLatestOrdinaryCarryOverFieldValue({ ...setContext, field })) !== "",
    );
    if (hasFieldValue) {
      return true;
    }
  }

  return false;
}
