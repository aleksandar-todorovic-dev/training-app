# Training App

Structured training app MVP built with React, Vite, Tailwind CSS, and React Router.

This project is not just a workout tracker.

It is a structured, local-first training app that combines:

- predefined Bulk Pro and Cut Pro training systems
- guided workout flow
- educational training content
- cycle-based progression
- prescribed set logging
- partial and full workout completion support
- contextual help during training
- MVP-friendly local-first progress handling

---

## MVP goal

Build a clean, focused, mobile-first training app that supports:

- two predefined plans: **Bulk Pro** and **Cut Pro**
- a 6 training day flow inside a 9-day cycle concept
- cycle, day, exercise, core, warm-up, guide, finish-day, and end-cycle flows
- guided exercise and core logging screens
- prescribed set rows generated from structured metadata
- set logging with weight, reps, and RIR
- per-set done state
- exercise status derived from completed set rows
- day progress derived from required main exercises
- core completion tracked separately from main exercise completion
- partial and full day completion
- previous-value carry-over across cycles
- local-first progress saving for the MVP

---

## Current status

### Phase 1 — Foundation

Complete.

Implemented:

- Vite + React project setup
- Tailwind CSS configuration
- base folder structure
- shared layout shell
- routing for the MVP screens
- shared UI structure for cards, sections, sheets, and buttons
- placeholder navigation between screens
- naming convention for plans, days, and core blocks
- basic GitHub Actions CI (`lint` + `build`)
- Firebase Hosting setup for live MVP preview

---

### Phase 2 — Static content and screen structure

Complete and merged to `main`.

Implemented:

- Screen 1 — Home
- Screen 2 — Plan overview
- Screen 3 — Cycle / Day list
- Screen 4 — Day screen
- Screen 5 — Exercise screen
- Screen 6 — Core screen
- Screen 7 — Warm-up sheet
- Screen 8 — Guide screen
- Screen 9 — Finish day confirmation sheet
- Screen 10 — End of cycle / Start new cycle

Current Phase 2 result:

- all planned MVP screens exist in static/UI form
- all main route-driven screens are connected
- Home, Plan Overview, Cycle, Day, Exercise, Core, Guide, and End Cycle pages use real static data where applicable
- Warm-up and Finish day are handled as Day screen sheets
- Exercise contextual help is implemented
- Advanced technique contextual help is implemented
- core screen structure is implemented as a working multi-exercise core block screen
- route-based lookup works for plans, days, exercises, core blocks, guides, and end-cycle pages

Important Phase 2 decisions:

- Warm-up is a Day screen sheet, not a standalone route
- Finish day confirmation is a Day screen sheet, not a standalone route
- End Cycle remains a dedicated route-driven page
- `+ Add set` is removed from the active Exercise flow
- advanced techniques remain guidance-only for MVP
- optional work does not affect required completion count
- static source data and runtime user progress must remain separate

---

### Phase 3 — Runtime logic

Active.

Phase 3 turns the app from a static prototype into an in-memory workout tool.

Current Phase 3 runtime work implemented:

- explicit `setCount` metadata added to exercise data
- prescribed set rows generated from `setCount`, not from parsing `prescription`
- runtime helper layer added for:
  - initial set row creation
  - exercise log creation
  - day log creation
  - exercise status derivation
  - day status derivation
- app runtime state foundation added:
  - `appInitialState`
  - `APP_ACTIONS`
  - `appReducer`
  - `AppStateProvider`
  - `useAppState`
- app wrapped in runtime provider
- Start cycle flow connected:
  - `PlanOverviewPage`
  - `START_PLAN_CYCLE`
  - reducer cycle shell creation
  - `CyclePage` runtime cycle read
- Day runtime flow connected:
  - `DayPage`
  - `ENSURE_DAY_LOG`
  - lazy day log creation
  - runtime DayPage progress calculation
  - runtime exercise card status labels
- Exercise runtime flow connected:
  - `ExercisePage` reads runtime `exerciseLog`
  - static set display scaffold removed
  - set rows now render from runtime state
  - runtime row count follows `setCount`
