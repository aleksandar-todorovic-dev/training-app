# Training App

Structured training app MVP built with React, Vite, Tailwind CSS, and React Router.

This project is not just a workout tracker. It is a local-first, guided training app built around structured programs, cycle-based progression, prescribed set logging, previous-value carry-over, and real-life flexibility.

---

## Product direction

The app is designed as a structured training companion.

Core product idea:

```text
Follow the plan.
Log the prescribed work.
Keep the cycle moving.
Use previous workout data as the next baseline.
Do not let partial days break the system.
```

The MVP focuses on two predefined training systems:

- **Bulk Pro**
- **Cut Pro**

Both use the same app structure:

```text
Plan
-> Cycle
-> Day
-> Exercise/Core
-> Finish day
-> End cycle
-> Start new cycle
```

---

## MVP goal

Build a clean, focused, mobile-first training app that supports:

- predefined Bulk Pro and Cut Pro plans
- a 6 training day flow inside a 9-day cycle concept
- route-driven plan, cycle, day, exercise, core, guide, and end-cycle screens
- Day screen sheets for warm-up guidance and finish-day confirmation
- guided exercise logging with prescribed set rows
- guided core block logging with reps/time/load support
- per-set done state
- runtime-derived exercise, core, day, and cycle status
- partial and full day completion
- previous-value carry-over across cycles
- local-first progress persistence in Phase 4

---

## Current status

```text
Phase 1 — Foundation: complete
Phase 2 — Static content and screen structure: complete and merged to main
Phase 3 — Runtime logic: active
Phase 4 — Local persistence: planned after runtime flow is stable in memory
Phase 5 — Polish and stability: planned after persistence
```

Current working branch:

```text
phase-3-runtime-logic
```

Current focus:

```text
Final Phase 3 runtime stabilization before Phase 4 localStorage.
```

---

## Tech stack

- React
- Vite
- Tailwind CSS
- React Router
- Context + reducer runtime state
- GitHub Actions basic CI
- Firebase Hosting for live MVP preview only

MVP backend boundary:

```text
No auth
No Firestore
No Cloud Functions
No cloud sync
No payment/unlock system
```

The app is intentionally local-first for the MVP.

---

## Current route map

```text
/                        -> HomePage
/plan/:planId            -> PlanOverviewPage
/plan/:planId/cycle      -> CyclePage
/plan/:planId/day/:dayId -> DayPage
/plan/:planId/day/:dayId/exercise/:exerciseId -> ExercisePage
/plan/:planId/day/:dayId/core/:coreId         -> CorePage
/plan/:planId/guide      -> GuidePage
/plan/:planId/end-cycle  -> EndCyclePage
*                        -> fallback route
```

Current route decisions:

- Warm-up is not a standalone route.
- Warm-up opens from `DayPage` as `WarmupSheet`.
- Finish day confirmation is not a standalone route.
- Finish day confirmation opens from `DayPage` as `FinishDaySheet`.
- End cycle remains a dedicated route-driven page.

---

## Completed phases

### Phase 1 — Foundation

Completed:

- Vite + React project setup
- Tailwind CSS configuration
- base folder structure
- shared layout shell
- shared button/card primitives
- full MVP route skeleton
- placeholder navigation
- basic GitHub Actions CI
- Firebase Hosting setup for live MVP preview

---

### Phase 2 — Static content and screen structure

Completed and merged to `main`.

Implemented screens:

1. Home
2. Plan Overview
3. Cycle / Day list
4. Day screen
5. Exercise screen
6. Core screen
7. Warm-up sheet
8. Guide screen
9. Finish day confirmation sheet
10. End cycle / Start new cycle

Important Phase 2 decisions:

- all MVP screens exist in static/UI form
- static source data is separated from future runtime progress
- `+ Add set` was removed from the active Exercise screen MVP flow
- users log prescribed working sets first
- advanced techniques are guidance-only for MVP
- optional bonus work stays in cue/help content and does not affect required completion
- core is separate from the main exercise completion count
- warm-up and guide content do not affect completion

---

## Phase 3 — Runtime logic

Phase 3 turns the app from a static prototype into an in-memory workout tool.

### Runtime foundation implemented

Implemented:

- explicit `setCount` metadata for main exercises
- explicit `setCount` metadata for core exercises
- runtime helper layer for:
  - set row creation
  - exercise log creation
  - day log creation
  - core log creation
  - exercise status derivation
  - day status derivation
  - core status derivation
  - main carry-over
  - core carry-over
