import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { advancedMethodDefinitions } from "../src/data/advancedMethods/definitions.js";
import { getApplicableSetIndexes } from "../src/utils/runtime/advancedMethodHelpers.js";
import { inspectStoredAppState, migrateV1ToV2 } from "../src/storage/appStateMigration.js";

let vite, build, resolve, appReducer, actions, initialState, buildRows;
let getPlan, getExercises, getDays, getDay, getCoreBlock, getCoreExercises, getProgress;
before(async () => {
  vite = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)),
    server: { middlewareMode: true, hmr: false, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] }, appType: "custom" });
  const load = (path) => vite.ssrLoadModule(`/src/${path}`);
  [
    { buildCycleMethodBindings: build, resolveCycleMethodBinding: resolve },
    { appReducer }, { APP_ACTIONS: actions }, { appInitialState: initialState },
    { buildInitialSetRows: buildRows }, { getPlanById: getPlan },
    { getExercisesByPlanId: getExercises }, { getDayDetailsByPlanId: getDays, getDayDetails: getDay },
    { getCoreBlockById: getCoreBlock, getCoreExercisesByIds: getCoreExercises },
    { getWorkoutProgress: getProgress },
  ] = await Promise.all([
    "utils/runtime/advancedMethodContextHelpers.js", "state/appReducer.js", "state/appActions.js",
    "state/appInitialState.js", "utils/runtime/exerciseLogHelpers.js", "data/plans/index.js",
    "data/exercises/index.js", "data/dayDetails/index.js", "data/core/index.js",
    "utils/runtime/workoutProgressHelpers.js",
  ].map(load));
});
after(() => vite?.close());

