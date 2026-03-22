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

Implemented so far:

- Vite + React project setup
- Tailwind CSS configuration
- base folder structure
- shared layout shell
- routing for all MVP screens
- shared UI structure for cards, sections, and buttons
- placeholder navigation between screens
- naming convention for plans, days, and core blocks

Current result:

- the app boots correctly
- all main routes exist
- placeholder screens render without errors
- the foundation shell is clickable

### Next step

Phase 2 — Static content and screen structure

Planned next:

- static data for both plans
- static day data for D1–D6
- static exercise/core/warm-up/guide content
- real static screen layouts based on the confirmed MVP screen map

## Tech stack

- React
- Vite
- Tailwind CSS
- React Router

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

## Current implemented foundation

- `App.jsx -> AppRouter` thin entry structure
- shared layout primitives:
  - `AppShell`
  - `ScreenHeader`
  - `SectionCard`
- shared navigation/button primitives:
  - `PrimaryButton`
  - `SecondaryButton`
  - `BackButton`
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
