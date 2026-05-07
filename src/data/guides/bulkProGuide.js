export const bulkProGuide = {
  id: "bulk-pro",
  title: "Bulk Pro Guide",
  intro:
    "Learn how the plan works, how to progress, and how to use it without overcomplicating things.",
  groups: [
    {
      id: "start-here",
      title: "Start here",
      intro: "Start here if you are opening the plan for the first time.",
      topics: [
        {
          id: "structured-training",
          title: "A real training cycle, not just a workout list",
          paragraphs: [
            "The plan gives you a clear next step instead of leaving every workout decision open.",
            "This app moves you through a structured D1-D6 training cycle where every day has a purpose. Some days are heavier, some days support the main work, and the app keeps the order clear so you always know what comes next.",
            "The goal is not to force a perfect weekly schedule. The goal is to help you stay consistent, keep logging, and continue the plan even when real life moves things around.",
          ],
          bullets: [
            "Follow the cycle, not a perfect calendar week.",
            "Each training day has a clear role.",
            "The app keeps the plan organized for you.",
            "Delaying a workout does not mean the system is broken.",
          ],
        },
        {
          id: "cycle-works",
          title: "How the cycle works",
          paragraphs: [
            "The plan works in order.",
            "You train two days, take one rest day, then continue with the next training day. After D6, you return to D1 and start the next cycle.",
            "Think of it as a repeating rhythm, not a Monday-to-Sunday schedule. If something interrupts your week, do not restart randomly. Just continue from the next planned day.",
            "The cycle is built so important muscle groups show up again through main work, support work, or top-up work. That is why a delayed workout does not break the whole plan.",
          ],
          bullets: [
            "D1 -> D2 -> rest",
            "D3 -> D4 -> rest",
            "D5 -> D6 -> rest",
            "After D6, return to D1.",
            "Rest days are part of the plan.",
          ],
        },
        {
          id: "first-cycle",
          title: "Your first cycle is not a test",
          paragraphs: [
            "Your first cycle is not about proving how strong you are.",
            "Use the first pass through D1-D6 to learn the flow, choose weights you can control, and create honest starting logs. Pick loads that let you hit the target rep range with clean form and the right RIR.",
            "Those first logs matter. Once you have real numbers in the app, your next workouts become easier to plan because you have something useful to compare against.",
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
      title: "How to train and progress",
      intro:
        "Use this section when you want to understand how hard to train, how to log your sets, and how to know when it is time to progress.",
      topics: [
        {
          id: "rir",
          title: "RIR: how hard should a set feel?",
          paragraphs: [
            "RIR means “reps in reserve”.",
            "It tells you how many clean reps you probably had left at the end of a set. If the target is RIR 2, stop when you feel you could still do about 2 clean reps. If the target is RIR 1, stop when you feel you could still do about 1 clean rep.",
            "This helps you train hard without turning every set into a max-effort grind.",
            "The plan is built for repeatable progress, not one heroic set. Keeping 1-2 reps in reserve helps you recover better, protect your technique, and come back strong for the next exercise, day, and cycle.",
            "Failure can be useful in small doses, but doing it too often adds fatigue faster than it adds quality stimulus. This matters especially for natural lifters, because recovery has to support the next exercise, the next day, and the whole cycle.",
          ],
          bullets: [
            "RIR 2 = about 2 clean reps left.",
            "RIR 1 = about 1 clean rep left.",
            "Stop before your form breaks down.",
            "The goal is repeatable quality, not one all-out set.",
            "You do not need to fail every set to make progress.",
          ],
        },
        {
          id: "progression",
          title: "Progression: add reps first",
          paragraphs: [
            "Progression should be simple.",
            "First, try to add clean reps inside the target range. When you can reach the top of the range with good form and the right RIR, then increase the weight slightly and build back up again.",
            "Keep the main exercises stable long enough to track real progress. If you change exercises too often, your log becomes harder to read because you are constantly comparing different movements instead of improving the same pattern.",
            "Not every workout needs to beat the last one. Some days you add reps, some days you hold steady, and on a cut, keeping strength is already a strong result.",
          ],
          bullets: [
            "Add reps before adding weight.",
            "Add weight only when the top range is clean.",
            "Keep form and RIR honest.",
            "Keep main exercises stable long enough to measure progress.",
            "Do not increase load just to make the log look better.",
          ],
        },
        {
          id: "previous-workouts",
          title: "Use previous workouts as a guide, not pressure",
          paragraphs: [
            "Your previous workout is there to help you, not stress you out.",
            "Use your last logged weight, reps, and RIR as a starting point for the next session. If the last workout was strong and clean, you may try to add a rep or small weight increase. If recovery is lower, it is okay to repeat or slightly adjust.",
            "The log connects one workout to the next, but it should guide your decisions, not force your ego.",
          ],
          bullets: [
            "Previous values are a reference point.",
            "You do not need to beat them every time.",
            "Compare weight, reps, and RIR together.",
            "Let the log help you make better choices.",
            "Clean repeated work is still useful progress.",
          ],
        },
        {
          id: "tempo-and-rest",
          title: "Tempo and rest: read the basics",
          paragraphs: [
            "Tempo tells you the rhythm of the rep.",
            "For example, `2-1-1` means lower the weight for about 2 seconds, pause for 1 second, then lift for about 1 second.",
            "Rest times are there to protect set quality. Heavy lifts usually need more rest so the next set is still strong. Smaller pump or accessory work can use shorter rest because the goal is different.",
          ],
          bullets: [
            "Tempo = lowering / pause / lifting.",
            "`2-1-1` = 2 sec down, 1 sec pause, 1 sec up.",
            "Heavy lifts need longer rest.",
            "Smaller pump work can use shorter rest.",
            "Rest enough to keep the next set productive.",
          ],
        },
      ],
    },
    {
      id: "plan-structure",
      title: "How the plan is structured",
      intro: "This section explains why the plan is organized the way it is.",
      topics: [
        {
          id: "bulk-vs-cut",
          title: "Bulk and Cut are not trained the same way",
          paragraphs: [
            "Bulk Pro and Cut Pro follow the same cycle logic, but they do not use the same training stress.",
            "Bulk Pro gives you more total work, more growth stimulus, and selected advanced techniques where they are written. Cut Pro is more controlled. The goal is to keep strength, muscle, and technique while managing fatigue.",
            "That does not mean Cut Pro is “easy”. It means the plan is adjusted for the goal.",
          ],
          bullets: [
            "Bulk Pro uses more volume and more growth stimulus.",
            "Cut Pro uses lower volume and more fatigue control.",
            "Cut Pro avoids extra failure work and unnecessary intensity.",
            "On a cut, keeping strength is already a win.",
            "Train for the goal you are currently in.",
          ],
        },
        {
          id: "day-roles",
          title: "Every training day has a role",
          paragraphs: [
            "Each day in the cycle has a job.",
            "Some days are built around a main lift or main muscle priority. Other exercises on that day support the main goal through top-up work, pump work, stability work, or smaller muscle-group coverage.",
            "For example, D1 carries heavier chest pressing, D2 focuses on vertical pulling, D3 is the heavy quad day, D4 supports shoulders and arms, D5 bridges chest pump and rows, and D6 brings posterior-chain work with top-ups.",
            "This is why the app shows a short goal for each day. It helps you understand what matters most in that session instead of treating the workout as a random checklist.",
          ],
          bullets: [
            "Every day has a main purpose.",
            "Support work is planned, not filler.",
            "Some days are heavier; some days are more supportive.",
            "Top-up work helps keep the cycle balanced.",
            "The day goal tells you what to prioritize.",
          ],
        },
        {
          id: "core-work",
          title: "Core work supports the main lifts",
          paragraphs: [
            "Core work is included to support the rest of the plan.",
            "The goal is better bracing, trunk control, and stability for bigger lifts like squats, presses, rows, and RDLs. It should be controlled and technical, not rushed or treated like a conditioning finisher.",
            "Good core work should help your training, not steal energy from it.",
          ],
          bullets: [
            "Core supports your main lifts.",
            "Keep reps controlled.",
            "Stop before your form breaks.",
            "Do not chase failure on core work.",
            "Move core if session length or fatigue becomes an issue.",
          ],
        },
        {
          id: "warmup-purpose",
          title: "Warm-up prepares the session",
          paragraphs: [
            "The warm-up is there to prepare you, not tire you out.",
            "Use it to raise body temperature, prepare the movement pattern, and build up gradually before the main lift. Ramp sets should feel clean and easy. Save your real effort for the working sets.",
            "A good warm-up should make the first working set feel better, not make you tired before it starts.",
          ],
          bullets: [
            "Keep the warm-up easy and controlled.",
            "Activation work prepares the pattern.",
            "Ramp sets are not working sets.",
            "The goal is to feel ready, not drained.",
            "Save effort for the real work.",
          ],
        },
      ],
    },
    {
      id: "fatigue-recovery-and-adjustments",
      title: "Fatigue, recovery, and adjustments",
      intro: "This section helps you keep the plan sustainable.",
      topics: [
        {
          id: "advanced-techniques",
          title: "Advanced techniques: use them only where written",
          paragraphs: [
            "Advanced techniques are extra intensity tools.",
            "In Bulk Pro, some exercises include methods like rest-pause, dropsets, stretch holds, or mechanical sets. Use them only where the plan says to use them. They are there to add a targeted stimulus, not to turn the whole workout into failure training.",
            "In Cut Pro, these techniques are mostly removed on purpose. The goal is to keep strength, technique, and recovery under control while dieting.",
          ],
          bullets: [
            "Use advanced techniques only where prescribed.",
            "Do not add extra dropsets or rest-pause work on your own.",
            "Bulk Pro uses them for targeted stimulus.",
            "Cut Pro avoids them to control fatigue.",
            "More intensity is not always better.",
          ],
        },
        {
          id: "recovery-and-deload",
          title: "Recovery is part of progression",
          paragraphs: [
            "You do not get stronger just by doing more work. You get stronger by doing work you can recover from.",
            "If strength drops across multiple sessions, joints start feeling worse, or every workout feels unusually heavy, it may be time to reduce stress for a short period.",
            "A deload is not quitting. It is a short reset so you can recover, keep the movement patterns, and continue the cycle with better performance.",
            "In practice, a deload usually means about a week of easier training: lighter weights, fewer sets, and more reps in reserve. A simple starting point is using around 80-85% of your usual load and cutting total sets by roughly 30-40%.",
            "For many natural lifters, this often lands somewhere around every 6-10 weeks, but the signals matter more than the calendar.",
          ],
          bullets: [
            "Repeated strength drops are a warning sign.",
            "Joint discomfort should not be ignored.",
            "Reduce load or sets before the plan breaks down.",
            "Deload = lighter work for a short reset, not stopping completely.",
            "Use deloads when recovery is falling behind, not only when the calendar says so.",
            "A deload is a reset, not a failure.",
          ],
        },
        {
          id: "liss-and-cardio",
          title: "LISS and cardio: useful, not punishment",
          paragraphs: [
            "LISS is low-intensity cardio used as a tool, mostly during a cut.",
            "In practice, this usually means 30-45 minutes of easy cardio like walking, incline treadmill work, or cycling at a calm pace you can recover from. For many people, that means roughly the 120-130 bpm range.",
            "It can help increase calorie expenditure without adding too much stress, but it should not hurt your main training. Start with little or no LISS, then add more only if needed.",
            "The goal is not to punish yourself with cardio. The goal is to support the plan while keeping strength and recovery as stable as possible.",
          ],
          bullets: [
            "Use LISS as a tool, not punishment.",
            "Example: 30-45 min easy walk, incline treadmill, or bike.",
            "Start with the minimum needed.",
            "Add cardio gradually if progress slows.",
            "Keep it easy enough to recover from.",
            "Do not let cardio ruin squat or RDL performance.",
          ],
        },
        {
          id: "variations-pain-and-form",
          title: "Variations, pain, and form breakdown",
          paragraphs: [
            "Some exercises include approved variations. Use them when equipment, joints, or performance make one option better than another.",
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
