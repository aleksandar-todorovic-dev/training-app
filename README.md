# Training App

Structured training app MVP built with React, Vite, Tailwind CSS, React Router, Context + reducer state, and localStorage persistence.

This project is not just a workout tracker. It is a local-first, guided training app built around structured training systems, cycle-based progression, prescribed set logging, previous-value carry-over, partial-day flexibility, and a mobile-first product experience.

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

Both plans use the same product flow:

```text
Plan
-> Cycle
-> Day
-> Exercise/Core
-> Finish day
-> End cycle recap
-> Start new cycle
```

The app guides the user through a structured cycle instead of behaving like a free-form workout notebook.

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
- local-first runtime progress persistence
- safe refresh behavior through localStorage
- controlled local progress reset
- a premium product polish layer across product and training screens

---

## Current status

```text
Phase 1 — Foundation: complete
Phase 2 — Static content and screen structure: complete and merged to main
Phase 3 — Runtime logic: functionally complete in memory
Pre-Phase-4 stabilization: complete
Phase 4 — Local persistence: complete
Phase 5 — Product UI polish: in progress
```

Current project state:

```text
The MVP screen flow works.
The runtime workout flow works.
Progress survives browser refresh.
Home and Plan Overview have received the first product-shell polish pass.
Cycle Dashboard has received the first dark training-mode polish pass.
The app now feels closer to a polished local-first product, not only a working MVP.
```

Current Phase 5 polish status:

```text
Screen 1 — Home: polished for current Phase 5 pass
Screen 2 — Plan Overview: polished for current Phase 5 pass
Screen 3 — Cycle Dashboard: functionally complete for current Phase 5 pass
Next focus — Screen 4 Day screen polish
```

---

## Tech stack

- React
- Vite
- Tailwind CSS
- React Router
- Context + reducer runtime state
- localStorage persistence
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

## Live preview

The project has Firebase Hosting configured for MVP preview:

```text
https://training-app-mvp.web.app
```

Hosting is used for live preview and device testing only.

No backend or cloud sync logic is part of the MVP.

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

## Visual product direction

Phase 5 uses a hybrid product/training visual system.

```text
Light mode = understanding, choosing, reviewing, learning.
Dark mode  = doing, logging, executing, finishing workouts.
```

Current screen grouping:

- **Light product shell:** Home, Plan Overview, Guide, End Cycle
- **Dark training mode:** Cycle Dashboard, Day, Exercise, Core, Warm-up sheet, Finish Day sheet

Current visual principles:

- the app should feel modern, serious, premium, calm, and mobile-first
- polish should improve hierarchy first, not just colors
- green/emerald should guide attention, not decorate everything
- product screens can feel lighter and more open
- training screens should feel focused, dark, and execution-oriented

Current Screen 3 dark training reference:

- slate-based dark surfaces
- restrained emerald accents
- compact review rows
- current-day/current-cycle hero as the main focus
- rest days visible as part of the cycle rhythm

Reusable dark training tokens may be extracted later after Day, Exercise, and Core screens confirm the same patterns.

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
- static source data is separated from runtime progress
- `+ Add set` was removed from the active Exercise screen MVP flow
- users log prescribed working sets first
- advanced techniques are guidance-only for MVP
- optional bonus work stays in cue/help content and does not affect required completion
- core is separate from the main exercise completion count
- warm-up and guide content do not affect completion

---

### Phase 3 — Runtime logic

Phase 3 turned the app from a static prototype into an in-memory workout tool.

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
  - day mode derivation
  - cycle completion checks
  - missing-value warning summaries
  - cycle recap summaries
  - main carry-over
  - core carry-over
- Context + reducer runtime state foundation
- `AppStateProvider`
- `useAppState`
- reducer action constants in `APP_ACTIONS`
- app wrapped with runtime provider
- active / finished / upcoming day modes
- read-only upcoming previews
- finished day review/edit behavior
- missing-value warnings before Finish day
- runtime-derived EndCyclePage recap
- explicit Start new cycle behavior

