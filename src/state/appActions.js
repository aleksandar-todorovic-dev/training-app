/**
 * Action names for the app runtime reducer.
 *
 * Runtime note:
 * Keep action names centralized so reducer cases, dispatch calls, and future
 * tests/documentation use the same source of truth.
 */
export const APP_ACTIONS = {
  SELECT_PLAN: "SELECT_PLAN",
  START_PLAN_CYCLE: "START_PLAN_CYCLE",
  ENSURE_DAY_LOG: "ENSURE_DAY_LOG",
  TOGGLE_EXERCISE_SET_DONE: "TOGGLE_EXERCISE_SET_DONE",
  UPDATE_EXERCISE_SET_FIELD: "UPDATE_EXERCISE_SET_FIELD",
};
