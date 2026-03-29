# Training App

Structured training app MVP built with React, Vite, Tailwind CSS, and React Router.

This project is not just a workout tracker.  
It is designed as a structured local-first training app that combines:

- predefined bulk and cut systems
- guided workout flow
- educational training content
- cycle-based progression
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
  - `index.js`

Added helpers:

- `getPlanById(planId)`
- `getDaysByPlanId(planId)`
- `getDayDetails(planId, dayId)`
- `getExercisesForDay(planId, exerciseIds)`
- `getCoreBlockById(coreId)`

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

- **Cycle / Day list**
  - reads `planId` from the route
  - loads the selected plan and D1-D6 day list from static source data
  - renders a dedicated 3-line cycle header:
    - plan name
    - cycle label
    - static progress summary
  - renders reusable day cards with:
    - day label
    - day name
    - optional core hint on D2 / D4 / D5
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
  - currently includes full Bulk day coverage for:
    - D1
    - D2
    - D3
    - D4
    - D5
    - D6
  - keeps Screen 4 strictly static-data-first with no runtime progress or completion logic yet

#### Current result

- the app boots correctly
- all main routes exist
- Home, Plan Overview, Cycle, and Day are connected to real static data
- route-based plan, day, exercise, and core lookup work
- the current static MVP flow is working:

`Home -> Plan Overview -> Cycle -> Day`

## Next step

Continue Phase 2 with:

- Cut plan day coverage for Screen 4
- static Exercise, Core, Warm-up, and Guide screens
- continued screen-by-screen responsive checks

## Tech stack

- React
- Vite
- Tailwind CSS
- React Router
- GitHub Actions (basic CI)

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