- Set done interaction connected:
  - `SetRow` receives `isDone`
  - checkbox toggles set done state
  - `ExerciseWorkflowCard` forwards set toggle intent
  - `ExercisePage` dispatches `TOGGLE_EXERCISE_SET_DONE`
  - reducer updates one prescribed set row immutably
  - DayPage status/progress updates from derived runtime state

Current working runtime loop:

```text
Start cycle
-> create cycle shell
-> open day
-> ensure runtime day log
-> derive DayPage progress/status
-> open exercise
-> render runtime set rows
-> toggle set done
-> update exercise status and DayPage progress automatically
```

Confirmed current behavior:

- opening a day creates a runtime day log if missing
- reopening a day does not reset existing runtime data
- opening an exercise shows the correct number of prescribed set rows
- checking one set makes the exercise status `Partial`
- checking all prescribed sets makes the exercise status `Complete`
- DayPage progress count updates when an exercise becomes complete
- checked set state is preserved while the app remains in memory

Current Phase 3 boundaries:

- weight/reps/RIR input editing is not connected yet
- `Mark exercise done` / `closedAt` is not implemented yet
- Finish day behavior is not implemented yet
- current day advancement is not implemented yet
- core runtime logging is not implemented yet
- end-cycle detection is not implemented yet
- previous-workout carry-over is not implemented yet
- localStorage persistence is not implemented yet

---

## Runtime rules currently active

### Static data vs runtime data

Static source data owns:

- plan content
- day structure
- exercise guidance
- core definitions
- warm-up content
- guide content
- contextual help content

Runtime user data owns:

- selected plan
- active cycle
- current day pointer
- day logs
- exercise logs
- set values
- set done state
- exercise completion status
- day progress
- later: core progress, finish-day state, previous workout carry-over

These layers must stay separate.

---

### Prescription vs setCount

Current rule:

```text
prescription = user-facing display
setCount     = runtime scaffold metadata
```

Example:

```js
{
  id: "smith-bench-press",
  prescription: "4 x 5-7",
  setCount: 4
}
```

Runtime logic must not parse strings like:

```text
4 x 5-7
3 x 8-10 / leg
1 cluster
```

Instead, prescribed runtime set rows are generated from explicit structured metadata.

---

### Main set row shape

Runtime main exercise set rows currently use:

```js
{
  setIndex: 1,
  weight: "",
  reps: "",
  rir: "",
  isDone: false
}
```

Rules:

- `setIndex` identifies the prescribed set order
- `weight`, `reps`, and `rir` are stored as strings
- empty strings are intentional for future controlled input fields
- a set counts as performed only when `isDone` is `true`
- input values alone do not complete a set

---

### Exercise log shape

Runtime exercise logs currently use:

```js
{
  exerciseId: "smith-bench-press",
  sets: [],
  closedAt: null
}
```

Rules:

- `exerciseId` links runtime data to static exercise data
- `sets` contains prescribed runtime set rows
- `closedAt` is reserved for future `Mark exercise done` behavior
- exercise status is derived from set rows, not stored manually

---

### Exercise status

Exercise status is derived from prescribed set rows:

```text
not-started = no prescribed set rows are done
partial     = at least one set row is done, but not all set rows are done
complete    = all prescribed set rows are done
```

`SetRow` checkbox state is currently the source of truth for exercise completion.

---

### Day log shape

Runtime day logs currently use:

```js
{
  dayId: "d1",
  mainExerciseLogs: {},
  coreBlockLog: null,
  finishedAt: null
}
```

Rules:

- `dayId` links runtime data to static day details
- `mainExerciseLogs` stores required main exercise logs
- `coreBlockLog` is currently `null`
- `finishedAt` is reserved for future Finish day behavior
- main day progress is derived from required main exercise logs
- core remains separate from the main exercise count

---

### Mark exercise done boundary

`Mark exercise done` is currently inactive.

Future rule:

```text
Mark exercise done should not fake unfinished sets as completed.
It should only close the exercise through closedAt.
Exercise status remains derived from set rows.
```

---

## Static source data

### Plan data

- `src/data/plans/`
  - `bulkPro.js`
  - `cutPro.js`
  - `index.js`

### Overview day data

- `src/data/days/`
  - `bulkProDays.js`
  - `cutProDays.js`
  - `index.js`