Full Bulk + Cut in-memory sanity testing passed before persistence was added.

---

### Phase 4 — Local persistence

Phase 4 made the existing runtime state survive refresh.

Implemented:

- dedicated storage layer
- versioned localStorage wrapper
- shallow storage validation
- safe fallback for missing, invalid, outdated, or broken storage
- AppStateProvider hydration from localStorage
- provider-level persistence after reducer state updates
- `RESET_APP_STATE`
- local progress reset UI on Home
- full refresh acceptance test pass

Storage file:

```text
src/storage/appStateStorage.js
```

Storage key:

```js
"training-app:v1:app-state";
```

Stored wrapper format:

```js
{
  version: 1,
  savedAt: "ISO timestamp",
  state: {
    selectedPlanId: null,
    progressByPlan: {}
  }
}
```

Storage API:

```js
loadStoredAppState();
saveStoredAppState(state);
clearStoredAppState();
```

Phase 4 acceptance tests passed:

```text
Bulk progress survives refresh — passed
Cut progress survives refresh — passed
Exercise values survive refresh — passed
Core values survive refresh — passed
Finished day/current day survives refresh — passed
Completed cycle survives refresh — passed
Cycle 2 carry-over survives refresh — passed
Bulk/Cut progress stay separate — passed
Reset clears progress — passed
Broken localStorage does not crash app — passed
Upcoming preview after refresh stays read-only — passed
Finished day edit after refresh keeps finished state and edited values — passed
Reset after both plans have progress clears both plans — passed
```

---

### Phase 5 — Product UI polish

Phase 5 is currently in progress.

Goal:

```text
Turn the functional local-first MVP into a clearer, more premium, more sellable training product while preserving confirmed runtime behavior.
```

Completed so far:

#### Screen 1 — Home

Home was polished into a stronger product entry screen.

Completed:

- light product shell direction
- clearer product hero
- stronger product positioning around cycles, guided workouts, previous values, and partial-day flexibility
- compact value pills
- cleaner plan cards
- plan-specific Home card identity
- quiet reset local progress action

#### Screen 2 — Plan Overview

Plan Overview was polished into a plan entry / mini-dashboard screen.

Completed:

- runtime-aware CTA moved closer to the top
- stronger current-status card
- compact plan fact cards
- scannable 9-day rhythm map
- cleaner principle/rules rows
- quieter Coach guide entry
- improved rhythm labels
- first icon semantics pass

Runtime-safe CTA behavior was preserved:

```text
No current cycle -> Start cycle
Unfinished current cycle -> Continue cycle
Completed current cycle -> Review cycle
```

#### Screen 3 — Cycle Dashboard

Cycle Dashboard was polished from a flat D1-D6 list into a dark training-mode dashboard.

Completed:

- dark training dashboard direction
- local green `Back to plan` link
- cycle header with progress status and check icon
- compact horizontal rhythm strip with rest days
- current day / current cycle hero
- runtime-aware hero CTA states
- `Next up` behavior that skips closed exercises
- completed-cycle hero state
- compact upcoming/completed rows
- truthful partial/no-set completed copy
- current day auto-centering in the rhythm strip
- coach reminder card

Current hero CTA states:

```text
Fresh day with no activity -> Start day
Day has logged/closed activity -> Continue day
All main exercises closed, day not finished -> Review day
Cycle complete -> Review cycle
```

Cycle Dashboard is considered functionally complete for the current Phase 5 polish round.

---

## Runtime action set

Current reducer actions:

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
RESET_APP_STATE;
```

---

## Current runtime loop

The app supports the main persisted runtime path:

```text
Start cycle
-> create cycle shell
-> open current day
-> ensure runtime day log
-> derive DayPage progress/status
-> open exercise
-> render prescribed runtime set rows
-> edit weight/reps/RIR values
-> toggle set done
-> close exercise intent
-> finish day
-> advance currentDayId
-> complete cycle after all D1-D6 are finished
-> review runtime cycle recap
-> start next cycle explicitly
-> carry previous checked values into the next cycle
-> persist runtime state locally
-> restore progress after refresh
```

Core runtime flow is also implemented:

```text
Open core block
-> ensure coreBlockLog
-> render core exercises and prescribed core set rows
-> edit load/reps/time/RIR where applicable
-> toggle core set done
-> derive core exercise/core block status
-> close core block intent
-> carry previous core values into the next cycle
-> persist core progress locally
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

