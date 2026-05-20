/**
 * Static core exercise source data.
 *
 * Runtime note:
 * `prescription` is user-facing display text.
 * `setCount` is runtime scaffold metadata used to generate prescribed core set rows.
 * Runtime logic must not parse `prescription` to decide how many rows to create.
 *
 * `logType` controls whether the primary logged value is reps or time.
 * `tracksLoad` controls whether the core row includes load.
 */
export const coreExercises = [
  {
    id: "hanging-leg-raise-strict",
    name: "Hanging Leg Raise (Strict)",
    subtitle: "Lower-ab control with anti-swing tension",
    prescription: "3 x 8-12",
    setCount: 3,
    logType: "reps",
    tracksLoad: false,
    cue: "Keep the ribs down, raise with control to about 90°, and pause at the top without swinging",
    details: {
      tempo: "2-1-2",
      rest: "90 s",
      extraCues: [
        "Start from a hollow position",
        "Exhale at the top",
        "Lower slowly instead of dropping the legs",
      ],
    },
  },
  {
    id: "decline-sit-up-weighted",
    name: "Decline Sit-Up (Weighted)",
    subtitle: "Loaded trunk flexion with lower-ab crunch focus",
    prescription: "3 x 10-12",
    setCount: 3,
    logType: "reps",
    tracksLoad: true,
    cue: "Keep the chin lightly tucked, crunch hard through the trunk, and do not pull with the neck",
    details: {
      tempo: "2-0-2",
      rest: "60-75 s",
      extraCues: [
        "Keep the ribs down as you curl up",
        "Think about shortening the abs, not just sitting up",
        "Lower under control without dropping back",
      ],
    },
  },
  {
    id: "plank",
    name: "Plank",
    subtitle: "Basic anti-extension trunk stability",
    prescription: "3 x 45-60 s",
    setCount: 3,
    logType: "time",
    tracksLoad: false,
    cue: "Keep a straight line, squeeze the glutes, and breathe without letting the hips sag",
    details: {
      tempo: "—",
      rest: "45 s",
      extraCues: [
        "Shoulders, hips, and heels stay aligned",
        "Keep the ribs down",
        "Do not let the low back take over",
      ],
    },
  },
  {
    id: "pallof-press",
    name: "Pallof Press",
    subtitle: "Anti-rotation trunk control",
    prescription: "3 x 12",
    setCount: 3,
    logType: "reps",
    tracksLoad: true,
    cue: "Stay stacked, brace hard, and press out without letting the torso rotate",
    details: {
      tempo: "2-1-2",
      rest: "45 s",
      extraCues: [
        "Complete the target reps on each side",
        "Keep the ribs down",
        "Squeeze the glutes to stay stable",
        "Exhale as the hands move away from the body",
      ],
    },
  },
  {
    id: "hanging-knee-raise-ppt",
    name: "Hanging Knee Raise (PPT)",
    subtitle: "Lower-ab control with posterior pelvic tilt",
    prescription: "3 x 8-12",
    setCount: 3,
    logType: "reps",
    tracksLoad: false,
    cue: "Tuck the pelvis first, pause at the top, and lower slowly without swinging",
    details: {
      tempo: "2-1-2",
      rest: "60-90 s",
      extraCues: [
        "Think pelvis first, knees second",
        "Keep the ribs down through the rep",
        "Do not chase height if position breaks",
      ],
    },
  },
  {
    id: "side-plank",
    name: "Side Plank",
    subtitle: "Lateral trunk stability and oblique control",
    prescription: "3 x 30-45 s",
    setCount: 3,
    logType: "time",
    tracksLoad: false,
    cue: "Keep the top hip high, hold a straight line, and stay stacked without twisting",
    details: {
      tempo: "—",
      rest: "45 s",
      extraCues: [
        "Hold the target time on each side",
        "Feel the obliques and top-side glute working",
        "Stay long through the body",
        "Use the forearm setup if it feels cleaner on the shoulder",
      ],
    },
  },
  {
    id: "plank-step-out",
    name: "Plank Step-Out",
    subtitle: "Dynamic anti-extension control",
    prescription: "3 x 12-16",
    setCount: 3,
    logType: "reps",
    tracksLoad: false,
    cue: "Keep the trunk braced, step out in short clean ranges, and do not lose the plank line",
    details: {
      tempo: "2-0-2",
      rest: "45 s",
      extraCues: [
        "Take short controlled steps",
        "Keep the hips low and quiet",
        "Do not let the pelvis drop as the feet move",
      ],
    },
  },
  {
    id: "russian-twist",
    name: "Russian Twist",
    subtitle: "Controlled trunk rotation work",
    prescription: "3 x 20",
    setCount: 3,
    logType: "reps",
    tracksLoad: true,
    cue: "Rotate through the trunk with control, keep the hips quiet, and stay smooth without using momentum",
    details: {
      tempo: "2-0-2",
      rest: "45 s",
      extraCues: [
        "Count total reps across both sides",
        "Use a smaller cleaner arc",
        "Let the trunk rotate, not the hips",
        "Do not throw the weight side to side",
      ],
    },
  },
  {
    id: "hollow-body-hold",
    name: "Hollow Body Hold",
    subtitle: "Static anti-extension brace hold",
    prescription: "3 x 20-30 s",
    setCount: 3,
    logType: "time",
    tracksLoad: false,
    cue: "Keep the ribs down, press the low back flat, and hold only the range you can own cleanly",
    details: {
      tempo: "—",
      rest: "45 s",
      extraCues: [
        "Keep the low back pressed down",
        "Lower the legs and arms only as far as position stays clean",
        "Stop before the ribs or low back pop up",
      ],
    },
  },
];