### Detailed day data

- `src/data/dayDetails/`
  - `bulkProDayDetails.js`
  - `cutProDayDetails.js`
  - `index.js`

### Exercise data

- `src/data/exercises/`
  - `bulkProExercises.js`
  - `cutProExercises.js`
  - `index.js`

### Core data

- `src/data/core/`
  - `coreBlocks.js`
  - `coreExercises.js`
  - `index.js`

### Warm-up data

- `src/data/warmups/`
  - `bulkProWarmups.js`
  - `cutProWarmups.js`
  - `index.js`

### Guide data

- `src/data/guides/`
  - `bulkProGuide.js`
  - `cutProGuide.js`
  - `index.js`

### Contextual help data

- `src/data/contextualHelp/`
  - `exerciseHelp.js`
  - `advancedTechniqueHelp.js`
  - `index.js`

### Current data helpers / exports

- `getPlanById(planId)`
- `getDaysByPlanId(planId)`
- `getDayDetails(planId, dayId)`
- `getExercisesForDay(planId, exerciseIds)`
- `getExerciseById(planId, exerciseId)`
- `getCoreBlockById(coreId)`
- `getCoreExercisesByIds(exerciseIds)`
- `getWarmupById(planId, warmupId)`
- `getGuideByPlanId(planId)`
- `advancedTechniqueHelpByType`

---

## Runtime state and helper files

### State layer

- `src/state/appInitialState.js`
- `src/state/appActions.js`
- `src/state/appReducer.js`
- `src/state/AppStateContext.js`
- `src/state/AppStateProvider.jsx`
- `src/state/useAppState.js`

### Runtime utility layer

- `src/utils/runtime/exerciseLogHelpers.js`
- `src/utils/runtime/dayLogHelpers.js`
- `src/utils/runtime/exerciseStatusHelpers.js`
- `src/utils/runtime/dayStatusHelpers.js`

Current purpose:

- generate prescribed set rows from static metadata
- create initial exercise logs
- create initial day logs
- derive exercise status
- derive day status

---

## Current route map

```text
/                        -> HomePage
/plan/:planId            -> PlanOverviewPage
/plan/:planId/cycle      -> CyclePage
/plan/:planId/day/:dayId -> DayPage
/plan/:planId/day/:dayId/exercise/:exerciseId -> ExercisePage
/plan/:planId/day/:dayId/core/:coreId -> CorePage
/plan/:planId/guide      -> GuidePage
/plan/:planId/end-cycle  -> EndCyclePage
*                        -> fallback route
```

Removed from active routing:

```text
/plan/:planId/day/:dayId/warmup
```

Warm-up now opens as `WarmupSheet` from `DayPage`.

---

## Screens

### Screen 1 — Home

- renders real predefined plan cards from static plan data
- includes goal, audience, cycle label, and plan CTA
- routes into the selected plan overview

### Screen 2 — Plan Overview

- reads `planId` from the route
- loads the selected plan from static source data
- loads overview-level day data for the selected plan
- renders training system, key rules, and training day order
- includes top-level `View guide` action and primary `Start cycle` CTA
- dispatches `START_PLAN_CYCLE`
- creates the current cycle shell in runtime state
- uses screen-specific richer day-order labels so the overview explains real day structure more honestly

### Screen 3 — Cycle / Day list

- reads `planId` from the route
- loads the selected plan and D1-D6 day list from static source data
- reads current cycle state from runtime state
- renders a dedicated 3-line cycle header:
  - plan name
  - runtime cycle label
  - runtime current day summary
- renders reusable day cards with:
  - day label
  - cleaned overview day name
  - optional truth hint line
  - optional core hint merged into the same metadata row
  - current static day-card status scaffold
  - `Open day` CTA

### Screen 4 — Day screen

- reads `planId` and `dayId` from the route
- loads detailed day-level content through `dayDetails`
- resolves exercises through `getExercisesForDay`
- dispatches `ENSURE_DAY_LOG` after valid day data loads
- reads current runtime `dayLog`
- derives progress summary from runtime `mainExerciseLogs`
- derives exercise card statuses from runtime exercise logs
- renders:
  - day label and name
  - short goal
  - runtime progress summary
  - session info
  - exercise list
  - conditional core entry
  - warm-up sheet trigger
  - finish-day sheet trigger
