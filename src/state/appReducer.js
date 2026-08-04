import { APP_ACTIONS } from "./appActions";
import { appInitialState } from "./appInitialState";
import { buildInitialDayLog } from "../utils/runtime/dayLogHelpers";
import { buildInitialCoreBlockLog } from "../utils/runtime/coreLogHelpers";
import { areAllTrainingDaysFinished } from "../utils/runtime/cycleStatusHelpers";

const TRAINING_DAY_ORDER = ["d1", "d2", "d3", "d4", "d5", "d6"];

function isRuntimeRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isUsablePlanProgress(planProgress) {
  if (
    !isRuntimeRecord(planProgress) ||
    !Number.isInteger(planProgress.currentCycleNumber) ||
    !Number.isSafeInteger(planProgress.currentCycleNumber) ||
    planProgress.currentCycleNumber < 1 ||
    !isRuntimeRecord(planProgress.cycles)
  ) {
    return false;
  }

  const currentCycle =
    planProgress.cycles[planProgress.currentCycleNumber];

  return (
    isRuntimeRecord(currentCycle) &&
    currentCycle.cycleNumber === planProgress.currentCycleNumber &&
    isRuntimeRecord(currentCycle.dayLogs)
  );
}

function getNextTrainingDayId(dayId) {
  const currentIndex = TRAINING_DAY_ORDER.indexOf(dayId);

  if (currentIndex === -1) {
    return null;
  }

  return TRAINING_DAY_ORDER[currentIndex + 1] ?? null;
}

/**
 * Main runtime reducer for the local-first MVP.
 *
 * Runtime model:
 * - Set rows are the source of truth for performed work.
 * - Input values describe the work, but never complete a set by themselves.
 * - `closedAt` and `finishedAt` record user intent, not automatic completion.
 * - Day, exercise, and core logs are created lazily so preview routes do not
 *   invent progress.
 * - Cycle completion is based on all required training days having `finishedAt`,
 *   not on perfect exercise completion.
 *
 * Runtime note:
 * The reducer receives the current state and an action, then returns the next
 * state without mutating the existing state object.
 */