Static source data is not stored in localStorage.

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
- cycle completion requires all D1-D6 training days to have `finishedAt`
- cycle completion does not require all exercises to be perfect/complete

---

## Guided day access model

The app separates day access into three product modes:

```text
Current day  = active logging allowed
Finished day = review/edit allowed with clear label
Upcoming day = preview allowed, active logging disabled
```

### Current day

Allowed:

```text
open day
open exercise
log set values
check set completion
close exercise
open core
log core values
finish day
```

### Finished day

Allowed:

```text
review day
open exercise/core
edit values
check/uncheck sets
update saved log
```

A finished day stays finished even if its set rows are edited later.

### Upcoming day

Allowed:

```text
preview day structure
open exercise/core preview
read static target rows and guidance
```

Not allowed:

```text
create current-cycle dayLog
log active workout values
check set completion
close exercise/core
finish future day
```

Upcoming exercise/core routes are read-only previews.

---

## Carry-over behavior

Carry-over is field-by-field.

A value can carry over only when:

```text
previous set has isDone: true
and the field is not an empty string
```

Main carry-over fields:

```js
["weight", "reps", "rir"];
```

Core carry-over fields:

```js
["load", "reps", "time", "rir"];
```

Not carried over:

```text
isDone
closedAt
finishedAt
completedAt
```

Important product rule:

```text
Unchecked edited values are persisted as local log input,
but they are not eligible for future carry-over.
```

This preserves the distinction between:

```text
input value = user-entered log detail
isDone      = confirmed performed set
```

---

## Finish day warnings

`FinishDaySheet` gives informational warnings before a user finishes a day.

Confirmed rule:

```text
Warnings do not block Finish day.
Warnings do not change runtime state.
```

Warnings do not change:

```text
isDone
closedAt
finishedAt
carry-over rules
```

### Checked-set warning boundary

Only checked sets are checked for missing values.

```text
Checked set + missing reps/RIR -> warning
Unchecked set + empty fields -> no warning
One checked set with valid values + several unchecked empty sets -> no warning
```

Reason:

```text
The app should not punish the user for unperformed work.
It should only warn when performed work was logged incompletely.
```

### No completed sets warning

If a user attempts to finish a day with:

```text
0 checked sets
```

the sheet warns that the day can still be finished, but it will not create useful new carry-over data.

### Baseline vs carry-over warning

Cycle 1:

```text
Baseline warning
```

Cycle 2+:

```text
Carry-over warning
```

This keeps the warning useful without introducing hard validation.

---

## EndCyclePage recap

EndCyclePage uses runtime state instead of placeholder statistics.

If the current cycle is not complete:

```text
Cycle is not complete yet
```

and the normal `Start new cycle` CTA is not shown.

When the cycle is complete, EndCyclePage shows:

```text
Cycle complete
Training days: X/6
Main exercises: X/Y
Partial days: X
Core blocks: X/3
```

The recap is intentionally minimal.

It is not an analytics dashboard.

Start new cycle remains explicit:

```text
Click Start new cycle
-> dispatch START_PLAN_CYCLE
-> create next cycle shell
-> navigate to CyclePage
-> D1 becomes Current
```

---

## Local persistence behavior

The app persists runtime user progress under one versioned localStorage key:

```text
training-app:v1:app-state
```

Stored runtime state includes:

```text
selectedPlanId
progressByPlan
current cycle data
day logs
exercise logs
core logs
set input values
set done state
closedAt
finishedAt
completedAt
carry-over relevant previous-cycle data
```

Not stored:

```text
static plan data
exercise source data
core definitions
warmups
guides
contextual help
local UI sheet open/closed state
```

