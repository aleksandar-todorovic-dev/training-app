/**
 * Static plan metadata for Cut Pro.
 *
 * Runtime note:
 * `dayOrder` defines the intended D1-D6 cycle order used by runtime navigation
 * and day-mode logic. Starting a cycle still happens through app state actions,
 * not by reading this object alone.
 */
export const cutPro = {
  id: "cut-pro",
  name: "Cut Pro",
  goal: "Fat loss / muscle retention",
  shortDescription:
    "Lower-volume structured cut plan designed to preserve strength and control fatigue.",
  audience:
    "Lifters who want to preserve strength and muscle while managing fatigue in a deficit.",
  cycleLabel: "6 training days / 9-day cycle",
  intro:
    "Lower-volume structured cut plan designed to preserve strength and control fatigue.",
  coreSystem: [
    "6 training days in a 9-day cycle",
    "Train 2 days, rest 1 day, repeat",
    "Each major muscle group is trained twice per cycle",
    "Core work is integrated into the cycle",
  ],
  keyRules: [
    "Log weight, reps, and RIR",
    "Keep technique and recovery under control",
    "Aim to preserve strength while cutting",
  ],
  dayOrder: ["d1", "d2", "d3", "d4", "d5", "d6"],
};
