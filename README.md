# Training App

Structured, mobile-first training app MVP built with React, Vite, Tailwind CSS, React Router, Context + reducer state, and localStorage persistence.

This project is not just a workout tracker. It is a local-first guided training companion built around structured training systems, cycle-based progression, prescribed set logging, previous-value carry-over, partial-day flexibility, and a polished mobile product experience.

---

## Current status

```text
MVP implementation complete.
Runtime model implemented.
localStorage persistence implemented.
Product/UI polish completed.
Guide/content clarity pass completed.
Final mobile visual QA passed.
Final MVP completion audit passed with notes.
Ready for private preview / launch-style testing.
```

No critical MVP blockers are currently known.

Current project phase:

```text
Final packaging / private-preview preparation.
```

Current packaging focus:

- simple app mark / logo decision
- README and portfolio presentation polish
- live deployment smoke testing
- private preview checklist
- final release notes / closeout commit

Known non-blocking limitations are tracked in the `Known MVP limitations` section below.

---

## Product direction

The app is designed as a structured training companion.

Core product idea:

```text
Follow a stable training cycle.
Log the prescribed work honestly.
Use previous values as the next baseline.
Keep moving even when a day is partial or life changes the schedule.
```

The MVP includes two predefined training systems:

- **Bulk Pro**
- **Cut Pro**

Both plans use the same product flow:

```text
Home
-> Plan Overview
-> Cycle Dashboard
-> Day
-> Exercise/Core
-> Finish Day
-> End Cycle recap
-> Start next cycle
```

The app guides the user through a structured cycle instead of behaving like a free-form workout notebook.

---

## Core MVP value

The MVP proves that a user can:

- choose a predefined training plan
- start and continue a structured cycle
- follow the current training day
- log prescribed main exercise sets
- log core blocks separately
- mark performed sets with explicit `isDone`
- finish full or partial days honestly
- carry useful previous values into the next cycle
- restore progress after refresh
- reset local progress safely
- use the app on a mobile-first interface with desktop presented as a centered app shell

---

## Cycle model

The current MVP cycle model is:

```text
6 training days inside a 9-day rhythm
```

Training order:

```text
D1 -> D2 -> D3 -> D4 -> D5 -> D6
```

Rhythm:

```text
D1 -> D2 -> Rest
D3 -> D4 -> Rest
D5 -> D6 -> Rest
```

Why this matters:

- the training order stays stable
- rest is part of the rhythm
- the cycle does not restart because of one missed or partial day
- muscle groups return through main, support, top-up, and bridge work
- flexibility means the calendar can breathe without making the plan random

---

## Tech stack

- React
- Vite
- Tailwind CSS
- React Router
- Context + reducer runtime state
- localStorage persistence
- GitHub Actions basic CI
- Firebase Hosting for preview/deploy

MVP backend boundary:

```text
No auth
No Firestore
No Cloud Functions
No cloud sync
No payments / unlock logic
No AI coaching
```

The MVP is intentionally local-first.

---

## Live preview

Firebase Hosting is configured for live MVP preview and device testing:

```text
https://training-app-mvp.web.app
```

Hosting is used only for preview/deploy.

No backend, account system, cloud database, or sync logic is part of the MVP.

Current note:

```text
The live URL should be smoke-tested again after deploying the latest final-packaging build.
```

---

## Route map

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

Route decisions:

- Warm-up is not a standalone route.
- Warm-up opens from `DayPage` as `WarmupSheet`.
- Finish Day is not a standalone route.
- Finish Day confirmation opens from `DayPage` as `FinishDaySheet`.
- End Cycle remains a dedicated route-driven page.
- Invalid/deep routes fail safely through fallback handling.

---

## Main screen flows

The MVP has 10 conceptual screens / flows:

1. Home
2. Plan Overview
3. Cycle Dashboard
4. Day screen
5. Exercise screen
6. Core screen
7. Warm-up sheet
8. Guide / Coach Library
9. Finish Day confirmation sheet
10. End Cycle / Start New Cycle

Screen 7 and Screen 9 are sheet flows opened from the Day screen, not standalone routes.

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
- first Git/GitHub checkpoint
- basic GitHub Actions CI
- Firebase Hosting setup for live MVP preview

---

### Phase 2 — Static content and screen structure

Completed and merged to `main`.

Completed:

- static plan data for Bulk Pro and Cut Pro
- static day data for D1-D6
- day detail data for both plans
- exercise data for both plans
- core block and core exercise data
- warm-up content
- guide content
- contextual help content
- all 10 MVP screen flows
- advanced technique contextual help
- static training content truth pass
- pre-runtime cleanup pass

Important Phase 2 decisions:

