import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createServer } from "vite";

import {
  getWorkoutProgress,
  getClosedDayPresentation,
} from "../src/utils/runtime/workoutProgressHelpers.js";

// Run with: node tests/workoutProgress.test.js
// Use the existing Vite transform for JSX and extensionless application imports.
// These checks exercise reducers and server-rendered content, not browser effects.
let vite;
let appReducer, actions, appInitialState, AppStateContext;
let getDayDetails, getDayDetailsByPlanId, getExercisesForDay;
let getCoreBlockById, getCoreExercisesByIds, getCycleSummary;
let getMissingValueWarningSummary;
let DayPage, ExercisePage, CorePage, CyclePage, FinishDaySheet;
after(() => vite?.close());
before(async () => {
  vite = await createServer({
    root: fileURLToPath(new URL("../", import.meta.url)),
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: "custom",
  });
  const load = (path) => vite.ssrLoadModule(`/src/${path}`);
  [
    { appReducer },
    { APP_ACTIONS: actions },
    { appInitialState },
    { AppStateContext },
    { getDayDetails, getDayDetailsByPlanId },
    { getExercisesForDay },
    { getCoreBlockById, getCoreExercisesByIds },
    { getCycleSummary },
    { getMissingValueWarningSummary },
    { default: DayPage },
    { default: ExercisePage },
    { default: CorePage },
    { default: CyclePage },
    { default: FinishDaySheet },
  ] = await Promise.all([
    "state/appReducer.js",
    "state/appActions.js",
    "state/appInitialState.js",
    "state/AppStateContext.js",
    "data/dayDetails/index.js",
    "data/exercises/index.js",
    "data/core/index.js",
    "utils/runtime/cycleSummaryHelpers.js",
    "utils/runtime/missingValueWarningHelpers.js",
    "pages/DayPage.jsx",
    "pages/ExercisePage.jsx",
    "pages/CorePage.jsx",
    "pages/CyclePage.jsx",
    "components/day/FinishDaySheet.jsx",
  ].map(load));
});

function workout(planId, dayId = "d1") {
  let state = structuredClone(appInitialState);
  const send = (type, payload = {}) => {
    state = appReducer(state, { type, payload: { planId, dayId, ...payload } });
  };
  const ensureDay = (id) => {
    const dayDetails = getDayDetails(planId, id);
    send(actions.ENSURE_DAY_LOG, {
      dayDetails,
      exercises: getExercisesForDay(planId, dayDetails.exerciseIds),
    });
  };
  send(actions.START_PLAN_CYCLE, { startedAt: "2026-10-31T10:00:00Z" });
  ensureDay("d1");
  if (dayId === "d2") {
    send(actions.FINISH_DAY, { dayId: "d1", finishedAt: "2026-10-31T10:01:00Z" });
    ensureDay("d2");
  }
  const details = getDayDetails(planId, dayId);
  const cycle = () => {
    const progress = state.progressByPlan[planId];
    return progress.cycles[progress.currentCycleNumber];
  };
  const day = () => cycle().dayLogs[dayId];
  const progress = () => getWorkoutProgress(day(), details.exerciseIds);
  const exerciseId = details.exerciseIds[0];
  const toggle = (id = exerciseId, setIndex = 1) =>
    send(actions.TOGGLE_EXERCISE_SET_DONE, { exerciseId: id, setIndex });
  const closeDay = () =>
    send(actions.FINISH_DAY, { finishedAt: "2026-10-31T11:00:00Z" });
  const coreBlock = getCoreBlockById(details.coreBlockId);
  const coreExercises = getCoreExercisesByIds(coreBlock?.exerciseIds);
  const ensureCore = () =>
    send(actions.ENSURE_CORE_BLOCK_LOG, { coreBlock, coreExercises });
  const render = (Page, path, url) => renderToStaticMarkup(
    h(AppStateContext.Provider, { value: { state, dispatch: send, isPersistenceAvailable: true } },
      h(MemoryRouter, { initialEntries: [url] },
        h(Routes, null, h(Route, { path, element: h(Page) }))),
    ),
  );
  const renderDay = (id = dayId) => render(DayPage, "/plan/:planId/day/:dayId", `/plan/${planId}/day/${id}`);
  const renderExercise = (id = dayId, ex = exerciseId) => render(ExercisePage,
    "/plan/:planId/day/:dayId/exercise/:exerciseId", `/plan/${planId}/day/${id}/exercise/${ex}`);
  const renderCore = (id = dayId) => render(CorePage,
    "/plan/:planId/day/:dayId/core/:coreId", `/plan/${planId}/day/${id}/core/${getDayDetails(planId, id).coreBlockId}`);
  const renderCycle = () => render(CyclePage, "/plan/:planId/cycle", `/plan/${planId}/cycle`);
  const renderFinish = () => renderToStaticMarkup(h(FinishDaySheet, {
    dayDetails: details,
    progress: progress(),
    hasCoreBlock: Boolean(coreBlock),
    missingValueWarningSummary: getMissingValueWarningSummary({ dayLog: day(), coreExercises }),
  }));
  return { send, ensureDay, cycle, day, details, progress, exerciseId, toggle,
    closeDay, ensureCore, coreExercises, renderDay, renderExercise, renderCore,
    renderCycle, renderFinish, state: () => state };
}