Broken or invalid storage behavior:

```text
invalid/missing/outdated/broken storage
-> fallback to appInitialState
-> app remains usable
```

Reset behavior:

```text
Home
-> Reset local progress
-> confirmation
-> clearStoredAppState()
-> dispatch RESET_APP_STATE
-> runtime state returns to appInitialState
```

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
  storage/
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

Important runtime/state/storage layers:

```text
src/state/
  appInitialState.js
  appActions.js
  appReducer.js
  AppStateContext.js
  AppStateProvider.jsx
  useAppState.js

src/storage/
  appStateStorage.js

src/utils/runtime/
  exerciseLogHelpers.js
  dayLogHelpers.js
  coreLogHelpers.js
  exerciseStatusHelpers.js
  dayStatusHelpers.js
  coreStatusHelpers.js
  dayModeHelpers.js
  cycleStatusHelpers.js
  missingValueWarningHelpers.js
  cycleSummaryHelpers.js
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
- runtime state is persisted locally
- localStorage is the only persistence layer in the MVP

### Product polish safety

- Phase 5 polish must preserve confirmed runtime behavior
- polish should not change reducer rules, route decisions, storage shape, or completion logic unless explicitly planned
- visual hierarchy should clarify the workout flow instead of adding noise

---

## Verification workflow

Before committing implementation checkpoints:

```bash
npm run lint
npm run build
git diff --check
```

Expected result:

```text
lint passes
production build passes
no trailing whitespace issues
app boots correctly
runtime state works
localStorage persistence works
```

Phase 4 acceptance testing has passed.

During Phase 5 polish, also manually verify the changed screen behavior before committing.

---

## Current next steps

Current MVP phase:

```text
Phase 5 — Product UI polish and stability
```

Completed in this phase:

- Home product-shell polish
- Plan Overview product-shell polish
- Cycle Dashboard dark training-mode polish

Next likely focus:

- Screen 4 Day screen polish
- continue dark training-mode consistency across Day, Exercise, Core, Warm-up, and Finish Day
- keep reusable UI tokens/pills/cards consistent only after patterns repeat across screens
- final mobile UI review after the main screen polish pass
- documentation cleanup and portfolio/demo presentation pass

Possible non-blocking polish item:

```text
If a deep runtime route is opened with no active cycle,
show a clearer empty-state / back-to-plan message.
```

---

## Documentation map

Important project documents:

```text
training-app-mvp-roadmap.md
training-app-technical-roadmap-v2.md
training-app-phase-3-runtime-logic-roadmap-final.md
training-app-pre-phase-4-runtime-decisions.md
training-app-phase-4-local-storage-decisions.md
training-app-architecture-notes.md
training-app-build-log.md
training-app-ui-system.md
training-app-mvp-screen-map-final-fixed.md
training-app-product-positioning-and-cycle-logic.md
training-app-phase-5-product-ui-polish-master-plan.md
training-app-phase-5-screen-implementation-notes-final.md
```

Use them as:

- roadmap = build order and phase scope
- technical roadmap = architecture and implementation direction
- Phase 3 roadmap = runtime model and helper/reducer direction
- pre-Phase-4 decisions = runtime stabilization decisions before persistence
- Phase 4 decisions = localStorage persistence plan and implementation result
- architecture notes = source-of-truth decisions and state/data/storage boundaries
- build log = completed implementation history
- UI system = reusable UI rules and visual consistency
- screen map = active screen/route flow
- product positioning = product philosophy and cycle logic
- Phase 5 master plan = product polish strategy and visual direction
- Phase 5 screen notes = screen-by-screen polish implementation guide

---

## Notes

This repository is being built strictly around the confirmed MVP scope.

The goal is to keep the project:

- structured
- mobile-first
- understandable
- local-first
- runtime-safe
- persistence-safe
- visually clear enough for a serious portfolio/demo project

Current guiding rule:

```text
Polish the product experience without breaking the confirmed local-first runtime flow.
```
