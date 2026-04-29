# Training App

Structured training app MVP built with React, Vite, Tailwind CSS, and React Router.

This project is not just a workout tracker.  
It is designed as a structured local-first training app that combines:

- predefined bulk and cut training systems
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
- warm-up support inside the Day screen flow
- central guide content
- contextual training help during workout flow
- finish-day confirmation
- end-of-cycle / start-new-cycle flow
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
- routing for the MVP screens
- shared UI structure for cards, sections, and buttons
- placeholder navigation between screens
- naming convention for plans, days, and core blocks
- basic GitHub Actions CI (`lint` + `build`)
- Firebase Hosting setup for live MVP preview

### Phase 2 — Static content and screen structure

Main static screen implementation is now visually complete.

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

Current Phase 2 status:

- all main planned MVP screens exist in static/UI form
- the main route-driven screens are connected
- warm-up and finish-day confirmation are handled as Day screen sheets
- End cycle exists as a route-driven static page
- runtime workout logic is still intentionally excluded

The remaining Phase 2 work is mainly:

- final static flow verification documentation
- reviewing local notes and deferred polish items
- deciding what must be fixed before entering Phase 3

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
  - `index.js`

### Current data helpers

- `getPlanById(planId)`
- `getDaysByPlanId(planId)`
- `getDayDetails(planId, dayId)`
- `getExercisesForDay(planId, exerciseIds)`
- `getExerciseById(planId, exerciseId)`
- `getCoreBlockById(coreId)`
- `getCoreExercisesByIds(exerciseIds)`
- `getWarmupById(planId, warmupId)`
- `getGuideByPlanId(planId)`

## Screens completed in static MVP form

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
- uses screen-specific richer day-order labels so the overview explains real day structure more honestly

### Screen 3 — Cycle / Day list

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

### Screen 4 — Day screen

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
- includes the warm-up entry point through `View warm-up`
- opens warm-up content as a Day screen sheet/modal instead of a separate page
- includes `Finish day` CTA and finish-day confirmation sheet
- currently includes full static coverage for both plans:
  - Bulk Pro D1-D6
  - Cut Pro D1-D6
- keeps Screen 4 strictly static-data-first with no runtime progress or completion logic yet

### Screen 5 — Exercise screen

- reads `planId`, `dayId`, and `exerciseId` from the route
- resolves the selected exercise through the static source-data layer
- uses a unified `ExerciseWorkflowCard` instead of the earlier multi-block shell
- keeps one exercise as one working unit with:
  - guidance layer (`Progression`, `Cue`, `Advanced technique`, `Extra cues`)
  - previous-workout helper note
  - compact 4-column execution summary
  - row-based set scaffolding
  - bottom action scaffolding
- includes a small contextual `? Help` trigger near the execution summary
- opens `HelpSheet` with short explanations for:
  - Tempo & rest
  - RIR
  - Progression
- keeps Screen 5 inside the current static/UI boundary with no runtime set logic yet

### Screen 6 — Core screen

- reads `planId`, `dayId`, and `coreId` from the route
- resolves the related plan / day / core block / core exercises
- treats one opened core block as one working screen
- shows all exercises for the selected core block on the same screen
- uses a shared `CoreWorkflowCard` with:
  - top-level core overview block
  - block-level purpose
  - compact `Exercises / Sets / RIR` overview
  - `Progression`
  - `Key reminders`
  - rest-day movement note
  - shared prefill helper
  - per-exercise cue and extra cues
  - per-exercise compact working summary
  - row-based core logging scaffold
  - per-exercise completion CTA
  - block-level completion CTA
- keeps Screen 6 inside the current static/UI boundary with no runtime core logging logic yet

### Screen 7 — Warm-up sheet

- warm-up content is plan-aware and stored in `src/data/warmups/`
- warm-up content is resolved through:
  - `dayDetails.sessionInfo.warmupId`
  - `getWarmupById(planId, warmupId)`
- `View warm-up` opens a sheet/modal from the Day screen
- the previous standalone `WarmupPage` and warm-up route were removed from the active flow
- the final warm-up flow is:

