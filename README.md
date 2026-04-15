# Training App

Structured training app MVP built with React, Vite, Tailwind CSS, and React Router.

This project is not just a workout tracker.  
It is designed as a structured local-first training app that combines:

- predefined bulk and cut systems
- guided workout flow
- educational training content
- cycle-based progression
- previous-workout continuity
- simple local persistence for MVP

## MVP goal

Build a clean, focused, mobile-first training app that supports:

- two predefined plans
- a 6 training day flow inside a 9-day cycle concept
- exercise and core navigation
- warm-up and guide views
- set logging with weight, reps, and RIR
- previous-value carry-over across cycles
- local-first progress saving

## Current status

### Phase 1 — Foundation

Completed.

Implemented:

- Vite + React project setup
- Tailwind CSS configuration
- base folder structure
- shared layout shell
- routing for all MVP screens
- shared UI structure for cards, sections, and buttons
- placeholder navigation between screens
- naming convention for plans, days, and core blocks
- basic GitHub Actions CI (`lint` + `build`)

### Phase 2 — Static content and screen structure

In progress.

Implemented so far:

#### Static source data

- `src/data/plans/`
  - `bulkPro.js`
  - `cutPro.js`
  - `index.js`
- `src/data/days/`
  - `bulkProDays.js`
  - `cutProDays.js`
  - `index.js`
- `src/data/dayDetails/`
  - `bulkProDayDetails.js`
  - `cutProDayDetails.js`
  - `index.js`
- `src/data/exercises/`
  - `bulkProExercises.js`
  - `cutProExercises.js`
  - `index.js`
- `src/data/core/`
  - `coreBlocks.js`
  - `coreExercises.js`
  - `index.js`

Added helpers:

- `getPlanById(planId)`
- `getDaysByPlanId(planId)`
- `getDayDetails(planId, dayId)`
- `getExercisesForDay(planId, exerciseIds)`
- `getCoreBlockById(coreId)`
- `getCoreExercisesByIds(exerciseIds)`

#### Screens completed in static MVP form

- **Home**
  - renders real predefined plan cards from static plan data
  - includes goal, audience, cycle label, and plan CTA

- **Plan Overview**
  - reads `planId` from the route
  - loads the selected plan from static source data
  - loads overview-level day data for the selected plan
  - renders training system, key rules, and training day order
  - includes top-level `View guide` action and primary `Start cycle` CTA
  - uses screen-specific richer day-order labels so the overview explains real day structure more honestly

- **Cycle / Day list**
  - reads `planId` from the route
  - loads the selected plan and D1-D6 day list from static source data
  - renders a dedicated 3-line cycle header:
    - plan name
    - cycle label
    - static progress summary
  - renders reusable day cards with:
    - day label
    - cleaned overview day name
    - optional truth hint line
    - optional core hint merged into the same metadata row
    - static status text
    - `Open day` CTA
  - keeps Screen 3 strictly static-data-first with no runtime progress logic yet

- **Day screen**
  - reads `planId` and `dayId` from the route
  - loads detailed day-level content through `dayDetails`
  - renders a real day header with:
    - day label and name
    - short goal
    - static progress summary
  - includes reusable day-specific UI blocks:
    - `SessionInfoCard`
    - `ExerciseListCard`
    - `CoreBlockCard`
  - renders session info, exercise list, and conditional core setup
  - currently includes full static coverage for both plans:
    - Bulk Pro D1-D6
    - Cut Pro D1-D6
  - keeps Screen 4 strictly static-data-first with no runtime progress or completion logic yet

- **Exercise screen**
  - reads `planId`, `dayId`, and `exerciseId` from the route
  - resolves the selected exercise through the static source-data layer
  - now uses a unified `ExerciseWorkflowCard` instead of the earlier multi-block shell
  - keeps one exercise as one working unit with:
    - guidance layer (`Progression`, `Cue`, `Advanced technique`, `Extra cues`)
    - previous-workout helper note
    - compact 4-column execution summary
    - row-based set scaffolding
    - bottom action scaffolding
  - keeps Screen 5 inside the current static/UI boundary with no runtime set logic yet

- **Core screen**
  - reads `planId`, `dayId`, and `coreId` from the route
  - resolves the related plan / day / core block / core exercises
  - no longer behaves like an info-only placeholder screen
  - now treats one core block as one working screen that contains all exercises for that block
  - uses a shared `CoreWorkflowCard` with:
    - top-level core overview block
    - shared execution block for all core exercises
    - per-exercise cue / tempo / rest / row scaffolding
    - per-exercise completion CTA
    - block-level completion CTA
  - keeps Screen 6 static for now while moving much closer to the real workout flow

#### Screen 4 content and presentation work completed