- static source data and runtime progress stay separate
- prescribed set rows come from explicit metadata
- `prescription` is user-facing display copy
- `setCount` is runtime scaffold metadata
- `+ Add set` is removed from the active Exercise screen MVP flow
- advanced techniques are guidance-only for MVP
- optional bonus work stays in cue/help content and does not affect required completion
- core is separate from the main exercise completion count
- warm-up and guide content do not affect completion

---

### Phase 3 — Runtime workout flow logic

Completed.

Phase 3 turned the app from a static prototype into an in-memory workout tool.

Implemented:

- Context + reducer runtime state
- `AppStateProvider`
- `useAppState`
- `progressByPlan` separation for Bulk Pro and Cut Pro
- lazy cycle/day/exercise/core log creation
- prescribed main exercise set rows from `setCount`
- prescribed core set rows from `setCount`, `logType`, and `tracksLoad`
- weight / reps / RIR input support for main exercises
- load / reps / time / RIR support for core
- explicit set done logic through `isDone`
- exercise and core close intent
- Day screen progress/status calculation
- active / finished / upcoming day modes
- read-only upcoming Day / Exercise / Core previews
- finished day review/edit behavior
- Finish Day runtime behavior
- partial-day support
- cycle completion guard
- runtime-derived EndCyclePage recap
- explicit Start New Cycle behavior
- previous-value carry-over for main exercises
- previous-value carry-over for core
- missing-value warnings without hard blocking Finish Day
- full Bulk + Cut in-memory sanity test

Confirmed runtime rule:

```text
Input values alone do not complete a set.
Only isDone marks a set as performed.
```

---

### Pre-Phase-4 stabilization

Completed.

This pass stabilized the in-memory runtime behavior before persistence was added.

Completed:

- active / finished / upcoming day modes
- PlanOverview CTA behavior fix
- cycle completion guard
- close action copy and navigation cleanup
- finished-day UI signal
- upcoming Exercise/Core read-only previews
- Finish Day missing-value warnings
- EndCyclePage runtime-derived recap
- full Bulk + Cut in-memory sanity test
- runtime readability / component responsibility pass
- comment pass for complex runtime-heavy files

---

### Phase 4 — Local persistence

Completed.

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
- full Phase 4 refresh acceptance test pass

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

Static source data is not stored in localStorage.

---

### Phase 5 — Product UI polish and stability

Completed.

Goal:

```text
Turn the functional local-first MVP into a clearer, more premium, more usable training product while preserving confirmed runtime behavior.
```

Completed:

- Home product value polish
- interactive Home value chips
- Plan Overview cycle/rhythm explanation polish
- Cycle Dashboard hierarchy and rhythm polish
- Day screen product/workout command-center polish
- Exercise screen execution/logging polish
- Core screen flexible support-work polish
- Warm-up sheet polish
- Guide / Coach Library polish
- Finish Day sheet polish
- End Cycle / recap polish
- dark premium product theme alignment
- CTA/copy cleanup
- 320px density check
- landscape known-limitation check
- desktop scrollbar affordance for rhythm strip
- dark sheet scrollbar polish
- exercise horizontal overflow fix
- final Home / Guide / copy polish pass
- final technical pre-MVP fix pass
- independent Codex reviews
- final lint and build checks

Final checks:

```text
npm run lint — passed
npm run build — passed
```

Build note:

- Vite may report a chunk-size warning above 500 kB.
- This is not a build failure and is not treated as an MVP blocker.

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

### Set completion

Main set row shape:

```js
{
  setIndex: 1,
  weight: "",
  reps: "",
  rir: "",
  isDone: false
}
```

Core set row shape:

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

- values are strings for controlled inputs
- empty strings are allowed while editing
- input values alone do not complete a set
- only `isDone: true` marks a set as performed

---

### Close intent vs completion

Close actions record user intent.

They do not fake completion.

Meaning:

```text
Set checkbox = what was actually performed
Exercise closedAt = user intentionally closed that exercise workflow
Core block closedAt = user intentionally closed that core workflow
Day finishedAt = user intentionally closed the training day
Cycle completedAt = all six training days have finishedAt
```

Rules:

- Close exercise does not check unfinished sets.
- Close core block does not check unfinished core sets.
- Finish day does not have to mean a perfect day.
- Partial days are valid MVP behavior.
- Core completion is separate from main exercise completion.

---

### Day access model

The app separates day access into four modes:

```text
active
finished
upcoming
inactive
```

Runtime meaning:

```text
active   -> current training day, logging allowed
finished -> day has finishedAt, existing log review/edit
upcoming -> future day, preview-only
inactive -> fallback state
```

Upcoming day rules:

- preview is allowed
- active logging is disabled
- no current-cycle logs are created
- inputs, checkbox toggles, close actions, and Finish Day actions are disabled/hidden

---

### Carry-over behavior

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

---

## Finish Day warnings

`FinishDaySheet` gives informational warnings before a user finishes a day.

Confirmed rule:

```text
Warnings do not block Finish Day.
Warnings do not change runtime state.
```