export function appReducer(state, action) {
  switch (action.type) {
    // ---------------------------------------------------------------------------
    // Plan / cycle lifecycle
    // ---------------------------------------------------------------------------

    case APP_ACTIONS.RESET_APP_STATE: {
      // Reset only the in-memory runtime state. Storage clearing is handled by the
      // dedicated storage layer before this action is dispatched.
      return appInitialState;
    }

    case APP_ACTIONS.SELECT_PLAN: {
      return {
        ...state,
        selectedPlanId: action.payload.planId,
      };
    }

    case APP_ACTIONS.START_PLAN_CYCLE: {
      const { planId, startedAt } = action.payload;
      const progressByPlan = isRuntimeRecord(state.progressByPlan)
        ? state.progressByPlan
        : {};
      const existingPlanProgress = progressByPlan[planId];
      const hasUsableExistingProgress =
        isUsablePlanProgress(existingPlanProgress);
      const nextCycleNumber = hasUsableExistingProgress
        ? existingPlanProgress.currentCycleNumber + 1
        : 1;
      const existingCycles = hasUsableExistingProgress
        ? existingPlanProgress.cycles
        : {};

      // Starting a cycle creates only the cycle shell. Malformed hydrated plan
      // progress is treated as absent so cycle numbering can never become NaN.
      // Day, exercise, and core logs are created later when the user opens the
      // active workflow for that cycle.
      return {
        ...state,
        selectedPlanId: planId,
        progressByPlan: {
          ...progressByPlan,
          [planId]: {
            currentCycleNumber: nextCycleNumber,
            cycles: {
              ...existingCycles,
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

    // ---------------------------------------------------------------------------
    // Lazy day log creation
    // ---------------------------------------------------------------------------

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

      const dayLog = buildInitialDayLog(dayDetails, exercises, {
        cycles: planProgress.cycles,
        currentCycleNumber,
      });

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

    // ---------------------------------------------------------------------------
    // Main exercise set updates
    // ---------------------------------------------------------------------------

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
      // `isDone` is the only field that marks a set as performed.
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

    case APP_ACTIONS.UPDATE_EXERCISE_SET_FIELD: {
      const { planId, dayId, exerciseId, setIndex, field, value } =
        action.payload;

      const allowedFields = ["weight", "reps", "rir"];

      if (!allowedFields.includes(field)) {
        return state;
      }

      const planProgress = state.progressByPlan[planId];

      // Set input updates can only run after a plan cycle exists.
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

      // Update only one editable field on the targeted prescribed set row.
      // Changing input values does not mark the set as performed.
      const nextSets = exerciseLog.sets.map((set) => {
        if (set.setIndex !== setIndex) {
          return set;
        }

        return {
          ...set,
          [field]: value,
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

    // ---------------------------------------------------------------------------
    // Core block lazy creation and set updates
    // ---------------------------------------------------------------------------

    case APP_ACTIONS.ENSURE_CORE_BLOCK_LOG: {
      const { planId, dayId, coreBlock, coreExercises } = action.payload;

      const planProgress = state.progressByPlan[planId];

      // A core block log can only be created after a plan cycle exists.
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

      // Preserve existing core progress so reopening CorePage never resets user input.
      if (dayLog.coreBlockLog) {
        return state;
      }

      const coreBlockLog = buildInitialCoreBlockLog(coreBlock, coreExercises, {
        cycles: planProgress.cycles,
        currentCycleNumber,
        dayId,
      });

      if (!coreBlockLog) {
        return state;
      }

      // Add core progress separately from main exercise logs.
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
                    coreBlockLog,
                  },
                },
              },
            },
          },
        },
      };
    }

    case APP_ACTIONS.TOGGLE_CORE_SET_DONE: {
      const { planId, dayId, coreExerciseId, setIndex } = action.payload;

      const planProgress = state.progressByPlan[planId];

      // Core set updates can only run after a plan cycle exists.
      if (!planProgress) {
        return state;
      }

      const currentCycleNumber = planProgress.currentCycleNumber;
      const currentCycle = planProgress.cycles[currentCycleNumber];

      if (!currentCycle) {
        return state;
      }

      const dayLog = currentCycle.dayLogs[dayId];

      if (!dayLog?.coreBlockLog) {
        return state;
      }

      const coreExerciseLog =
        dayLog.coreBlockLog.coreExerciseLogs[coreExerciseId];

      if (!coreExerciseLog) {
        return state;
      }

      // Toggle only the targeted prescribed core set row.
      // Core completion stays separate from main day progress.
      const nextSets = coreExerciseLog.sets.map((set) => {
        if (set.setIndex !== setIndex) {
          return set;
        }

        return {
          ...set,
          isDone: !set.isDone,
        };
      });

      // Store the updated core set rows without affecting main exercise progress.
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
                    coreBlockLog: {
                      ...dayLog.coreBlockLog,
                      coreExerciseLogs: {
                        ...dayLog.coreBlockLog.coreExerciseLogs,
                        [coreExerciseId]: {
                          ...coreExerciseLog,
                          sets: nextSets,
                        },
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

    case APP_ACTIONS.UPDATE_CORE_SET_FIELD: {
      const { planId, dayId, coreExerciseId, setIndex, field, value } =
        action.payload;

      const allowedFields = ["load", "reps", "time", "rir"];

      if (!allowedFields.includes(field)) {
        return state;
      }

      const planProgress = state.progressByPlan[planId];

      // Core set input updates can only run after a plan cycle exists.
      if (!planProgress) {
        return state;
      }

      const currentCycleNumber = planProgress.currentCycleNumber;
      const currentCycle = planProgress.cycles[currentCycleNumber];

      if (!currentCycle) {
        return state;
      }

      const dayLog = currentCycle.dayLogs[dayId];

      if (!dayLog?.coreBlockLog) {
        return state;
      }

      const coreExerciseLog =
        dayLog.coreBlockLog.coreExerciseLogs[coreExerciseId];

      if (!coreExerciseLog) {
        return state;
      }

      // Update only one editable field on the targeted prescribed core set row.
      // Changing input values does not mark the core set as performed.
      const nextSets = coreExerciseLog.sets.map((set) => {
        if (set.setIndex !== setIndex) {
          return set;
        }

        return {
          ...set,
          [field]: value,
        };
      });

      // Store the updated core set rows without affecting main exercise progress.
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
                    coreBlockLog: {
                      ...dayLog.coreBlockLog,
                      coreExerciseLogs: {
                        ...dayLog.coreBlockLog.coreExerciseLogs,
                        [coreExerciseId]: {
                          ...coreExerciseLog,
                          sets: nextSets,
                        },
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

    // ---------------------------------------------------------------------------
    // Close intent actions
    // ---------------------------------------------------------------------------

    case APP_ACTIONS.MARK_EXERCISE_CLOSED: {
      const { planId, dayId, exerciseId, closedAt } = action.payload;

      const planProgress = state.progressByPlan[planId];

      // Exercise close can only run after a plan cycle exists.
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

      // Closing an exercise records intent only; set completion stays derived
      // from set rows.
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
                        closedAt,
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

    case APP_ACTIONS.MARK_CORE_EXERCISE_CLOSED: {
      const { planId, dayId, coreExerciseId, closedAt } = action.payload;

      const planProgress = state.progressByPlan[planId];

      // This action is reducer-supported but not currently exposed by the MVP UI.
      // The active MVP closes the whole core block through MARK_CORE_BLOCK_CLOSED.
      if (!planProgress) {
        return state;
      }

      const currentCycleNumber = planProgress.currentCycleNumber;
      const currentCycle = planProgress.cycles[currentCycleNumber];

      if (!currentCycle) {
        return state;
      }

      const dayLog = currentCycle.dayLogs[dayId];

      if (!dayLog?.coreBlockLog) {
        return state;
      }

      const coreExerciseLog =
        dayLog.coreBlockLog.coreExerciseLogs[coreExerciseId];

      if (!coreExerciseLog) {
        return state;
      }

      // Closing a core exercise records intent only; set completion stays derived
      // from core set rows.
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
                    coreBlockLog: {
                      ...dayLog.coreBlockLog,
                      coreExerciseLogs: {
                        ...dayLog.coreBlockLog.coreExerciseLogs,
                        [coreExerciseId]: {
                          ...coreExerciseLog,
                          closedAt,
                        },
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

    case APP_ACTIONS.MARK_CORE_BLOCK_CLOSED: {
      const { planId, dayId, closedAt } = action.payload;

      const planProgress = state.progressByPlan[planId];

      // Core block close can only run after a plan cycle exists.
      if (!planProgress) {
        return state;
      }

      const currentCycleNumber = planProgress.currentCycleNumber;
      const currentCycle = planProgress.cycles[currentCycleNumber];

      if (!currentCycle) {
        return state;
      }

      const dayLog = currentCycle.dayLogs[dayId];

      if (!dayLog?.coreBlockLog) {
        return state;
      }

      // Closing a core block records intent only; core status stays derived from
      // core set rows.
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
                    coreBlockLog: {
                      ...dayLog.coreBlockLog,
                      closedAt,
                    },
                  },
                },
              },
            },
          },
        },
      };
    }

    // ---------------------------------------------------------------------------
    // Finish day / cycle completion
    // ---------------------------------------------------------------------------

    case APP_ACTIONS.FINISH_DAY: {
      const { planId, dayId, finishedAt } = action.payload;

      const planProgress = state.progressByPlan[planId];

      // A day can only be finished after a plan cycle exists.
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

      const nextDayId = getNextTrainingDayId(dayId);

      const nextDayLogs = {
        ...currentCycle.dayLogs,
        [dayId]: {
          ...dayLog,
          finishedAt,
        },
      };

      const isCycleComplete = areAllTrainingDaysFinished(
        nextDayLogs,
        TRAINING_DAY_ORDER,
      );

      // Finishing a day records close intent only; completion remains derived
      // from set rows.
      //
      // Partial days remain valid. The cycle is complete only when all required
      // training days have finishedAt.
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
                currentDayId: nextDayId ?? currentCycle.currentDayId,
                completedAt: isCycleComplete
                  ? finishedAt
                  : currentCycle.completedAt,
                dayLogs: nextDayLogs,
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