`Day screen -> View warm-up -> Warm-up sheet -> Close warm-up -> same Day screen`

- warm-up content includes:
  - title
  - goal
  - step-based guidance
  - short coaching-style execution notes
- warm-up uses a unified `WarmupStepsCard` inside `WarmupSheet`
- no warm-up runtime logic was added:
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
- Guide data lives in:
  - `src/data/guides/bulkProGuide.js`
  - `src/data/guides/cutProGuide.js`
  - `src/data/guides/index.js`
- Guide lookup is handled through:
  - `getGuideByPlanId(planId)`
- Guide uses a section-entry flow instead of one long all-open wall of text:
  - landing state with section cards
  - opened section state with one focused guide section
  - return action at top and bottom
- current guide groups:
  - `start-here`
  - `train-and-progress`
  - `plan-structure`
  - `fatigue-recovery-and-adjustments`
- Bulk and Cut guides share the same structure while preserving plan-specific training logic
- central Guide remains the deeper system-level explanation layer

### Screen 9 — Finish day confirmation

- implemented as a bottom sheet inside `DayPage`
- not a standalone route
- opened through the `Finish day` CTA at the bottom of the Day screen
- uses local `isFinishDayOpen` state
- reuses the existing sheet visual language established by Warm-up and Help sheets
- explains the future full/partial completion role without adding runtime logic
- for days with core, includes a note that core is tracked separately from the main exercise count
- current actions:
  - `Confirm finish`
  - `Keep training`
- in this static phase, actions close the sheet only
- no real finish-day behavior is active yet

### Screen 10 — End of cycle / Start new cycle

- implemented as a route-driven static page:

`/plan/:planId/end-cycle`

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
- it is not yet reached through real workout completion because that requires Phase 3 runtime logic

## Content and presentation work completed

### Screen 2 and Screen 3

- Screen 2 now uses richer day-order presentation labels through a screen-specific override layer
- Screen 3 now shows a muted secondary truth hint line below the main day title
- Screen 3 core hints were merged into the same metadata row where applicable
- shared overview day names were cleaned up in the base `days` layer:
  - `/` -> `&`
  - `+` -> `&` where appropriate
  - `Legs Heavy` -> `Quads Heavy`

### Screen 4

- full Bulk Screen 4 day coverage completed
- full Cut Screen 4 day coverage completed
- DayPage static progress summary was upgraded to a plan-aware shape
- Screen 4 day titles, goals, and exercise names were cleaned up using the confirmed UI naming and copy rules
- user-facing exercise naming now uses:
  - `&` instead of `/` in day titles
  - natural goal phrasing instead of `+`
  - cleaner exercise names with controlled use of hyphenation and abbreviations
- duplicated visible `Cue:` text was removed from Screen 4 exercise cards
- `cue` remains in the source data layer because Screen 5 owns detailed exercise execution guidance

### Screen 5

- Screen 5 was corrected from a fragmented multi-block shell into a unified workout workflow screen
- row-based set presentation replaced the earlier heavier card-based scaffold
- the previous-workout continuity message now sits closer to the execution area
- the compact 4-column summary was stabilized and kept as the accepted direction:
  - normal font size
  - wider columns
  - concise values
  - full explanation stays in the guidance layer above
- a contextual exercise helper was added through one small `? Help` trigger near the working rules / compact summary area
- the first helper explains tempo, rest, RIR, and progression without duplicating the full central Guide
- Screen 5 is considered complete for the current MVP static/UI pass, aside from later final design polish if needed

### Screen 6

- Screen 6 was corrected away from the earlier info-only concept
- one opened core block now behaves like a multi-exercise workflow screen
- all exercises for the selected core block appear on one screen
- the core data layer now includes:
  - richer block-level guidance
  - `exerciseIds`
  - individual core exercise lookup
  - core exercise subtitles
  - cue and extra cue content
  - tempo and rest values
  - `logType`
  - `tracksLoad`