- full Bulk Screen 4 day coverage completed
- full Cut Screen 4 day coverage completed
- DayPage static progress summary was upgraded to a plan-aware shape
- Screen 4 day titles, goals, and exercise names were cleaned up using the confirmed UI naming and copy rules
- user-facing exercise naming now uses:
  - `&` instead of `/` in day titles
  - natural goal phrasing instead of `+`
  - cleaner exercise names with controlled use of hyphenation and abbreviations

#### Screen 2 and Screen 3 presentation work completed

- Screen 2 now uses richer day-order presentation labels through a screen-specific override layer
- Screen 3 now shows a muted secondary truth hint line below the main day title
- Screen 3 core hints were merged into the same metadata row where applicable
- shared overview day names were cleaned up in the base `days` layer:
  - `/` -> `&`
  - `+` -> `&` where appropriate
  - `Legs Heavy` -> `Quads Heavy`

#### Screen 5 work completed so far

- Screen 5 was corrected from a fragmented multi-block shell into a unified workout workflow screen
- row-based set presentation replaced the earlier heavier card-based scaffold
- the previous-workout continuity message now sits closer to the execution area
- the compact 4-column summary was stabilized and kept as the accepted direction:
  - normal font size
  - wider columns
  - concise values
  - full explanation stays in the guidance layer above

#### Screen 6 work completed so far

- Screen 6 was corrected away from the earlier info-only concept
- one opened core block now behaves like a multi-exercise execution screen
- the first Screen 6 pass expanded the core data layer with:
  - richer block-level content
  - per-block details
  - `exerciseIds`
  - individual core exercise lookup
- Screen 6 was then refined into a cleaner 2-block structure:
  - one top-level core overview block
  - one shared execution block
- duplicated helper text and redundant top-level metrics were reduced
- core execution rows now use more truthful labels:
  - `Reps` for rep-based movements
  - `Time` for hold-based movements
- this `Reps / Time` switch is currently handled as a light UI-level conditional during the static/UI phase, not yet as a stricter structured runtime data rule

#### Shared UI refinement completed

- `PrimaryButton.jsx` was expanded from a link-only wrapper into a shared primary action component that now supports:
  - route links through `to`
  - native button rendering when no route target is provided
  - `className`
  - `type`
  - forwarded props

This keeps Screen 6 and later action-heavy screens aligned with the same shared CTA primitive used across the app.

#### Current result

- the app boots correctly
- all main routes exist
- Home, Plan Overview, Cycle, Day, Exercise, and Core are connected to real static data
- route-based plan, day, exercise, and core lookup work
- Screen 4 is structurally complete in static MVP form for both predefined plans
- Screen 5 now reads like a real working exercise screen
- Screen 6 now follows a believable core workflow direction instead of a passive info screen
- the current static MVP flow is working:

`Home -> Plan Overview -> Cycle -> Day -> Exercise / Core`

## Next step

Continue Phase 2 with:

- Screen 7 — Warm-up view
- Screen 8 — Guide screen
- continued Screen 6 polish / copy cleanup
- continued screen-by-screen responsive checks

## Tech stack

- React
- Vite
- Tailwind CSS
- React Router
- GitHub Actions (basic CI)
- Firebase Hosting (live preview only)

## Architecture direction

The app is being built in phases with a clean separation between:

- routes / screens
- reusable UI components
- static source data
- runtime app state
- storage helpers
- utility logic

For MVP:

- no auth
- no backend
- no cloud sync
- local-first only

## Current implemented structure

- thin app entry:
  - `App.jsx -> AppRouter`

- shared layout primitives:
  - `AppShell`
  - `ScreenHeader`
  - `SectionCard`

- shared navigation/button primitives:
  - `PrimaryButton`
  - `SecondaryButton`
  - `BackButton`

- feature-specific plan / cycle UI:
  - `PlanCard`
  - `CycleHeader`
  - `DayCard`

- feature-specific day UI:
  - `SessionInfoCard`
  - `ExerciseListCard`
  - `CoreBlockCard`

- feature-specific exercise UI:
  - `ExerciseWorkflowCard`
  - `SetRow`

- feature-specific core UI:
  - `CoreWorkflowCard`
  - `CoreSetRow`

- MVP route skeleton:
  - `/`
  - `/plan/:planId`
  - `/plan/:planId/cycle`
  - `/plan/:planId/day/:dayId`
  - `/plan/:planId/day/:dayId/exercise/:exerciseId`
  - `/plan/:planId/day/:dayId/core/:coreId`
  - `/plan/:planId/day/:dayId/warmup`
  - `/plan/:planId/guide`
  - `/plan/:planId/end-cycle`

## Notes

This repository is being built strictly around the confirmed MVP scope and roadmap.  
The goal is to keep the structure clean, avoid scope creep, and move phase by phase.

The current implementation still respects the main MVP boundaries:

- static-data-first before runtime logic
- local-first persistence only
- core kept separate from main day exercise completion
- exercise `prescription` kept as a user-facing display string during the current Phase 2 boundary
