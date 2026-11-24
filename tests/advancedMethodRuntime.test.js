import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";
import { advancedMethodDefinitions, getMethodDefinition } from "../src/data/advancedMethods/definitions.js";
import { deriveMethodState, transitionMethodLog } from "../src/utils/runtime/advancedMethodHelpers.js";
import { createAppStatePersistence, WORKOUT_STORAGE_KEYS } from "../src/storage/appStateStorage.js";

let vite, appReducer, actions, initialState, findAttempt;
let getPlan, getDay, getDays, getExercises, getCoreBlock, getCoreExercises, getProgress, getSummary, getCarryOver;
before(async () => {
  vite = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)),
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] }, appType: "custom" });
  const load = (path) => vite.ssrLoadModule(`/src/${path}`);
  [
    { appReducer }, { APP_ACTIONS: actions }, { appInitialState: initialState },
    { findPreviousCompatibleMethodAttempt: findAttempt }, { getPlanById: getPlan },
    { getDayDetails: getDay, getDayDetailsByPlanId: getDays }, { getExercisesForDay: getExercises },
    { getCoreBlockById: getCoreBlock, getCoreExercisesByIds: getCoreExercises },
    { getWorkoutProgress: getProgress }, { getCycleSummary: getSummary }, { getLatestCarryOverFieldValue: getCarryOver },
  ] = await Promise.all([
    "state/appReducer.js", "state/appActions.js", "state/appInitialState.js", "utils/runtime/advancedMethodHistoryHelpers.js",
    "data/plans/index.js", "data/dayDetails/index.js", "data/exercises/index.js", "data/core/index.js",
    "utils/runtime/workoutProgressHelpers.js", "utils/runtime/cycleSummaryHelpers.js", "utils/runtime/carryOverHelpers.js",
  ].map(load));
});
after(() => vite?.close());