- Screen 6 now uses a cleaner two-part structure:
  - one top-level core overview block
  - one shared execution block
- duplicated helper text and redundant top-level metrics were reduced
- block-level `Notes` was renamed to `Key reminders`
- `Can be moved to a rest day if needed` was confirmed to stay on the Core screen
- core execution helper copy was aligned with the Screen 5 prefill pattern
- core exercise prescriptions were cleaned where compact-summary qualifiers caused awkward wrapping:
  - `/ side` and `total` meaning was moved into `extraCues`
- Screen 6 now uses explicit metadata instead of display-string inference:
  - `logType` controls `Reps` vs `Time`
  - `tracksLoad` controls whether a row shows `Kg / Reps / RIR` or `Target / Reps-or-Time / RIR`
- weighted core movements now support load scaffolding:
  - Decline Sit-Up (Weighted)
  - Pallof Press
  - Russian Twist
- Screen 6 now follows the Screen 5 execution pattern more closely through a compact per-exercise summary:
  - `Sets`
  - `Tempo`
  - `RIR`
  - `Rest`
- Screen 6 is considered complete for the current MVP static/UI pass

### Screen 7 / Warm-up

- warm-up static data was added for both plans
- each plan includes warm-up content for D1-D6
- warm-up content passed truth/content review against:
  - original plan structure
  - real phone notes used during training
  - actual day purpose
- warm-up item text was upgraded from plain movement lists into short coaching-style notes
- the first route-driven warm-up page was replaced after mobile review with a cleaner Day screen sheet/modal
- `WarmupStepCard` was replaced by `WarmupStepsCard`
- `WarmupSheet` was added
- the standalone warm-up page and warm-up route were removed from the active flow
- Screen 7 is considered complete for the current MVP static/UI pass

### Screen 8 / Guide

- static guide content was added for both plans
- Guide data follows a shared section-based shape:
  - `id`
  - `title`
  - `intro`
  - `groups`
  - `topics`
  - `paragraphs`
  - `bullets`
- the Guide screen was changed from one large all-open content wall into a focused section-entry flow
- Bulk and Cut guide content were reviewed and refined for:
  - progression explanation
  - RIR and failure guidance
  - not changing main exercises too frequently
  - day-role examples
  - flexible deload guidance
  - Cut-specific lower-volume reassurance
  - Cut maintain-first progression framing
  - LISS / rest-day positioning
  - keeping Bulk working weights as long as form and RIR stay honest
- Screen 8 is considered complete for the current central Guide first pass

### Contextual help

- a new contextual help data layer was started:
  - `src/data/contextualHelp/exerciseHelp.js`
  - `src/data/contextualHelp/index.js`
- a reusable `HelpSheet` component was added:
  - `src/components/common/HelpSheet.jsx`
- the first contextual helper was connected only to Screen 5
- current Exercise helper sections:
  - Tempo & rest
  - RIR
  - Progression
- the first-pass decision is to use one small `? Help` trigger instead of multiple question marks across the compact summary
- future helper candidates remain deferred:
  - Previous workout / last log helper
  - Advanced technique helper
  - Core purpose helper
  - Warm-up purpose helper
  - Finish day / partial completion helper
  - Day role helper

### Screen 9 / Finish day

- Finish day confirmation was implemented as a Day screen sheet/modal
- this preserves the current flow:

`Day screen -> Finish day -> Finish day sheet -> same Day screen`

- the sheet explains future full/partial completion behavior without adding runtime logic
- current sheet actions close the sheet only
- real Finish day behavior belongs to Phase 3

### Screen 10 / End cycle

- the placeholder `EndCyclePage` was replaced with a route-driven static page
- the page is plan-aware through route param lookup
- the page includes static cycle recap and next-cycle explanation
- it avoids pretending that carry-over or cycle reset logic already exists
- direct route access currently works
- real navigation from finishing D6 into End Cycle belongs to Phase 3

## Shared UI refinement completed

