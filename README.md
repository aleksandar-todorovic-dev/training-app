# Cycle Coach

A mobile-first, local-first React MVP built as a **structured training companion**, not a generic workout tracker.

Cycle Coach combines two predefined strength-training systems — **Bulk Pro** and **Cut Pro** — with guided workout execution, contextual training support, set-by-set logging, previous-value continuity, and cycle-based progression in one clear flow.

The product is built around two connected principles:

```text
Clarity during the workout.
Continuity across the cycle.
```

Users can see what to do, how to approach it, what they logged previously, and what comes next. The cycle-based structure keeps training order stable when real-life schedules change without turning flexibility into random workout selection.

The current release is intentionally local-first and MVP-scoped. It focuses on validating the product flow, training-state model, persistence logic, educational layer, and mobile workout experience before adding accounts, cloud sync, payments, or broader customization.

---

## Live App

Firebase Hosting:

```text
https://training-app-mvp.web.app
```

Current application version:

```text
0.6.0
```

Current release stage:

```text
Limited Public Preview
```

The app does not currently use accounts, cloud workout storage, cloud sync, payments, advertising, analytics SDKs, marketing pixels, or AI coaching.

Workout progress is stored locally in the browser. Normal Firebase Hosting requests still occur when the web app and its static assets are loaded.

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [App Flow](#app-flow)
- [Public Preview Surfaces](#public-preview-surfaces)
- [Technical Architecture](#technical-architecture)
- [Runtime State Model](#runtime-state-model)
- [Persistence Model](#persistence-model)
- [Static Data Structure](#static-data-structure)
- [Important Runtime Rules](#important-runtime-rules)
- [UI / UX Direction](#ui--ux-direction)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Running Locally](#running-locally)
- [Verification](#verification)
- [Screenshots](#screenshots)
- [Current Status](#current-status)
- [MVP Scope](#mvp-scope)
- [Known MVP Limitations](#known-mvp-limitations)
- [Future Improvements](#future-improvements)
- [What This Project Demonstrates](#what-this-project-demonstrates)
- [License](#license)

---

## Overview

Cycle Coach helps users follow a predefined strength-training system without turning every workout into manual planning, scattered notes, or guesswork.

The app brings the key information required to follow and execute the program into one workout flow:

- the active plan and current cycle
- the current training day
- exercise order
- prescribed sets and rep targets
- RIR, tempo, rest, and progression guidance
- contextual cues and training help
- set-by-set logging
- previous useful values
- the next meaningful step

The second core product value is continuity across the cycle.

Bulk Pro and Cut Pro use a stable D1–D6 training order inside a 9-day rhythm. When a workout is moved, missed, or completed only partially, the user does not need to rebuild the week, randomly skip work, or force several sessions into a compressed calendar.

The product principle is:

```text
The calendar can move.
The training order stays clear.
```

The MVP supports:

- choosing between **Bulk Pro** and **Cut Pro**
- starting and continuing a training cycle
- following the current training day
- logging prescribed exercise sets
- logging separate Core blocks
- finishing full or partial days honestly
- preserving useful previous values for the next cycle
- reviewing a completed cycle
- restoring progress after refresh through localStorage

The practical user outcome is:

```text
Know what to do.
Know how to approach it.
Know what comes next.
```

---

## Core Features

### Structured training plans

The MVP includes two plans inside the same structured training system:

- **Bulk Pro** — progression-focused training with repeatable workload and cycle-to-cycle continuity
- **Cut Pro** — recovery-aware training organized around maintaining productive training while managing fatigue during a cut

Users choose the plan that matches their current training phase.

The plans share the same application infrastructure:

- cycle flow
- guided workout screens
- set logging
- previous-value continuity
- partial-day behavior
- contextual guidance
- local persistence

They differ in training purpose, exercise selection, day emphasis, workload distribution, and progression guidance.

Bulk Pro and Cut Pro are plans within one product. Any future decision to unlock or sell them separately would be an access or monetization decision, not a change to the underlying product architecture.

### 6-day cycle inside a 9-day rhythm

The current cycle model is:

```text
D1 -> D2 -> Rest
D3 -> D4 -> Rest
D5 -> D6 -> Rest
```

The training order stays stable while rest days give the schedule room to breathe.

The cycle is not rigidly tied to Monday–Sunday labels. If real life moves a workout, the user continues from the next planned training day instead of rebuilding the week or choosing randomly.

This is controlled flexibility, not a free-form scheduler.

The system preserves:

- day order
- plan intent
- recovery spacing
- current-cycle orientation
- the next meaningful workout step

It does not automatically estimate fatigue, prescribe adaptive recovery, or allow arbitrary plan restructuring.

### Guided workout flow

The user moves through a clear app flow:

```text
Home
-> Plan Overview
-> Cycle Dashboard
-> Day
-> Exercise / Core
-> Finish Day
-> End Cycle recap
-> Start next cycle
```

The app keeps the current action and next meaningful step visible instead of asking the user to rebuild the training structure manually.

During execution, the product combines:

- day purpose
- exercise order
- prescribed targets
- RIR guidance
- tempo
- rest
- progression rules
- contextual cues
- previous useful values
- current completion state

The information hierarchy follows a deliberate rule:

```text
Action first.
Guidance in context.
Deeper education when requested.
```

### Exercise logging

Main exercises support:

- prescribed set rows generated from explicit metadata
- weight input
- reps input
- RIR input
- performed-set checkbox
- exercise close intent
- active, finished, and preview states

Input values alone do not complete a set.

Only `isDone: true` marks a set as performed.

### Core block logging

Core work is integrated into selected training days and tracked separately from main exercise completion.

Core logging supports:

- reps-based Core work
- time-based Core work
- load tracking where relevant
- RIR tracking
- Core block close intent
- separate Core carry-over behavior

Core progress supports the training system but does not affect main day completion.

Invalid Core deep links are guarded before runtime Core state can be created.

### Partial-day support

The app allows users to finish a day even when the day was partial.

This is intentional product behavior, not a missing validation rule.

A finished day means the user intentionally moved the cycle forward. It does not claim that every prescribed exercise or set was completed.

This supports real situations such as:

- limited workout time
- unexpected interruptions
- fatigue
- skipped optional work
- sessions that could not be completed as planned

The system records what actually happened, preserves the cycle order, and keeps the next step clear.

### Previous-value carry-over

Performed set values can become useful references for the next cycle.

Carry-over is field-by-field and only uses values from sets marked as performed.

The app does not carry forward:

- completion state
- closed state
- finished-day state
- completed-cycle state

Unchecked edited values remain in the historical log but are not eligible for future carry-over.

### Educational training layer

The MVP includes a static educational layer that supports workout execution without turning every screen into a long manual.

The guidance layer covers:

- plan logic and cycle structure
- RIR and effort management
- tempo and rest targets
- progression rules
- exercise cues
- recovery and fatigue guidance
- warm-up guidance
- advanced technique explanations
- contextual exercise help

Education is split by context:

- **Home** explains the product value quickly.
- **Guide** explains the larger training system.
- **Exercise help** explains working rules such as tempo, rest, RIR, and progression.
- **Training notes and cues** provide short execution reminders near the current exercise.
- **Advanced technique help** explains optional intensity methods.
- **Warm-up sheets** provide short day-specific preparation guidance.

The product uses progressive disclosure:

```text
Essential targets stay visible.
Additional help appears in context.
Deeper explanations remain available on demand.
```

This content is general training guidance. It does not replace individual coaching, medical advice, rehabilitation, diagnosis, or professional assessment.

---

## App Flow

### Main routes

```text
/                                         -> HomePage
/plan/:planId                             -> PlanOverviewPage
/plan/:planId/cycle                       -> CyclePage
/plan/:planId/day/:dayId                  -> DayPage
/plan/:planId/day/:dayId/exercise/:exerciseId -> ExercisePage
/plan/:planId/day/:dayId/core/:coreId     -> CorePage
/plan/:planId/guide                       -> GuidePage
/plan/:planId/end-cycle                   -> EndCyclePage

/privacy                                  -> PublicInfoPage
/preview-terms                            -> PublicInfoPage
/fitness-safety                           -> PublicInfoPage
/contact                                  -> PublicInfoPage

*                                         -> fallback route
```

### Screen roles

| Screen | Role |
| --- | --- |
| Home | Product entry, plan choice, value explanation |
| Plan Overview | Plan context, rhythm explanation, start/continue/review cycle |
| Cycle Dashboard | Current cycle overview and next training day |
| Day | Workout command center for the selected day |
| Exercise | Main exercise logging and execution guidance |
| Core | Separate Core support workflow |
| Warm-up Sheet | Short pre-workout guidance |
| Guide | Deeper plan and training-system education |
| Finish Day Sheet | Close the current day with partial-day support |
| End Cycle | Runtime-derived cycle recap and next-cycle transition |
| Public Info | Privacy, Preview Terms, Fitness & Safety, and Contact information |

Warm-up, contextual help, safety acknowledgement, and Finish Day are sheet flows rather than standalone workout routes.

---

## Public Preview Surfaces

The limited public preview includes persistent access to:

- **Privacy**
- **Preview Terms**
- **Fitness & Safety**
- **Contact**

The app footer identifies the product as:

```text
Cycle Coach · Free preview · 18+
```

The first cycle start also uses a one-time safety acknowledgement flow.

That acknowledgement is intentionally separate from workout progress:

- cancelling the sheet does not start the cycle
- confirming the sheet stores the acknowledgement
- the acknowledgement is not plan-specific
- resetting local workout progress does not clear the acknowledgement
- clearing site storage removes both workout progress and the acknowledgement

Current preview scope intentionally excludes:

- accounts
- cloud workout databases
- cloud sync
- payments
- subscriptions
- supporter/tip flows
- advertising
- analytics SDKs
- marketing pixels
- AI coaching
- medical or rehabilitation functionality

Contact for the public preview:

```text
cyclecoach.app@gmail.com
```

---

## Technical Architecture

The app is built with:

- React
- Vite
- Tailwind CSS
- React Router
- Context + reducer runtime state
- localStorage persistence
- Motion for UI transitions
- Lucide icons
- Firebase Hosting
- GitHub Actions CI

The architecture separates static training content from runtime user progress.

```text
Static source data = what the app prescribes
Runtime state      = what the user selected, logged, finished, or carried forward
```

This separation keeps the training system stable while allowing user progress to change independently.

---

## Runtime State Model

Global app state is managed with Context + reducer.

High-level state shape:

```js
{
  selectedPlanId: null,
  progressByPlan: {}
}
```

Progress is separated per plan so Bulk Pro and Cut Pro do not share cycle state.

Runtime state includes:

- selected plan
- active cycle
- cycle history
- current day pointer
- day logs
- main exercise logs
- Core block logs
- set input values
- set done state
- exercise/Core close intent
- day finish intent
- cycle completion
- previous-value carry-over references

The reducer owns state transitions. Persistence stays outside the reducer.

---

## Persistence Model

The MVP uses two localStorage concerns with separate responsibilities.

### Workout state

Storage module:

```text
src/storage/appStateStorage.js
```

Storage key:

```js
"training-app:v1:app-state"
```

Stored wrapper:

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

The workout storage layer handles:

- loading saved runtime state
- saving runtime state
- clearing workout progress
- falling back safely when storage is missing, invalid, outdated, or malformed
- discarding isolated invalid plan progress without crashing valid plan progress

If a browser write fails, Cycle Coach surfaces a persistence warning instead of silently implying that progress is being saved. The warning clears after a later successful write.

### Safety acknowledgement

Storage module:

```text
src/storage/safetyAcknowledgementStorage.js
```

Storage key:

```js
"training-app:v1:safety-acknowledged"
```

This key stores only whether the first-start safety acknowledgement has already been confirmed.

It is intentionally separate from workout state. `Reset local progress` clears workout progress but does not clear this acknowledgement.

Static source data is not copied into localStorage.

---

## Static Data Structure

Training content is stored as static source data.

High-level structure:

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

Static data owns:

- plan names and descriptions
- training day structure
- exercise definitions
- Core block definitions
- warm-up content
- guide content
- contextual help content
- public preview information

Runtime state stores only user progress and user-entered values.

---

## Important Runtime Rules

### `prescription` is display copy

The app does not parse user-facing prescription strings.

```text
prescription = user-facing display text
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

Core exercises also use metadata such as:

```js
{
  logType: "reps" | "time",
  tracksLoad: true | false
}
```

### Set completion is explicit

Input values do not complete a set.

```text
Set checkbox = what was actually performed
Input values = details about what was performed
```

A set counts as performed only when:

```js
isDone === true
```

### Close intent does not fake completion

Close actions record user intent. They do not automatically complete unfinished work.

```text
Exercise closedAt = user intentionally closed that exercise workflow
Core block closedAt = user intentionally closed that Core workflow
Day finishedAt = user intentionally closed the training day
Cycle completedAt = all six required training days have finishedAt
```

### Upcoming previews are read-only

Upcoming Day, Exercise, and Core views allow previewing the structure but do not create or mutate current-cycle logs.

### Route guards must not mutate rejected state

Rejected invalid routes are display guards only. They must not create runtime progress.

This includes invalid Core routes where the requested Core block does not belong to the selected training day.

### Carry-over is conservative

A value can carry over only when:

```text
the previous set was marked as performed
and the specific field is not empty
```

Unchecked edited values remain saved in the local log but are not eligible for future carry-over.

---

## UI / UX Direction

The MVP uses a dark, mobile-first product interface built around a **Cold Performance / Structured Coaching** direction.

Design goals:

- serious
- structured
- calm
- training-focused
- fast to use during workouts
- modern without being flashy

The interface is designed around workout clarity rather than feature density.

Product and information-hierarchy principles:

```text
Action first.
Guidance in context.
Deeper education when requested.
```

```text
Show the current step clearly.
Keep the next action visible.
Do not force false completion.
```

Important UI patterns include:

- centered mobile-first app shell
- product screens for plan choice and explanation
- training screens for execution and logging
- bottom sheets for warm-up, help, safety, and finish-day confirmation
- compact row-based set logging
- contextual help without leaving the workout flow
- read-only preview states for upcoming work
- distinct active, partial, complete, and finished states
- persistent public-information footer
- persistence-failure status messaging
- restrained route-focus and reduced-motion accessibility behavior

Desktop intentionally uses a centered mobile-first app shell rather than a full dashboard layout.

---

## Project Structure

```text
src/
  app/
  components/
  data/
  pages/
  state/
  storage/
  styles/
  utils/
```

Key areas:

```text
src/app/                 Router and app-level layout helpers
src/pages/               Route-level screens
src/components/          Shared and feature-specific UI components
src/data/                Static training and public-info content
src/state/               Context + reducer runtime state
src/storage/             localStorage persistence boundaries
src/styles/              UI tokens and motion presets
src/utils/runtime/       Runtime helper logic
```

---

## Tech Stack

### Runtime

- React
- React DOM
- React Router
- Tailwind CSS
- Motion
- Lucide React

### Tooling

- Vite
- ESLint
- GitHub Actions
- Firebase Hosting

### Package manager

This project uses npm and includes a committed `package-lock.json`.

---

## Running Locally

Recommended environment:

```text
Node.js 20+
npm
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Verification

The current limited-public-preview release gate includes:

```bash
git diff --check
npm run lint
npm run build
npm audit
npm audit --omit=dev
```

Current pre-merge verification status:

```text
git diff check passed
lint passed
production build passed
npm audit passed with 0 vulnerabilities
npm audit --omit=dev passed with 0 vulnerabilities
final whole-app release audit passed
targeted Core-route blocker regression passed
QA Firebase Hosting preview refreshed from the approved candidate
published QA assets matched the local production build
expected Firebase Hosting security headers verified
```

The final release audit initially found one persistent-state blocker involving an invalid Core deep link. The issue was fixed with a minimal route-guard change and then rechecked for both Bulk Pro and Cut Pro before the release gate was marked PASS.

Production deployment and a final production smoke check are the remaining environment-level closeout steps before external preview use.

### Hosting hardening

Firebase Hosting currently sends:

- Content-Security-Policy
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Permissions Policy disabling geolocation, camera, and microphone

Firebase preview channels also carry the expected `noindex` behavior.

### Build note

Vite may report a chunk-size warning above 500 kB after production build. This is currently accepted as a non-blocking MVP limitation and can be revisited post-MVP with route-level code splitting if needed.

---

## Screenshots

The screenshot slots below represent the main mobile-first product flow. The image files should be refreshed with the current Cold Performance / Structured Coaching redesign before the repository is presented publicly.

<p>
  <a href="docs/screenshots/home.png"><img src="docs/screenshots/thumbs/home.png" alt="Cycle Coach home screen" width="180" /></a>
  <a href="docs/screenshots/plan-overview.png"><img src="docs/screenshots/thumbs/plan-overview.png" alt="Cycle Coach plan overview screen" width="180" /></a>
  <a href="docs/screenshots/cycle-dashboard.png"><img src="docs/screenshots/thumbs/cycle-dashboard.png" alt="Cycle Coach cycle dashboard screen" width="180" /></a>
  <a href="docs/screenshots/day-screen.png"><img src="docs/screenshots/thumbs/day-screen.png" alt="Cycle Coach day screen" width="180" /></a>
</p>

<p>
  <a href="docs/screenshots/exercise-logging.png"><img src="docs/screenshots/thumbs/exercise-logging.png" alt="Cycle Coach exercise logging screen" width="180" /></a>
  <a href="docs/screenshots/core-workflow.png"><img src="docs/screenshots/thumbs/core-workflow.png" alt="Cycle Coach Core workflow screen" width="180" /></a>
  <a href="docs/screenshots/guide.png"><img src="docs/screenshots/thumbs/guide.png" alt="Cycle Coach training guide screen" width="180" /></a>
  <a href="docs/screenshots/end-cycle.png"><img src="docs/screenshots/thumbs/end-cycle.png" alt="Cycle Coach end-cycle recap screen" width="180" /></a>
</p>

---

## Current Status

```text
0.6.0 — Limited Public Preview
```

The local-first MVP is implemented and has passed the final pre-merge release gate.

Completed release-readiness work includes:

- structured Bulk Pro / Cut Pro runtime
- cycle-based workout flow
- localStorage hydration and persistence boundaries
- persistence-failure UX
- public Privacy / Preview Terms / Fitness & Safety / Contact surfaces
- one-time first-start safety acknowledgement
- training-claims cleanup
- dependency security remediation
- Firebase Hosting security headers
- targeted accessibility smoke and fixes
- final whole-app read-only release audit
- confirmed Core-route blocker fix
- final targeted blocker re-check with PASS

Remaining release-closeout work:

```text
merge approved release candidate -> main
run main-branch verification
deploy main to production Firebase Hosting
run production smoke / network / storage / header checks
begin limited external validation
```

The repository contains an older private-preview history, but the current README describes the present limited-public-preview candidate and current MVP behavior.

---

## MVP Scope

This MVP includes:

- Bulk Pro and Cut Pro inside one structured training system
- 6-day cycle inside a 9-day rhythm
- guided workout flow
- main exercise logging
- Core block logging
- previous-value carry-over
- partial-day support
- runtime-derived cycle recap
- localStorage persistence
- persistence-failure feedback
- reset local progress
- public preview information and safety surfaces
- mobile-first UI

This MVP does not include:

- authentication
- Firestore
- Cloud Functions
- cloud workout sync
- multi-device sync
- payments
- subscriptions or unlock logic
- tips/support payments
- advertising
- analytics SDKs
- marketing pixels
- AI coaching
- adaptive programming
- custom plan builder
- custom exercise substitutions
- nutrition tracking
- cardio tracking
- PWA install flow
- full desktop dashboard layout
- medical, rehabilitation, diagnosis, or treatment functionality

---

## Known MVP Limitations

Accepted current limitations:

- Progress is local to the browser/device.
- Clearing browser storage removes saved workout progress.
- Clearing all site storage also removes the safety acknowledgement.
- Desktop uses a centered mobile-first app shell, not a full desktop layout.
- Phone landscape is usable but not a primary optimization target.
- The app is not a PWA yet.
- Vite may show a non-blocking chunk-size warning.
- No automated test suite is included yet.
- Accessibility work is a targeted limited-preview smoke, not formal WCAG certification or an exhaustive assistive-technology matrix.
- The limited preview is intentionally being used to validate real-user comprehension, repeat use, and workout-flow usefulness.

---

## Future Improvements

Possible post-MVP directions:

- PWA / standalone install experience
- authentication and cloud sync
- controlled exercise substitutions that preserve movement role and cycle logic
- custom plan building
- rest timer
- deeper training history and analytics
- training-history charts
- machine setup guidance
- rest/LISS module
- improved desktop layout
- refreshed portfolio screenshot gallery and case study
- automated test coverage

These are intentionally outside the current local-first MVP scope.

Any future move into payments, subscriptions, supporter/tip flows, cloud accounts, analytics, health integrations, AI-generated coaching, or deliberate new geographic targeting should trigger a fresh product, privacy, safety, and release-readiness review.

---

## What This Project Demonstrates

This project was built as a complete product-style MVP, not only as a UI prototype or workout logging demo.

### Product and UX thinking

- translating training-domain rules into a clear user flow
- defining one structured system with two plan options
- combining prescribed structure with controlled schedule flexibility
- designing for real-life interruptions and partial workouts
- keeping the current and next meaningful actions visible
- separating essential workout information from optional deeper education
- using contextual guidance and progressive disclosure
- modeling honest partial completion instead of forcing perfect states
- maintaining a clear MVP boundary around local-first behavior
- preparing a real product for limited external validation

### Frontend architecture

- React app architecture with route-based screens
- Context + reducer state management
- separation of static source data and runtime user progress
- reducer-driven workout lifecycle transitions
- versioned localStorage persistence and hydration
- isolated validation of malformed stored plan progress
- conservative previous-value carry-over logic
- explicit completion modeling through performed-set checkboxes
- route-safe active, finished, upcoming, and invalid states
- separate safety acknowledgement persistence
- reusable UI primitives and mobile-first interface design

### Delivery and engineering discipline

- structured source-of-truth project documentation
- staged MVP development
- final release-gate auditing
- dependency and Hosting security review
- accessibility regression smoke
- lint, build, and audit verification
- Firebase Hosting preview validation
- GitHub Actions CI
- explicit scope decisions, accepted limitations, and post-MVP boundaries

---

## License

No open-source license has been selected for Cycle Coach.

This repository is shared for review and portfolio purposes. No open-source license is granted by this repository; third-party dependencies remain governed by their own licenses.