for (const planId of ["bulk-pro", "cut-pro"]) {
  test(`${planId}: partial main work is visible on Day, Finish Day and Cycle`, () => {
    const w = workout(planId);
    w.toggle();
    assert.equal(w.progress().performedMainSetCount, 1);
    assert.equal(w.progress().completedExerciseCount, 0);
    assert.match(w.renderDay(), /1 main set performed/);
    assert.match(w.renderDay(), /0\/8 exercises complete/);
    assert.match(w.renderDay(), /Next · Partial/);
    assert.match(w.renderFinish(), /1 main set performed/);
    assert.match(w.renderFinish(), /0\/8 main exercises complete/);
    assert.match(w.renderFinish(), /Baseline heads-up/);
    w.toggle(w.details.exerciseIds[1]);
    assert.equal(w.progress().performedMainSetCount, 2);
    assert.equal(w.progress().completedExerciseCount, 0);
    assert.match(w.renderFinish(), /2 main sets performed/);
    w.closeDay();
    assert.match(w.renderCycle(), /Closed partial · 2 main sets performed/);
  });

  test(`${planId}: entered values and closing never count as performed work`, () => {
    const w = workout(planId);
    w.send(actions.UPDATE_EXERCISE_SET_FIELD, {
      exerciseId: w.exerciseId, setIndex: 1, field: "weight", value: "50",
    });
    w.send(actions.MARK_EXERCISE_CLOSED, { exerciseId: w.exerciseId, closedAt: "closed" });
    assert.equal(w.progress().performedMainSetCount, 0);
    assert.equal(w.progress().completedExerciseCount, 0);
    assert.match(w.renderDay(), /0 main sets performed/);
    assert.match(w.renderFinish(), /No performed sets yet/);
    assert.match(w.renderExercise(), />Closed</);
    w.closeDay();
    assert.match(w.renderCycle(), /Closed · No sets performed/);
  });

  test(`${planId}: a full exercise counts once and is skipped without explicit close`, () => {
    const w = workout(planId);
    const sets = w.day().mainExerciseLogs[w.exerciseId].sets;
    sets.forEach((set) => w.toggle(w.exerciseId, set.setIndex));
    assert.equal(w.progress().completedExerciseCount, 1);
    assert.equal(w.progress().performedMainSetCount, sets.length);
    assert.equal(w.day().mainExerciseLogs[w.exerciseId].closedAt, null);
    assert.match(w.renderExercise(), />Complete</);
    assert.match(w.renderDay(), /1\/8 exercises complete/);
    assert.equal(
      w.renderDay().match(/href="([^"]+)"[^>]*>Start exercise/)?.[1],
      `/plan/${planId}/day/d1/exercise/${w.details.exerciseIds[1]}`,
    );
    w.closeDay();
    assert.equal(getClosedDayPresentation(w.progress()).statusDetail, `${sets.length} main sets performed`);
  });

  test(`${planId}: reopening a closed partial exercise offers return, not finish`, () => {
    const w = workout(planId);
    w.toggle();
    w.send(actions.MARK_EXERCISE_CLOSED, { exerciseId: w.exerciseId, closedAt: "closed" });
    const before = JSON.stringify(w.state());
    const html = w.renderExercise();
    assert.match(html, /Closed partial/);
    assert.match(html, /Return to day/);
    assert.doesNotMatch(html, /Finish exercise/);
    assert.match(w.renderDay(), /Closed partial/);
    assert.equal(
      w.renderDay().match(/href="([^"]+)"[^>]*>Start exercise/)?.[1],
      `/plan/${planId}/day/d1/exercise/${w.details.exerciseIds[1]}`,
    );
    assert.equal(JSON.stringify(w.state()), before);
  });

  test(`${planId}: fully performed main work is complete even without close timestamps`, () => {
    const w = workout(planId);
    Object.entries(w.day().mainExerciseLogs).forEach(([id, log]) => {
      log.sets.forEach((set) => w.toggle(id, set.setIndex));
    });
    assert.match(w.renderDay(), /All main exercises are complete or closed/);
    assert.match(w.renderCycle(), /Review day/);
    assert.ok(Object.values(w.day().mainExerciseLogs).every((log) => log.closedAt === null));
    w.closeDay();
    assert.match(w.renderCycle(), /Closed · Main complete/);
    assert.equal(getClosedDayPresentation(w.progress()).evidenceState, "complete");
    // Done-only work stays distinct from End Cycle's useful-value criterion.
    const recap = getCycleSummary({ cycle: w.cycle(), dayDetailsList: [w.details] });
    assert.equal(recap.loggedMainExercisesCount, 0);
  });

  test(`${planId}: Core-only work remains separate and is acknowledged after closing`, () => {
    const w = workout(planId, "d2");
    w.ensureCore();
    w.send(actions.TOGGLE_CORE_SET_DONE, { coreExerciseId: w.coreExercises[0].id, setIndex: 1 });
    w.send(actions.MARK_CORE_BLOCK_CLOSED, { closedAt: "closed" });
    assert.match(w.renderCore(), /Closed partial/);
    assert.match(w.renderCore(), /Return to day/);
    assert.doesNotMatch(w.renderCore(), /Finish core block/);
    assert.equal(w.progress().completedExerciseCount, 0);
    assert.match(w.renderFinish(), /0 main sets performed/);
    assert.match(w.renderFinish(), /1 Core set performed/);
    assert.doesNotMatch(w.renderFinish(), /No performed sets yet/);
    w.closeDay();
    const html = w.renderCycle();
    assert.match(html, /Closed · 0 main sets performed/);
    assert.match(html, /1 Core set performed/);
    assert.match(html, /aria-label="D2[^"]*0 main sets performed, 1 Core set performed"/);
  });

  test(`${planId}: an empty closed day remains valid and honest`, () => {
    const w = workout(planId);
    assert.match(w.renderFinish(), /0 main sets performed/);
    assert.match(w.renderFinish(), /No performed sets yet/);
    w.closeDay();
    assert.equal(w.cycle().currentDayId, "d2");
    assert.match(w.renderCycle(), /Closed · No sets performed/);
  });

  test(`${planId}: finished-day main and Core logs remain editable`, () => {
    const w = workout(planId, "d2");
    w.ensureCore();
    w.toggle();
    w.closeDay();
    const finishedAt = w.day().finishedAt;
    w.send(actions.UPDATE_EXERCISE_SET_FIELD, {
      exerciseId: w.exerciseId, setIndex: 1, field: "weight", value: "60",
    });
    w.send(actions.UPDATE_CORE_SET_FIELD, {
      coreExerciseId: w.coreExercises[0].id, setIndex: 1, field: "rir", value: "2",
    });
    assert.equal(w.day().finishedAt, finishedAt);
    assert.equal(w.cycle().currentDayId, "d3");
    assert.match(w.renderExercise(), /Saved log/);
    assert.match(w.renderExercise(), /value="60"/);
    assert.match(w.renderExercise(), /Return to day/);
    assert.match(w.renderCore(), /Saved log/);
    assert.match(w.renderCore(), /value="2"/);
    assert.match(w.renderCore(), /Return to day/);
    assert.equal(w.progress().performedMainSetCount, 1);
    assert.equal(w.progress().performedCoreSetCount, 0);
  });

  test(`${planId}: upcoming pages render preview content without editable controls`, () => {
    const w = workout(planId);
    const before = JSON.stringify(w.state());
    assert.match(w.renderDay("d2"), /Upcoming training day/);
    const exercise = w.renderExercise("d2", getDayDetails(planId, "d2").exerciseIds[0]);
    const core = w.renderCore("d2");
    for (const html of [exercise, core]) {
      assert.match(html, /Read-only preview/);
      assert.doesNotMatch(html, /<input|aria-pressed=|Finish exercise|Finish core block|Return to day/);
    }
    assert.equal(JSON.stringify(w.state()), before);
    assert.equal(w.cycle().dayLogs.d2, undefined);
  });

  test(`${planId}: cycle advancement and main/Core carry-over keep new sets unchecked`, () => {
    const w = workout(planId, "d2");
    w.ensureCore();
    w.send(actions.UPDATE_EXERCISE_SET_FIELD, {
      exerciseId: w.exerciseId, setIndex: 1, field: "weight", value: "55",
    });
    w.toggle();
    w.send(actions.UPDATE_CORE_SET_FIELD, {
      coreExerciseId: w.coreExercises[0].id, setIndex: 1, field: "rir", value: "2",
    });
    w.send(actions.TOGGLE_CORE_SET_DONE, { coreExerciseId: w.coreExercises[0].id, setIndex: 1 });
    for (const day of getDayDetailsByPlanId(planId).slice(1)) {
      w.ensureDay(day.id);
      w.send(actions.FINISH_DAY, { dayId: day.id, finishedAt: "finished" });
    }
    assert.equal(w.cycle().completedAt, "finished");
    w.send(actions.START_PLAN_CYCLE, { startedAt: "next-cycle" });
    assert.equal(w.cycle().currentDayId, "d1");
    assert.deepEqual(w.cycle().dayLogs, {});
    w.ensureDay("d1");
    w.send(actions.FINISH_DAY, { dayId: "d1", finishedAt: "finished" });
    w.ensureDay("d2");
    w.ensureCore();
    assert.equal(w.day().mainExerciseLogs[w.exerciseId].sets[0].weight, "55");
    assert.equal(w.day().coreBlockLog.coreExerciseLogs[w.coreExercises[0].id].sets[0].rir, "2");
    assert.equal(w.progress().performedMainSetCount, 0);
    assert.equal(w.progress().performedCoreSetCount, 0);
    assert.equal(w.day().finishedAt, null);
    assert.match(w.renderExercise(), /Previous values loaded/);
  });
}