- Context + reducer runtime state foundation
- `AppStateProvider`
- `useAppState`
- reducer action constants in `APP_ACTIONS`
- app wrapped with runtime provider

### Current runtime actions

Current runtime action set includes:

```js
SELECT_PLAN;
START_PLAN_CYCLE;
ENSURE_DAY_LOG;
ENSURE_CORE_BLOCK_LOG;
TOGGLE_EXERCISE_SET_DONE;
TOGGLE_CORE_SET_DONE;
UPDATE_EXERCISE_SET_FIELD;
UPDATE_CORE_SET_FIELD;
MARK_EXERCISE_CLOSED;
MARK_CORE_EXERCISE_CLOSED;
MARK_CORE_BLOCK_CLOSED;
FINISH_DAY;
```

### Current working runtime loop

The app currently supports the main in-memory runtime path:

```text
Start cycle
-> create cycle shell
-> open day
-> ensure runtime day log
-> derive DayPage progress/status
-> open exercise
-> render runtime set rows
-> edit weight/reps/RIR values
-> toggle set done
-> close exercise intent
-> finish day
-> advance currentDayId
-> carry previous main exercise values into the next cycle
```

Core runtime flow is also implemented:

```text
Open core block
-> ensure coreBlockLog
-> render core exercises and prescribed core set rows
-> edit load/reps/time/RIR where applicable
-> toggle core set done
-> derive core exercise/core block status
-> close core exercise/block intent
-> carry previous core values into the next cycle
```

---

## Runtime model

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
- current cycle
- current day pointer
- day logs
- exercise logs
- core logs
- set values
- set done state
- `closedAt`
- `finishedAt`
- `completedAt`
- carry-over values

These layers must stay separate.

---

### Prescription vs runtime metadata

Runtime logic does not parse user-facing prescription strings.

Confirmed rule:

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

Core uses additional metadata:

```js
{
  logType: "reps" | "time",
  tracksLoad: true | false
}
```

---

### Main set row shape

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

- values are stored as strings for controlled inputs
- empty strings are allowed during editing
- input values alone do not complete a set
- only `isDone: true` marks a set as performed

---

### Core set row shape

```js
{
  setIndex: 1,
  load: "",
  reps: "",
  time: "",
  rir: "",
  isDone: false
}
```

Rules:

- `load` is used when the core exercise tracks load
- `reps` is used for reps-based core exercises
- `time` is used for time-based core exercises
- `rir` remains editable
- only `isDone: true` marks a core set as performed

---

### Exercise log shape

```js
{
  exerciseId: "smith-bench-press",
  sets: [],
  closedAt: null
}
```

Rules:

- `sets` contains prescribed runtime set rows
- `closedAt` records close intent
- `closedAt` does not complete the exercise
- exercise status is derived from set rows

Exercise status:

```text
not-started = no prescribed set rows are done
partial     = at least one set row is done, but not all
complete    = all prescribed set rows are done
```

---

### Core block log shape

```js
{
  coreBlockId: "core-a",
  coreExerciseLogs: {
    "hanging-leg-raise-strict": {
      coreExerciseId: "hanging-leg-raise-strict",
      sets: [],
      closedAt: null
    }
  },
  closedAt: null
}
```

Rules:

- core status is separate from main day progress
- core does not affect the main exercise completion count
- core close intent is separate from core completion
- core completion is derived from checked core set rows

---

### Day log shape

```js
{
  dayId: "d1",
  mainExerciseLogs: {},
  coreBlockLog: null,
  finishedAt: null
}
```

Rules:

- `mainExerciseLogs` stores required main exercises
- `coreBlockLog` stores separate core progress when a day includes core
- `finishedAt` records that the user intentionally closed the day
- `finishedAt` does not mean the day was perfect
- day status is derived from required main exercise logs

---

### Cycle log shape

```js
{
  planId: "bulk-pro",
  cycleNumber: 1,
  currentDayId: "d1",
  dayLogs: {},
  startedAt: "2026-05-21T00:00:00.000Z",
  completedAt: null
}
```

Rules:

- `currentDayId` points to the next meaningful training day
- partial days are valid
- cycle completion should require all D1-D6 training days to have `finishedAt`
- cycle completion does not require all exercises to be perfect/complete

---

## Carry-over behavior

### Main exercise carry-over

Main carry-over fields:

```js
["weight", "reps", "rir"];
```

A value can carry over only when:

```text
previous set has isDone: true
and the field is not an empty string
```

Carry-over is field-by-field.

This means one missing value does not erase another useful previous value.

Not carried over:

```text
isDone
closedAt
finishedAt
completedAt
```

---

### Core carry-over