- includes full coverage for both plans:
  - Bulk Pro D1-D6
  - Cut Pro D1-D6

### Screen 5 — Exercise screen

- reads `planId`, `dayId`, and `exerciseId` from the route
- resolves the selected exercise through the static source-data layer
- reads current runtime `exerciseLog`
- adapts runtime set rows into the display shape expected by `ExerciseWorkflowCard`
- renders prescribed runtime set rows based on `setCount`
- supports per-set done toggle through:
  - `SetRow`
  - `ExerciseWorkflowCard`
  - `ExercisePage`
  - `TOGGLE_EXERCISE_SET_DONE`
  - `appReducer`
- uses a unified `ExerciseWorkflowCard` with:
  - guidance layer
  - previous-workout helper note
  - compact 4-column execution summary
  - row-based set logging
  - bottom action scaffold
- includes `Working rules ? Help`
- includes `Advanced technique ? Help` where supported

### Screen 6 — Core screen

- reads `planId`, `dayId`, and `coreId` from the route
- resolves the related plan / day / core block / core exercises
- treats one opened core block as one working screen
- shows all exercises for the selected core block on the same screen
- uses a shared `CoreWorkflowCard`
- uses explicit static metadata:
  - `logType`
  - `tracksLoad`
- currently remains static/UI-only for runtime behavior
- real core runtime logging belongs to a later Phase 3 step

### Screen 7 — Warm-up sheet

- warm-up content is plan-aware and stored in `src/data/warmups/`
- warm-up content is resolved through:
  - `dayDetails.sessionInfo.warmupId`
  - `getWarmupById(planId, warmupId)`
- `View warm-up` opens a sheet/modal from the Day screen
- no warm-up runtime logic is planned for MVP:
  - no timers
  - no checkboxes
  - no completion state
  - no persistence
  - no tracking

### Screen 8 — Guide screen

- central Guide content is complete for the current MVP static pass
- Guide content is plan-aware:
  - Bulk Pro Guide
  - Cut Pro Guide
- Guide uses a section-entry flow:
  - landing state with section cards
  - opened section state with one focused guide section
  - return action at top and bottom
- central Guide remains the deeper system-level explanation layer
- Guide/help content does not affect runtime completion

### Screen 9 — Finish day confirmation

- implemented as a bottom sheet inside `DayPage`
- not a standalone route
- opened through the `Finish day` CTA at the bottom of the Day screen
- explains future full/partial completion behavior
- for days with core, includes a note that core is tracked separately from the main exercise count
- current actions:
  - `Confirm finish`
  - `Keep training`
- actions currently close the sheet only
- real Finish day behavior belongs to a later Phase 3 step

### Screen 10 — End of cycle / Start new cycle

- implemented as a route-driven static page:

```text
/plan/:planId/end-cycle
```

- reads `planId` from the route
- resolves the selected plan through `getPlanById(planId)`
- renders plan-aware static content for:
  - Bulk Pro
  - Cut Pro
- includes:
  - back navigation to Cycle
  - plan and cycle reference
  - `Cycle complete` title
  - cycle recap section
  - static training-days summary
  - exercise-completion preview
  - next-cycle explanation
  - `Start new cycle` CTA
- currently works by direct route access
- it is not yet reached through real workout completion logic

---

## Shared UI and component structure

### Shared layout primitives

- `AppShell`
- `ScreenHeader`
- `SectionCard`

### Shared navigation / button primitives

- `PrimaryButton`
- `SecondaryButton`
- `BackButton`

`PrimaryButton` and `SecondaryButton` support:

- route links through `to`
- native button rendering when no route target is provided
- `className`
- `type`
- forwarded props

### Shared sheet / helper primitive

- `HelpSheet`

Used for:

- exercise working-rules help
- advanced technique help
- similar sheet/modal flows

### Feature-specific plan / cycle UI

- `PlanCard`
- `CycleHeader`
- `DayCard`

### Feature-specific day UI