const pilots = [
  { exerciseId: "incline-db-press", dayId: "d1", type: "rest-pause", setIndex: 3 },
  { exerciseId: "face-away-cable-curl", dayId: "d4", type: "rest-pause", setIndex: 1 },
  { exerciseId: "cable-stretch-fly", dayId: "d1", type: "iso-stretch", setIndex: 1 },
].map(({ exerciseId, dayId, type, setIndex }) => {
  const planId = "bulk-pro";
  const definitionId = `${planId}/${exerciseId}/${type}`;
  const definition = getMethodDefinition({ planId, exerciseId, definitionId, revision: 1 });
  assert.ok(definition, `Missing runtime pilot definition: ${definitionId} revision 1`);
  assert.equal(definition.type, type, `${definitionId}: unexpected method type`);
  assert.equal(definition.prescribedSetCount, setIndex, `${definitionId}: unexpected prescribed set count`);
  assert.equal(definition.appliesTo, "last", `${definitionId}: expected the last set only`);
  return { definition, planId, dayId, exerciseId, setIndex };
});
const incline = pilots[0];
const choice = (value) => ({ type: "set-choice", choice: value });
const metric = (value = "3", phaseId = "extra-reps", field = "reps") => ({ type: "set-metric", phaseId, field, value });
const execution = (value = "performed", phaseId = "extra-reps") => ({ type: "set-execution", phaseId, execution: value });
function freeze(value) {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const cycle = (state, planId = "bulk-pro") => {
  const progress = state.progressByPlan[planId];
  return progress.cycles[progress.currentCycleNumber];
};
function start(state = structuredClone(initialState), startedAt = "2026-11-16T10:00:00Z", planId = "bulk-pro") {
  return appReducer(state, { type: actions.START_PLAN_CYCLE, payload: { planId, startedAt } });
}
function ensure(state, dayId = "d1", planId = "bulk-pro") {
  const dayDetails = getDay(planId, dayId);
  return appReducer(state, { type: actions.ENSURE_DAY_LOG, payload: {
    planId, dayDetails, exercises: getExercises(planId, dayDetails.exerciseIds),
  } });
}
function workout(pilot = incline) {
  const state = ensure(start(undefined, undefined, pilot.planId), pilot.dayId, pilot.planId);
  cycle(state, pilot.planId).currentDayId = pilot.dayId;
  return state;
}
const rowInCycle = (current, pilot = incline) => current.dayLogs[pilot.dayId].mainExerciseLogs[pilot.exerciseId].sets
  .find((row) => row.setIndex === pilot.setIndex);
const row = (state, pilot = incline) => rowInCycle(cycle(state, pilot.planId), pilot);
function payload(state, change = metric(), pilot = incline) {
  const current = cycle(state, pilot.planId);
  return { planId: pilot.planId, cycleNumber: current.cycleNumber, cycleStartedAt: current.startedAt,
    dayId: pilot.dayId, exerciseId: pilot.exerciseId, setIndex: pilot.setIndex, change };
}
const update = (state, change, pilot = incline) => appReducer(state,
  { type: actions.UPDATE_EXERCISE_METHOD, payload: payload(state, change, pilot) });
function reject(state, value) {
  const before = JSON.stringify(state);
  assert.equal(appReducer(freeze(state), { type: actions.UPDATE_EXERCISE_METHOD, payload: value }), state);
  assert.equal(JSON.stringify(state), before);
}

for (const pilot of pilots) {
  test(`${pilot.exerciseId}: choice, metrics and confirmation edit only the optional method record`, () => {
    let state = freeze(workout(pilot));
    const original = state;
    state = update(state, choice("record"), pilot);
    assert.deepEqual(row(state, pilot).methodLog, { choice: "record", phases: {} });
    const phase = pilot.definition.phases[0];
    state = update(freeze(state), metric("0", phase.phaseId, phase.requiredMetrics[0]), pilot);
    assert.equal(deriveMethodState(pilot.definition, row(state, pilot).methodLog).status, "draft");
    state = update(freeze(state), execution("performed", phase.phaseId), pilot);
    const derived = deriveMethodState(pilot.definition, row(state, pilot).methodLog);
    assert.equal(derived.status, "performed");
    assert.equal(derived.numericComplete, true);
    assert.equal(derived.targetComparisons[phase.phaseId][phase.requiredMetrics[0]], "below");
    assert.equal(row(state, pilot).isDone, false);
    const stripped = structuredClone(state);
    delete row(stripped, pilot).methodLog;
    assert.deepEqual(stripped, original);
    assert.ok(!Object.hasOwn(row(original, pilot), "methodLog"));
  });
}

test("skip keeps inactive phases, rejects phase edits, and resume restores confirmation", () => {
  let state = update(workout(), execution());
  const recorded = row(state).methodLog;
  state = update(freeze(state), choice("skip"));
  assert.deepEqual(row(state).methodLog.phases, recorded.phases);
  assert.equal(deriveMethodState(incline.definition, row(state).methodLog).status, "skipped");
  reject(state, payload(state, metric()));
  reject(state, payload(state, execution("partial")));
  state = update(state, choice("record"));
  assert.deepEqual(row(state).methodLog, recorded);
  assert.equal(deriveMethodState(incline.definition, row(state).methodLog).numericComplete, false);
  state = update(state, metric("3"));
  state = update(state, metric(""));
  assert.equal(deriveMethodState(incline.definition, row(state).methodLog).status, "performed");
  assert.equal(deriveMethodState(incline.definition, row(state).methodLog).numericComplete, false);
});

test("first confirmation, first metric and initial skip never require a base Done", () => {
  for (const change of [execution("partial"), execution(), metric(), choice("skip")]) {
    const state = workout();
    const next = update(freeze(state), change);
    assert.notEqual(next, state);
    assert.equal(row(next).isDone, false);
    assert.ok(row(next).methodLog);
  }
});

for (const [field, values] of [
  ["planId", [undefined, null, 1, "", "unknown", "cut-pro", "__proto__"]],
  ["cycleNumber", [undefined, "1", 0, -1, 1.5, 2, Number.MAX_SAFE_INTEGER + 1, Infinity]],
  ["cycleStartedAt", [undefined, null, 1, "", "stale-start", "2026-11-16T10:00:00Z "]],
  ["dayId", [undefined, null, 1, "", "d2", "unknown", "__proto__"]],
  ["exerciseId", [undefined, null, 1, "", "smith-bench-press", "face-away-cable-curl", "unknown"]],
  ["setIndex", [undefined, "3", 0, -1, 1, 2, 4, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1]],
]) {
  test(`wrong or malformed ${field} is rejected without changing valid prior method data`, () => {
    const state = update(workout(), metric());
    for (const value of values) reject(state, { ...payload(state), [field]: value });
    const missing = payload(state); delete missing[field]; reject(state, missing);
  });
}

test("payload accepts only declared data fields, never whole logs, definitions or bindings", () => {
  const state = workout();
  for (const value of [undefined, null, [], "record", {}, { ...payload(state), methodLog: {} },
    { ...payload(state), definition: incline.definition }, { ...payload(state), binding: {} },
    Object.create(payload(state)), { ...payload(state), [Symbol("extra")]: true },
    Object.defineProperty(payload(state), "hidden", { value: true }),
    { ...payload(state), get change() { throw Error("getter must not execute"); } }]) reject(state, value);
});

test("invalid transitions preserve both an absent record and a previous valid record", () => {
  for (const state of [workout(), update(workout(), metric())]) {
    for (const change of [null, [], "record", {}, choice("unknown"), execution("done"), execution("performed", "unknown"),
      metric("31"), metric("-1"), metric("1.5"), metric("1,5"), metric("01"), metric(" 1"), metric("1e1"),
      metric(3), metric("2", "extra-reps", "weight"), metric("2", "unknown"),
      metric("1000", "extra-reps", "restSeconds"), { type: "set-metric", phaseId: "extra-reps", field: "reps" },
      { ...metric(), methodLog: {} }, { ...choice("record"), definition: {} },
      { get type() { throw Error("getter must not execute"); } }]) reject(state, payload(state, change));
  }
});

test("seconds use the accepted 999 upper bound without deriving execution from numbers", () => {
  const stretch = pilots[2];
  let state = update(workout(stretch), metric("999", "loaded-stretch", "durationSeconds"), stretch);
  assert.equal(deriveMethodState(stretch.definition, row(state, stretch).methodLog).status, "draft");
  reject(state, payload(state, metric("1000", "loaded-stretch", "durationSeconds"), stretch));
  state = update(state, metric("", "loaded-stretch", "durationSeconds"), stretch);
  state = update(state, execution("performed", "loaded-stretch"), stretch);
  assert.equal(deriveMethodState(stretch.definition, row(state, stretch).methodLog).numericComplete, false);
});

test("stale actions fail after advancement and after reset/restarted Cycle 1", () => {
  const first = workout();
  const stale = payload(first);
  const advanced = ensure(start(freeze(first), "2026-11-17T10:00:00Z"));
  reject(advanced, stale);
  assert.equal(Object.hasOwn(row(advanced), "methodLog"), false);
  const reset = appReducer(advanced, { type: actions.RESET_APP_STATE });
  const restarted = ensure(start(reset, "2026-11-18T10:00:00Z"));
  assert.equal(cycle(restarted).cycleNumber, 1);
  reject(restarted, stale);
  assert.ok(row(update(restarted, metric())).methodLog);
});

test("unstarted plans and archived-only action contexts cannot receive method updates", () => {
  const valid = payload(workout());
  reject(structuredClone(initialState), valid);
  const archived = workout();
  const stale = payload(archived);
  const next = start(freeze(archived), "next-start");
  reject(next, stale);
  assert.deepEqual(cycle(next).dayLogs, {});
});

test("selected plan preference is not ownership; valid edits can target another active plan", () => {
  let state = workout();
  state = start(state, "cut-start", "cut-pro");
  state = ensure(state, "d1", "cut-pro");
  assert.equal(state.selectedPlanId, "cut-pro");
  assert.ok(row(update(freeze(state), metric())).methodLog);
  const cutPilot = { ...incline, planId: "cut-pro" };
  reject(state, payload(state, metric(), cutPilot));
});

for (const [label, mutate] of [
  ["wrong parent plan", (c) => { c.planId = "cut-pro"; }],
  ["wrong cycle identity", (c) => { c.cycleNumber = 2; }],
  ["unknown current day", (c) => { c.currentDayId = "unknown"; }],
  ["missing day log", (c) => { delete c.dayLogs.d1; }],
  ["wrong day identity", (c) => { c.dayLogs.d1.dayId = "d2"; }],
  ["missing main log", (c) => { delete c.dayLogs.d1.mainExerciseLogs["incline-db-press"]; }],
  ["wrong exercise identity", (c) => { c.dayLogs.d1.mainExerciseLogs["incline-db-press"].exerciseId = "cable-stretch-fly"; }],
  ["legacy cycle", (c) => { delete c.methodBindings; }],
  ["unknown schema", (c) => { c.methodBindings.version = 99; }],
  ["malformed container", (c) => { c.methodBindings = null; }],
  ["missing binding", (c) => { delete c.methodBindings.exercises["incline-db-press"]; }],
  ["malformed binding", (c) => { c.methodBindings.exercises["incline-db-press"] = []; }],
  ["unknown revision", (c) => { c.methodBindings.exercises["incline-db-press"].revision = 99; }],
  ["wrong frozen count", (c) => { c.methodBindings.exercises["incline-db-press"].setCount = 2; }],
  ["wrong binding day", (c) => { c.methodBindings.exercises["incline-db-press"].dayId = "d4"; }],
  ["short scaffold", (c) => { c.dayLogs.d1.mainExerciseLogs["incline-db-press"].sets.pop(); }],
  ["duplicate scaffold", (c) => { c.dayLogs.d1.mainExerciseLogs["incline-db-press"].sets[0].setIndex = 3; }],
  ["incompatible scaffold", (c) => { c.dayLogs.d1.mainExerciseLogs["incline-db-press"].sets[0].setIndex = 4; }],
]) {
  test(`method reducer rejects ${label} without repair or partial changes`, () => {
    const state = workout(); const edit = payload(state);
    mutate(cycle(state)); reject(state, edit);
  });
}

test("malformed previous method records remain intact rather than being replaced", () => {
  for (const previous of [undefined, null, [], {}, { choice: "record", phases: [] },
    { choice: "invalid", phases: {} }, { choice: "record", phases: { unknown: { execution: "performed" } } },
    { choice: "record", phases: { "extra-reps": { execution: "done" } } },
    { choice: "record", phases: { "extra-reps": { execution: "performed", reps: "500" } } },
    { choice: "record", phases: {}, futureData: "preserve" }]) {
    const state = workout(); row(state).methodLog = previous;
    reject(state, payload(state, choice("skip")));
    assert.equal(row(state).methodLog, previous);
  }
});

test("a precreated upcoming log never grants method edits, even with a finish timestamp", () => {
  const curl = pilots[1];
  for (const finishedAt of [null, "synthetic-precreated-finish"]) {
    const state = ensure(workout(), "d4");
    cycle(state).dayLogs.d4.finishedAt = finishedAt;
    reject(state, payload(state, choice("record"), curl));
  }
});

test("finished days stay editable within the current cycle without changing lifecycle or Core", () => {
  let state = ensure(workout(), "d2");
  const block = getCoreBlock(getDay("bulk-pro", "d2").coreBlockId);
  state = appReducer(state, { type: actions.ENSURE_CORE_BLOCK_LOG, payload: {
    planId: "bulk-pro", dayId: "d2", coreBlock: block, coreExercises: getCoreExercises(block.exerciseIds),
  } });
  state = appReducer(state, { type: actions.FINISH_DAY, payload: { planId: "bulk-pro", dayId: "d1", finishedAt: "closed-day" } });
  cycle(state).dayLogs.d1.mainExerciseLogs[incline.exerciseId].closedAt = "closed-exercise";
  const original = freeze(state);
  const beforeProgress = getProgress(cycle(state).dayLogs.d1, getDay("bulk-pro", "d1").exerciseIds);
  const beforeSummary = getSummary({ cycle: cycle(state), dayDetailsList: getDays("bulk-pro") });
  const next = update(state, execution());
  assert.notEqual(next, state);
  assert.equal(cycle(next).dayLogs.d2, cycle(original).dayLogs.d2);
  assert.equal(cycle(next).methodBindings, cycle(original).methodBindings);
  const originalSets = cycle(original).dayLogs.d1.mainExerciseLogs[incline.exerciseId].sets;
  const nextSets = cycle(next).dayLogs.d1.mainExerciseLogs[incline.exerciseId].sets;
  assert.equal(nextSets[0], originalSets[0]); assert.equal(nextSets[1], originalSets[1]);
  const stripped = structuredClone(next); delete row(stripped).methodLog;
  assert.deepEqual(stripped, original);
  assert.deepEqual(getProgress(cycle(next).dayLogs.d1, getDay("bulk-pro", "d1").exerciseIds), beforeProgress);
  assert.deepEqual(getSummary({ cycle: cycle(next), dayDetailsList: getDays("bulk-pro") }), beforeSummary);
  assert.equal(row(next).isDone, false);
});

test("closed current cycles and out-of-order complete row arrays remain supported", () => {
  const state = workout();
  cycle(state).currentDayId = "d6"; cycle(state).completedAt = "closed-cycle";
  cycle(state).dayLogs.d1.finishedAt = "finished";
  cycle(state).dayLogs.d1.mainExerciseLogs[incline.exerciseId].sets.reverse();
  const next = update(freeze(state), metric());
  assert.ok(row(next).methodLog);
  assert.equal(cycle(next).completedAt, "closed-cycle");
  assert.deepEqual(cycle(next).dayLogs.d1.mainExerciseLogs[incline.exerciseId].sets.map((r) => r.setIndex), [3, 2, 1]);
});

test("base Done/undo, closure, new cycles and standard carry-over never transfer or erase method data", () => {
  let state = workout();
  Object.assign(row(state), { weight: "24", reps: "10", rir: "2" });
  state = update(state, execution()); const method = row(state).methodLog;
  const toggle = { type: actions.TOGGLE_EXERCISE_SET_DONE,
    payload: { planId: "bulk-pro", dayId: "d1", exerciseId: incline.exerciseId, setIndex: 3 } };
  state = appReducer(freeze(state), toggle);
  state = appReducer(freeze(state), toggle);
  assert.equal(row(state).isDone, false); assert.equal(row(state).methodLog, method);
  state = appReducer(state, { type: actions.UPDATE_EXERCISE_SET_FIELD,
    payload: { planId: "bulk-pro", dayId: "d1", exerciseId: incline.exerciseId, setIndex: 3, field: "weight", value: "24" } });
  assert.equal(row(state).methodLog, method);
  state = appReducer(state, toggle);
  const first = cycle(state);
  state = ensure(start(freeze(state), "next-cycle"));
  assert.deepEqual(row(state), { setIndex: 3, weight: "24", reps: "10", rir: "2", isDone: false });
  const context = { cycles: state.progressByPlan["bulk-pro"].cycles, currentCycleNumber: 2,
    dayId: "d1", exerciseId: incline.exerciseId, setIndex: 3, field: "weight" };
  const previous = getCarryOver(context);
  const next = update(freeze(state), metric("0"));
  assert.equal(getCarryOver({ ...context, cycles: next.progressByPlan["bulk-pro"].cycles }), previous);
  assert.equal(next.progressByPlan["bulk-pro"].cycles[1], first);
  assert.equal(rowInCycle(first).methodLog, method);
});

function confirmed(pilot = incline, value = "3", status = "performed") {
  const phase = pilot.definition.phases[0];
  let log = transitionMethodLog(pilot.definition, undefined, metric(value, phase.phaseId, phase.requiredMetrics[0]));
  return transitionMethodLog(pilot.definition, log, execution(status, phase.phaseId));
}
function history(pilot = incline, currentCycleNumber = 3) {
  const previous = structuredClone(cycle(workout(pilot), pilot.planId));
  const current = structuredClone(previous);
  current.cycleNumber = currentCycleNumber; current.startedAt = "current-start"; current.dayLogs = {};
  Object.assign(rowInCycle(previous, pilot), { weight: "24", reps: "10", rir: "2", methodLog: confirmed(pilot) });
  return { cycles: { 1: previous, [currentCycleNumber]: current }, currentCycleNumber,
    planId: pilot.planId, dayId: pilot.dayId, exerciseId: pilot.exerciseId, setIndex: pilot.setIndex };
}

for (const pilot of pilots) {
  test(`${pilot.exerciseId}: history works before current rows exist and preserves a truthful detached attempt`, () => {
    const context = history(pilot);
    rowInCycle(context.cycles[1], pilot).extraBaseData = { note: "retain" };
    const before = JSON.stringify(context); freeze(context);
    const found = findAttempt(context);
    assert.equal(found.cycleNumber, 1); assert.equal(found.dayId, pilot.dayId);
    assert.equal(found.exerciseId, pilot.exerciseId); assert.equal(found.setIndex, pilot.setIndex);
    assert.equal(found.derived.status, "performed"); assert.equal(found.baseSet.isDone, false);
    assert.equal(found.methodLog.phases[pilot.definition.phases[0].phaseId].execution, "performed");
    assert.deepEqual(found.baseSet.extraBaseData, { note: "retain" });
    assert.equal(Object.hasOwn(found.baseSet, "methodLog"), false);
    found.methodLog.choice = "skip"; found.baseSet.extraBaseData.note = "changed"; found.binding.revision = 99;
    assert.equal(JSON.stringify(context), before);
    assert.deepEqual(context.cycles[context.currentCycleNumber].dayLogs, {});
  });
}

test("history iterates real numeric cycle keys across enormous gaps, not lexical order", () => {
  const context = history(incline, Number.MAX_SAFE_INTEGER);
  context.cycles[9] = structuredClone(context.cycles[1]); context.cycles[9].cycleNumber = 9;
  context.cycles[10] = structuredClone(context.cycles[1]); context.cycles[10].cycleNumber = 10;
  rowInCycle(context.cycles[10]).weight = "30";
  context.cycles["099"] = { ...context.cycles[1], cycleNumber: 99 };
  context.cycles["1e3"] = { ...context.cycles[1], cycleNumber: 1000 };
  context.cycles[11] = { ...context.cycles[1], cycleNumber: 12 };
  const found = findAttempt(freeze(context));
  assert.equal(found.cycleNumber, 10); assert.equal(found.baseSet.weight, "30");
});

test("latest confirmed incomplete attempt wins, with no blending of empty or zero measurements", () => {
  for (const status of ["partial", "performed"]) {
    const context = history(incline, 8);
    context.cycles[5] = structuredClone(context.cycles[1]); context.cycles[5].cycleNumber = 5;
    const latest = rowInCycle(context.cycles[5]);
    Object.assign(latest, { weight: "", reps: "", rir: "", methodLog: confirmed(incline, "", status) });
    latest.methodLog.phases["extra-reps"].restSeconds = "0";
    const found = findAttempt(freeze(context));
    assert.equal(found.cycleNumber, 5); assert.equal(found.baseSet.weight, ""); assert.equal(found.baseSet.reps, "");
    assert.equal(found.methodLog.phases["extra-reps"].reps, "");
    assert.equal(found.methodLog.phases["extra-reps"].restSeconds, "0");
    assert.equal(found.derived.numericComplete, false); assert.equal(found.derived.status, status);
  }
  const zero = history(); rowInCycle(zero.cycles[1]).methodLog = confirmed(incline, "0");
  const found = findAttempt(freeze(zero));
  assert.equal(found.methodLog.phases["extra-reps"].reps, "0");
  assert.equal(found.derived.targetComparisons["extra-reps"].reps, "below");
});

for (const [label, mutate] of [
  ["missing method", (c) => { delete rowInCycle(c).methodLog; }],
  ["skipped retained confirmation", (c) => { rowInCycle(c).methodLog.choice = "skip"; }],
  ["draft numbers", (c) => { rowInCycle(c).methodLog.phases["extra-reps"].execution = "unconfirmed"; }],
  ["invalid metric", (c) => { rowInCycle(c).methodLog.phases["extra-reps"].reps = "500"; }],
  ["invalid phase", (c) => { rowInCycle(c).methodLog.phases = { unknown: { execution: "performed" } }; }],
  ["malformed method", (c) => { rowInCycle(c).methodLog = null; }],
  ["foreign parent plan", (c) => { c.planId = "cut-pro"; }],
  ["unknown schema", (c) => { c.methodBindings.version = 99; }],
  ["unknown revision", (c) => { c.methodBindings.exercises[incline.exerciseId].revision = 99; }],
  ["different definition", (c) => { c.methodBindings.exercises[incline.exerciseId].definitionId = pilots[1].definition.definitionId; }],
  ["wrong count", (c) => { c.methodBindings.exercises[incline.exerciseId].setCount = 2; }],
  ["wrong owner", (c) => { c.methodBindings.exercises[incline.exerciseId].dayId = "d4"; }],
  ["missing binding", (c) => { delete c.methodBindings.exercises[incline.exerciseId]; }],
  ["legacy context", (c) => { delete c.methodBindings; }],
  ["wrong day identity", (c) => { c.dayLogs.d1.dayId = "d2"; }],
  ["wrong exercise identity", (c) => { c.dayLogs.d1.mainExerciseLogs[incline.exerciseId].exerciseId = "other"; }],
  ["duplicate scaffold", (c) => { c.dayLogs.d1.mainExerciseLogs[incline.exerciseId].sets[0].setIndex = 3; }],
  ["short scaffold", (c) => { c.dayLogs.d1.mainExerciseLogs[incline.exerciseId].sets.pop(); }],
  ["invalid base Done", (c) => { rowInCycle(c).isDone = "false"; }],
]) {
  test(`history excludes ${label} and falls back only to one whole compatible attempt`, () => {
    const context = history(incline, 6);
    context.cycles[4] = structuredClone(context.cycles[1]); context.cycles[4].cycleNumber = 4;
    mutate(context.cycles[4]);
    const before = JSON.stringify(context);
    assert.equal(findAttempt(freeze(context)).cycleNumber, 1);
    assert.equal(JSON.stringify(context), before);
    const onlyInvalid = { ...context, cycles: { 4: context.cycles[4], 6: context.cycles[6] } };
    assert.equal(findAttempt(freeze(onlyInvalid)), null);
  });
}

test("current binding is mandatory: history never substitutes a protocol from previous cycles", () => {
  for (const mutate of [(c) => { delete c.methodBindings; }, (c) => { c.methodBindings.version = 99; },
    (c) => { c.methodBindings.exercises[incline.exerciseId].revision = 99; },
    (c) => { c.methodBindings = null; }, (c) => { c.planId = "cut-pro"; },
    (c) => { c.cycleNumber = 1; }]) {
    const context = history(); mutate(context.cycles[3]);
    assert.equal(findAttempt(freeze(context)), null);
  }
  const context = history();
  for (const override of [{ setIndex: 1 }, { setIndex: "3" }, { setIndex: 4 }, { setIndex: -1 },
    { currentCycleNumber: "3" }, { currentCycleNumber: Number.MAX_SAFE_INTEGER + 1 }, { cycles: [] }, { planId: "cut-pro" }]) {
    assert.equal(findAttempt(freeze({ ...context, ...override })), null);
  }
});

test("history requires exact known revisions, even when both share base/phase structure", () => {
  const context = history();
  const definitions = structuredClone(advancedMethodDefinitions);
  definitions.push({ ...structuredClone(definitions[0]), revision: 2 });
  const catalog = { getPlanById: getPlan, getDayDetailsByPlanId: getDays,
    getExercisesByPlanId: (planId) => getDays(planId).flatMap((day) => getExercises(planId, day.exerciseIds)),
    getMethodDefinition: (ref) => definitions.find((definition) =>
      ["planId", "exerciseId", "definitionId", "revision"].every((field) => definition[field] === ref[field])) ?? null };
  context.cycles[3].methodBindings.exercises[incline.exerciseId].revision = 2;
  assert.equal(findAttempt(freeze(context), catalog), null);
  const matching = structuredClone(context); matching.cycles[1].methodBindings.exercises[incline.exerciseId].revision = 2;
  assert.equal(findAttempt(freeze(matching), catalog).cycleNumber, 1);
});

test("unrecognized base/load semantics remain opaque instead of being compared", () => {
  for (const change of [
    (d) => { d.base.semantics = "unknown"; }, (d) => { d.base.loadKind = "assistance"; },
    (d) => { d.base.loadUnit = "unknown"; }, (d) => { d.phases[0].loadRule = "unknown"; },
  ]) {
    const definition = structuredClone(incline.definition); change(definition);
    const catalog = { getPlanById: getPlan, getDayDetailsByPlanId: getDays,
      getExercisesByPlanId: (planId) => getExercises(planId, getDay(planId, "d1").exerciseIds),
      getMethodDefinition: () => definition };
    assert.equal(findAttempt(freeze(history()), catalog), null);
  }
});

test("method records round-trip through the unchanged V2 session and never auto-fill next-cycle rows", () => {
  const state = update(workout(), execution());
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const session = createAppStatePersistence({ getStorage: () => storage });
  assert.equal(session.save(state), true);
  const loaded = createAppStatePersistence({ getStorage: () => storage }).getSnapshot();
  assert.equal(loaded.mode, "ready"); assert.deepEqual(loaded.state, state);
  const next = start(loaded.state, "next-start");
  const progress = next.progressByPlan["bulk-pro"];
  const before = JSON.stringify(next);
  assert.equal(findAttempt({ cycles: progress.cycles, currentCycleNumber: progress.currentCycleNumber,
    planId: "bulk-pro", dayId: "d1", exerciseId: incline.exerciseId, setIndex: 3 }).cycleNumber, 1);
  assert.equal(JSON.stringify(next), before);
  assert.equal(Object.hasOwn(row(ensure(next)), "methodLog"), false);
  assert.equal(values.size, 1); assert.ok(values.has(WORKOUT_STORAGE_KEYS.v2));
});

const cluster = { planId: "bulk-pro", dayId: "d5", exerciseId: "assisted-pull-up-cluster", setIndex: 1 };
const secondCluster = { ...cluster, setIndex: 2 };
const clusterBinding = { definitionId: "bulk-pro/assisted-pull-up-cluster/cluster", revision: 1, dayId: "d5", setCount: 2 };
const clusterDefinition = getMethodDefinition({ ...cluster, ...clusterBinding });
const burst = "additional-burst";
const assistance = (mode, kg) => ({ type: "set-assistance", phaseId: burst, mode, kg });
const clearAssistance = { type: "clear-assistance", phaseId: burst };

function clusterWorkout(previous) {
  const started = start(previous);
  assert.deepEqual(cycle(started).methodBindings.exercises[cluster.exerciseId], clusterBinding);
  const state = getDays(cluster.planId).slice(0, 4).reduce((state, day) => finishDay(state, day.id), started);
  assert.equal(cycle(state).currentDayId, cluster.dayId);
  return ensure(state, cluster.dayId);
}

function finishDay(state, dayId) {
  return appReducer(ensure(state, dayId), { type: actions.FINISH_DAY, payload: {
    planId: cluster.planId, dayId, finishedAt: `closed-${dayId}`,
  } });
}

test("Cluster same checks the displayed KG against the addressed row at dispatch time", () => {
  let state = clusterWorkout();
  const sets = cycle(state).dayLogs.d5.mainExerciseLogs[cluster.exerciseId].sets;
  sets.reverse();
  row(state, cluster).weight = "025.0";
  row(state, secondCluster).weight = "32.5";
  state = update(freeze(state), assistance("same", "25"), cluster);
  const saved = row(state, cluster).methodLog;
  assert.deepEqual(saved.phases[burst].assistance, { mode: "same", kg: "25" });
  assert.equal(row(state, secondCluster).methodLog, undefined);
  reject(state, payload(state, assistance("same", "25"), secondCluster));
  state = update(state, assistance("same", "32.5"), secondCluster);
  assert.deepEqual(row(state, secondCluster).methodLog.phases[burst].assistance, { mode: "same", kg: "32.5" });

  const displayed = payload(state, assistance("same", "25"), cluster);
  state = appReducer(freeze(state), { type: actions.UPDATE_EXERCISE_SET_FIELD,
    payload: { ...cluster, field: "weight", value: "0" } });
  reject(state, displayed);
  assert.equal(row(state, cluster).methodLog, saved);
  state = update(state, assistance("same", "0"), cluster);
  assert.deepEqual(row(state, cluster).methodLog.phases[burst].assistance, { mode: "same", kg: "0" });
});

test("Cluster entered accepts an independent or equal KG, including when same is unavailable", () => {
  for (const weight of [undefined, null, "", "25.", "25,5", "-1", "1000", 25, "25"]) {
    let state = clusterWorkout();
    if (weight === undefined) delete row(state, cluster).weight;
    else row(state, cluster).weight = weight;
    reject(state, payload(state, assistance("same", "32.5"), cluster));
    state = update(state, assistance("entered", "32.5"), cluster);
    assert.deepEqual(row(state, cluster).methodLog.phases[burst].assistance, { mode: "entered", kg: "32.5" });
    if (weight === "25") {
      state = update(state, assistance("entered", "25"), cluster);
      assert.deepEqual(row(state, cluster).methodLog.phases[burst].assistance, { mode: "entered", kg: "25" });
    }
  }
});

test("Cluster skip, resume and clear preserve burst evidence and independent completion", () => {
  let state = clusterWorkout();
  reject(state, payload(state, clearAssistance, cluster));
  state = update(state, assistance("entered", "0"), cluster);
  const derive = () => deriveMethodState(clusterDefinition, row(state, cluster).methodLog);
  assert.equal(derive().status, "draft");
  assert.equal(derive().numericComplete, false);
  state = update(state, execution("performed", burst), cluster);
  assert.equal(derive().status, "performed");
  assert.equal(derive().numericComplete, false);
  state = update(state, metric("0", burst), cluster);
  assert.equal(derive().numericComplete, true);
  assert.deepEqual(derive().targetComparisons[burst], { reps: "below", restSeconds: "unrecorded" });
  state = update(state, metric("15", burst, "restSeconds"), cluster);
  const recorded = row(state, cluster).methodLog;
  state = update(state, choice("skip"), cluster);
  reject(state, payload(state, assistance("entered", "15"), cluster));
  reject(state, payload(state, clearAssistance, cluster));
  state = update(state, choice("record"), cluster);
  assert.deepEqual(row(state, cluster).methodLog, recorded);
  state = update(state, clearAssistance, cluster);
  assert.deepEqual(row(state, cluster).methodLog.phases[burst], { reps: "0", restSeconds: "15", execution: "performed" });
  assert.equal(row(state, cluster).isDone, false);
  reject(state, payload(state, clearAssistance, cluster));
});

test("Cluster rejects invalid assistance edits without replacing prior evidence", () => {
  const state = update(clusterWorkout(), assistance("entered", "25"), cluster);
  for (const kg of [undefined, null, 25, "", "025", "25.0", "-1", "25.", " 25", "1e2", "25,5", "1.25", "1000"]) {
    reject(state, payload(state, assistance("entered", kg), cluster));
  }
  const edit = assistance("entered", "32.5");
  for (const change of [assistance("automatic", "25"), { ...edit, phaseId: "extra-reps" },
    { ...edit, weight: "25" }, { ...clearAssistance, kg: "25" }, { type: "clear-assistance" },
    Object.create(edit), { ...edit, get kg() { throw Error("Unexpected getter call"); } }]) {
    reject(state, payload(state, change, cluster));
  }
  for (const pilot of pilots) {
    const original = update(workout(pilot), execution("performed", pilot.definition.phases[0].phaseId), pilot);
    for (const change of [edit, clearAssistance]) {
      reject(original, payload(original, { ...change, phaseId: pilot.definition.phases[0].phaseId }, pilot));
    }
  }
});

test("Cluster assistance requires the current cycle, editable day, exact binding and both unique rows", () => {
  const state = update(clusterWorkout(), assistance("entered", "0"), cluster);
  const edit = payload(state, assistance("entered", "32.5"), cluster);
  for (const override of [{ cycleNumber: 2 }, { cycleStartedAt: "stale" }, { dayId: "d1" }, { planId: "cut-pro" },
    { exerciseId: incline.exerciseId }, { setIndex: 3 }]) reject(state, { ...edit, ...override });
  for (const mutate of [
    (c) => { c.currentDayId = "d4"; },
    (c) => { delete c.methodBindings.exercises[cluster.exerciseId]; },
    (c) => { c.methodBindings.exercises[cluster.exerciseId].revision = 2; },
    (c) => { c.methodBindings.exercises[cluster.exerciseId].definitionId = "unknown"; },
    (c) => { c.methodBindings.exercises[cluster.exerciseId].setCount = 1; },
    (c) => { c.methodBindings.exercises[cluster.exerciseId].dayId = "d1"; },
    (c) => { c.dayLogs.d5.mainExerciseLogs[cluster.exerciseId].sets.pop(); },
    (c) => { rowInCycle(c, secondCluster).setIndex = 1; },
  ]) {
    const invalid = structuredClone(state);
    mutate(cycle(invalid));
    reject(invalid, edit);
  }
});

function clusterHistory() {
  let first = clusterWorkout();
  Object.assign(row(first, cluster), { weight: "25", reps: "9", rir: "", isDone: true });
  first = update(first, assistance("same", "25"), cluster);
  first = update(first, metric("5", burst), cluster);
  first = update(first, execution("performed", burst), cluster);
  first = finishDay(finishDay(first, "d5"), "d6");
  let second = clusterWorkout(first);
  second = update(second, assistance("entered", "32.5"), secondCluster);
  second = update(second, metric("0", burst, "restSeconds"), secondCluster);
  second = update(second, execution("partial", burst), secondCluster);
  second = finishDay(finishDay(second, "d5"), "d6");
  const current = cycle(start(second, "current-start"));
  return { ...cluster, currentCycleNumber: 3, cycles: { 1: cycle(first), 2: cycle(second), 3: current } };
}

test("Cluster history selects one detached confirmed attempt per set without filling gaps", () => {
  const context = freeze(clusterHistory());
  const first = findAttempt(context);
  const second = findAttempt({ ...context, setIndex: 2 });
  assert.equal(first.cycleNumber, 1);
  assert.equal(context.cycles[1].completedAt, "closed-d6");
  assert.deepEqual(first.baseSet, { setIndex: 1, weight: "25", reps: "9", rir: "", isDone: true });
  assert.deepEqual(first.methodLog.phases[burst], { execution: "performed", reps: "5", restSeconds: "",
    assistance: { mode: "same", kg: "25" } });
  assert.equal(second.cycleNumber, 2);
  assert.equal(context.cycles[2].completedAt, "closed-d6");
  assert.deepEqual(second.baseSet, { setIndex: 2, weight: "", reps: "", rir: "", isDone: false });
  assert.deepEqual(second.methodLog.phases[burst], { execution: "partial", reps: "", restSeconds: "0",
    assistance: { mode: "entered", kg: "32.5" } });
  assert.equal(second.derived.numericComplete, false);
  second.methodLog.phases[burst].assistance.kg = "99";
  assert.equal(rowInCycle(context.cycles[2], secondCluster).methodLog.phases[burst].assistance.kg, "32.5");
  assert.deepEqual(context.cycles[3].dayLogs, {});
});

test("Cluster history requires compatible bindings and valid, confirmed evidence for that exact set", () => {
  for (const mutate of [
    (c) => { delete c.methodBindings.exercises[cluster.exerciseId]; },
    (c) => { c.methodBindings.exercises[cluster.exerciseId].revision = 2; },
    (c) => { c.methodBindings.exercises[cluster.exerciseId].setCount = 1; },
    (c) => { rowInCycle(c, secondCluster).methodLog.choice = "skip"; },
    (c) => { rowInCycle(c, secondCluster).methodLog.phases[burst].execution = "unconfirmed"; },
    (c) => { rowInCycle(c, secondCluster).methodLog.phases[burst].assistance.kg = "01"; },
    (c) => { delete rowInCycle(c, secondCluster).methodLog; },
  ]) {
    const context = clusterHistory();
    mutate(context.cycles[2]);
    assert.equal(findAttempt(freeze({ ...context, setIndex: 2 })), null);
  }
  const context = clusterHistory();
  delete context.cycles[3].methodBindings.exercises[cluster.exerciseId];
  assert.equal(findAttempt(freeze(context)), null);
});

test("Cluster history does not generalize to other known revisions or load conventions", () => {
  for (const override of [{ revision: 2 }, { appliesTo: "last" }, { type: "rest-pause" },
    { base: { ...clusterDefinition.base, loadKind: "external" } },
    { phases: [{ ...clusterDefinition.phases[0], loadRule: "same-as-base" }] },
    { phases: [{ ...clusterDefinition.phases[0], phaseId: "other-burst" }] }]) {
    const definition = { ...clusterDefinition, ...override };
    const context = clusterHistory();
    for (const c of Object.values(context.cycles)) c.methodBindings.exercises[cluster.exerciseId].revision = definition.revision;
    const catalog = { getPlanById: getPlan, getDayDetailsByPlanId: getDays,
      getExercisesByPlanId: (planId) => getExercises(planId, getDay(planId, "d5").exerciseIds),
      getMethodDefinition: () => definition };
    assert.equal(findAttempt(freeze({ ...context, setIndex: 2 }), catalog), null);
  }
});

test("Cluster evidence survives V2 reload alongside pilot and Core data without affecting progression or carry-over", () => {
  let state = clusterWorkout();
  state = update(state, execution(), incline);
  assert.ok(row(state, incline).methodLog);
  const coreBlock = getCoreBlock(getDay(cluster.planId, cluster.dayId).coreBlockId);
  const ensureCore = (state) => appReducer(state, { type: actions.ENSURE_CORE_BLOCK_LOG, payload: {
    planId: cluster.planId, dayId: cluster.dayId, coreBlock, coreExercises: getCoreExercises(coreBlock.exerciseIds),
  } });
  state = ensureCore(state);
  const firstCoreRow = (state) => cycle(state).dayLogs.d5.coreBlockLog.coreExerciseLogs[coreBlock.exerciseIds[0]].sets[0];
  Object.assign(firstCoreRow(state), { reps: "8", isDone: true });
  Object.assign(row(state, cluster), { weight: "25", reps: "9", rir: "2", isDone: true });
  const before = freeze(state);
  state = update(state, assistance("same", "25"), cluster);
  state = update(state, execution("partial", burst), cluster);
  state = update(state, assistance("entered", "32.5"), secondCluster);
  state = update(state, metric("0", burst), secondCluster);
  state = update(state, execution("performed", burst), secondCluster);
  const stripped = structuredClone(state);
  delete row(stripped, cluster).methodLog;
  delete row(stripped, secondCluster).methodLog;
  assert.deepEqual(stripped, before);
  const progress = (s) => getProgress(cycle(s).dayLogs.d5, getDay(cluster.planId, cluster.dayId).exerciseIds);
  const summary = (s) => getSummary({ cycle: cycle(s), dayDetailsList: getDays(cluster.planId) });
  assert.deepEqual(progress(state), progress(before));
  assert.deepEqual(summary(state), summary(before));

  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const session = createAppStatePersistence({ getStorage: () => storage });
  assert.equal(session.save(state), true);
  assert.deepEqual([...values.keys()], [WORKOUT_STORAGE_KEYS.v2]);
  assert.equal(JSON.parse(values.get(WORKOUT_STORAGE_KEYS.v2)).version, 2);
  const loaded = createAppStatePersistence({ getStorage: () => storage }).getSnapshot();
  assert.equal(loaded.mode, "ready");
  assert.deepEqual(loaded.state, state);
  assert.deepEqual(row(loaded.state, cluster).methodLog.phases[burst].assistance, { mode: "same", kg: "25" });
  assert.deepEqual(row(loaded.state, secondCluster).methodLog.phases[burst],
    { execution: "performed", reps: "0", restSeconds: "", assistance: { mode: "entered", kg: "32.5" } });

  const oldAction = payload(loaded.state, assistance("entered", "40"), cluster);
  const next = ensureCore(clusterWorkout(finishDay(finishDay(loaded.state, "d5"), "d6")));
  assert.deepEqual(Object.keys(cycle(next).methodBindings.exercises).sort(), [...pilots, cluster, dropset].map((p) => p.exerciseId).sort());
  assert.deepEqual(cycle(start(next, "cut-start", "cut-pro"), "cut-pro").methodBindings.exercises, {});
  assert.deepEqual(row(next, cluster), { setIndex: 1, weight: "25", reps: "9", rir: "2", isDone: false });
  assert.deepEqual(row(next, secondCluster), { setIndex: 2, weight: "", reps: "", rir: "", isDone: false });
  assert.deepEqual(firstCoreRow(next), { ...firstCoreRow(before), isDone: false });
  reject(next, oldAction);
  for (const address of [cluster, secondCluster]) {
    const attempt = findAttempt({ ...address, cycles: next.progressByPlan[cluster.planId].cycles, currentCycleNumber: 2 });
    assert.equal(attempt.cycleNumber, 1);
    assert.deepEqual(attempt.methodLog, row(loaded.state, address).methodLog);
    assert.notEqual(attempt.methodLog, rowInCycle(next.progressByPlan[cluster.planId].cycles[1], address).methodLog);
  }
});

const dropset = { planId: "bulk-pro", dayId: "d3", exerciseId: "leg-extension", setIndex: 3 };
const dropBinding = { definitionId: "bulk-pro/leg-extension/dropset", revision: 1, dayId: "d3", setCount: 3 };
const dropIds = ["drop-1", "drop-2", "drop-3"];
const dropDefinition = getMethodDefinition({ ...dropset, ...dropBinding });
assert.ok(dropDefinition, "Missing registered D3 Leg Extension Dropset revision 1");

function dropsetWorkout() {
  const started = start();
  assert.deepEqual(cycle(started).methodBindings.exercises[dropset.exerciseId], dropBinding);
  const state = finishDay(finishDay(started, "d1"), "d2");
  assert.equal(cycle(state).currentDayId, dropset.dayId);
  return ensure(state, dropset.dayId);
}
const readDrop = (state) => row(state, dropset).methodLog;
const finishDrop = (phaseId = dropIds[0]) => ({ type: "finish-dropset", phaseId });
const extendDrop = (phaseId = dropIds[0]) => ({ type: "extend-dropset", phaseId });
const dropAction = (state, change, overrides = {}) => ({ type: actions.UPDATE_EXERCISE_METHOD,
  payload: { ...payload(state, change, dropset), ...overrides } });
const sendDrop = (state, change) => appReducer(freeze(state), dropAction(state, change));

test("the registered Dropset remains guarded in a Bulk cycle without its binding", () => {
  const previous = dropsetWorkout();
  delete cycle(previous).methodBindings.exercises[dropset.exerciseId];
  assert.equal(Object.keys(cycle(previous).methodBindings.exercises).length, 4);
  assert.equal(sendDrop(previous, finishDrop()), previous);
  assert.equal(readDrop(previous), undefined);
});

test("Dropset reducer preserves confirmation, editing and extension independently of workout progress", () => {
  const original = dropsetWorkout();
  row(original, dropset).isDone = true;
  let state = sendDrop(original, metric("37.5", dropIds[0], "loadKg"));
  assert.equal(deriveMethodState(dropDefinition, readDrop(state)).status, "draft");
  state = sendDrop(state, execution("performed", dropIds[0]));
  assert.equal(deriveMethodState(dropDefinition, readDrop(state)).status, "partial");
  state = sendDrop(state, finishDrop());
  assert.equal(readDrop(state).endPhaseId, dropIds[0]);
  const skipped = sendDrop(state, choice("skip"));
  assert.equal(readDrop(skipped).choice, "skip");
  assert.equal(sendDrop(skipped, extendDrop()), skipped);
  assert.equal(sendDrop(skipped, metric("6", dropIds[0])), skipped);
  state = sendDrop(skipped, choice("record"));
  assert.equal(readDrop(state).endPhaseId, dropIds[0]);
  state = sendDrop(state, metric("0", dropIds[0]));
  assert.deepEqual(readDrop(state).phases[dropIds[0]], { execution: "performed", loadKg: "37.5", reps: "0" });
  assert.equal(readDrop(state).endPhaseId, dropIds[0]);
  for (const [index, phaseId] of dropIds.entries()) {
    if (index > 0) {
      state = sendDrop(state, extendDrop(dropIds[index - 1]));
      assert.equal(deriveMethodState(dropDefinition, readDrop(state)).status, "partial");
      state = sendDrop(state, finishDrop(phaseId));
    }
    const log = readDrop(state);
    assert.equal(log.endPhaseId, phaseId);
    assert.deepEqual(Object.keys(log.phases), dropIds.slice(0, index + 1));
    assert.equal(deriveMethodState(dropDefinition, log).status, "performed");
    assert.equal(sendDrop(state, finishDrop(phaseId)), state);
  }
  assert.equal(sendDrop(state, extendDrop(dropIds[2])), state);
  const base = structuredClone(state);
  delete row(base, dropset).methodLog;
  assert.deepEqual(base, original);
});

test("Dropset rejects stale actions, foreign addresses, bad bindings and malformed changes by identity", () => {
  const initial = dropsetWorkout();
  const valid = sendDrop(initial, finishDrop());
  for (const overrides of [{ cycleNumber: 2 }, { cycleStartedAt: "stale" }, { setIndex: 2 },
    { dayId: "d2" }, { exerciseId: "not-leg-extension" }, { protocol: dropDefinition }]) {
    assert.equal(appReducer(valid, dropAction(valid, extendDrop(), overrides)), valid);
  }
  for (const change of [{ ...extendDrop(), extra: true }, { ...extendDrop(), phaseId: 1 },
    { type: "finish-dropset" }, { type: "extend-dropset", get phaseId() { throw new Error("getter invoked"); } },
    metric("27,5", dropIds[0], "loadKg"), metric("27.", dropIds[0], "loadKg"), metric("31", dropIds[0]),
    finishDrop(dropIds[1]), extendDrop(dropIds[1])]) {
    assert.equal(sendDrop(valid, change), valid);
  }
  assert.equal(sendDrop(initial, finishDrop(dropIds[1])), initial);
  assert.equal(sendDrop(initial, extendDrop()), initial);
  const reopened = sendDrop(valid, extendDrop());
  assert.equal(sendDrop(reopened, extendDrop()), reopened);
  for (const mutate of [
    (c) => { delete c.methodBindings; },
    (c) => { c.methodBindings.exercises[dropset.exerciseId].revision = 99; },
    (c) => { c.methodBindings.exercises[dropset.exerciseId].setCount = 2; },
    (c) => { c.methodBindings.exercises[dropset.exerciseId].dayId = "d2"; },
    (c) => { c.dayLogs.d3.mainExerciseLogs[dropset.exerciseId].sets[0].setIndex = 3; },
    (c) => { c.currentDayId = "d2"; c.dayLogs.d3.finishedAt = "future-finished"; },
    (c) => { rowInCycle(c, dropset).methodLog.endPhaseId = "drop-4"; },
  ]) {
    const invalid = structuredClone(valid);
    mutate(cycle(invalid));
    assert.equal(sendDrop(invalid, extendDrop()), invalid);
  }
  const cut = { ...dropset, planId: "cut-pro" };
  const cutState = workout(cut);
  cycle(cutState, cut.planId).methodBindings.exercises[cut.exerciseId] = { ...dropBinding };
  assert.equal(appReducer(freeze(cutState), { type: actions.UPDATE_EXERCISE_METHOD,
    payload: payload(cutState, finishDrop(), cut) }), cutState);
  const existingMethod = freeze(workout());
  assert.equal(appReducer(existingMethod, { type: actions.UPDATE_EXERCISE_METHOD,
    payload: payload(existingMethod, finishDrop("extra-reps")) }), existingMethod);
});

test("Dropset edits a finished day in the current cycle without changing closure", () => {
  const finishedDay = finishDay(dropsetWorkout(), "d3");
  assert.equal(cycle(finishedDay).currentDayId, "d4");
  const result = sendDrop(finishedDay, finishDrop());
  assert.equal(readDrop(result).endPhaseId, "drop-1");
  const stripped = structuredClone(result);
  delete row(stripped, dropset).methodLog;
  assert.deepEqual(stripped, finishedDay);
});

test("Dropset history selects one latest compatible confirmed attempt with its exact completion and provenance", () => {
  const base = dropsetWorkout();
  const completeFirst = sendDrop(sendDrop(base, metric("37.5", dropIds[0], "loadKg")), finishDrop());
  let attempt = sendDrop(base, metric("0", dropIds[0]));
  for (const [index, phaseId] of dropIds.entries()) {
    if (index > 0) attempt = sendDrop(attempt, extendDrop(dropIds[index - 1]));
    if (index === 1) attempt = sendDrop(attempt, metric("25", phaseId, "loadKg"));
    for (const status of ["partial", "performed"]) {
      const latest = sendDrop(attempt, status === "performed" ? finishDrop(phaseId) : execution("performed", phaseId));
      const prior = structuredClone(cycle(latest));
      prior.cycleNumber = 3;
      prior.startedAt = "latest-start";
      const current = structuredClone(cycle(base));
      const skipped = structuredClone(prior);
      skipped.cycleNumber = 4;
      rowInCycle(skipped, dropset).methodLog.choice = "skip";
      const invalid = structuredClone(prior);
      invalid.cycleNumber = 5;
      rowInCycle(invalid, dropset).methodLog.endPhaseId = "drop-4";
      const unresolved = structuredClone(prior);
      unresolved.cycleNumber = 6;
      unresolved.methodBindings.exercises[dropset.exerciseId].revision = 99;
      current.cycleNumber = 7;
      const context = freeze({ ...dropset, currentCycleNumber: 7,
        cycles: { 1: cycle(completeFirst), 3: prior, 4: skipped, 5: invalid, 6: unresolved, 7: current } });
      const found = findAttempt(context);
      assert.equal(found.cycleNumber, 3);
      assert.equal(found.cycleStartedAt, "latest-start");
      assert.equal(found.derived.status, status);
      assert.equal(found.derived.numericComplete, false);
      assert.deepEqual(found.methodLog, readDrop(latest));
      assert.equal(found.methodLog.endPhaseId, status === "performed" ? phaseId : undefined);
      assert.equal(found.methodLog.phases[dropIds[0]].loadKg, "");
      assert.equal(found.methodLog.phases[dropIds[0]].reps, "0");
      found.methodLog.phases[dropIds[0]].reps = "10";
      assert.equal(rowInCycle(prior, dropset).methodLog.phases[dropIds[0]].reps, "0");
      assert.equal(rowInCycle(current, dropset).methodLog, undefined);
    }
    attempt = sendDrop(attempt, finishDrop(phaseId));
  }
});

test("Dropset history requires a valid current address and an exact known protocol", () => {
  const previous = cycle(sendDrop(dropsetWorkout(), finishDrop()));
  const current = structuredClone(cycle(dropsetWorkout()));
  current.cycleNumber = 2;
  const context = freeze({ ...dropset, cycles: { 1: previous, 2: current }, currentCycleNumber: 2 });
  assert.equal(findAttempt(context).cycleNumber, 1);
  const beforeRowsExist = freeze({ ...context, cycles: { 1: previous, 2: { ...current, dayLogs: {} } } });
  assert.equal(findAttempt(beforeRowsExist).cycleNumber, 1);
  for (const override of [{ setIndex: 2 }, { dayId: "d2" }, { planId: "cut-pro" }]) {
    assert.equal(findAttempt({ ...context, ...override }), null);
  }
  for (const mutate of [
    (c) => { delete c.methodBindings; },
    (c) => { delete c.methodBindings.exercises[dropset.exerciseId]; },
    (c) => { c.methodBindings.exercises[dropset.exerciseId].revision = 99; },
    (c) => { c.dayLogs = null; },
    (c) => { c.dayLogs.d3.mainExerciseLogs[dropset.exerciseId].sets.pop(); },
    (c) => { rowInCycle(c, dropset).methodLog = { choice: "record", phases: {}, endPhaseId: "drop-1" }; },
  ]) {
    const copy = structuredClone(context);
    mutate(copy.cycles[2]);
    assert.equal(findAttempt(freeze(copy)), null);
  }
  for (const override of [{ reductionPercent: 20 }, { appliesTo: "all" },
    { phases: dropDefinition.phases.slice(0, 2) }, { phases: dropDefinition.phases.toReversed() }]) {
    const catalog = { getPlanById: getPlan, getDayDetailsByPlanId: getDays,
      getExercisesByPlanId: (planId) => getExercises(planId, getDay(planId, "d3").exerciseIds),
      getMethodDefinition: () => ({ ...dropDefinition, ...override }) };
    assert.equal(findAttempt(context, catalog), null);
  }
});

test("V2 preserves Dropset phases and early completion without granting edits to an unbound record", () => {
  const values = new Map();
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const session = createAppStatePersistence({ getStorage: () => storage });
  let state = sendDrop(dropsetWorkout(), metric("0", dropIds[0]));
  for (const [index, phaseId] of dropIds.entries()) {
    if (index > 0) state = sendDrop(state, extendDrop(dropIds[index - 1]));
    state = sendDrop(state, finishDrop(phaseId));
    assert.equal(session.save(state), true);
    const loaded = createAppStatePersistence({ getStorage: () => storage }).getSnapshot();
    assert.equal(loaded.mode, "ready");
    assert.deepEqual(loaded.state, state);
    assert.equal(readDrop(loaded.state).endPhaseId, phaseId);
    assert.deepEqual(deriveMethodState(dropDefinition, readDrop(loaded.state)), deriveMethodState(dropDefinition, readDrop(state)));
    const change = metric("25", phaseId, "loadKg");
    const edited = sendDrop(loaded.state, change);
    assert.equal(readDrop(edited).phases[phaseId].loadKg, "25");
    assert.equal(readDrop(edited).endPhaseId, phaseId);
    const unbound = structuredClone(loaded.state);
    delete cycle(unbound).methodBindings.exercises[dropset.exerciseId];
    assert.equal(sendDrop(unbound, change), unbound);
    assert.deepEqual(readDrop(unbound), readDrop(state));
  }
  assert.deepEqual([...values.keys()], [WORKOUT_STORAGE_KEYS.v2]);

  const invalidWrapper = JSON.parse(values.get(WORKOUT_STORAGE_KEYS.v2));
  readDrop(invalidWrapper.state).endPhaseId = "drop-4";
  values.set(WORKOUT_STORAGE_KEYS.v2, JSON.stringify(invalidWrapper));
  const opaque = createAppStatePersistence({ getStorage: () => storage }).getSnapshot();
  assert.equal(opaque.mode, "ready");
  assert.deepEqual(readDrop(opaque.state), readDrop(invalidWrapper.state));
  assert.equal(sendDrop(opaque.state, metric("25", dropIds[0], "loadKg")), opaque.state);

  readDrop(invalidWrapper.state).phases[dropIds[0]].execution = "invalid";
  const corrupt = JSON.stringify(invalidWrapper);
  values.set(WORKOUT_STORAGE_KEYS.v2, corrupt);
  const recovery = createAppStatePersistence({ getStorage: () => storage });
  assert.equal(recovery.getSnapshot().mode, "recovery-required");
  assert.equal(recovery.save(state), false);
  assert.equal(values.get(WORKOUT_STORAGE_KEYS.v2), corrupt);
});

const chrome = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Real effects and dispatch gating need a browser. This small test-only route
// mounts the unchanged provider; its synthetic probe adds no application hooks.
test("isolated Chrome: the existing provider gates UPDATE_EXERCISE_METHOD and verifies its saves",
  { skip: !chrome, timeout: 120000 }, async (t) => {
    const profile = await mkdtemp(join(tmpdir(), "cycle-coach-method-runtime-"));
    let server, child, socket;
    const pending = new Map();
    try {
      const seed = JSON.stringify({ version: 2, savedAt: "synthetic-save", state: workout() });
      const html = `<!doctype html><html><head><link rel="icon" href="data:,"></head><body><div id="root"></div><script type="module">
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AppStateProvider } from '/src/state/AppStateProvider.jsx';
import { useAppState } from '/src/state/useAppState.js';
function Probe() {
  const context = useAppState();
  useEffect(() => { window.__methodRuntime = context; });
  return null;
}
createRoot(document.getElementById('root')).render(React.createElement(React.StrictMode, null,
  React.createElement(AppStateProvider, null, React.createElement(Probe))));
</script></body></html>`;
      server = await createServer({ cacheDir: join(profile, "vite-cache"), server: { host: "127.0.0.1", port: 0 },
        optimizeDeps: { noDiscovery: true, include: ["react", "react-dom/client", "react/jsx-dev-runtime", "react/jsx-runtime"] },
        plugins: [{ name: "method-runtime-test", configureServer(vite) {
          vite.middlewares.use(async (req, res, next) => {
            if (req.url !== "/__method-runtime") return next();
            res.setHeader("Content-Type", "text/html"); res.end(await vite.transformIndexHtml(req.url, html));
          });
        } }] });
      await server.listen();
      const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
      child = spawn(chrome, ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu",
        "--no-first-run", "--no-default-browser-check", `--user-data-dir=${profile}`, "--remote-debugging-port=0", "about:blank"],
      { stdio: ["ignore", "ignore", "pipe"] });
      const endpoint = await new Promise((resolve, reject) => {
        let output = "";
        const timer = setTimeout(() => reject(Error(`Chrome did not start: ${output.slice(-600)}`)), 15000);
        child.stderr.on("data", (chunk) => {
          output += chunk;
          const match = output.match(/DevTools listening on (ws:\/\/\S+)/);
          if (match) { clearTimeout(timer); resolve(match[1]); }
        });
        child.once("error", (error) => { clearTimeout(timer); reject(error); });
      });
      socket = new WebSocket(endpoint);
      await new Promise((resolve, reject) => {
        socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true });
      });
      let sequence = 0;
      const exceptions = [];
      socket.addEventListener("message", ({ data }) => {
        const message = JSON.parse(data);
        if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails);
        const request = pending.get(message.id);
        if (request) {
          clearTimeout(request.timer); pending.delete(message.id);
          if (message.error) request.reject(Error(JSON.stringify(message.error))); else request.resolve(message.result);
        }
      });
      const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
        const id = ++sequence;
        const timer = setTimeout(() => { pending.delete(id); reject(Error(`Browser command timed out: ${method}`)); }, 15000);
        pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params, sessionId }));
      });
      const { targetId } = await send("Target.createTarget", { url: "about:blank" });
      const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
      const call = (method, params) => send(method, params, sessionId);
      await call("Page.enable"); await call("Runtime.enable");
      await call("Page.addScriptToEvaluateOnNewDocument", { source: `
        const v2 = ${JSON.stringify(WORKOUT_STORAGE_KEYS.v2)};
        if (!sessionStorage.getItem('method-runtime-seeded')) {
          localStorage.setItem(v2, ${JSON.stringify(seed)}); sessionStorage.setItem('method-runtime-seeded','true');
        }
        window.__methodWrites = []; window.__failMethodSave = false;
        const nativeSet = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
          if (this === localStorage) {
            window.__methodWrites.push(key);
            if (window.__failMethodSave && key === v2) throw new DOMException('Synthetic quota','QuotaExceededError');
          }
          return nativeSet.call(this, key, value);
        };` });
      const evaluate = async (expression) => {
        const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
        if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
        return result.result.value;
      };
      const wait = async (expression) => {
        for (let index = 0; index < 1000; index += 1) {
          try { if (await evaluate(expression)) return; }
          catch (error) { if (!/context|navigat/i.test(error.message)) throw error; }
          await pause(50);
        }
        throw Error(`Browser condition timed out: ${expression}; errors=${JSON.stringify(exceptions)}`);
      };
      const v2 = JSON.stringify(WORKOUT_STORAGE_KEYS.v2);
      const reset = JSON.stringify(WORKOUT_STORAGE_KEYS.reset);
      const target = "window.__methodRuntime.state.progressByPlan['bulk-pro'].cycles[1].dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[2]";
      const dispatch = (change) => evaluate(`window.__methodRuntime.dispatch(${JSON.stringify({
        type: actions.UPDATE_EXERCISE_METHOD, payload: payload(workout(), change),
      })})`);
      const settled = () => evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
      await call("Page.navigate", { url: `${origin}/__method-runtime` });
      await wait("Boolean(window.__methodRuntime)");
      await t.test("rejected actions create no autosave; accepted method edits pass the whitelist and persist", async () => {
        assert.deepEqual(await evaluate("window.__methodWrites"), []);
        const before = await evaluate("JSON.stringify(window.__methodRuntime.state)");
        await dispatch(metric("31")); await settled();
        assert.equal(await evaluate("JSON.stringify(window.__methodRuntime.state)"), before);
        assert.deepEqual(await evaluate("window.__methodWrites"), []);
        await dispatch(metric("0"));
        await wait(`${target}.methodLog?.phases['extra-reps'].reps === '0' && window.__methodRuntime.persistence.saveStatus === 'saved'`);
        assert.equal(await evaluate(`JSON.parse(localStorage.getItem(${v2})).state.progressByPlan['bulk-pro'].cycles[1].dayLogs.d1.mainExerciseLogs['incline-db-press'].sets[2].methodLog.phases['extra-reps'].reps`), "0");
        assert.equal(await evaluate(`${target}.isDone`), false);
        const writes = await evaluate("window.__methodWrites.length");
        await dispatch(metric("31")); await settled();
        assert.equal(await evaluate("window.__methodWrites.length"), writes);
      });
      await t.test("ordinary write failure keeps method edits in memory until verified retry", async () => {
        const before = await evaluate(`localStorage.getItem(${v2})`);
        await evaluate("window.__failMethodSave=true");
        await dispatch(execution());
        await wait("window.__methodRuntime.persistence.saveStatus === 'failed'");
        assert.equal(await evaluate(`${target}.methodLog.phases['extra-reps'].execution`), "performed");
        assert.equal(await evaluate(`localStorage.getItem(${v2})`), before);
        await evaluate("window.__failMethodSave=false; window.__methodRuntime.retryPersistence()");
        await wait("window.__methodRuntime.persistence.saveStatus === 'saved'");
      });
      let ownedRaw;
      await t.test("canEdit blocks a stale method dispatch before any storage event is delivered", async () => {
        ownedRaw = await evaluate(`localStorage.getItem(${v2})`);
        const external = JSON.stringify({ ...JSON.parse(ownedRaw), savedAt: "synthetic-external-change" });
        await evaluate(`localStorage.setItem(${v2}, ${JSON.stringify(external)})`);
        const writes = await evaluate("window.__methodWrites.length");
        await dispatch(metric("4"));
        await wait("window.__methodRuntime.persistence.mode === 'storage-conflict'");
        assert.equal(await evaluate(`${target}.methodLog.phases['extra-reps'].reps`), "0");
        assert.equal(await evaluate(`localStorage.getItem(${v2})`), external);
        assert.equal(await evaluate("window.__methodWrites.length"), writes);
      });
      await t.test("an active reset marker blocks the new action through the existing gate", async () => {
        await evaluate(`localStorage.setItem(${v2}, ${JSON.stringify(ownedRaw)}); window.__methodRuntime.reloadProgress()`);
        await wait("window.__methodRuntime.persistence.mode === 'ready'");
        await evaluate(`localStorage.setItem(${reset}, 'synthetic-reset')`);
        const writes = await evaluate("window.__methodWrites.length");
        await dispatch(metric("4"));
        await wait("window.__methodRuntime.persistence.mode === 'reset-incomplete'");
        assert.equal(await evaluate(`${target}.methodLog.phases['extra-reps'].reps`), "0");
        assert.equal(await evaluate("window.__methodWrites.length"), writes);
      });
      await t.test("unsafe hydration blocks method dispatch and never overwrites the raw original", async () => {
        await evaluate(`localStorage.removeItem(${reset}); localStorage.setItem(${v2}, 'synthetic-corrupt'); delete window.__methodRuntime`);
        await call("Page.reload");
        await wait("window.__methodRuntime?.persistence.mode === 'recovery-required'");
        const before = await evaluate("JSON.stringify(window.__methodRuntime.state)");
        await dispatch(metric()); await settled();
        assert.equal(await evaluate("JSON.stringify(window.__methodRuntime.state)"), before);
        assert.equal(await evaluate(`localStorage.getItem(${v2})`), "synthetic-corrupt");
        assert.deepEqual(await evaluate("window.__methodWrites"), []);
      });
      await t.test("Dropset confirmation writes V2 and reloads; rejected and repeated actions make no writes", async () => {
        const state = dropsetWorkout();
        const raw = JSON.stringify({ version: 2, savedAt: "dropset-test-seed", state });
        await evaluate(`localStorage.setItem(${v2}, ${JSON.stringify(raw)})`);
        await call("Page.reload");
        await wait("window.__methodRuntime?.persistence.mode === 'ready'");
        const sendChange = (change) => evaluate(`window.__methodRuntime.dispatch(${JSON.stringify(dropAction(state, change))})`);
        const stored = () => evaluate(`localStorage.getItem(${v2})`);
        const logPath = "progressByPlan['bulk-pro']?.cycles[1]?.dayLogs.d3?.mainExerciseLogs['leg-extension']?.sets[2]?.methodLog";
        const dropLog = `window.__methodRuntime?.state.${logPath}`;
        await sendChange(finishDrop(dropIds[1]));
        await settled();
        assert.equal(await stored(), raw);
        assert.deepEqual(await evaluate("window.__methodWrites"), []);

        await sendChange(metric("37.5", dropIds[0], "loadKg"));
        await sendChange(metric("0", dropIds[0]));
        await sendChange(finishDrop());
        await wait(`JSON.parse(localStorage.getItem(${v2})).state.${logPath}?.endPhaseId === 'drop-1'`);
        await settled();
        const saved = await stored();
        const expected = { choice: "record", endPhaseId: "drop-1",
          phases: { "drop-1": { execution: "performed", loadKg: "37.5", reps: "0" } } };
        assert.deepEqual(readDrop(JSON.parse(saved).state), expected);
        const writes = await evaluate("window.__methodWrites.length");
        for (const change of [finishDrop(), extendDrop(dropIds[1]), metric("27,", dropIds[0], "loadKg")]) {
          await sendChange(change);
        }
        await settled();
        assert.equal(await stored(), saved);
        assert.equal(await evaluate("window.__methodWrites.length"), writes);

        // A reload acknowledgement can arrive before the old document goes away.
        await evaluate("delete window.__methodRuntime");
        await call("Page.reload");
        await wait(`${dropLog}?.endPhaseId === 'drop-1'`);
        assert.deepEqual(await evaluate(dropLog), expected);
        assert.deepEqual(await evaluate("window.__methodWrites"), []);
      });
      assert.deepEqual(exceptions, []);
      await send("Browser.close");
    } finally {
      pending.forEach((request) => clearTimeout(request.timer)); socket?.close();
      if (child && child.exitCode === null) {
        const exited = new Promise((resolve) => child.once("exit", resolve)); child.kill(); await exited;
      }
      await server?.close();
      await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    }
  });
