/**
 * Static exercise source data for the Bulk Pro plan.
 *
 * Runtime boundary:
 * `prescription` is user-facing display text only. Runtime set rows must be
 * generated from explicit scaffold metadata such as `setCount`, not by parsing
 * the prescription string.
 *
 * MVP boundary:
 * Optional work and advanced techniques are guidance-only unless represented
 * by explicit runtime metadata.
 */
export const bulkProExercises = [
  // D1 bulk
  {
    id: "smith-bench-press",
    name: "Smith Bench Press",
    subtitle: "Primary chest tension lift",
    prescription: "4 x 5-7",
    setCount: 4,
    cue: "Upper back tight, touch the lower chest under control, and keep leg drive steady",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "150 s",
      progression:
        "Add reps first. When the prescribed working sets reach 7 with clean form and target RIR, increase the load slightly next time.",
      advancedTechnique: null,
      extraCues: [
        "Keep shoulder blades pinned",
        "Elbows about 45-60° from the torso",
        "Do not bounce the touch",
      ],
    },
  },
  {
    id: "incline-db-press",
    name: "Incline DB Press",
    subtitle: "Upper-chest mechanical tension",
    prescription: "3 x 8-10",
    setCount: 3,
    cue: "Use a slight incline, pause briefly at the bottom, and press without losing shoulder position",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "120 s",
      progression:
        "Build toward the top of the 8-10 range with the same dumbbells. Increase load when all work sets reach 10 cleanly.",
      advancedTechnique:
        "Last set rest-pause: rack the dumbbells for 15 seconds, then perform 2-3 extra reps.",
      advancedTechniqueType: "rest-pause",
      extraCues: [
        "Keep the incline slight",
        "Do not lower past a clean shoulder position",
        "Control the dumbbells all the way down",
      ],
    },
  },
  {
    id: "weighted-dip",
    name: "Weighted Dip",
    subtitle: "Lower-chest and triceps heavy work",
    prescription: "3 x 8-10",
    setCount: 3,
    cue: "Keep the chest open, use a clean controlled path, and stop before the shoulders lose position",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "120 s",
      progression:
        "Stay in the 8-10 range with full control. Add load once all work sets reach 10 cleanly.",
      advancedTechnique: null,
      extraCues: [
        "Use a slight forward lean for chest bias",
        "Keep elbows about 45-60°",
        "Do not swing out of the bottom",
      ],
    },
  },
  {
    id: "cable-stretch-fly",
    name: "Cable Stretch Fly",
    subtitle: "Stretch-overload chest finisher",
    prescription: "1 x 12-15",
    setCount: 1,
    cue: "Keep a soft elbow bend, stay in a long controlled range, and let the chest stretch without turning it into a press",
    details: {
      tempo: "2-0-2",
      targetRir: "1-2",
      rest: "—",
      progression:
        "Keep the stretch and control honest first. Increase load only when you can complete the full 12-15 range without losing position.",
      advancedTechnique:
        "Finish the set with a 15-second loaded stretch in the bottom position.",
      advancedTechniqueType: "iso-stretch",
      extraCues: [
        "Keep the elbow angle fixed",
        "Do not rush the bottom stretch",
        "Stay smooth and do not lock out hard at the top",
      ],
    },
  },
  {
    id: "overhead-rope-extension",
    name: "Overhead Rope Extension",
    subtitle: "Triceps stretch-focused isolation",
    prescription: "4 x 12-15",
    setCount: 4,
    cue: "Keep the elbows stable, use the full stretch, and finish with a clean squeeze",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60-75 s",
      progression:
        "Own the 12-15 range with stable elbows before increasing the stack.",
      advancedTechnique:
        "Last set dropset: reduce the load by about 20% and continue with clean reps.",
      advancedTechniqueType: "dropset",
      extraCues: [
        "Lean slightly forward to feel the stretch better",
        "Do not let the elbows flare too wide",
        "Spread the rope cleanly at the finish",
      ],
    },
  },
  {
    id: "lateral-raise-db",
    name: "Lateral Raise (DB)",
    subtitle: "Side-delt pump and activation",
    prescription: "2 x 15",
    setCount: 2,
    cue: "Keep the shoulder down, lead with the elbow, and stop before the trap takes over",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Keep the reps smooth and the range honest. Add load only when both sets stay clean at the target reps.",
      advancedTechnique: null,
      extraCues: [
        "Do not swing the torso",
        "Lift only to a clean shoulder-height range",
        "Keep the neck relaxed",
      ],
    },
  },
  {
    id: "standing-ohp-light",
    name: "Standing Overhead Press (BB)",
    subtitle: "Light shoulder activation work",
    prescription: "2 x 8",
    setCount: 2,
    cue: "Brace hard, press in a clean path, and do not lean back to finish the rep",
    details: {
      tempo: "2-1-1",
      targetRir: "3-4",
      rest: "90 s",
      progression:
        "This stays submaximal. Add load only if both sets remain crisp and never interfere with the main bench work.",
      advancedTechnique: null,
      extraCues: [
        "Keep the ribs down",
        "Stay well short of grindy reps",
        "Let it stay clean and submaximal",
      ],
    },
  },
  {
    id: "face-pull",
    name: "Face Pull",
    subtitle: "Rear-delt and scap health support",
    prescription: "2 x 15",
    setCount: 2,
    cue: "Pull high, rotate out at the top, and finish with clean scap control",
    details: {
      tempo: "2-0-2",
      targetRir: "2-3",
      rest: "45 s",
      progression:
        "Prioritize clean scap movement and full control before adding load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the shoulders down",
        "Lead with the elbows",
        "Do not crane the neck forward",
      ],
    },
  },

  // BULK — D2
  {
    id: "weighted-pull-up",
    name: "Weighted Pull-up",
    subtitle: "Primary vertical back strength lift",
    prescription: "4 x 5-8",
    setCount: 4,
    cue: "Set the shoulder blades down first, pull the chest up, and control the full range without swinging",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "150 s",
      progression:
        "Add reps first. When the prescribed working sets reach 8 with clean reps and target RIR, increase the load slightly next time.",
      advancedTechnique: null,
      extraCues: [
        "Start from a dead hang for one second",
        "Drive the elbows toward the ribs",
        "No kipping or torso swing",
      ],
    },
  },
  {
    id: "wide-grip-lat-pulldown",
    name: "Wide Grip Lat Pulldown",
    subtitle: "Upper lat width work",
    prescription: "3 x 8-10",
    setCount: 3,
    cue: "Keep the shoulders down, drive the elbows into the pockets, and keep the torso stable",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "120 s",
      progression:
        "Stay in the 8-10 range with clean scap control. Increase load when all sets reach 10 without leaning back to finish reps.",
      advancedTechnique: null,
      extraCues: [
        "Use a medium-wide grip, not an exaggerated one",
        "Pause briefly in the bottom position",
        "Do not lean back to finish the rep",
      ],
    },
  },
  {
    id: "neutral-close-grip-pulldown",
    name: "Neutral Close Grip Pulldown",
    subtitle: "Lower lat and mid-back support",
    prescription: "2 x 10-12",
    setCount: 2,
    cue: "Stay stacked, keep the elbows close, and finish each rep without swinging back",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "90 s",
      progression:
        "Own the 10-12 range with a stable torso before adding load.",
      advancedTechnique: null,
      extraCues: [
        "Use neutral handles",
        "Pause briefly in the bottom position",
        "Control the return fully",
      ],
    },
  },
  {
    id: "straight-arm-pulldown",
    name: "Straight Arm Pulldown",
    subtitle: "Lat isolation with constant tension",
    prescription: "2 x 12-15",
    setCount: 2,
    cue: "Keep a soft elbow bend, keep the ribs down, and pull with the lats instead of the triceps",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Keep constant tension and a clean arc first. Increase load only when both sets stay smooth through the full range.",
      advancedTechnique: null,
      extraCues: [
        "Keep the elbow angle fixed",
        "Do not let the shoulders drift up",
        "Stay smooth through the full arc",
      ],
    },
  },
  {
    id: "back-extension",
    name: "Back Extension",
    subtitle: "Lower-back health and hinge support",
    prescription: "2 x 15",
    setCount: 2,
    cue: "Move from the hips, pause briefly at the top, and stop before the low back takes over",
    details: {
      tempo: "2-1-2",
      targetRir: "2-3",
      rest: "60 s",
      progression:
        "Keep the hinge pattern clean first. Increase difficulty only when all reps stay controlled without spinal overextension.",
      advancedTechnique: null,
      extraCues: [
        "Keep the spine neutral",
        "Do not hyperextend to finish the rep",
        "Let the glutes and hamstrings help the movement",
      ],
    },
  },
  {
    id: "barbell-curl",
    name: "Barbell Curl",
    subtitle: "Primary biceps loading",
    prescription: "3 x 10-12",
    setCount: 3,
    cue: "Keep the elbows by the body, squeeze at the top, and lower without swinging the torso",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "90 s",
      progression:
        "Build toward the top of the 10-12 range with strict reps before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Do not let the elbows drift forward",
        "Keep the wrists neutral",
        "Do not rock the body to finish the rep",
      ],
    },
  },
  {
    id: "hammer-curl",
    name: "Hammer Curl",
    subtitle: "Brachialis and brachioradialis support",
    prescription: "3 x 10-12",
    setCount: 3,
    cue: "Keep the wrists neutral, keep the upper arm still, and control the full arc",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "90 s",
      progression:
        "Stay in the 10-12 range with neutral wrists and full control before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the shoulders down",
        "Do not swing the torso",
        "Lower under full control",
      ],
    },
  },
  {
    id: "reverse-curl",
    name: "Reverse Curl (EZ or BB)",
    subtitle: "Forearm and elbow-flexor support",
    prescription: "2 x 15",
    setCount: 2,
    cue: "Keep the knuckles up, keep the wrist neutral, and move the weight without shoulder cheating",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Keep the reps clean and wrists stable before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Use a light enough load for clean reps",
        "Do not shrug the weight up",
        "Stay smooth through the full arc",
      ],
    },
  },
  {
    id: "back-shrug",
    name: "Back Shrug",
    subtitle: "Upper trap work",
    prescription: "2 x 10-12",
    setCount: 2,
    cue: "Lift straight up, hold the top cleanly for one second, and do not roll the shoulders",
    details: {
      tempo: "2-0-1",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Reach the top of the 10-12 range with a clear one-second hold before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the bar behind the body",
        "Use a slight forward lean if it feels cleaner",
        "Think ears to shoulders, not circles",
      ],
    },
  },

  // BULK — D3
  {
    id: "high-bar-back-squat",
    name: "High-Bar Back Squat",
    subtitle: "Primary quad strength lift",
    prescription: "4 x 6-8",
    setCount: 4,
    cue: "Brace hard, keep the ribs down, and control the depth without losing foot pressure",
    details: {
      tempo: "3-1-1",
      targetRir: "≈1-2",
      rest: "150 s",
      progression:
        "Add reps first. When the prescribed working sets reach 8 with clean depth and target RIR, increase the load slightly next time.",
      advancedTechnique: null,
      extraCues: [
        "Let the knees track over the toes",
        "Keep the heels planted",
        "Go to clean depth without butt-wink",
      ],
    },
  },
  {
    id: "leg-press-narrow",
    name: "Leg Press (Narrow)",
    subtitle: "Quad volume with constant tension",
    prescription: "3 x 10-12",
    setCount: 3,
    cue: "Use a narrower stance, control the bottom, and keep quad tension without bouncing",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "120 s",
      progression:
        "Stay in the 10-12 range with full control and no bounce. Increase load when all sets reach 12 cleanly.",
      advancedTechnique: null,
      extraCues: [
        "Keep the feet mid-height on the platform",
        "Do not lock the knees hard at the top",
        "Stay controlled through the full range",
      ],
    },
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    subtitle: "Unilateral quad work with glute stretch",
    prescription: "3 x 8-10",
    setCount: 3,
    cue: "Stay balanced, keep the front foot rooted, and drive the floor away with the working leg",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "90 s",
      progression:
        "Build toward the top of the rep range on both legs with stable balance and full control before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Reps are per leg",
        "Use a shorter step if you want more quad bias",
        "Pause briefly in the bottom with control",
        "Hold support lightly if balance is the limit",
      ],
    },
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    subtitle: "Quad isolation with dropset finish",
    prescription: "3 x 12-15",
    setCount: 3,
    cue: "Squeeze hard at the top, keep the hips still, and lower the weight under control",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Own the 12-15 range with clean reps and full contraction before increasing the load.",
      advancedTechnique:
        "Last set dropset: reduce the load by about 25% and continue with controlled reps.",
      advancedTechniqueType: "dropset",
      extraCues: [
        "Do not throw the hips off the seat",
        "Aim for full contraction, not sloppy speed",
        "Let the last set burn before the dropset",
      ],
    },
  },
  {
    id: "seated-leg-curl",
    name: "Seated Leg Curl",
    subtitle: "Hamstring control and tension",
    prescription: "3 x 10-12",
    setCount: 3,
    cue: "Keep the back on the pad, lower slowly, and squeeze the hamstrings hard at the top",
    details: {
      tempo: "3-1-2",
      targetRir: "≈1-2",
      rest: "75-90 s",
      progression:
        "Stay in the 10-12 range with full control and a clear top squeeze before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the ribs down",
        "Do not lift the hips off the setup",
        "Make the eccentric honest for all reps",
      ],
    },
  },
  {
    id: "standing-calf-raise",
    name: "Standing Calf Raise",
    subtitle: "Primary calf work",
    prescription: "3 x 15-20",
    setCount: 3,
    cue: "Use full range, pause in the stretch, and rise without bouncing",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Reach the top of the rep range with full range and clean pauses before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the knees straight but not locked hard",
        "Reach the top with a real squeeze",
        "Do not rush out of the bottom",
      ],
    },
  },
  {
    id: "seated-calf-raise",
    name: "Seated Calf Raise",
    subtitle: "Secondary calf work",
    prescription: "2 x 15-20",
    setCount: 2,
    cue: "Stay controlled through the full range, hold the top, and do not bounce out of the stretch",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "45 s",
      progression: "Keep the range long and controlled before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Let the bottom stretch happen fully",
        "Keep tension on the calves, not momentum",
        "Chase the burn without shortening the range",
      ],
    },
  },
  {
    id: "hip-stability-ab-ad-d3",
    name: "Abductor & Adductor Machine",
    subtitle: "Hip stability superset",
    prescription: "3 x 15",
    setCount: 3,
    cue: "Move both directions with control and keep the transition short but clean",
    details: {
      tempo: "2-0-2",
      targetRir: "2-3",
      rest: "30 s",
      progression:
        "Keep both directions smooth and controlled before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Each round = 15 abductor reps + 15 adductor reps",
        "Do not rush the switch between directions",
        "Keep both sides even and controlled",
        "Treat it like support work, not ego work",
      ],
    },
  },

  // BULK — D4
  {
    id: "standing-overhead-press-bb",
    name: "Standing Overhead Press (BB)",
    subtitle: "Primary shoulder strength press",
    prescription: "3 x 6-8",
    setCount: 3,
    cue: "Brace hard, keep the ribs down, and press close to the face without leaning back",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "150 s",
      progression:
        "Add reps first. When the prescribed working sets reach 8 with clean reps and target RIR, increase the load slightly next time.",
      advancedTechnique: null,
      extraCues: [
        "Keep the glutes tight through the rep",
        "Press close, then finish over the head",
        "Do not hyperextend the low back",
      ],
    },
  },
  {
    id: "machine-lateral-raise",
    name: "Machine Lateral Raise",
    subtitle: "Primary side-delt volume",
    prescription: "3 x 12-15",
    setCount: 3,
    cue: "Keep the shoulder down, lead with the elbow, and stop before the trap takes over",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60-75 s",
      progression:
        "Build toward the top of the 12-15 range with clean reps before increasing load.",
      advancedTechnique:
        "Optional last set dropset: reduce the load by about 20% and continue with controlled reps.",
      advancedTechniqueType: "dropset",
      extraCues: [
        "Start slightly below shoulder level with control",
        "Do not shrug into the rep",
        "Stop around a clean parallel range",
      ],
    },
  },
  {
    id: "cable-lateral-lean-away",
    name: "Cable Lateral (Lean-away)",
    subtitle: "Constant-tension side-delt work",
    prescription: "2 x 12-15",
    setCount: 2,
    cue: "Lean slightly, keep the shoulder down, and hold tension on the delt through the full arc",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "45-60 s",
      progression:
        "Keep the full arc smooth and tension continuous before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Lean only a little, not excessively",
        "Keep the palm angled down if that feels cleaner",
        "Do not shrug into the rep",
      ],
    },
  },
  {
    id: "reverse-pec-deck",
    name: "Reverse Pec-Deck",
    subtitle: "Rear-delt control and upper-back support",
    prescription: "3 x 12-15",
    setCount: 3,
    cue: "Keep the neck relaxed, hold the rear-delt squeeze, and control the return",
    details: {
      tempo: "2-1-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Reach the top of the rep range with a clean one-second squeeze before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the shoulder blades down and back",
        "Pause clearly for one second in the squeeze",
        "Do not let the torso shift",
      ],
    },
  },
  {
    id: "db-upright-row",
    name: "Upright Row (DB)",
    subtitle: "Trap and upper-delt work",
    prescription: "2 x 10-12",
    setCount: 2,
    cue: "Use a wider path, lift only to shoulder height, and keep the shoulders down",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "75-90 s",
      progression: "Keep the reps clean and pain-free before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Do not yank the dumbbells up",
        "Keep the elbows from climbing too high",
        "Stop if the rep stops feeling clean",
      ],
    },
  },
  {
    id: "db-shrug",
    name: "Dumbbell Shrug",
    subtitle: "Upper-trap squeeze work",
    prescription: "2 x 10-12",
    setCount: 2,
    cue: "Lift straight up, hold the squeeze at the top, and do not roll the shoulders",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "60-75 s",
      progression:
        "Reach the top of the 10-12 range with a clean one-second hold before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Think ears to shoulders",
        "Keep the movement straight, not circular",
        "Do not use a bounce to start the rep",
      ],
    },
  },
  {
    id: "incline-db-curl",
    name: "Incline DB Curl",
    subtitle: "Biceps top-up with long-length tension",
    prescription: "2 x 12",
    setCount: 2,
    cue: "Keep the shoulders pinned back, let the elbows stay behind the torso, and use the full range without swinging",
    details: {
      tempo: "3-1-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression: "Keep the reps strict and stretched before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Let the biceps lengthen fully at the bottom",
        "Do not let the elbows drift forward",
        "Keep the torso fixed to the bench",
      ],
    },
  },
  {
    id: "face-away-cable-curl",
    name: "Face-away Cable Curl",
    subtitle: "Cable biceps finisher",
    prescription: "1 x 15",
    setCount: 1,
    cue: "Stay fixed, use the full stretch first, and curl without leaning back to finish the rep",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "45-60 s",
      progression:
        "Keep the single set smooth and fully stretched before increasing load.",
      advancedTechnique:
        "Rest-pause: after the main set, rest 15 seconds and perform 5-6 extra reps.",
      advancedTechniqueType: "rest-pause",
      extraCues: [
        "Keep the torso still",
        "Let the arm open fully before curling",
        "Do not turn the last reps into body English",
      ],
    },
  },
  {
    id: "rope-pushdown",
    name: "Rope Pushdown",
    subtitle: "Triceps pump finisher",
    prescription: "2 x 15",
    setCount: 2,
    cue: "Keep the elbows pinned, spread the rope at the bottom, and finish with a clean squeeze",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "45-60 s",
      progression:
        "Keep both sets clean with a real squeeze before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Do not let the shoulders roll forward",
        "Keep the torso still",
        "Do not rush the squeeze",
      ],
    },
  },

  // BULK — D5
  {
    id: "dips-or-decline-db-press",
    name: "Dips or Decline DB Press",
    subtitle: "Lower-chest pump press",
    prescription: "3 x 10-12",
    setCount: 3,
    cue: "Use a controlled eccentric, keep the path chest-driven, and do not bounce out of the bottom",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "90 s",
      progression:
        "Build toward the top of the 10-12 range with clean controlled reps before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Use a slight forward lean if you choose dips",
        "Pick the cleaner chest-driven option",
        "Stop before the bottom position gets loose",
      ],
    },
  },
  {
    id: "low-to-high-cable-fly",
    name: "Low-to-High Cable Fly",
    subtitle: "Upper-fiber chest pump work",
    prescription: "2 x 12-15",
    setCount: 2,
    cue: "Drive low to high, keep constant tension, and hold the squeeze at the top",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Reach the top of the 12-15 range with a clean one-second squeeze before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the elbows slightly bent and fixed",
        "Do not let the weights crash together",
        "Do not turn the rep into a press",
      ],
    },
  },
  {
    id: "push-up-mechanical-dropset",
    name: "Push-up Mechanical Dropset",
    subtitle: "Chest flush finisher",
    prescription: "1 x 12",
    setCount: 1,
    cue: "Change positions without rest, keep the trunk tight, and do not let the reps get sloppy at the end",
    details: {
      tempo: "1-0-1",
      targetRir: "1-2",
      rest: "—",
      progression:
        "Keep the full cluster clean first. Add reps only if you can maintain position quality through each variation.",
      advancedTechnique:
        "Mechanical dropset: perform 12 wide reps, 8 close reps, then 6 plyo reps without rest.",
      advancedTechniqueType: "mechanical-dropset",
      extraCues: [
        "Move quickly but stay organized between positions",
        "Keep the body in one line",
        "Stop the cluster before the last reps turn messy",
      ],
    },
  },
  {
    id: "skull-crusher-ez",
    name: "Skull Crusher (EZ)",
    subtitle: "Triceps lock-out focus",
    prescription: "3 x 8-10",
    setCount: 3,
    cue: "Keep the upper arms slightly back, lower with control, and extend without throwing the shoulders",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "90 s",
      progression:
        "Build toward the top of the 8-10 range with fixed upper arms before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the wrists neutral",
        "Do not let the elbows flare wide",
        "Use the stretch without chasing pain",
      ],
    },
  },
  {
    id: "overhead-db-extension",
    name: "Overhead DB Extension",
    subtitle: "Long-head triceps stretch work",
    prescription: "3 x 10-12",
    setCount: 3,
    cue: "Keep the ribs down, use the full stretch, and finish with a clean extension",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "90 s",
      progression:
        "Stay in the 10-12 range with a full stretch and clean finish before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the elbows slightly in",
        "Do not let the ribcage flare to finish the rep",
        "Use the stretch, then squeeze cleanly",
      ],
    },
  },
  {
    id: "assisted-pull-up-cluster",
    name: "Assisted Pull-up Cluster",
    subtitle: "Vertical pull bridge before rows",
    prescription: "2 x 8-10",
    setCount: 2,
    cue: "Use only enough assistance to keep the range clean, pause briefly in the hang, and do not let the second burst turn into grindy reps",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "120 s",
      progression:
        "Reduce assistance gradually while keeping the full cluster clean and repeatable.",
      advancedTechnique:
        "Cluster set: perform 8-10 reps, rest 15 seconds, then perform 4-5 more reps.",
      advancedTechniqueType: "cluster",
      extraCues: [
        "Set the shoulder blades down before pulling",
        "Keep the first burst around honest RIR 1-2",
        "Do not rush the 15-second break",
      ],
    },
  },
  {
    id: "t-bar-row",
    name: "T-Bar Row",
    subtitle: "Primary row strength work",
    prescription: "4 x 6-8",
    setCount: 4,
    cue: "Keep the torso stable, drive the elbows toward the hips, and hold the squeeze briefly at the top",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "150 s",
      progression:
        "Add reps first. When the prescribed working sets reach 8 with a stable torso and target RIR, increase the load slightly next time.",
      advancedTechnique: null,
      extraCues: [
        "Keep the ribs down",
        "Do not yank the weight with a torso swing",
        "Pull the elbows back, not up",
      ],
    },
  },
  {
    id: "chest-supported-row",
    name: "Chest Supported Row (45°)",
    subtitle: "Stable row thickness work",
    prescription: "3 x 8-10",
    setCount: 3,
    cue: "Stay glued to the pad, set the shoulder blades first, and pull without any body swing",
    details: {
      tempo: "2-1-1",
      targetRir: "≈1-2",
      rest: "120 s",
      progression:
        "Own the 8-10 range with full control before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the chest planted on the support",
        "Squeeze, then control the return",
        "Do not jerk the first inch of the rep",
      ],
    },
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row",
    subtitle: "Metabolic row finisher",
    prescription: "2 x 12-15",
    setCount: 2,
    cue: "Pull with the elbows, hold the squeeze for one second, and control the return without rocking back",
    details: {
      tempo: "2-1-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression: "Keep the squeeze and return clean before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep a neutral spine",
        "Do not turn the squeeze into a torso swing",
        "Let the return stay slow and clean",
        "Fatigue fallback: if D5 is running long or upper-back fatigue is high, perform 1 clean set instead of forcing both.",
      ],
    },
  },

  // BULK — D6
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    subtitle: "Primary posterior-chain strength lift",
    prescription: "4 x 6-8",
    setCount: 4,
    cue: "Keep the bar close, push the hips back, and stay braced without hyperextending at the top",
    details: {
      tempo: "3-1-1",
      targetRir: "≈1-2",
      rest: "150 s",
      progression:
        "Add reps first. When the prescribed working sets reach 8 with a clean hinge and target RIR, increase the load slightly next time.",
      advancedTechnique: null,
      extraCues: [
        "Keep the ribs down and the spine neutral",
        "Stop where the hamstring stretch stays clean",
        "Pause briefly above the knees before coming up",
      ],
    },
  },
  {
    id: "seated-leg-curl-d6",
    name: "Seated Leg Curl",
    subtitle: "Hamstring contraction work",
    prescription: "3 x 10-12",
    setCount: 3,
    cue: "Stay pinned into the seat, squeeze hard at the top, and lower under control",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "90 s",
      progression:
        "Reach the top of the 10-12 range with a clear squeeze before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Do not lift the hips off the seat",
        "Hold the top squeeze for one second",
        "Keep the lowering controlled all the way down",
      ],
    },
  },
  {
    id: "machine-glute-kickback",
    name: "Machine Glute Kickback",
    subtitle: "Glute squeeze work",
    prescription: "3 x 12-15",
    setCount: 3,
    cue: "Keep the pelvis stable, drive back through the heel, and finish with a clean glute squeeze",
    details: {
      tempo: "2-1-2",
      targetRir: "≈1-2",
      rest: "45-60 s",
      progression:
        "Build toward the top of the range with a clean one-second squeeze before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Reps are per leg",
        "Keep the knee slightly bent",
        "Do not rotate the torso or hips",
        "Return slowly without swinging",
      ],
    },
  },
  {
    id: "back-extension-d6",
    name: "Back Extension",
    subtitle: "Posterior-chain health set",
    prescription: "2 x 12-15",
    setCount: 2,
    cue: "Move from the hips, let the glutes lead, and stop before the low back takes over",
    details: {
      tempo: "2-1-2",
      targetRir: "2-3",
      rest: "60 s",
      progression:
        "Keep the hinge clean and controlled before increasing difficulty.",
      advancedTechnique: null,
      extraCues: [
        "Keep the spine neutral",
        "Do not jerk the top position",
        "Finish in a straight line, not past it",
      ],
    },
  },
  {
    id: "walking-lunge",
    name: "Walking Lunge",
    subtitle: "Quad top-up with short-step bias",
    prescription: "3 x 12",
    setCount: 3,
    cue: "Use a shorter step, stay balanced, and drive through the front foot with control",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Build toward smooth, even reps on both legs before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Reps are per leg",
        "Let the knee travel forward in a controlled way",
        "Keep the torso stable with only a slight lean",
        "Do not rush the stride",
      ],
    },
  },
  {
    id: "hip-stability-ab-ad-d6",
    name: "Abductor & Adductor Machine",
    subtitle: "Hip stability superset",
    prescription: "1 x 15",
    setCount: 1,
    cue: "Move both directions with control and keep the transition short but clean",
    details: {
      tempo: "2-0-2",
      targetRir: "2-3",
      rest: "30 s",
      progression:
        "Keep both directions smooth and even before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "One round = 15 abductor reps + 15 adductor reps",
        "Switch directions without rushing",
        "Keep both sides even and controlled",
        "Treat it like support work, not ego work",
      ],
    },
  },
  {
    id: "leg-press-calf-raise",
    name: "Leg-Press Calf Raise",
    subtitle: "Calf pump work",
    prescription: "3 x 12-15",
    setCount: 3,
    cue: "Use full range, pause in the stretch, and rise with a hard squeeze without bouncing",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Reach the target reps with full range and clean control before increasing load.",
      advancedTechnique:
        "Last set dropset: reduce the load by about 25% and continue with controlled reps.",
      advancedTechniqueType: "dropset",
      extraCues: [
        "Let the heels drop into a real stretch",
        "Do not bounce out of the bottom",
        "Rotate foot position only if control stays clean",
      ],
    },
  },
  {
    id: "seated-calf-raise-d6",
    name: "Seated Calf Raise",
    subtitle: "Primary soleus volume",
    prescription: "3 x 15-20",
    setCount: 3,
    cue: "Stay controlled through the full range, hold the squeeze, and do not bounce out of the stretch",
    details: {
      tempo: "2-0-2",
      targetRir: "≈1-2",
      rest: "45 s",
      progression:
        "Build toward the top of the range with full range and control before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Let the bottom stretch happen fully",
        "Keep tension on the calves, not momentum",
        "Do not rush the last burning reps",
      ],
    },
  },
  {
    id: "preacher-curl-ez",
    name: "Preacher Curl (EZ)",
    subtitle: "Primary biceps support work",
    prescription: "2 x 10-12",
    setCount: 2,
    cue: "Stay locked to the pad, squeeze at the top, and lower under control without letting the elbow drift",
    details: {
      tempo: "2-1-2",
      targetRir: "≈1-2",
      rest: "75-90 s",
      progression:
        "Reach the top of the 10-12 range with clean reps and a real top squeeze before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the armpit glued to the pad",
        "Do not lock the elbow hard at the bottom",
        "Hold the top squeeze for one second",
      ],
    },
  },
  {
    id: "preacher-curl-mechanical",
    name: "Preacher Curl — Mechanical",
    subtitle: "Wide-to-narrow biceps mechanical finisher",
    prescription: "1 x 6-8",
    setCount: 1,
    cue: "Keep the same load, switch grips cleanly, and stop as soon as the shoulders want to take over",
    details: {
      tempo: "2-1-2",
      targetRir: "≈1-2",
      rest: "75-90 s",
      progression:
        "Keep the full wide-to-narrow sequence clean before increasing load.",
      advancedTechnique:
        "Mechanical set: perform the reps with a wide grip, then switch immediately to a narrow grip with the same weight.",
      advancedTechniqueType: "mechanical-set",
      extraCues: [
        "Stay locked to the pad for both grips",
        "Do not rush the grip change",
        "Keep the sequence clean, not ugly",
      ],
    },
  },
  {
    id: "behind-the-back-wrist-curl",
    name: "Behind-the-Back Wrist Curl",
    subtitle: "Forearm flexor work",
    prescription: "3 x 12-15",
    setCount: 3,
    cue: "Let the bar roll to the fingers, curl it back up, and hold the top briefly without jerking",
    details: {
      tempo: "2-1-2",
      targetRir: "≈1-2",
      rest: "60 s",
      progression:
        "Keep the reps smooth and the top position controlled before increasing load.",
      advancedTechnique: null,
      extraCues: [
        "Keep the shoulders down",
        "Use a shoulder-width grip",
        "Do not yank the bar up",
        "Optional bonus: if grip feels fresh, add 1-2 easy wrist-roller rotations after this exercise.",
      ],
    },
  },
];
