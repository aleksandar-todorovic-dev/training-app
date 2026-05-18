import { APP_ACTIONS } from "./appActions";
import { buildInitialDayLog } from "../utils/runtime/dayLogHelpers";

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

    case APP_ACTIONS.ENSURE_DAY_LOG: {
      const { planId, dayDetails, exercises } = action.payload;

      const planProgress = state.progressByPlan[planId];

      // A day log can only be created after a plan cycle exists.
      if (!planProgress) {
        return state;
      }

      const currentCycleNumber = planProgress.currentCycleNumber;
      const currentCycle = planProgress.cycles[currentCycleNumber];

      if (!currentCycle) {
        return state;
      }

      // Preserve existing day logs so reopening a day never resets user input.
      if (currentCycle.dayLogs[dayDetails.id]) {
        return state;
      }

      const dayLog = buildInitialDayLog(dayDetails, exercises);

      if (!dayLog) {
        return state;
      }

      // Add the new day log to the current cycle without mutating existing state.
      return {
        ...state,
        progressByPlan: {
          ...state.progressByPlan,
          [planId]: {
            ...planProgress,
            cycles: {
              ...planProgress.cycles,
              [currentCycleNumber]: {
                ...currentCycle,
                dayLogs: {
                  ...currentCycle.dayLogs,
                  [dayDetails.id]: dayLog,
                },
              },
            },
          },
        },
      };
    }

    case APP_ACTIONS.TOGGLE_EXERCISE_SET_DONE: {
      const { planId, dayId, exerciseId, setIndex } = action.payload;

      const planProgress = state.progressByPlan[planId];
      // Set updates can only run after a plan cycle exists.
      if (!planProgress) {
        return state;
      }

      const currentCycleNumber = planProgress.currentCycleNumber;
      const currentCycle = planProgress.cycles[currentCycleNumber];

      if (!currentCycle) {
        return state;
      }

      const dayLog = currentCycle.dayLogs[dayId];

      if (!dayLog) {
        return state;
      }

      const exerciseLog = dayLog.mainExerciseLogs[exerciseId];

      if (!exerciseLog) {
        return state;
      }
      // Toggle only the targeted prescribed set row.
      const nextSets = exerciseLog.sets.map((set) => {
        if (set.setIndex !== setIndex) {
          return set;
        }

        return {
          ...set,
          isDone: !set.isDone,
        };
      });

      // Store the updated set rows without mutating the existing exercise log.
      return {
        ...state,
        progressByPlan: {
          ...state.progressByPlan,
          [planId]: {
            ...planProgress,
            cycles: {
              ...planProgress.cycles,
              [currentCycleNumber]: {
                ...currentCycle,
                dayLogs: {
                  ...currentCycle.dayLogs,
                  [dayId]: {
                    ...dayLog,
                    mainExerciseLogs: {
                      ...dayLog.mainExerciseLogs,
                      [exerciseId]: {
                        ...exerciseLog,
                        sets: nextSets,
                      },
                    },
                  },
                },
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
