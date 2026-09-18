/**
 * Static educational guide content for the Cut Pro plan.
 *
 * Product note:
 * Guide content explains the training system, progression, recovery, and plan
 * usage. It is read-only support content and does not affect runtime logs,
 * day completion, or cycle state.
 */
export const cutProGuide = {
  id: "cut-pro",
  title: "Cut Pro Guide",
  intro:
    "Learn how the cut plan works, how to keep training productive in a deficit, and how to train with the aim of maintaining useful strength and muscle while managing fatigue.",
  groups: [
    {
      id: "start-here",
      title: "Start here",
      intro:
        "Understand how the cut cycle works, why it stays flexible, and how to log productive training while recovery can be more constrained.",
      topics: [
        {
          id: "structured-cut",
          title: "Structured cut training, not random workouts",
          paragraphs: [
            "Cut Pro is still a real training cycle.",
            "The app moves you through D1-D6 in order, but the plan uses tighter volume, fewer intensity methods, and more fatigue control than Bulk Pro. The goal is to provide a strong resistance-training stimulus during a cut while keeping training quality and fatigue manageable.",
            "Cycle Coach does not create or track your calorie deficit. Body-weight and body-composition outcomes depend on nutrition, training, recovery, and individual factors.",
            "Lower volume does not mean lower purpose. It means the work is selected more carefully because recovery can be more constrained during an energy deficit.",
          ],
          bullets: [
            "The cut plan is still structured training.",
            "The goal is preservation, control, and repeatable quality.",
            "Lower volume is intentional.",
            "The app keeps the order clear so dieting does not turn training into guesswork.",
          ],
        },
        {
          id: "cycle-works",
          title: "How the cycle works",
          paragraphs: [
            "The cut cycle follows the same training rhythm, but with tighter fatigue control.",
            "You move through two training days, one rest day, two more training days, another rest day, then the final two training days before resting again and returning to D1.",
            "Think of this as a repeating rhythm, not a strict Monday-to-Sunday schedule. On a cut, that rhythm matters because recovery needs more respect.",
          ],
          bullets: [
            "Train the next planned day in order.",
            "Keep rest days as part of the system.",
            "After D6, return to D1.",
            "Do not turn the cut into random workouts.",
          ],
        },
        {
          id: "life-interrupts-cycle",
          title: "When life interrupts the cycle",
          paragraphs: [
            "A delayed workout does not erase the plan.",
            "If real life moves a session, do not restart the cycle and do not jump randomly to your favorite day. Continue from the next planned training day and keep the cycle order stable.",
            "This works because the plan is built with overlap. Major muscle groups return regularly through main work, support work, or small top-up work, so the system stays useful even when the calendar is not perfect.",
            "On a cut, this flexibility is especially important. You may need to move a rest day earlier, keep one rest day fully passive, or add easy LISS only when recovery allows it. The goal is to adjust without turning the plan random.",
          ],
          bullets: [
            "Move rest when needed, but keep the training order stable.",
            "Do not restart the whole cycle because one day moved.",
            "Do not turn the plan into random workouts.",
            "Top-up work helps maintain useful signals without excess fatigue.",
            "Recovery decisions should support the next lifting day.",
          ],
        },
        {
          id: "logging-basics",
          title: "How logging works",
          paragraphs: [
            "The log should record what you actually did, not what the plan hoped you would do.",
            "A set counts as performed only when you check it as done. Weight, reps, and RIR describe the set, but input values alone do not complete it.",
            "You can finish a day even if every set was not completed. A partial day is still a valid training log. On a cut, honest logging is more useful than pretending every session was perfect.",
            "Core and warm-up have their own purpose. Core is separate from main day progress, and warm-up is guidance only.",
          ],
          bullets: [
            "Checkbox = the set was performed.",
            "Inputs describe the set; they do not complete it.",
            "Unchecked sets are not missing data. They are simply not performed.",
            "Finish day means closing the day, not proving it was perfect.",
            "Partial days are valid.",
            "Upcoming days are preview-only until they become the active day.",
          ],
        },
        {
          id: "first-cut-cycle",
          title: "Your first cut cycle is about control",
          paragraphs: [
            "Your first cut cycle is not the time to prove toughness.",
            "Use the first pass through D1-D6 to feel how the lower-volume structure works, find stable working weights, and log honest baseline performance while calories are lower.",
            "If you are coming from a bulk, try to keep the same key lifts and useful working weights as long as form and RIR stay honest. Reduce load only when reps, technique, or recovery clearly show that the deficit is catching up.",
            "If you can keep good form, hold useful strength, and repeat productive sessions, the plan is doing its job.",
          ],
          bullets: [
            "Start controlled.",
            "Do not chase PRs just to prove the cut is working.",
            "Keep form and RIR honest.",
            "Use the first cycle to establish a realistic cut baseline.",
            "Stable performance is a reasonable goal during a deficit.",
          ],
        },
      ],
    },
    {
      id: "train-and-progress",
      title: "Training rules",
      intro:
        "Use these rules to keep training productive while recovery can be more constrained and fatigue can accumulate more easily.",
      topics: [
        {
          id: "rir",
          title: "RIR: train hard without burning recovery",
          paragraphs: [
            "RIR means reps in reserve.",
            "It tells you how many clean reps you estimate you had left at the end of a set. RIR 2 means roughly 2 clean reps left. RIR 1 means roughly 1 clean rep left. RIR is an estimate, not an exact measurement.",
            "On a cut, this matters even more. The goal is to send a strong training signal without creating more fatigue than you can recover from.",
          ],
          bullets: [
            "RIR 2 = about 2 clean reps left.",
            "RIR 1 = about 1 clean rep left.",
            "Stop before form breaks down.",
            "Avoid unnecessary failure work.",
            "Good cut training is hard, clean, and repeatable.",
          ],
        },
        {
          id: "progression",
          title: "Progression: maintain first, improve when it is there",
          paragraphs: [
            "Progression on a cut should stay honest.",
            "Your first goal is to hold useful strength and keep clean reps inside the target range. If performance is there, add a rep. If you are stable near the top of the range with the right RIR, a small load increase can make sense.",
            "Maintaining useful strength is a reasonable goal during a deficit. Do not force load jumps just to make the log look more aggressive.",
          ],
          bullets: [
            "Hold useful strength first.",
            "Add reps before adding weight.",
            "Add weight only when performance is clearly there.",
            "Maintaining useful strength is a reasonable goal during a deficit.",
            "Do not chase fake progression with ugly reps.",
          ],
        },
        {
          id: "previous-workouts",
          title: "Use previous workouts as a guide, not pressure",
          paragraphs: [
            "Previous values are there to help you make calm decisions.",
            "Use your last logged weight, reps, and RIR as a starting point. If recovery is good, you may repeat the same performance cleanly or add a rep. If recovery is lower, it is okay to hold steady or take a small step back.",
            "On a cut, the trend matters more than winning every single workout.",
          ],
          bullets: [
            "Previous values are a reference point.",
            "You do not need to beat them every time.",
            "Compare weight, reps, and RIR together.",
            "Holding performance can mean the plan is working.",
            "Use the log for calm decisions, not ego decisions.",
          ],
        },
        {
          id: "tempo-and-rest",
          title: "Tempo and rest protect set quality",
          paragraphs: [
            "Tempo and rest matter more when recovery is limited.",
            "Tempo tells you the rhythm of the rep. A tempo like 2-1-1 means lower with control, pause briefly, then lift with control.",
            "Rest times help keep the next set worth doing. Heavy lifts still need real rest. Smaller accessory work can use shorter rest because the goal is different.",
          ],
          bullets: [
            "Tempo keeps reps controlled.",
            "Heavy lifts still need real rest.",
            "Accessory work can use shorter rest.",
            "Rest enough to keep the next set productive.",
            "Do not turn cut training into rushed survival reps.",
          ],
        },
      ],
    },
    {
      id: "plan-structure",
      title: "Plan structure",
      intro:
        "Understand why the cut plan is tighter, how top-up work maintains useful training signals, and where core and warm-up fit.",
      topics: [
        {
          id: "bulk-vs-cut",
          title: "Cut is not easy, just more controlled",
          paragraphs: [
            "Bulk Pro and Cut Pro use the same cycle logic, but they do not use the same amount of training stress.",
            "Cut Pro reduces volume, removes most advanced intensity work, and keeps a tighter grip on fatigue. The goal is to support strength retention and training quality during a cut.",
            "Do not worry if the cut plan looks smaller than the bulk plan. In a deficit, you need enough hard, clean work to keep the signal strong, not endless extra fatigue.",
          ],
          bullets: [
            "Cut Pro uses lower volume on purpose.",
            "Cut Pro avoids unnecessary fatigue.",
            "Most advanced techniques are removed on purpose.",
            "The goal is to preserve performance, not show off effort.",
            "The structure is tighter because recovery can be more constrained during an energy deficit.",
          ],
        },
        {
          id: "day-roles",
          title: "Every training day still has a role",
          paragraphs: [
            "Each day in the cut cycle still has a job.",
            "The plan is built around primary work, bridge work, and smaller top-up signals. On a cut, this matters even more because the goal is to maintain useful training signals without adding unnecessary fatigue.",
            "Some exercises carry the main signal of the day. Others support frequency, balance, movement quality, or the next important lift in the cycle.",
          ],
          bullets: [
            "D1 — Chest Strength: main chest signal, triceps support, and shoulder accessory work.",
            "D2 — Back Width: vertical pull for lats, main biceps block, traps, forearms, lower back, and Core A.",
            "D3 — Quad Heavy: main squat/quad work, hamstring spark, calves, and hip stability.",
            "D4 — Shoulders: main shoulder work, traps, light arms, and Core B.",
            "D5 — Back Depth + Chest Pump: horizontal rows for thickness, a small lat primer, chest pump bridge, light triceps, and Core C.",
            "D6 — Posterior Chain: RDL/hamstring/glute focus, calves, quad lunge top-up, biceps, forearms, hips, and lower-back accessory work.",
          ],
        },
        {
          id: "top-up-coverage",
          title: "Top-up work keeps the signal alive",
          paragraphs: [
            "Top-up work on a cut is not random extra work.",
            "A primary focus is the main reason a day exists. A bridge signal connects one part of the cycle to another. A top-up is a smaller dose used to maintain frequency, balance, or movement quality without creating a second full main session.",
            "Small does not mean unimportant. On a cut, smaller signals are often useful because they keep the cycle connected while total fatigue stays controlled.",
            "This is also why the cycle can handle small schedule changes. The plan has overlap, but it still works best when the order stays stable.",
          ],
          bullets: [
            "Primary work keeps the main training signal strong.",
            "Bridge work connects important muscle signals across the cycle.",
            "Top-up work maintains frequency without forcing extra fatigue.",
            "Do the top-up work where the plan includes it.",
            "Do not add extra intensity just because the cut plan has lower volume.",
          ],
        },
        {
          id: "core-work",
          title: "Core work supports the main lifts",
          paragraphs: [
            "Core work is included to support the rest of the plan.",
            "Use core work to practice bracing, trunk control, and stability that are relevant to compound lifting. On a cut, keep it controlled when fatigue is higher.",
            "Core should stay controlled and technical. If fatigue is high or the session needs to stay shorter, core can move to a rest or LISS day while the main training order stays stable.",
          ],
          bullets: [
            "Core supports your main lifts.",
            "Keep reps controlled.",
            "Stop before form breaks down.",
            "Do not chase failure on core work.",
            "Move core flexibly when needed, but do not let it steal recovery from the main plan.",
          ],
        },
        {
          id: "warmup-purpose",
          title: "Warm-up prepares the session",
          paragraphs: [
            "The warm-up is there to prepare you, not tire you out.",
            "Use it to raise body temperature, prepare the movement pattern, and ease into the first working sets. This matters even more on a cut, where wasting energy early is not useful.",
            "A good warm-up should make the session feel more stable, not more exhausting.",
          ],
          bullets: [
            "Keep the warm-up easy and controlled.",
            "Prepare the pattern before the work sets.",
            "Ramp sets are not working sets.",
            "The goal is to feel ready, not drained.",
            "Warm-up is guidance only, not tracked progress.",
          ],
        },
      ],
    },
    {
      id: "fatigue-recovery-and-adjustments",
      title: "Recovery decisions",
      intro:
        "Use this section when fatigue rises, performance drops, or you need to adjust the cut without turning training into punishment.",
      topics: [
        {
          id: "advanced-techniques",
          title: "Most advanced techniques are removed on purpose",
          paragraphs: [
            "Cut Pro is not the place to stack extra intensity just because motivation is high or the session feels shorter.",
            "Most advanced techniques from Bulk Pro are removed on purpose. The deficit already adds stress, so the plan protects performance by keeping the training signal strong but controlled.",
            "If the plan does not prescribe extra intensity, do not invent more. The goal is to support training quality and strength retention while fatigue is managed more carefully.",
          ],
          bullets: [
            "Do not add extra dropsets or rest-pause work on your own.",
            "Cut Pro controls fatigue tightly.",
            "Diet stress already counts as stress.",
            "More intensity is not automatically better.",
            "Preserve performance before chasing extra burn.",
          ],
        },
        {
          id: "recovery-and-deload",
          title: "Recovery supports training quality",
          paragraphs: [
            "More work is not automatically better during a cut.",
            "Training is only one part of a cut. Nutrition, protein intake, sleep, recovery, and individual factors also matter when calories are lower.",
            "An easy cooldown or gentle stretching after training is optional. Use it if it feels comfortable and helps you finish the session gradually. Do not rely on post-workout stretching to prevent soreness or injury.",
            "If strength drops across multiple sessions, joints feel worse, sleep is poor, or every workout feels unusually heavy, reduce stress before the plan breaks down.",
            "A deload is not failure. It is a short reset that keeps movement patterns alive while fatigue comes down.",
            "A simple deload starting point is about a week of easier training: lighter loads, fewer total sets, and more reps in reserve. During a deficit, recovery can become more constrained, so use your actual performance and fatigue signals rather than assuming a fixed schedule.",
          ],
          bullets: [
            "Nutrition, protein intake, sleep, and recovery remain important when calories are lower.",
            "Cooldown or gentle stretching is optional after training.",
            "Repeated strength drops can signal rising fatigue.",
            "Joint discomfort should not be ignored.",
            "Recovery can become more constrained during an energy deficit.",
            "A deload is lighter training, not stopping completely.",
            "Use recovery signals, not only the calendar.",
          ],
        },
        {
          id: "liss-and-cardio",
          title: "LISS is a tool, not punishment",
          paragraphs: [
            "LISS is low-intensity cardio that can be used to increase activity during a cut.",
            "In practice, this usually means easy walking, incline treadmill work, or cycling at a calm pace you can recover from. The aim is to add low-intensity activity without interfering with the next lifting day.",
            "Start with the minimum useful amount. Add more only when it fits your overall cut strategy and recovery can handle it.",
            "The goal is not to prove work ethic with cardio. The goal is to support the overall cut strategy without unnecessarily compromising lifting performance or recovery.",
          ],
          bullets: [
            "Use LISS as a tool, not punishment.",
            "Start with the minimum useful amount.",
            "Add cardio gradually if progress slows.",
            "Keep it easy enough to recover from.",
            "Leave space for real rest when recovery needs it.",
            "Do not let cardio ruin squat or RDL performance.",
          ],
        },
        {
          id: "variations-pain-and-form",
          title: "Variations, pain, and form breakdown",
          paragraphs: [
            "Some exercises include listed variations because equipment, joints, and recovery can change how a movement feels.",
            "A variation is not a random swap. It should keep the same job inside the day. For example, an assisted pull-up still keeps the vertical pulling role, and a lighter dip or decline press option can still keep the pressing role.",
            "If pain changes the movement, do not force it. Reduce load, adjust range, or use the listed variation. On a cut, avoid forcing ugly reps when fatigue is already high.",
          ],
          bullets: [
            "Use listed variations when they fit better.",
            "Do not randomly replace main lifts without a reason.",
            "Keep the same movement purpose.",
            "If pain changes your form, adjust instead of forcing it.",
            "Flexibility should keep the plan stable, not turn it random.",
          ],
        },
      ],
    },
  ],
};