const preActivationBindings = {
  version: 1,
  exercises: {
    "incline-db-press": { definitionId: "bulk-pro/incline-db-press/rest-pause", revision: 1, dayId: "d1", setCount: 3 },
    "cable-stretch-fly": { definitionId: "bulk-pro/cable-stretch-fly/iso-stretch", revision: 1, dayId: "d1", setCount: 1 },
    "face-away-cable-curl": { definitionId: "bulk-pro/face-away-cable-curl/rest-pause", revision: 1, dayId: "d4", setCount: 1 },
  },
};
const clusterId = "assisted-pull-up-cluster";
const dropsetId = "leg-extension";
const beforeDropsetBindings = { version: 1, exercises: {
  ...preActivationBindings.exercises,
  [clusterId]: { definitionId: "bulk-pro/assisted-pull-up-cluster/cluster", revision: 1, dayId: "d5", setCount: 2 },
} };
const beforeRolloutBindings = { version: 1, exercises: {
  ...beforeDropsetBindings.exercises,
  [dropsetId]: { definitionId: "bulk-pro/leg-extension/dropset", revision: 1, dayId: "d3", setCount: 3 },
} };
const addedBindings = {
  "overhead-rope-extension": { definitionId: "bulk-pro/overhead-rope-extension/dropset", revision: 1, dayId: "d1", setCount: 4 },
  "machine-lateral-raise": { definitionId: "bulk-pro/machine-lateral-raise/dropset", revision: 1, dayId: "d4", setCount: 3 },
  "leg-press-calf-raise": { definitionId: "bulk-pro/leg-press-calf-raise/dropset", revision: 1, dayId: "d6", setCount: 3 },
};
const preacherId = "preacher-curl-mechanical";
const preacherBinding = { definitionId: "bulk-pro/preacher-curl-mechanical/mechanical-set", revision: 1, dayId: "d6", setCount: 1 };
const beforePreacherBindings = { version: 1, exercises: { ...beforeRolloutBindings.exercises, ...addedBindings } };
const expected = { version: 1, exercises: { ...beforePreacherBindings.exercises, [preacherId]: preacherBinding } };
function freeze(value) {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function catalog() {
  const value = {
    plans: structuredClone([getPlan("bulk-pro"), getPlan("cut-pro")]),
    exercises: structuredClone(getExercises("bulk-pro")),
    days: structuredClone(getDays("bulk-pro")),
    definitions: structuredClone(advancedMethodDefinitions),
    activeMethodsByPlan: { "bulk-pro": Object.entries(preActivationBindings.exercises).map(([exerciseId, binding]) => ({
      exerciseId, definitionId: binding.definitionId, revision: binding.revision, dayId: binding.dayId,
      type: exerciseId === "cable-stretch-fly" ? "iso-stretch" : "rest-pause",
    })), "cut-pro": [] },
    getPlanById: (id) => value.plans.find((plan) => plan.id === id),
    getExercisesByPlanId: () => value.exercises,
    getDayDetailsByPlanId: () => value.days,
    getMethodDefinition: (ref) => value.definitions.find((definition) =>
      ["planId", "exerciseId", "definitionId", "revision"].every((key) => definition[key] === ref[key])) ?? null,
  };
  return value;
}
const start = (state = structuredClone(initialState), planId = "bulk-pro") => appReducer(state,
  { type: actions.START_PLAN_CYCLE, payload: { planId, startedAt: "synthetic-start" } });
const cycle = (state, planId = "bulk-pro") => {
  const progress = state.progressByPlan[planId];
  return progress.cycles[progress.currentCycleNumber];
};
function ensure(state, dayId = "d1", planId = "bulk-pro", exercises = null) {
  const dayDetails = getDay(planId, dayId);
  return appReducer(state, { type: actions.ENSURE_DAY_LOG, payload: {
    planId, dayDetails, exercises: exercises ?? getExercises(planId).filter((exercise) => dayDetails.exerciseIds.includes(exercise.id)),
  } });
}
const address = (current) => ({ planId: "bulk-pro", cycle: current, dayId: "d1", exerciseId: "incline-db-press" });
const inclineRows = (state) => cycle(state).dayLogs.d1.mainExerciseLogs["incline-db-press"].sets;

test("new Bulk/Cut cycles install only the approved snapshot and keep lazy logs empty", () => {
  for (const planId of ["bulk-pro", "cut-pro"]) {
    const state = start(undefined, planId);
    assert.deepEqual(cycle(state, planId).methodBindings, planId === "bulk-pro" ? expected : { version: 1, exercises: {} });
    assert.deepEqual(cycle(state, planId).dayLogs, {});
    assert.equal(cycle(state, planId).currentDayId, "d1");
  }
  assert.notEqual(build({ planId: "bulk-pro" }).bindings, build({ planId: "bulk-pro" }).bindings);
});

test("production keeps nine Bulk bindings and ten applicable rows with Push-up absent even from the registry", () => {
  const state = start();
  const current = cycle(state);
  const { exercises } = current.methodBindings;
  const pushUpId = "push-up-mechanical-dropset";
  assert.equal(advancedMethodDefinitions.length, 9);
  assert.equal(advancedMethodDefinitions.some(({ exerciseId }) => exerciseId === pushUpId), false);
  assert.equal(Object.keys(exercises).length, 9);
  assert.equal(Object.hasOwn(exercises, pushUpId), false);
  assert.deepEqual(cycle(start(undefined, "cut-pro"), "cut-pro").methodBindings.exercises, {});
  let positions = 0;
  for (const dayId of getPlan("bulk-pro").dayOrder) {
    const opened = cycle(ensure(state, dayId));
    for (const [exerciseId, exerciseLog] of Object.entries(opened.dayLogs[dayId].mainExerciseLogs)) {
      const resolved = resolve({ planId: "bulk-pro", cycle: opened, dayId, exerciseId });
      if (resolved.status === "resolved") positions += getApplicableSetIndexes(resolved.definition, exerciseLog.sets).length;
      if (exerciseId === pushUpId) {
        assert.equal(resolved.status, "unbound");
        assert.deepEqual(exerciseLog.sets, [{ setIndex: 1, weight: "", reps: "", rir: "", isDone: false }]);
      }
    }
  }
  assert.equal(positions, 10);
});

test("only a new cycle gains a fresh snapshot; legacy unvisited days never backfill", () => {
  const legacy = start();
  delete cycle(legacy).methodBindings;
  const before = JSON.stringify(legacy);
  freeze(legacy);
  const opened = ensure(legacy, "d4");
  assert.equal(Object.hasOwn(cycle(opened), "methodBindings"), false);
  assert.equal(resolve({ ...address(cycle(opened)), dayId: "d4", exerciseId: "face-away-cable-curl" }).status, "unbound");
  const next = start(freeze(opened));
  assert.equal(cycle(next).cycleNumber, 2);
  assert.deepEqual(cycle(next).methodBindings, expected);
  assert.equal(next.progressByPlan["bulk-pro"].cycles[1], cycle(opened));
  assert.equal(JSON.stringify(legacy), before);
  assert.deepEqual(cycle(next).dayLogs, {});
});

test("a three-binding Bulk cycle keeps its snapshot when it first opens D5 and when archived", () => {
  let previous = start();
  cycle(previous).methodBindings = structuredClone(preActivationBindings);
  const snapshot = freeze(cycle(previous).methodBindings);
  const finish = (state, dayId) => appReducer(state, { type: actions.FINISH_DAY,
    payload: { planId: "bulk-pro", dayId, finishedAt: `closed-${dayId}` } });
  for (const dayId of ["d1", "d2", "d3", "d4"]) previous = finish(ensure(previous, dayId), dayId);
  assert.equal(cycle(previous).currentDayId, "d5");
  assert.equal(cycle(previous).dayLogs.d5, undefined);
  const scope = { planId: "bulk-pro", dayId: "d5", exerciseId: clusterId };
  assert.equal(resolve({ ...scope, cycle: cycle(previous) }).status, "unbound");
  const opened = ensure(freeze(previous), "d5");
  assert.equal(cycle(opened).methodBindings, snapshot);
  assert.equal(resolve({ ...scope, cycle: cycle(opened) }).status, "unbound");
  const oldRows = cycle(opened).dayLogs.d5.mainExerciseLogs[clusterId].sets;
  assert.deepEqual(oldRows.map((row) => row.setIndex), [1, 2]);
  assert.ok(oldRows.every((row) => !Object.hasOwn(row, "methodLog")));
  const completed = finish(ensure(finish(opened, "d5"), "d6"), "d6");
  const archived = freeze(cycle(completed));
  assert.equal(archived.completedAt, "closed-d6");
  const next = start(freeze(completed));
  assert.equal(cycle(next).cycleNumber, 2);
  assert.deepEqual(cycle(next).methodBindings, expected);
  assert.equal(next.progressByPlan["bulk-pro"].cycles[1], archived);
  assert.deepEqual(archived.methodBindings, preActivationBindings);
  assert.equal(archived.dayLogs.d5.mainExerciseLogs[clusterId].sets, oldRows);
});

test("first D3 visit preserves earlier snapshots and only a new cycle has a last-set Dropset binding", () => {
  const finish = (state, dayId) => appReducer(ensure(state, dayId), { type: actions.FINISH_DAY,
    payload: { planId: "bulk-pro", dayId, finishedAt: `closed-${dayId}` } });
  const resolveDropset = (state) => resolve({ planId: "bulk-pro", cycle: cycle(state), dayId: "d3", exerciseId: dropsetId });
  const rows = (state) => cycle(state).dayLogs.d3.mainExerciseLogs[dropsetId].sets;
  for (const previousBindings of [preActivationBindings, beforeDropsetBindings]) {
    const previous = start();
    const snapshot = freeze(structuredClone(previousBindings));
    cycle(previous).methodBindings = snapshot;
    const beforeD3 = finish(finish(previous, "d1"), "d2");
    assert.equal(cycle(beforeD3).currentDayId, "d3");
    assert.equal(cycle(beforeD3).dayLogs.d3, undefined);
    const opened = ensure(freeze(beforeD3), "d3");
    assert.equal(cycle(opened).methodBindings, snapshot);
    assert.equal(resolveDropset(opened).status, "unbound");
    assert.deepEqual(rows(opened).map(({ setIndex }) => setIndex), [1, 2, 3]);
    assert.ok(rows(opened).every((row) => !Object.hasOwn(row, "methodLog")));
    const archived = ["d3", "d4", "d5", "d6"].reduce(finish, opened);
    const next = start(freeze(archived));
    assert.equal(cycle(next).cycleNumber, 2);
    assert.equal(next.progressByPlan["bulk-pro"].cycles[1], cycle(archived));
    assert.equal(cycle(archived).methodBindings, snapshot);
    assert.deepEqual(cycle(next).methodBindings, expected);
    const current = ensure(finish(finish(next, "d1"), "d2"), "d3");
    assert.deepEqual(rows(current).map(({ setIndex }) => setIndex), [1, 2, 3]);
    assert.deepEqual(getApplicableSetIndexes(resolveDropset(current).definition, rows(current)), [3]);
    assert.ok(rows(current).every((row) => !Object.hasOwn(row, "methodLog")));
  }
});

test("pre-row resolver resolves all active methods, absent bindings and same-ID Cut safely", () => {
  const current = freeze(cycle(start()));
  for (const [exerciseId, binding] of Object.entries(expected.exercises)) {
    const resolved = resolve({ planId: "bulk-pro", cycle: current, dayId: binding.dayId, exerciseId });
    assert.equal(resolved.status, "resolved");
    assert.equal(resolved.binding, current.methodBindings.exercises[exerciseId]);
    assert.equal(resolved.definition.revision, 1);
  }
  assert.equal(resolve({ ...address(current), exerciseId: "smith-bench-press" }).status, "unbound");
  assert.equal(resolve({ ...address(cycle(start(undefined, "cut-pro"), "cut-pro")), planId: "cut-pro" }).status, "unbound");
  const cut = structuredClone(current); cut.planId = "cut-pro";
  assert.notEqual(resolve({ ...address(cut), planId: "cut-pro" }).status, "resolved");
});

test("first visits and reload preserve authentic three-, four-, five- and eight-binding snapshots", () => {
  for (const historic of [preActivationBindings, beforeDropsetBindings, beforeRolloutBindings, beforePreacherBindings]) {
    let state = start();
    cycle(state).methodBindings = freeze(structuredClone(historic));
    const snapshot = cycle(state).methodBindings;
    for (const dayId of getPlan("bulk-pro").dayOrder) {
      assert.equal(cycle(state).dayLogs[dayId], undefined);
      state = ensure(freeze(state), dayId);
      assert.equal(cycle(state).methodBindings, snapshot);
      const laterBindings = { ...addedBindings, [preacherId]: preacherBinding };
      for (const [exerciseId, binding] of Object.entries(laterBindings)) {
        if (binding.dayId !== dayId || Object.hasOwn(historic.exercises, exerciseId)) continue;
        assert.equal(resolve({ planId: "bulk-pro", cycle: cycle(state), dayId, exerciseId }).status, "unbound");
        const rows = cycle(state).dayLogs[dayId].mainExerciseLogs[exerciseId].sets;
        assert.equal(rows.length, binding.setCount);
        assert.ok(rows.every((row) => !Object.hasOwn(row, "methodLog")));
      }
      state = appReducer(state, { type: actions.FINISH_DAY, payload: { planId: "bulk-pro", dayId, finishedAt: `closed-${dayId}` } });
    }
    const restored = inspectStoredAppState(JSON.stringify({ version: 2, savedAt: "fixture", state }), 2);
    assert.equal(restored.status, "valid");
    const previous = cycle(restored.wrapper.state);
    assert.deepEqual(previous.methodBindings, historic);
    const next = start(freeze(restored.wrapper.state));
    assert.equal(next.progressByPlan["bulk-pro"].cycles[1], previous);
    assert.deepEqual(cycle(next).methodBindings, expected);
  }
});

test("an opaque exact reference can resolve once the registry knows it without changing the saved snapshot", () => {
  const current = cycle(start());
  const exerciseId = "leg-press-calf-raise";
  current.methodBindings = { version: 1, exercises: { [exerciseId]: structuredClone(addedBindings[exerciseId]) } };
  freeze(current);
  const scope = { planId: "bulk-pro", cycle: current, dayId: "d6", exerciseId };
  const before = catalog();
  before.definitions.splice(before.definitions.findIndex((definition) => definition.exerciseId === exerciseId), 1);
  // The injected catalog intentionally reproduces the pre-registration lookup.
  assert.equal(resolve(scope, before).reason, "unknown-definition-revision");
  const known = resolve(scope);
  assert.equal(known.status, "resolved");
  assert.equal(known.binding, current.methodBindings.exercises[exerciseId]);
  assert.deepEqual(current.methodBindings.exercises, { [exerciseId]: addedBindings[exerciseId] });
});

test("a retained historical revision resolves despite a newer active protocol and static count", () => {
  const source = catalog();
  const current = freeze(cycle(start()));
  const exercise = source.exercises.find((item) => item.id === "incline-db-press");
  exercise.setCount = 4;
  source.activeMethodsByPlan["bulk-pro"][0].revision = 2;
  const original = source.definitions.find((item) => item.exerciseId === exercise.id);
  source.definitions.unshift({ ...structuredClone(original), revision: 2, prescribedSetCount: 4 });
  assert.equal(build({ planId: "bulk-pro" }, source).bindings.exercises[exercise.id].revision, 2);
  const resolved = resolve(address(current), freeze(source));
  assert.equal(resolved.status, "resolved");
  assert.equal(resolved.definition.revision, 1);
  assert.equal(resolved.binding.setCount, 3);
  assert.deepEqual(current.methodBindings, expected);
});

test("definitions in the registry never activate methods omitted from an allowlist", () => {
  const source = catalog();
  source.definitions.push({ ...source.definitions[0], exerciseId: "overhead-rope-extension", definitionId: "synthetic/unapproved", revision: 9 });
  assert.deepEqual(build({ planId: "bulk-pro" }, freeze(source)).bindings, preActivationBindings);
});

for (const [label, mutate] of [
  ["unknown plan", (source) => { source.plans = []; }],
  ["missing active catalog", (source) => { delete source.activeMethodsByPlan["bulk-pro"]; }],
  ["invalid active list", (source) => { source.activeMethodsByPlan["bulk-pro"] = null; }],
  ["duplicate active entry", (source) => { source.activeMethodsByPlan["bulk-pro"].push(source.activeMethodsByPlan["bulk-pro"][0]); }],
  ["wrong active day", (source) => { source.activeMethodsByPlan["bulk-pro"][0].dayId = "d2"; }],
  ["duplicate day ownership", (source) => { source.days[1].exerciseIds.push("incline-db-press"); }],
  ["duplicate within-day ownership", (source) => { source.days[0].exerciseIds.push("incline-db-press"); }],
  ["duplicate exercise metadata", (source) => { source.exercises.push(source.exercises[1]); }],
  ["malformed ownership metadata", (source) => { source.days[0].exerciseIds = null; }],
  ["unknown active revision", (source) => { source.activeMethodsByPlan["bulk-pro"][0].revision = 99; }],
  ["string active revision", (source) => { source.activeMethodsByPlan["bulk-pro"][0].revision = "1"; }],
  ["wrong active type", (source) => { source.activeMethodsByPlan["bulk-pro"][0].type = "cluster"; }],
  ["wrong declared type", (source) => { source.exercises.find((item) => item.id === "incline-db-press").details.advancedTechniqueType = "cluster"; }],
  ["wrong prescribed count", (source) => { source.exercises.find((item) => item.id === "incline-db-press").setCount = 4; }],
  ["wrong definition identity", (source) => { source.getMethodDefinition = () => ({ ...source.definitions[0], planId: "cut-pro" }); }],
]) {
  test(`invalid active catalog fails completely without mutation: ${label}`, () => {
    const source = mutateCatalog(mutate);
    const result = build({ planId: "bulk-pro" }, source);
    assert.equal(result.status, "invalid");
    assert.ok(result.reason);
    assert.equal(Object.hasOwn(result, "bindings"), false);
  });
}
function mutateCatalog(mutate) {
  const source = catalog(); mutate(source); return freeze(source);
}

test("failed live catalog validation rejects cycle creation with the same previous state", () => {
  const state = freeze(ensure(start()));
  const before = JSON.stringify(state);
  const exercise = getExercises("bulk-pro").find((item) => item.id === "incline-db-press");
  const count = exercise.setCount;
  try {
    exercise.setCount = 4;
    assert.equal(start(state), state);
    assert.equal(JSON.stringify(state), before);
  } finally { exercise.setCount = count; }
  assert.equal(start(state, "unknown"), state);
});

for (const [label, mutate, status] of [
  ["absent snapshot", (c) => { delete c.methodBindings; }, "unbound"],
  ["missing binding", (c) => { delete c.methodBindings.exercises["incline-db-press"]; }, "unbound"],
  ["null container", (c) => { c.methodBindings = null; }, "invalid"],
  ["array container", (c) => { c.methodBindings = []; }, "invalid"],
  ["missing schema", (c) => { delete c.methodBindings.version; }, "invalid"],
  ["unknown schema", (c) => { c.methodBindings.version = 2; }, "unresolved"],
  ["string schema", (c) => { c.methodBindings.version = "1"; }, "invalid"],
  ["array map", (c) => { c.methodBindings.exercises = []; }, "invalid"],
  ["missing map", (c) => { delete c.methodBindings.exercises; }, "invalid"],
  ["wrong parent plan", (c) => { c.planId = "cut-pro"; }, "invalid"],
  ["invalid cycle number", (c) => { c.cycleNumber = 0; }, "invalid"],
  ["string cycle number", (c) => { c.cycleNumber = "1"; }, "invalid"],
]) {
  test(`pre-row resolution preserves data and fails closed: ${label}`, () => {
    const current = cycle(start()); mutate(current); freeze(current);
    const before = JSON.stringify(current);
    const result = resolve(address(current));
    assert.equal(result.status, status);
    assert.ok(result.reason);
    assert.equal(Object.hasOwn(result, "definition"), false);
    assert.equal(JSON.stringify(current), before);
  });
}

for (const [field, values] of [
  ["definitionId", [undefined, "", "unknown-definition"]],
  ["revision", [undefined, "1", 0, -1, 1.5, 99]],
  ["dayId", [undefined, null, "", "d2", "unknown"]],
  ["setCount", [undefined, "3", 0, -1, 1.5, 2, 4, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 1, Infinity]],
]) {
  test(`invalid or unknown binding ${field} never resolves or controls row count`, () => {
    for (const value of values) {
      const state = start();
      const current = cycle(state);
      const binding = current.methodBindings.exercises["incline-db-press"];
      if (value === undefined) delete binding[field]; else binding[field] = value;
      const before = JSON.stringify(current);
      assert.ok(["invalid", "unresolved"].includes(resolve(address(freeze(current))).status));
      const rows = buildRows({ id: "incline-db-press", setCount: 2 }, {
        planId: "bulk-pro", cycles: { 1: current }, currentCycleNumber: 1, dayId: "d1",
      });
      assert.equal(rows.length, 2);
      assert.equal(JSON.stringify(current), before);
    }
  });
}

test("moved ownership rejects a historical binding instead of silently rebinding", () => {
  const source = catalog();
  source.days[0].exerciseIds = source.days[0].exerciseIds.filter((id) => id !== "incline-db-press");
  source.days[1].exerciseIds.push("incline-db-press");
  const current = freeze(cycle(start()));
  assert.equal(resolve(address(current), freeze(source)).status, "invalid");
  assert.equal(resolve({ ...address(current), dayId: "d2" }, source).status, "invalid");
});

test("null/array bindings, inherited fields and accessors stay unusable without executing getters", () => {
  for (const value of [null, [], {}, Object.create(expected.exercises["incline-db-press"]),
    { get definitionId() { throw Error("must not execute"); }, revision: 1, dayId: "d1", setCount: 3 }]) {
    const current = cycle(start());
    current.methodBindings.exercises["incline-db-press"] = value;
    assert.equal(resolve(address(current)).status, "invalid");
    assert.equal(current.methodBindings.exercises["incline-db-press"], value);
  }
  for (const current of [null, undefined, [], { planId: "bulk-pro", cycleNumber: Number.MAX_SAFE_INTEGER + 1 }]) {
    assert.equal(resolve(address(current)).status, "invalid");
  }
});

test("known frozen counts govern new lazy rows; existing rows and metadata are never rebuilt", () => {
  const state = start();
  const snapshot = freeze(cycle(state).methodBindings);
  const exercise = getExercises("bulk-pro").find((item) => item.id === "incline-db-press");
  const count = exercise.setCount;
  try {
    exercise.setCount = 4;
    const opened = ensure(state);
    assert.equal(inclineRows(opened).length, 3);
    assert.equal(cycle(opened).methodBindings, snapshot);
    assert.deepEqual(getApplicableSetIndexes(resolve(address(cycle(opened))).definition, inclineRows(opened)), [3]);
    inclineRows(opened)[2].methodLog = { choice: "skip", phases: {} };
    inclineRows(opened)[2].weight = "24";
    cycle(opened).dayLogs.d1.finishedAt = "finished";
    cycle(opened).dayLogs.d1.mainExerciseLogs[exercise.id].closedAt = "closed";
    const before = JSON.stringify(opened);
    assert.equal(ensure(freeze(opened)), opened);
    assert.equal(JSON.stringify(opened), before);
  } finally { exercise.setCount = count; }
});

test("wrong cycle-map identity cannot lend a frozen count to another cycle", () => {
  const current = cycle(start());
  const rows = buildRows({ id: "incline-db-press", setCount: 2 }, {
    planId: "bulk-pro", cycles: { 2: current }, currentCycleNumber: 2, dayId: "d1",
  });
  assert.equal(rows.length, 2);
});

test("regular Bulk rows, Cut rows and absent bindings retain the static scaffold without method logs", () => {
  for (const planId of ["bulk-pro", "cut-pro"]) {
    const state = ensure(start(undefined, planId), "d1", planId);
    const logs = cycle(state, planId).dayLogs.d1.mainExerciseLogs;
    for (const exercise of getExercises(planId).filter((item) => getDay(planId, "d1").exerciseIds.includes(item.id))) {
      assert.equal(logs[exercise.id].sets.length, exercise.setCount);
      assert.ok(logs[exercise.id].sets.every((row) => !Object.hasOwn(row, "methodLog") && row.isDone === false));
    }
  }
  const state = start(); delete cycle(state).methodBindings.exercises["incline-db-press"];
  assert.equal(ensure(state, "d1", "bulk-pro", [{ id: "incline-db-press", setCount: 2 }])
    .progressByPlan["bulk-pro"].cycles[1].dayLogs.d1.mainExerciseLogs["incline-db-press"].sets.length, 2);
});

test("post-row applicability reuses the accepted complete-scaffold and ordering contract", () => {
  const definition = resolve(address(cycle(start()))).definition;
  assert.deepEqual(getApplicableSetIndexes(definition, [{ setIndex: 3 }, { setIndex: 1 }, { setIndex: 2 }]), [3]);
  for (const rows of [[], [{ setIndex: 1 }], [{ setIndex: 1 }, { setIndex: 1 }, { setIndex: 3 }],
    [{ setIndex: 0 }, { setIndex: 2 }, { setIndex: 3 }], [{ setIndex: 1 }, { setIndex: 2 }, { setIndex: 4 }]]) {
    assert.deepEqual(getApplicableSetIndexes(definition, rows), []);
  }
});

test("V2, V1 migration and JSON round trips preserve bindings and opaque extension metadata", () => {
  const state = ensure(start());
  const current = cycle(state);
  current.methodBindings.futureContainerField = { keep: true };
  current.methodBindings.exercises["incline-db-press"].futureBindingField = { keep: "original" };
  current.methodBindings.exercises["opaque-exercise"] = { definitionId: "future", revision: 99, data: [1, 2] };
  const wrapper = freeze({ version: 2, savedAt: "synthetic-save", state });
  const raw = JSON.stringify(wrapper);
  const inspection = inspectStoredAppState(raw, 2);
  assert.equal(inspection.status, "valid");
  assert.deepEqual(inspection.wrapper, wrapper);
  assert.deepEqual(migrateV1ToV2({ ...wrapper, version: 1 }).candidate, wrapper);
  const restored = cycle(inspection.wrapper.state);
  assert.equal(resolve(address(restored)).status, "resolved");
  assert.deepEqual(restored.methodBindings, current.methodBindings);
  assert.equal(JSON.stringify(wrapper), raw);
  assert.equal(Object.hasOwn(restored.dayLogs.d1.mainExerciseLogs["incline-db-press"].sets[2], "methodLog"), false);
});

test("main/Core progress, closure and field-by-field legacy carry-over remain independent", () => {
  let state = ensure(start());
  delete cycle(state).methodBindings;
  Object.assign(inclineRows(state)[2], { weight: "24", reps: "10", rir: "2", isDone: true });
  state = ensure(state, "d2");
  const block = getCoreBlock(getDay("bulk-pro", "d2").coreBlockId);
  state = appReducer(state, { type: actions.ENSURE_CORE_BLOCK_LOG, payload: {
    planId: "bulk-pro", dayId: "d2", coreBlock: block, coreExercises: getCoreExercises(block.exerciseIds),
  } });
  const coreLog = cycle(state).dayLogs.d2.coreBlockLog;
  const coreSet = Object.values(coreLog.coreExerciseLogs)[0].sets[0];
  coreSet.isDone = true; coreSet.rir = "2";
  const progress = getProgress(cycle(state).dayLogs.d2, getDay("bulk-pro", "d2").exerciseIds);
  assert.equal(progress.performedCoreSetCount, 1); assert.equal(progress.performedMainSetCount, 0);
  state = appReducer(state, { type: actions.FINISH_DAY, payload: { planId: "bulk-pro", dayId: "d1", finishedAt: "finished" } });
  const first = freeze(cycle(state));
  state = ensure(start(freeze(state)));
  assert.deepEqual(inclineRows(state)[2], { setIndex: 3, weight: "24", reps: "10", rir: "2", isDone: false });
  Object.assign(inclineRows(state)[2], { weight: "26", reps: "", rir: "", isDone: true });
  const second = freeze(cycle(state));
  state = ensure(start(freeze(state)));
  assert.deepEqual(inclineRows(state)[2], { setIndex: 3, weight: "26", reps: "10", rir: "2", isDone: false });
  assert.equal(state.progressByPlan["bulk-pro"].cycles[1], first);
  assert.equal(state.progressByPlan["bulk-pro"].cycles[2], second);
  assert.equal(cycle(state).dayLogs.d1.finishedAt, null);
  assert.equal(cycle(state).completedAt, null);
  assert.deepEqual(cycle(state).methodBindings, expected);
  assert.equal(Object.hasOwn(first, "methodBindings"), false);
  assert.equal(JSON.stringify(state).includes("methodLog"), false);
});
