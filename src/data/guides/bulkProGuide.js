/**
 * Static educational guide content for the Bulk Pro plan.
 *
 * Product note:
 * Guide content explains the training system, progression, recovery, and plan
 * usage. It is read-only support content and does not affect runtime logs,
 * day completion, or cycle state.
 */
export const bulkProGuide = {
  id: "bulk-pro",
  title: "Bulk Pro Guide",
  intro:
    "Learn how the plan works, how to progress, and how to keep the cycle productive even when your schedule is not perfect.",
  groups: [
    {
      id: "start-here",
      title: "Start here",
      intro:
        "Understand the cycle, how flexible it can be, and how to log your first workouts without overthinking it.",
      topics: [
        {
          id: "structured-training",
          title: "A real training cycle, not just a workout list",
          paragraphs: [
            "Bulk Pro is built as a training cycle, not a random list of gym sessions.",
            "The app moves you through D1-D6 in order, and every day has a job. Some days carry the main growth work. Other days add support, top-up volume, or smaller signals that keep the full cycle balanced.",
            "The goal is simple: know what comes next, train hard with control, and keep the plan moving even when your week is not perfect.",
          ],
          bullets: [
            "Follow the cycle, not a perfect calendar week.",
            "Each day has a clear training role.",
            "Support and top-up work are planned, not filler.",
            "The app keeps the order clear so you do not have to rebuild the plan every week.",
          ],
        },
        {
          id: "cycle-works",
          title: "How the cycle works",
          paragraphs: [
            "The cycle follows a simple training rhythm.",
            "Bulk Pro moves through two training days, one rest day, two more training days, another rest day, then the final two training days before resting again and returning to D1.",
            "Think of this as a repeating rhythm, not a strict Monday-to-Sunday schedule. The order matters more than the name of the day on the calendar.",
          ],
          bullets: [
            "Train the next planned day in order.",
            "Use rest days as part of the rhythm.",
            "After D6, return to D1.",
            "Do not rebuild the plan around the calendar.",
          ],
        },
        {
          id: "life-interrupts-cycle",
          title: "When life interrupts the cycle",
          paragraphs: [
            "A delayed workout does not erase the plan.",
            "If real life moves a session, do not restart the cycle and do not jump randomly to your favorite day. Continue from the next planned training day and keep the cycle order stable.",
            "This works because the plan is built with overlap. Major muscle groups return regularly through main work, support work, or small top-up work, so the system stays useful even when the calendar is not perfect.",
            "Flexibility here does not mean training randomly. It means the cycle can absorb small schedule changes without falling apart.",
          ],
          bullets: [
            "Move rest when needed, but keep the training order stable.",
            "Do not restart the whole cycle because one day moved.",
            "Do not turn the plan into a random menu of workouts.",
            "Top-up work helps the cycle stay balanced.",
            "Consistency over time matters more than a perfect week.",
          ],
        },
        {
          id: "logging-basics",
          title: "How logging works",
          paragraphs: [
            "The log should record what you actually did, not what the plan hoped you would do.",
            "A set counts as performed only when you check it as done. Weight, reps, and RIR describe the set, but input values alone do not complete it.",
            "Some prescribed methods may combine positions or leverage inside one continuous effort. In the MVP, log that sequence as one set row instead of trying to split every part into separate inputs.",
            "You can finish a day even if every set was not completed. A partial day is still a valid training log. The app does not fake completion just to make the day look perfect.",
            "Core and warm-up have their own purpose. Core is separate from main day progress, and warm-up is guidance only.",
          ],
          bullets: [
            "Checkbox = the set was performed.",
            "Inputs describe the set; they do not complete it.",
            "Log continuous methods as one set row when the plan treats them as one effort.",
            "Unchecked sets are not missing data. They are simply not performed.",
            "Finish day means closing the day, not proving it was perfect.",
            "Partial days are valid.",
            "Upcoming days are preview-only until they become the active day.",
          ],
        },
        {
          id: "first-cycle",
          title: "Your first cycle is not a test",
          paragraphs: [
            "Your first cycle is not about proving how strong you are.",
            "Use the first pass through D1-D6 to learn the flow, choose weights you can control, and create honest starting logs. Pick loads that let you hit the target rep range with clean form and the right RIR.",
            "Those first logs matter because they become your reference point. Once the app has real numbers, the next cycle is easier to plan and compare.",
          ],
          bullets: [
            "Start controlled.",
            "Do not force PRs in the first cycle.",
            "Keep form and RIR honest.",
            "Use the first cycle to create your baseline.",
            "Good starting logs make progression easier later.",
          ],
        },
      ],
    },
    {
      id: "train-and-progress",
      title: "Training rules",
      intro:
        "Use these rules to train hard, log honestly, and progress without turning every set into a max-effort test.",
      topics: [
        {
          id: "rir",
          title: "RIR: stop with clean reps left",
          paragraphs: [
            "RIR means reps in reserve.",
            "It tells you how many clean reps you probably had left at the end of a set. RIR 2 means you stop with about 2 clean reps left. RIR 1 means you stop with about 1 clean rep left.",
            "Bulk Pro is built for hard, repeatable work. You should train with intent, but not turn every set into a grind. If your form breaks down, you already went too far.",
          ],
          bullets: [
            "RIR 2 = about 2 clean reps left.",
            "RIR 1 = about 1 clean rep left.",
            "Stop before form breaks down.",
            "Hard sets should still be repeatable.",
            "You do not need failure on every set to grow.",
          ],
        },
        {
          id: "progression",
          title: "Progression: add reps first",
          paragraphs: [
            "Progression should stay simple.",
            "First, try to add clean reps inside the target range. When you can reach the top of the range with good form and the right RIR, then increase the weight slightly and build back up again.",
            "Do not add weight just to make the log look better. The goal is stronger, cleaner training over time, not rushed numbers.",
          ],
          bullets: [
            "Add reps before adding weight.",
            "Add weight only when the top range is clean.",
            "Keep form and RIR honest.",
            "Keep main exercises stable long enough to measure progress.",
            "A clean repeat is better than a messy increase.",
          ],
        },
        {
          id: "previous-workouts",
          title: "Use previous workouts as a guide, not pressure",
          paragraphs: [
            "Previous values are there to help you make better decisions.",
            "Use your last logged weight, reps, and RIR as a starting point. If the last session was strong and clean, try to add a rep or make a small load increase when it makes sense.",
            "If recovery is lower, repeating the same result can still be useful. The log should guide you, not push your ego into bad reps.",
          ],
          bullets: [
            "Previous values are a reference point.",
            "You do not need to beat them every time.",
            "Compare weight, reps, and RIR together.",
            "Repeat clean work when needed.",
            "Let the log guide decisions, not pressure them.",
          ],
        },
        {
          id: "tempo-and-rest",
          title: "Tempo and rest protect set quality",
          paragraphs: [
            "Tempo and rest are not decorative numbers.",
            "Tempo tells you the rhythm of the rep. A tempo like 2-1-1 means lower with control, pause briefly, then lift with control.",
            "Rest times help protect performance. Heavy lifts need more rest so the next set is still strong. Smaller pump or support work can use shorter rest because the goal is different.",
          ],
          bullets: [
            "Tempo keeps reps controlled.",
            "Heavy lifts need longer rest.",
            "Support and pump work can use shorter rest.",
            "Rest enough to make the next set productive.",
            "Do not rush rest just to finish faster.",
          ],
        },
      ],
    },
    {
      id: "plan-structure",
      title: "Plan structure",
      intro:
        "Understand why the days are built this way, how top-up work supports the cycle, and where core and warm-up fit.",
      topics: [
        {
          id: "bulk-vs-cut",
          title: "Bulk and Cut are not trained the same way",
          paragraphs: [
            "Bulk Pro and Cut Pro use the same cycle logic, but they do not use the same training stress.",
            "Bulk Pro gives you more total work, more growth stimulus, and selected advanced techniques where they are written. Cut Pro is more controlled because recovery is lower during a deficit.",
            "That does not make one plan smarter than the other. It means each plan is matched to a different goal.",
          ],
          bullets: [
            "Bulk Pro = more volume and growth stimulus.",
            "Cut Pro = lower volume and more fatigue control.",
            "Bulk can use selected advanced techniques.",
            "Cut removes most extra intensity on purpose.",
            "Train for the phase you are actually in.",
          ],
        },
        {
          id: "day-roles",
          title: "Every training day has a role",
          paragraphs: [
            "Each day in the cycle has a job.",
            "The plan is built around primary work, bridge work, and smaller top-up signals. This keeps the cycle connected without turning every session into a full main day for every muscle.",
            "Some exercises are there to drive the main signal of the day. Others support frequency, balance, joints, posture, or the next big lift in the cycle.",
          ],
          bullets: [
            "D1 — Chest Strength: main chest tension, triceps support, and shoulder health.",
            "D2 — Back Width: vertical pull for lats, main biceps block, traps, forearms, lower back, and Core A.",
            "D3 — Quad Heavy: main squat/quad work, hamstring spark, calves, and hip stability.",
            "D4 — Shoulders: main shoulder work, traps, light arms, and Core B.",
            "D5 — Back Depth + Chest Pump: horizontal rows for thickness, a small lat primer, chest pump bridge, light triceps, and Core C.",
            "D6 — Posterior Chain: RDL/hamstring/glute focus, calves, quad lunge top-up, biceps, forearms, hips, and low-back health.",
          ],
        },
        {
          id: "top-up-coverage",
          title: "Top-up work keeps the cycle balanced",
          paragraphs: [
            "Top-up work is not random extra volume.",
            "A primary focus is the main reason a day exists. A bridge signal connects one part of the cycle to another. A top-up is a smaller dose used for frequency, balance, joint health, posture, or keeping a muscle involved without making it another full main session.",
            "Small does not mean useless. Top-up work is smaller because it has a smaller job, not because it has no job.",
            "This is one reason the cycle can handle small schedule changes. The plan has overlap, but the order still matters.",
          ],
          bullets: [
            "Primary work drives the main signal of the day.",
            "Bridge work connects important muscle signals across the cycle.",
            "Top-up work keeps frequency and balance without adding unnecessary chaos.",
            "Do the top-up work where the plan includes it.",
            "Do not turn top-up sets into ego sets or extra failure work.",
          ],
        },
        {
          id: "core-work",
          title: "Core work supports the main lifts",
          paragraphs: [
            "Core work is included to support the rest of the plan.",
            "The goal is better bracing, trunk control, and stability for bigger lifts like squats, presses, rows, and RDLs. It should be controlled and technical, not rushed or treated like a conditioning finisher.",
            "Core is useful, but it stays separate from main day progress. If you are short on time or fatigue is high, core can move to a rest or LISS day while the main training order stays stable.",
          ],
          bullets: [
            "Core supports your main lifts.",
            "Keep reps controlled.",
            "Stop before form breaks down.",
            "Do not chase failure on core work.",
            "Move core flexibly when needed, but keep D1-D6 training order stable.",
          ],
        },
        {
          id: "warmup-purpose",
          title: "Warm-up prepares the session",
          paragraphs: [
            "The warm-up is there to prepare you, not tire you out.",
            "Use it to raise body temperature, prepare the movement pattern, and build up gradually before the main lift. Ramp sets should feel clean and easy.",
            "A good warm-up should make the first working set feel better, not make you tired before it starts.",
          ],
          bullets: [
            "Keep the warm-up easy and controlled.",
            "Activation work prepares the pattern.",
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
        "Use this section when training starts feeling heavier, recovery drops, or you need to adjust without losing the structure of the plan.",
      topics: [
        {
          id: "advanced-techniques",
          title: "Advanced techniques are prescribed, not automatic",
          paragraphs: [
            "Advanced techniques are extra intensity tools.",
            "Bulk Pro includes methods like rest-pause, dropsets, loaded stretches, clusters, or mechanical sets only where they are written. They are there to add a targeted stimulus, not to turn the whole workout into failure training.",
            "Use them as part of the plan, not as a way to make every exercise harder. They are not an automatic target for every cycle; if recovery, form, or performance is not there, clean straight work is the better choice. More intensity is not always a better signal if it damages the next sets, next day, or next cycle.",
          ],
          bullets: [
            "Use advanced techniques only where prescribed.",
            "Do not add extra dropsets or rest-pause work on your own.",
            "The goal is targeted stimulus, not chaos.",
            "Stop the technique if form falls apart.",
            "More intensity is not always better.",
          ],
        },
        {
          id: "recovery-and-deload",
          title: "Recovery is part of progression",
          paragraphs: [
            "You do not grow just by doing more work. You grow from work you can recover from and repeat.",
            "Training gives the signal, but nutrition and sleep decide how well you can use that signal. Bulk Pro tracks training, but results still depend on eating enough, getting enough protein, and recovering consistently.",
            "After training, use a short cooldown and gentle stretching for the muscle groups you trained. Keep it calm and pain-free. The goal is to reduce stiffness, maintain range of motion, and help the body settle after the session.",
            "If strength drops across multiple sessions, joints start feeling worse, sleep is poor, or every workout feels unusually heavy, the plan may need a short stress reduction.",
            "A deload is not quitting. It is a short reset that keeps the movement patterns alive while fatigue comes down.",
            "A simple deload starting point is about a week of easier training: lighter loads, fewer total sets, and more reps in reserve. The exact numbers matter less than the goal - reduce stress enough to come back stronger.",
          ],
          bullets: [
            "Training needs food, protein, sleep, and recovery to produce results.",
            "Stretch the trained muscle groups gently after the session.",
            "Repeated strength drops are a warning sign.",
            "Joint discomfort should not be ignored.",
            "Reduce load, sets, or intensity before the plan breaks down.",
            "A deload is lighter training, not giving up.",
            "Use recovery signals, not only the calendar.",
          ],
        },
        {
          id: "liss-and-cardio",
          title: "LISS and cardio are tools, not punishment",
          paragraphs: [
            "LISS means low-intensity cardio.",
            "During Bulk Pro, cardio should support health, appetite, conditioning, and recovery without stealing performance from lifting. It should not make squat, pressing, rows, or RDLs worse.",
            "If you use it, keep it easy and recoverable. Think easy walking, incline treadmill, or cycling at a pace that does not feel like another hard workout.",
            "Cardio is useful when it supports the plan. It becomes a problem when it competes with the work the plan is built around.",
          ],
          bullets: [
            "Keep cardio easy enough to recover from.",
            "Do not let cardio hurt main lift performance.",
            "Use it for health, conditioning, or appetite support.",
            "Start with the minimum useful amount.",
            "More cardio is not automatically better.",
          ],
        },
        {
          id: "variations-pain-and-form",
          title: "Variations, pain, and form breakdown",
          paragraphs: [
            "Some exercises include approved variations because equipment, joints, and body structure are not the same for everyone.",
            "A variation is not a random replacement. It should keep the same purpose inside the day. For example, an assisted pull-up still keeps the vertical pulling role, and a decline press option still keeps the pressing role.",
            "If pain changes the movement, do not force it. Reduce load, adjust range, or use the listed variation. If form breaks down, the set is no longer giving the signal the plan wants.",
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
