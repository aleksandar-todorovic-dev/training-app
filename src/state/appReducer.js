import { APP_ACTIONS } from "./appActions";

/**
 * Main runtime reducer for the local-first MVP.
 *
 * Runtime note:
 * The reducer receives the current state and an action, then returns the next
 * state without mutating the existing state object.
 */
export function appReducer(state, action) {
  switch (action.type) {
    case APP_ACTIONS.SELECT_PLAN: {
      return {
        ...state,
        selectedPlanId: action.payload.planId,
      };
    }

    case APP_ACTIONS.START_PLAN_CYCLE: {
      const { planId, startedAt } = action.payload;
      const existingPlanProgress = state.progressByPlan[planId];

      const nextCycleNumber = existingPlanProgress
        ? existingPlanProgress.currentCycleNumber + 1
        : 1;

      return {
        ...state,
        selectedPlanId: planId,
        progressByPlan: {
          ...state.progressByPlan,
          [planId]: {
            currentCycleNumber: nextCycleNumber,
            cycles: {
              ...(existingPlanProgress?.cycles ?? {}),
              [nextCycleNumber]: {
                planId,
                cycleNumber: nextCycleNumber,
                currentDayId: "d1",
                dayLogs: {},
                startedAt,
                completedAt: null,
              },
            },
          },
        },
      };
    }

    default:
      return state;
  }
}