Core carry-over fields:

```js
["load", "reps", "time", "rir"];
```

A value can carry over only when:

```text
previous core set has isDone: true
and the field is not an empty string
```

Core carry-over identity:

```text
previous cycle
same dayId
same coreExerciseId
same setIndex
same field
```

Not carried over:

```text
isDone
coreExerciseLog.closedAt
coreBlockLog.closedAt
```

Core does not have its own independent cycle. Core belongs to the same day/cycle system as the main workout.

---

## Pre-Phase 4 runtime stabilization

Before localStorage is added, the remaining Phase 3 work is a runtime stabilization pass.

This pass is documented in:

```text
training-app-pre-phase-4-runtime-decisions.md
```

Main decisions to implement before Phase 4:

1. Active / Finished / Upcoming day mode
2. PlanOverview CTA behavior fix
3. Cycle completion guard
4. Close action copy and navigation cleanup
5. Finished day UI signal
6. Upcoming day preview restrictions
7. Missing-value warnings
8. EndCyclePage runtime-derived recap
9. Full Bulk + Cut in-memory sanity test

Phase 4 should start only after the in-memory flow behaves correctly.

---

## Project file structure

Current high-level structure:

```text
src/
  app/
  pages/
  components/
  data/
  state/
  styles/
  utils/
```

Important source-data layers:

```text
src/data/
  plans/
  days/
  dayDetails/
  exercises/
  core/
  warmups/
  guides/
  contextualHelp/
```

Important runtime/state layers:

```text
src/state/
  appInitialState.js
  appActions.js
  appReducer.js
  AppStateContext.js
  AppStateProvider.jsx
  useAppState.js

src/utils/runtime/
  exerciseLogHelpers.js
  dayLogHelpers.js
  coreLogHelpers.js
  exerciseStatusHelpers.js
  dayStatusHelpers.js
  coreStatusHelpers.js
  inputHelpers.js
  coreInputHelpers.js
  carryOverHelpers.js
  coreCarryOverHelpers.js
```

---

## Important MVP rules preserved

### Required vs optional work

- required main exercises come from `dayDetails.exerciseIds`
- optional bonus work stays in cue/help content
- optional work does not affect required completion
- advanced techniques are guidance-only for MVP
- prescribed set rows are the source of truth for completion

### Core

- core is integrated into D2, D4, and D5
- core progress is tracked separately
- core does not affect main day progress
- core carry-over follows the same cycle system as the main workout

### Warm-up and Guide

- warm-up is supporting guidance only
- warm-up does not affect completion
- guide/help content does not affect completion

### Local-first MVP

- no auth
- no backend
- no cloud sync
- no payments
- runtime state first
- localStorage only after runtime flow is stable

---

## Verification workflow

Before committing implementation checkpoints:

```bash
npm run lint
npm run build
```

Expected result:

```text
lint passes
production build passes
app boots correctly
runtime state works in memory
```

---

## Current next step

Continue Phase 3 runtime stabilization before Phase 4.

Recommended next implementation step:

```text
Active / Finished / Upcoming day mode
```

Then continue through:

```text
PlanOverview CTA fix
Cycle completion guard
Close action cleanup
Finished day UI signal
Upcoming preview restrictions
Missing-value warnings
EndCyclePage runtime recap
Full Bulk + Cut sanity test
```

Only after that:

```text
Phase 4 — localStorage persistence
```

---

## Documentation map

Important project documents:

```text
training-app-mvp-roadmap.md
training-app-technical-roadmap-v2.md
training-app-phase-3-runtime-logic-roadmap-final.md
training-app-pre-phase-4-runtime-decisions.md
training-app-architecture-notes.md
training-app-build-log.md
training-app-ui-system.md
training-app-mvp-screen-map-final-fixed.md
training-app-product-positioning-and-cycle-logic.md
```

Use them as:

- roadmap = build order and phase scope
- technical roadmap = architecture and implementation direction
- Phase 3 roadmap = runtime model and helper/reducer direction
- pre-Phase-4 decisions = runtime stabilization decisions before persistence
- architecture notes = source-of-truth decisions and state/data boundaries
- build log = completed implementation history
- UI system = reusable UI rules and visual consistency
- screen map = active screen/route flow
- product positioning = product philosophy and cycle logic

---

## Notes

This repository is being built strictly around the confirmed MVP scope.

The goal is to keep the project:

- structured
- mobile-first
- understandable
- local-first
- runtime-safe before persistence
- useful as a serious portfolio project

Current guiding rule:

```text
Make runtime behavior correct in memory before saving it permanently.
```
