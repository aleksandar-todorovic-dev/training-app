import { APP_ACTIONS } from "./appActions";
import { buildInitialDayLog } from "../utils/runtime/dayLogHelpers";
import { buildInitialCoreBlockLog } from "../utils/runtime/coreLogHelpers";

const TRAINING_DAY_ORDER = ["d1", "d2", "d3", "d4", "d5", "d6"];

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

      const coreBlockLog = buildInitialCoreBlockLog(coreBlock, coreExercises);

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

      // Closing an exercise records intent only; set completion stays derived from set rows.
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

      // Core exercise close can only run after a plan cycle exists.
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

      // Closing a core exercise records intent only; set completion stays derived from set rows.
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

      // Closing a core block records intent only; core status stays derived from core set rows.
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
      const isLastTrainingDay = nextDayId === null;

      // Finishing a day records close intent only; completion remains derived from set rows.
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
                currentDayId: isLastTrainingDay
                  ? currentCycle.currentDayId
                  : nextDayId,
                completedAt: isLastTrainingDay
                  ? finishedAt
                  : currentCycle.completedAt,
                dayLogs: {
                  ...currentCycle.dayLogs,
                  [dayId]: {
                    ...dayLog,
                    finishedAt,
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
