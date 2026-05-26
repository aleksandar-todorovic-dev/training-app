import { appInitialState } from "../state/appInitialState";

const STORAGE_KEY = "training-app:v1:app-state";
const STORAGE_VERSION = 1;

/**
 * Checks for a plain object-like value used by storage shape validation.
 *
 * Storage note:
 * Arrays and null are rejected because the stored app wrapper and runtime state
 * must both be object records.
 */
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Validates the versioned localStorage wrapper before hydration.
 *
 * Storage note:
 * This is intentionally shallow validation for the MVP. The app validates the
 * wrapper version and top-level runtime shape, but does not deeply inspect every
 * cycle, day, exercise, core block, or set row.
 */
function isValidStoredAppState(value) {
  if (!isObject(value)) {
    return false;
  }

  if (value.version !== STORAGE_VERSION) {
    return false;
  }

  if (!isObject(value.state)) {
    return false;
  }

  const { selectedPlanId, progressByPlan } = value.state;

  const hasValidSelectedPlanId =
    selectedPlanId === null || typeof selectedPlanId === "string";

  if (!hasValidSelectedPlanId) {
    return false;
  }

  if (!isObject(progressByPlan)) {
    return false;
  }

  return true;
}

/**
 * Loads the saved runtime app state from localStorage.
 *
 * Storage note:
 * Broken, missing, outdated, or invalid storage must never crash the app.
 * Invalid storage falls back to the clean in-memory initial state.
 */
export function loadStoredAppState() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return appInitialState;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!isValidStoredAppState(parsedValue)) {
      return appInitialState;
    }

    return parsedValue.state;
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
