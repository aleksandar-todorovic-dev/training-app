import { appInitialState } from "../state/appInitialState";

const STORAGE_KEY = "training-app:v1:app-state";
const STORAGE_VERSION = 1;

/**
 * Checks for a plain object-like value used by storage shape validation.
 *
 * Storage note:
 * Arrays and null are rejected because stored runtime maps must be object
 * records.
 */
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && Number.isSafeInteger(value) && value > 0;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isNullableString(value) {
  return value === null || typeof value === "string";
}

function isValidMainSetRow(set) {
  return (
    isObject(set) &&
    isPositiveInteger(set.setIndex) &&
    typeof set.weight === "string" &&
    typeof set.reps === "string" &&
    typeof set.rir === "string" &&
    typeof set.isDone === "boolean"
  );
}

function isValidCoreSetRow(set) {
  return (
    isObject(set) &&
    isPositiveInteger(set.setIndex) &&
    typeof set.load === "string" &&
    typeof set.reps === "string" &&
    typeof set.time === "string" &&
    typeof set.rir === "string" &&
    typeof set.isDone === "boolean"
  );
}

function isValidExerciseLog(exerciseLog, exerciseId) {
  return (
    isObject(exerciseLog) &&
    exerciseLog.exerciseId === exerciseId &&
    Array.isArray(exerciseLog.sets) &&
    exerciseLog.sets.every(isValidMainSetRow) &&
    isNullableString(exerciseLog.closedAt)
  );
}

function isValidCoreExerciseLog(coreExerciseLog, coreExerciseId) {
  return (
    isObject(coreExerciseLog) &&
    coreExerciseLog.coreExerciseId === coreExerciseId &&
    Array.isArray(coreExerciseLog.sets) &&
    coreExerciseLog.sets.every(isValidCoreSetRow) &&
    isNullableString(coreExerciseLog.closedAt)
  );
}

function isValidCoreBlockLog(coreBlockLog) {
  if (coreBlockLog === null) {
    return true;
  }

  if (
    !isObject(coreBlockLog) ||
    !isNonEmptyString(coreBlockLog.coreBlockId) ||
    !isObject(coreBlockLog.coreExerciseLogs) ||
    !isNullableString(coreBlockLog.closedAt)
  ) {
    return false;
  }

  return Object.entries(coreBlockLog.coreExerciseLogs).every(
    ([coreExerciseId, coreExerciseLog]) =>
      isNonEmptyString(coreExerciseId) &&
      isValidCoreExerciseLog(coreExerciseLog, coreExerciseId),
  );
}

function isValidDayLog(dayLog, dayId) {
  if (
    !isObject(dayLog) ||
    dayLog.dayId !== dayId ||
    !isObject(dayLog.mainExerciseLogs) ||
    !isValidCoreBlockLog(dayLog.coreBlockLog) ||
    !isNullableString(dayLog.finishedAt)
  ) {
    return false;
  }

  return Object.entries(dayLog.mainExerciseLogs).every(
    ([exerciseId, exerciseLog]) =>
      isNonEmptyString(exerciseId) &&
      isValidExerciseLog(exerciseLog, exerciseId),
  );
}

function isValidCycle(cycle, cycleKey, planId) {
  if (
    !isObject(cycle) ||
    !isPositiveInteger(cycle.cycleNumber) ||
    String(cycle.cycleNumber) !== cycleKey ||
    cycle.planId !== planId ||
    !isNonEmptyString(cycle.currentDayId) ||
    !isObject(cycle.dayLogs) ||
    !isNullableString(cycle.startedAt) ||
    !isNullableString(cycle.completedAt)
  ) {
    return false;
  }

  return Object.entries(cycle.dayLogs).every(
    ([dayId, dayLog]) =>
      isNonEmptyString(dayId) && isValidDayLog(dayLog, dayId),
  );
}

function isValidPlanProgress(planProgress, planId) {
  if (
    !isObject(planProgress) ||
    !isPositiveInteger(planProgress.currentCycleNumber) ||
    !isObject(planProgress.cycles)
  ) {
    return false;
  }

  const cycleEntries = Object.entries(planProgress.cycles);
  const hasCurrentCycle = isObject(
    planProgress.cycles[planProgress.currentCycleNumber],
  );

  if (!hasCurrentCycle || cycleEntries.length === 0) {
    return false;
  }

  return cycleEntries.every(
    ([cycleKey, cycle]) =>
      isPositiveInteger(Number(cycleKey)) &&
      isValidCycle(cycle, cycleKey, planId),
  );
}

/**
 * Validates and normalizes the versioned localStorage wrapper before hydration.
 *
 * Storage boundary:
 * The wrapper and the runtime records that the UI/reducer dereference are
 * checked here. Invalid plan-progress entries are discarded independently so
 * one damaged plan cannot crash the app or erase another valid plan.
 */
function normalizeStoredAppState(value) {
  if (!isObject(value) || value.version !== STORAGE_VERSION) {
    return null;
  }

  if (!isObject(value.state)) {
    return null;
  }

  const { selectedPlanId, progressByPlan } = value.state;
  const hasValidSelectedPlanId =
    selectedPlanId === null || typeof selectedPlanId === "string";

  if (!hasValidSelectedPlanId || !isObject(progressByPlan)) {
    return null;
  }

  const validProgressByPlan = Object.entries(progressByPlan).reduce(
    (result, [planId, planProgress]) => {
      if (!isNonEmptyString(planId) || !isValidPlanProgress(planProgress, planId)) {
        return result;
      }

      return {
        ...result,
        [planId]: planProgress,
      };
    },
    {},
  );

  return {
    selectedPlanId,
    progressByPlan: validProgressByPlan,
  };
}

/**
 * Loads the saved runtime app state from localStorage.
 *
 * Storage note:
 * Broken, missing, outdated, or invalid storage must never crash the app.
 * Invalid wrappers fall back to the clean initial state, while isolated invalid
 * plan entries are discarded by the hydration boundary.
 */
export function loadStoredAppState() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return appInitialState;
    }

    const parsedValue = JSON.parse(rawValue);
    const normalizedState = normalizeStoredAppState(parsedValue);

    return normalizedState ?? appInitialState;
  } catch (error) {
    console.warn("Failed to load stored app state:", error);
    return appInitialState;
  }
}

/**
 * Saves the current runtime app state into the versioned storage wrapper.
 *
 * Storage note:
 * This persists runtime user progress only. Static source data from `src/data`
 * is not stored because it already ships with the app.
 */
export function saveStoredAppState(state) {
  try {
    const valueToStore = {
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      state,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(valueToStore));
  } catch (error) {
    console.warn("Failed to save app state:", error);
  }
}

/**
 * Clears the persisted runtime app state from localStorage.
 *
 * Storage note:
 * This supports reset/testing flows for the local-first MVP.
 */
export function clearStoredAppState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear stored app state:", error);
  }
}