- `PrimaryButton.jsx` was expanded from a link-only wrapper into a shared primary action component that supports:
  - route links through `to`
  - native button rendering when no route target is provided
  - `className`
  - `type`
  - forwarded props

- `SecondaryButton.jsx` was expanded from a link-only wrapper into a shared secondary action component that supports:
  - route links through `to`
  - native button rendering when no route target is provided
  - `className`
  - `type`
  - forwarded props

This keeps shared CTA styling consistent while allowing both route navigation and local UI actions such as opening / closing sheets.

## Current result

- the app boots correctly
- main routes for the current static flow are connected
- Home, Plan Overview, Cycle, Day, Exercise, Core, Guide, and End Cycle pages are connected to real static data where applicable
- warm-up, exercise help, and finish-day confirmation use local sheet/modal patterns
- route-based plan, day, exercise, core, guide, and end-cycle lookup work
- warm-up is displayed as a Day screen sheet/modal rather than a standalone route
- finish-day confirmation is displayed as a Day screen sheet/modal rather than a standalone route
- Screen 4 is structurally complete in static MVP form for both predefined plans
- Screen 5 reads like a real working exercise screen
- Screen 6 reads like a real working core block screen
- Screen 7 reads like short supporting warm-up guidance before the workout
- Screen 8 central Guide exists as a focused section-based knowledge layer
- Screen 9 exists as a visible static confirmation step
- Screen 10 exists as a static end-of-cycle screen
- the current static MVP flow is working:

`Home -> Plan Overview -> Cycle -> Day -> Exercise / Core / Warm-up sheet / Finish day sheet`

Additional static route:

`/plan/:planId/end-cycle`

## Next step

Before entering Phase 3, complete a final Phase 2 wrap-up pass:

- document static flow verification
- review locally saved notes from the Phase 2 build
- decide which small issues are worth fixing before runtime logic
- avoid expanding scope into new features

After that, continue into Phase 3:

- selected plan state
- current cycle state
- day completion state
- exercise completion state
- core block completion state
- set input state
- previous-workout prefill
- finish-day logic
- partial/full completion
- end-of-cycle detection
- start-new-cycle behavior
- previous-value carry-over

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

- shared sheet / helper primitive:
  - `HelpSheet`

- feature-specific plan / cycle UI:
  - `PlanCard`
  - `CycleHeader`
  - `DayCard`

- feature-specific day UI:
  - `SessionInfoCard`
  - `ExerciseListCard`
  - `CoreBlockCard`
  - `FinishDaySheet`

- feature-specific exercise UI:
  - `ExerciseWorkflowCard`
  - `SetRow`

- feature-specific core UI:
  - `CoreWorkflowCard`
  - `CoreSetRow`

- feature-specific warm-up UI:
  - `WarmupSheet`
  - `WarmupStepsCard`

- feature-specific guide UI:
  - `GuidePage`

- MVP route skeleton currently used:
  - `/`
  - `/plan/:planId`
  - `/plan/:planId/cycle`
  - `/plan/:planId/day/:dayId`
  - `/plan/:planId/day/:dayId/exercise/:exerciseId`
  - `/plan/:planId/day/:dayId/core/:coreId`
  - `/plan/:planId/guide`
  - `/plan/:planId/end-cycle`

## Notes

This repository is being built strictly around the confirmed MVP scope and roadmap.  
The goal is to keep the structure clean, avoid scope creep, and move phase by phase.

The current implementation still respects the main MVP boundaries:

- static-data-first before runtime logic
- local-first persistence only
- core kept separate from main day exercise completion
- warm-up kept as supporting Day screen guidance, not a separate workout workflow
- finish-day confirmation kept as a Day screen sheet/modal, not a standalone route
- end-cycle kept as a route-driven page, but not yet connected through runtime completion
- central Guide kept as the deeper system-level explanation
- contextual help kept small, local, and close to the workflow area where the user needs it
- exercise `prescription` kept as a user-facing display string during the current Phase 2 boundary
- core logging behavior now has explicit static metadata (`logType`, `tracksLoad`) so future runtime logic does not need to parse display strings