- `SessionInfoCard`
- `ExerciseListCard`
- `CoreBlockCard`
- `FinishDaySheet`

### Feature-specific exercise UI

- `ExerciseWorkflowCard`
- `SetRow`

Current boundary:

- `SetRow` is presentational
- `ExerciseWorkflowCard` forwards set toggle intent upward
- `ExercisePage` connects runtime state and dispatch
- reducer owns the state update

### Feature-specific core UI

- `CoreWorkflowCard`
- `CoreSetRow`

### Feature-specific warm-up UI

- `WarmupSheet`
- `WarmupStepsCard`

### Feature-specific guide UI

- `GuideGroupCard`
- `GuideTopicBlock`

---

## Important MVP rules preserved

### Required vs optional work

- required exercises belong in `dayDetails.exerciseIds`
- optional work belongs in cue/help content
- optional work does not affect required completion count
- advanced techniques are guidance-only for MVP
- prescribed working sets are the source of truth for exercise completion

### Core

- core remains separate from main exercise count
- D2 / D4 / D5 include core blocks
- core completion should be tracked separately
- core should not enter the main day exercise fraction

### Warm-up and Guide

- warm-up is supporting guidance only
- warm-up does not affect completion
- guide/help content does not affect completion

### Local-first MVP

- no auth
- no backend
- no cloud sync
- runtime state first
- localStorage belongs to Phase 4

### Future product direction

The MVP should remain local-first now, but the structure should not block future:

- paid plan unlocks
- auth
- user profiles
- cloud sync
- plan entitlement logic

For now, paid access and auth are after-MVP concerns, not Phase 3 implementation tasks.

---

## Tech stack

- React
- Vite
- Tailwind CSS
- React Router
- GitHub Actions basic CI
- Firebase Hosting for live preview only

---

## Verification workflow

Before committing implementation checkpoints, run:

```bash
npm run lint
npm run build
```

Current expected result:

- lint passes
- production build passes
- app boots correctly
- current runtime state works in memory

---

## Current result

The app currently supports this in-memory runtime flow:

```text
Home
-> Plan Overview
-> Start cycle
-> Cycle
-> Day
-> Exercise
-> Toggle set done
-> Return to Day
-> See derived exercise status/progress
```

Current working behavior:

- the app boots correctly
- main routes are connected
- static source data renders across all major screens
- runtime provider is connected
- Start cycle creates an in-memory cycle shell
- opening a day creates an in-memory day log
- DayPage progress/status is derived from runtime logs
- ExercisePage renders runtime set rows
- SetRow checkbox toggles runtime `isDone`
- DayPage progress updates when exercises become complete
- state remains available while the app stays in memory

Still remaining for the MVP runtime loop:

- weight/reps/RIR input editing
- `Mark exercise done` / `closedAt`
- core runtime logging
- Finish day behavior
- current day advancement
- end-cycle detection
- previous workout carry-over
- localStorage persistence
- final polish and stability pass

---

## Next step

Continue Phase 3 runtime logic.

Recommended next implementation steps:

1. connect weight/reps/RIR input values to runtime set rows
2. implement `Mark exercise done` / `closedAt`
3. implement core runtime logging
4. implement Finish day behavior
5. implement current day pointer advancement
6. implement end-cycle detection
7. implement previous-workout carry-over
8. add localStorage persistence after runtime state works in memory

---

## Notes

This repository is being built strictly around the confirmed MVP scope and roadmap.

The goal is to keep the structure clean, avoid scope creep, and move phase by phase.

The current implementation respects the main MVP boundaries:

- static-data-first before runtime logic
- local-first MVP
- runtime state before persistence
- core kept separate from main day exercise completion
- warm-up kept as supporting Day screen guidance
- finish-day confirmation kept as a Day screen sheet/modal
- end-cycle kept as a route-driven page, but not yet connected through runtime completion
- central Guide kept as the deeper system-level explanation
- contextual help kept small, local, and close to the workflow area
- advanced technique help kept guidance-only
- exercise `prescription` kept as a user-facing display string
- structured `setCount` used for prescribed runtime set rows
- core logging behavior has explicit static metadata (`logType`, `tracksLoad`)
- optional bonus work stays out of required completion logic
