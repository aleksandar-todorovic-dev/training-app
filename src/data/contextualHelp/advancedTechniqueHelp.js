/**
 * Contextual help content keyed by exercise advanced technique type.
 *
 * Product note:
 * Advanced techniques are guidance-only in the MVP. These entries explain how
 * and when to use a technique, but they do not change prescribed set counts,
 * completion rules, or runtime progress.
 */
export const advancedTechniqueHelpByType = {
  dropset: {
    title: "Dropset",
    intro:
      "A dropset extends the last working set by reducing the load and continuing with controlled reps.",
    sections: [
      {
        id: "how-to",
        title: "How to do it",
        paragraphs: [
          "Finish the prescribed working set first.",
          "Use the approximate percentage in the exercise note. Start from the actual main-set load and use the preceding actual load for each later drop.",
          "Three drops are planned. Stopping after the first or second is fine. There is no fixed rep target for a drop. If you log it, record only the load used and reps achieved.",
          "Stop earlier if form breaks down, joints feel irritated, or the target muscle is no longer controlling the movement.",
        ],
      },
      {
        id: "when-to-use",
        title: "When to use it",
        paragraphs: [
          "Use it only when your normal working sets are clean, recovery is good, and joints feel fine.",
          "Do not force advanced techniques every workout. Rotate them across cycles, or use them only when recovery, joints, and set quality are good.",
          "If the day already includes several advanced techniques or fatigue is high, do not force all of them. Complete the prescribed sets first and use the technique only when quality is still good.",
        ],
      },
    ],
  },

  "rest-pause": {
    title: "Rest-pause",
    intro:
      "Rest-pause extends a set by adding a short break and a few extra clean reps with the same load.",
    sections: [
      {
        id: "how-to",
        title: "How to do it",
        paragraphs: [
          "Finish the working set, rest for the time shown in the exercise note, then perform the extra reps listed there.",
          "The pause should help you extend the set without turning the reps into ugly grinding.",
        ],
      },
      {
        id: "when-to-use",
        title: "When to use it",
        paragraphs: [
          "Use it only when your form is stable and the target muscle is still doing the work.",
          "Do not force advanced techniques every workout. Rotate them across cycles, or use them only when recovery, joints, and set quality are good.",
          "Skip it if the extra reps would become sloppy, joint-heavy, or too grindy. If the day already includes several advanced techniques, complete the prescribed sets first and use this only when quality is still good.",
        ],
      },
    ],
  },

  "mechanical-set": {
    title: "Mechanical set",
    intro:
      "A mechanical set can extend the work by changing the grip, angle, or variation while keeping the prescribed load.",
    sections: [
      {
        id: "how-to",
        title: "How to do it",
        paragraphs: [
          "Complete the prescribed wide-grip work first. Continue with a narrow grip only if your form is still controlled.",
          "Keep the same load. Stabilize or rack it as needed, then change grips without rushing or taking a planned rest.",
          "Record the actual reps for the optional continuation. There is no fixed rep target.",
          "The goal is to extend clean tension, not to cheat the movement.",
        ],
      },
      {
        id: "when-to-use",
        title: "When to use it",
        paragraphs: [
          "Use it only when the first variation is close to done but your form is still organized.",
          "Do not force advanced techniques every workout. Rotate them across cycles, or use them only when recovery, joints, and set quality are good.",
          "Stop if the second part turns into shoulder swing, momentum, or poor joint position. If the day already includes several advanced techniques, do not force every one of them when fatigue is high.",
        ],
      },
    ],
  },

  "mechanical-dropset": {
    title: "Mechanical dropset",
    intro:
      "A mechanical dropset makes the exercise easier by changing position or variation instead of reducing the load.",
    sections: [
      {
        id: "how-to",
        title: "How to do it",
        paragraphs: [
          "For Bulk D5, start with standard floor push-ups using bodyweight. Aim for 12 reps with 1–2 reps in reserve.",
          "If form stays steady, you can continue with knee push-ups. Change position with control, without a planned rest.",
          "Stop if form deteriorates or you feel pain. In cycles with a continuation panel, record only the knee push-up reps you do.",
        ],
      },
      {
        id: "when-to-use",
        title: "When to use it",
        paragraphs: [
          "Use it as a finisher when the main work is already done and form is still clean.",
          "Do not force advanced techniques every workout. Rotate them across cycles, or use them only when recovery, joints, and set quality are good.",
          "Do not chase extra reps if the movement starts breaking down. If the day already includes several advanced techniques, complete the prescribed sets first and use this only when quality is still good.",
        ],
      },
    ],
  },

  "iso-stretch": {
    title: "Iso-stretch",
    intro:
      "An iso-stretch holds the loaded stretch position after a set to add tension without adding another full set.",
    sections: [
      {
        id: "how-to",
        title: "How to do it",
        paragraphs: [
          "Finish the working set first.",
          "Move into the stretched position shown by the exercise and hold it under control for the listed time.",
          "The stretch should feel loaded and stable, not painful or forced.",
        ],
      },
      {
        id: "when-to-use",
        title: "When to use it",
        paragraphs: [
          "Use it only when the joint position feels safe and the target muscle is still controlling the load.",
          "Do not force advanced techniques every workout. Rotate them across cycles, or use them only when recovery, joints, and set quality are good.",
          "Skip it if the stretch feels sharp, unstable, or if fatigue is already too high. If the day already includes several advanced techniques, do not force every one of them.",
        ],
      },
    ],
  },

  cluster: {
    title: "Cluster",
    intro:
      "A cluster splits one hard set into smaller bursts with a short rest inside the set.",
    sections: [
      {
        id: "how-to",
        title: "How to do it",
        paragraphs: [
          "On Bulk D5, start each of two sets with 8–10 reps. For the optional continuation, rest 15 seconds and aim for 4–5 extra reps. Rest 120 seconds between sets.",
          "On the same machine, less assistance makes the pull-up harder. Mark Done for the first burst. Log the continuation separately when the cycle includes Cluster logging.",
          "Each burst should stay clean. The short rest is there to preserve quality.",
        ],
      },
      {
        id: "when-to-use",
        title: "When to use it",
        paragraphs: [
          "Use it only when you can keep the movement clean across both bursts.",
          "Do not force advanced techniques every workout. Rotate them across cycles, or use them only when recovery, joints, and set quality are good.",
          "Skip or reduce it if the second burst turns into rushed or grindy reps. If the day already includes several advanced techniques, complete the prescribed sets first and use this only when quality is still good.",
        ],
      },
    ],
  },
};