Warnings do not change:

```text
isDone
closedAt
finishedAt
carry-over rules
```

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

## UI/product direction

The confirmed MVP visual direction is a dark premium product theme.

The app should feel:

- serious
- structured
- modern
- training-focused
- product-like
- calm, not flashy
- premium through hierarchy, spacing, surfaces, and restraint
- mobile-first and fast to use during training

`AppShell` supports visual purpose modes:

```jsx
<AppShell mode="product">
<AppShell mode="training">
```

Current meaning:

```text
product  = overview, choosing, explaining, reviewing
training = executing, logging, finishing workout flow
```

Important rule:

```text
product/training modes are purpose modes, not a full light-vs-dark split.
```

Both modes stay aligned with the current dark premium product theme.

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

## Important MVP rules

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

- UI polish must preserve confirmed runtime behavior
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

For release/private-preview checks, also verify:

```text
Home value chips and plan entry
Start / Continue / Review cycle behavior
active day logging
upcoming preview read-only behavior
partial day Finish Day flow
EndCyclePage recap
refresh persistence
reset local progress
invalid/deep route fallback
latest hosted preview after deploy
```

---

## Deployment smoke test

Before sharing the latest hosted build for private preview, run a focused live smoke test.

Minimum smoke test flow:

```text
Open latest hosted preview
-> confirm Home loads correctly
-> open both Bulk Pro and Cut Pro plan pages
-> start or continue a cycle
-> open Cycle Dashboard
-> open the current Day screen
-> open one Exercise screen
-> log at least one set value
-> mark at least one set as done
-> refresh the page and confirm persistence
-> return to the Day screen
-> open Core when available
-> confirm upcoming Day / Exercise / Core previews are read-only
-> finish a partial day
-> confirm currentDayId advances correctly
-> open EndCyclePage guard state before cycle completion
-> test Reset local progress
-> test one invalid/deep route fallback
```

The smoke test is not a full retest of every feature.

Goal:

```text
Confirm that the deployed build matches the already accepted local MVP behavior.
```

If a real blocker appears during smoke testing, fix it before private preview.

If a new idea appears during smoke testing, classify it first:

```text
must-fix
packaging polish
private-preview feedback
post-MVP
```

---

## Documentation map

Active project documentation:

```text
training-app-mvp-roadmap.md
training-app-architecture-notes.md
training-app-ui-system.md
training-app-product-positioning-and-cycle-logic.md
training-app-build-log.md
```

Use them as:

- `training-app-mvp-roadmap.md` — current MVP status, scope, milestones, and next steps
- `training-app-architecture-notes.md` — current technical/runtime source of truth
- `training-app-ui-system.md` — current UI/product interaction source of truth
- `training-app-product-positioning-and-cycle-logic.md` — current product/cycle logic source of truth
- `training-app-build-log.md` — historical implementation log

Older planning documents may exist in local archive, but they are no longer active project source-of-truth documents.

---

## Current next steps

The implementation MVP is complete.

Current focus is final packaging and private-preview preparation.

Next practical steps:

1. Finalize the simple app mark / logo direction.
2. Keep this technical README aligned with the final MVP status.
3. Prepare separate portfolio-facing presentation material.
4. Deploy the latest build if needed.
5. Perform a live deployment smoke test.
6. Prepare a private preview checklist.
7. Create final release notes / closeout commit.
8. Run private preview / launch-style testing.
9. Convert feedback into a post-MVP backlog.

Do not expand MVP scope unless a real blocker is found.

New ideas should be classified before implementation:

```text
must-fix
packaging polish
private-preview feedback
post-MVP
```

---

## Post-MVP / deferred scope

These remain future product considerations and should not be added during MVP closeout:

- auth
- cloud sync
- payments / unlock logic
- custom plan builder
- analytics
- AI coaching
- social/community features
- advanced rest day / LISS flow
- custom exercise substitutions
- rest timer
- full exercise library
- deeper muscle-group / plan-synergy education
- machine setup guidance
- assisted-machine logging refinement
- nutrition tracking
- cardio tracking
- full desktop layout redesign
- PWA / fullscreen install experience for a more app-like mobile flow
- short-height landscape recommendation banner
- targeted internal navigation/history polish if private preview shows real confusion
- smoother collapse behavior for long coaching/support note sections
- simple brand identity expansion beyond the MVP app mark
- public landing / marketing page
- full portfolio case-study writeup

---

## Final reminder

The goal of this MVP was not to build everything.

The goal was to build:

- a structured training app
- with a clear cycle flow
- fast set logging
- previous-value carry-over
- core integrated into training days
- partial-day flexibility
- local-first persistence
- and enough guidance to keep the soul of the system alive

Current guiding rule:

```text
Protect the finished MVP scope. Move new ideas into post-MVP unless they fix a real blocker.
```
