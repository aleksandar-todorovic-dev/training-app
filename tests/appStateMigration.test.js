import assert from "node:assert/strict";
import { test } from "node:test";
import { inspectStoredAppState, migrateV1ToV2, selectStoredAppState } from "../src/storage/appStateMigration.js";
import { appInitialState } from "../src/state/appInitialState.js";
import { getWorkoutProgress } from "../src/utils/runtime/workoutProgressHelpers.js";
import { areAllTrainingDaysFinished } from "../src/utils/runtime/cycleStatusHelpers.js";
import { advancedMethodDefinitions } from "../src/data/advancedMethods/definitions.js";

const copy = (value) => JSON.parse(JSON.stringify(value));
const dayOrder = ["d1", "d2", "d3", "d4", "d5", "d6"];
const mainPath = "/state/progressByPlan/bulk-pro/cycles/2/dayLogs/d1/mainExerciseLogs/incline-db-press";
const mainLog = (wrapper) => wrapper.state.progressByPlan["bulk-pro"].cycles[2].dayLogs.d1.mainExerciseLogs["incline-db-press"];
const coreLog = (wrapper) => wrapper.state.progressByPlan["bulk-pro"].cycles[2].dayLogs.d1.coreBlockLog;
const currentPlan = (wrapper) => wrapper.state.progressByPlan["bulk-pro"];
const set = (index, done = false) => ({ setIndex: index, weight: "24.", reps: "45", rir: "", isDone: done });

function day(dayId, finishedAt = null) {
  return {
    dayId,
    mainExerciseLogs: {
      "incline-db-press": {
        exerciseId: "incline-db-press",
        sets: [set(1, true), { ...set(2), weight: "", reps: "0012", rir: "2" }, set(3)],
        closedAt: "closed-partial",
        annotation: { note: "Original annotation", flags: [true, null] },
      },
    },
    coreBlockLog: {
      coreBlockId: "core-a",
      coreExerciseLogs: {
        "cable-crunch": { coreExerciseId: "cable-crunch", closedAt: null,
          sets: [{ setIndex: 1, load: "12,5", reps: "14", time: "", rir: "1", isDone: true }] },
        plank: { coreExerciseId: "plank", closedAt: "core-exercise-closed",
          sets: [{ setIndex: 1, load: "", reps: "", time: "035", rir: "", isDone: false }] },
      },
      closedAt: "core-block-closed",
    },
    finishedAt,
  };
}

/** Real persisted shapes; legacy strings deliberately exceed today's UI rules. */
function fixture(version = 1) {
  return {
    version,
    savedAt: "2026-11-14T17:42:31.123+01:00",
    sourceMetadata: { label: "preserve wrapper metadata" },
    state: {
      selectedPlanId: "bulk-pro",
      metadata: { label: "preserve state metadata" },
      progressByPlan: Object.fromEntries(["bulk-pro", "cut-pro"].map((planId) => [planId, {
        currentCycleNumber: 2,
        cycles: {
          1: { planId, cycleNumber: 1, currentDayId: "d6",
            dayLogs: Object.fromEntries(dayOrder.map((id) => [id, day(id, `finished-${id}`)])),
            startedAt: "2026-10-01T08:00:00Z", completedAt: "2026-10-08T10:00:00Z" },
          2: { planId, cycleNumber: 2, currentDayId: "d2",
            dayLogs: { d1: day("d1", "2026-11-14T11:12:13+01:00"),
              d2: { dayId: "d2", mainExerciseLogs: {}, coreBlockLog: null, finishedAt: null } },
            startedAt: "2026-11-13T09:00:00Z", completedAt: null },
        },
      }])),
    },
  };
}

function freezeTree(value) {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(freezeTree);
    Object.freeze(value);
  }
  return value;
}

function assertRecovery(result, source, reason = "invalid") {
  assert.equal(result.status, "recovery-required");
  assert.equal(result.source, source);
  assert.equal(result.reason, reason);
  assert.equal(result.canPersist, false);
  assert.equal(Object.hasOwn(result, "state"), false);
  assert.equal(Object.hasOwn(result, "candidate"), false);
}

test("fresh state is detached and does not manufacture a persisted wrapper or methods", () => {
  const result = selectStoredAppState({ v1: null, v2: null });
  assert.equal(result.status, "ready");
  assert.equal(result.source, "fresh");
  assert.equal(result.wrapper, null);
  assert.equal(result.canPersist, true);
  assert.deepEqual(result.state, appInitialState);
  assert.notEqual(result.state, appInitialState);
  result.state.selectedPlanId = "cut-pro";
  assert.equal(appInitialState.selectedPlanId, null);
});

test("empty saved state and lazy cycle shells are valid without inventing days or sets", () => {
  for (const version of [1, 2]) {
    const source = { version, savedAt: "saved", state: copy(appInitialState) };
    assert.equal(inspectStoredAppState(source, version).status, "valid");
    source.state.selectedPlanId = "bulk-pro";
    assert.equal(inspectStoredAppState(source, version).status, "valid");
    source.state.progressByPlan["bulk-pro"] = {
      currentCycleNumber: 1,
      cycles: { 1: { planId: "bulk-pro", cycleNumber: 1, currentDayId: "d1",
        dayLogs: {}, startedAt: null, completedAt: null } },
    };
    const result = inspectStoredAppState(source, version);
    assert.equal(result.status, "valid");
    assert.deepEqual(result.wrapper, source);
    assert.deepEqual(result.wrapper.state.progressByPlan["bulk-pro"].cycles[1].dayLogs, {});
  }
});

test("V1 migration changes only wrapper version, retaining both plans, all history and metadata", () => {
  const source = freezeTree(fixture());
  const before = JSON.stringify(source);
  assert.equal(inspectStoredAppState(source, 1).status, "valid");
  const result = migrateV1ToV2(source);
  assert.equal(result.status, "migration-pending");
  assert.equal(result.canPersist, false);
  assert.deepEqual(result.candidate, { ...source, version: 2 });
  assert.equal(result.candidate.savedAt, source.savedAt);
  assert.notEqual(result.candidate.state, source.state);
  assert.deepEqual(Object.keys(result.candidate.state.progressByPlan), ["bulk-pro", "cut-pro"]);
  assert.deepEqual(Object.keys(currentPlan(result.candidate).cycles), ["1", "2"]);
  assert.equal(mainLog(result.candidate).sets[0].reps, "45");
  assert.equal(mainLog(result.candidate).sets[1].reps, "0012");
  assert.equal(coreLog(result.candidate).coreExerciseLogs.plank.sets[0].time, "035");
  assert.equal(coreLog(result.candidate).coreExerciseLogs["cable-crunch"].sets[0].load, "12,5");
  assert.equal(JSON.stringify(source), before);
  result.candidate.state.progressByPlan["bulk-pro"].cycles[2].dayLogs.d1.finishedAt = "edited-copy";
  assert.equal(JSON.stringify(source), before);
});

test("migration preserves main/Core counts, closed partial work and cycle lifecycle independently", () => {
  const source = fixture();
  const { candidate } = migrateV1ToV2(source);
  for (const planId of ["bulk-pro", "cut-pro"]) {
    for (const number of [1, 2]) {
      const before = source.state.progressByPlan[planId].cycles[number];
      const after = candidate.state.progressByPlan[planId].cycles[number];
      assert.equal(areAllTrainingDaysFinished(after.dayLogs, dayOrder), number === 1);
      assert.deepEqual([after.startedAt, after.completedAt, after.currentDayId],
        [before.startedAt, before.completedAt, before.currentDayId]);
      for (const [id, beforeDay] of Object.entries(before.dayLogs)) {
        const afterDay = after.dayLogs[id];
        const ids = Object.keys(beforeDay.mainExerciseLogs);
        assert.deepEqual(getWorkoutProgress(afterDay, ids), getWorkoutProgress(beforeDay, ids));
        assert.deepEqual(afterDay, beforeDay);
      }
    }
    assert.deepEqual(getWorkoutProgress(candidate.state.progressByPlan[planId].cycles[2].dayLogs.d1, ["incline-db-press"]), {
      totalExerciseCount: 1, completedExerciseCount: 0, performedMainSetCount: 1, performedCoreSetCount: 1,
    });
  }
});

test("migration is deterministic, JSON-safe and adds no method or legacy semantic fields", () => {
  const source = fixture();
  const result = migrateV1ToV2(JSON.stringify(source));
  assert.deepEqual(result, migrateV1ToV2(source));
  assert.deepEqual(result, JSON.parse(JSON.stringify(result)));
  assert.equal(inspectStoredAppState(result.candidate, 2).status, "valid");
  assert.equal(JSON.stringify(result).includes("methodLog"), false);
  assert.equal(JSON.stringify(result).includes("methodBindings"), false);
  assert.equal(JSON.stringify(result).includes("pre-extension"), false);
  assert.deepEqual(mainLog(result.candidate).sets, mainLog(source).sets);
});

test("savedAt is preserved verbatim; absence is diagnosed without making up a timestamp", () => {
  const source = fixture();
  source.savedAt = "non-ISO original timestamp";
  assert.equal(migrateV1ToV2(source).candidate.savedAt, source.savedAt);
  delete source.savedAt;
  const result = migrateV1ToV2(source);
  assert.equal(result.status, "migration-pending");
  assert.equal(Object.hasOwn(result.candidate, "savedAt"), false);
  assert.ok(result.diagnostics.some((item) => item.code === "missing-saved-at" && item.severity === "warning"));
  source.savedAt = null;
  assertRecovery(migrateV1ToV2(source), "v1");
});

test("V2 wins without merging or even inspecting the stale V1 source", () => {
  const v1 = fixture();
  const v2 = fixture(2);
  v2.savedAt = "latest";
  v2.state.selectedPlanId = "cut-pro";
  mainLog(v2).sets[0].weight = "77";
  for (const old of [null, v1, "broken V1", { get version() { throw Error("must not read"); } }]) {
    const result = selectStoredAppState({ v1: old, v2 });
    assert.equal(result.status, "ready");
    assert.equal(result.source, "v2");
    assert.deepEqual(result.wrapper, v2);
    assert.equal(mainLog(result.wrapper).sets[0].weight, "77");
    assert.notEqual(result.state, v2.state);
  }
  const pending = selectStoredAppState({ v1, v2: null });
  assert.equal(pending.status, "migration-pending");
});

test("a present bad V2 blocks valid V1 fallback and retains the exact problematic source", () => {
  for (const v2 of ["", "{broken", "null", fixture(1), { ...fixture(2), state: {} }, { ...fixture(2), version: 3 }]) {
    const result = selectStoredAppState({ v1: fixture(), v2 });
    assertRecovery(result, "v2", typeof v2 === "object" && v2.version !== 2 ? "unsupported" : "invalid");
    assert.equal(result.input, v2);
  }
});

test("null alone denotes absence; empty/primitive stored values and undefined are invalid", () => {
  assert.equal(inspectStoredAppState(null, 1).status, "absent");
  for (const input of ["", " ", "null", "false", "0", "[]", "{}", "undefined", "{", undefined, false, 0]) {
    const inspected = inspectStoredAppState(input, 1);
    assert.equal(inspected.status, "invalid", String(input));
    assert.equal(inspected.input, input);
    assertRecovery(selectStoredAppState({ v1: input, v2: null }), "v1");
  }
  assertRecovery(selectStoredAppState({ v1: fixture(), v2: undefined }), "v2");
  assertRecovery(migrateV1ToV2(null), "v1", "absent");
});

test("wrong source versions and future wrappers remain unsupported, never downgraded", () => {
  for (const version of [2, 3, 99]) {
    const source = fixture(version);
    assert.equal(inspectStoredAppState(source, 1).status, "unsupported");
    assertRecovery(migrateV1ToV2(source), "v1", "unsupported");
    assert.equal(source.version, version);
  }
  for (const version of [undefined, null, "1", 0, -1, 1.5]) {
    const source = fixture();
    if (version === undefined) delete source.version;
    else source.version = version;
    assert.equal(inspectStoredAppState(source, 1).status, "invalid");
  }
});

const damagedCases = [
  ["missing state", (w) => { delete w.state; }, "/state"],
  ["invalid selected plan", (w) => { w.state.selectedPlanId = 7; }, "/state/selectedPlanId"],
  ["missing progress", (w) => { delete w.state.progressByPlan; }, "/state/progressByPlan"],
  ["invalid plan", (w) => { w.state.progressByPlan["cut-pro"] = null; }, "/state/progressByPlan/cut-pro"],
  ["invalid cycle pointer", (w) => { currentPlan(w).currentCycleNumber = 0; }, "/state/progressByPlan/bulk-pro/currentCycleNumber"],
  ["missing pointed cycle", (w) => { currentPlan(w).currentCycleNumber = 3; }, "/state/progressByPlan/bulk-pro/currentCycleNumber"],
  ["empty cycles", (w) => { currentPlan(w).cycles = {}; }, "/state/progressByPlan/bulk-pro/currentCycleNumber"],
  ["invalid cycles map", (w) => { currentPlan(w).cycles = []; }, "/state/progressByPlan/bulk-pro/cycles"],
  ["broken historical cycle", (w) => { currentPlan(w).cycles[1] = null; }, "/state/progressByPlan/bulk-pro/cycles/1"],
  ["cycle key alias", (w) => { currentPlan(w).cycles["01"] = copy(currentPlan(w).cycles[1]); }, "/state/progressByPlan/bulk-pro/cycles/01/cycleNumber"],
  ["mismatched cycle identity", (w) => { currentPlan(w).cycles[1].cycleNumber = 2; }, "/state/progressByPlan/bulk-pro/cycles/1/cycleNumber"],
  ["large mismatched cycle number", (w) => { currentPlan(w).cycles[1].cycleNumber = Number.MAX_SAFE_INTEGER; }, "/state/progressByPlan/bulk-pro/cycles/1/cycleNumber"],
  ["mismatched plan identity", (w) => { currentPlan(w).cycles[1].planId = "cut-pro"; }, "/state/progressByPlan/bulk-pro/cycles/1/planId"],
  ["missing current day", (w) => { delete currentPlan(w).cycles[1].currentDayId; }, "/state/progressByPlan/bulk-pro/cycles/1/currentDayId"],
  ["invalid lifecycle timestamp", (w) => { currentPlan(w).cycles[1].completedAt = 1; }, "/state/progressByPlan/bulk-pro/cycles/1/completedAt"],
  ["invalid days map", (w) => { currentPlan(w).cycles[1].dayLogs = []; }, "/state/progressByPlan/bulk-pro/cycles/1/dayLogs"],
  ["mismatched day", (w) => { currentPlan(w).cycles[2].dayLogs.d1.dayId = "d2"; }, "/state/progressByPlan/bulk-pro/cycles/2/dayLogs/d1/dayId"],
  ["invalid exercise map", (w) => { currentPlan(w).cycles[2].dayLogs.d1.mainExerciseLogs = []; }, "/state/progressByPlan/bulk-pro/cycles/2/dayLogs/d1/mainExerciseLogs"],
  ["invalid exercise", (w) => { currentPlan(w).cycles[2].dayLogs.d1.mainExerciseLogs["incline-db-press"] = []; }, mainPath],
  ["mismatched exercise", (w) => { mainLog(w).exerciseId = "wrong"; }, `${mainPath}/exerciseId`],
  ["missing close field", (w) => { delete mainLog(w).closedAt; }, `${mainPath}/closedAt`],
  ["invalid sets", (w) => { mainLog(w).sets = {}; }, `${mainPath}/sets`],
  ["invalid set record", (w) => { mainLog(w).sets[0] = null; }, `${mainPath}/sets/0`],
  ["invalid set index", (w) => { mainLog(w).sets[0].setIndex = 0; }, `${mainPath}/sets/0/setIndex`],
  ["duplicate set identity", (w) => { mainLog(w).sets[1].setIndex = 1; }, `${mainPath}/sets/1/setIndex`],
  ["non-string main value", (w) => { mainLog(w).sets[0].reps = 12; }, `${mainPath}/sets/0/reps`],
  ["non-boolean Done", (w) => { mainLog(w).sets[0].isDone = "true"; }, `${mainPath}/sets/0/isDone`],
  ["missing Core", (w) => { delete currentPlan(w).cycles[2].dayLogs.d1.coreBlockLog; }, "/state/progressByPlan/bulk-pro/cycles/2/dayLogs/d1/coreBlockLog"],
  ["damaged Core exercise map", (w) => { coreLog(w).coreExerciseLogs = []; }, "/state/progressByPlan/bulk-pro/cycles/2/dayLogs/d1/coreBlockLog/coreExerciseLogs"],
  ["non-string Core time", (w) => { coreLog(w).coreExerciseLogs.plank.sets[0].time = 35; }, "/state/progressByPlan/bulk-pro/cycles/2/dayLogs/d1/coreBlockLog/coreExerciseLogs/plank/sets/0/time"],
];

for (const [name, damage, path] of damagedCases) {
  test(`damaged history: ${name} is diagnosed without discarding any plan or cycle`, () => {
    const source = fixture();
    damage(source);
    const before = JSON.stringify(source);
    const result = migrateV1ToV2(freezeTree(source));
    assertRecovery(result, "v1");
    assert.ok(result.diagnostics.some((item) => item.path === path && item.severity === "error"), JSON.stringify(result.diagnostics));
    assert.equal(result.input, source);
    assert.equal(JSON.stringify(result.input), before);
    assert.deepEqual(result.input, JSON.parse(before));
  });
}

test("JSON-safe unknown history IDs, metadata and row ordering are preserved without current-plan filtering", () => {
  const source = fixture();
  const oldPlan = copy(currentPlan(source));
  for (const cycle of Object.values(oldPlan.cycles)) cycle.planId = "retired-plan";
  source.state.progressByPlan["retired-plan"] = oldPlan;
  source.state.selectedPlanId = "retired-plan";
  mainLog(source).sets.reverse();
  // Extension keys must not be assigned through a prototype setter during cloning.
  source.extra = JSON.parse('{"__proto__":{"preserve":true},"constructor":"metadata"}');
  const result = migrateV1ToV2(source);
  assert.deepEqual(result.candidate, { ...source, version: 2 });
  assert.equal(Object.hasOwn(result.candidate.extra, "__proto__"), true);
  assert.equal(Object.getPrototypeOf(result.candidate.extra), Object.prototype);
});

test("unknown method revisions remain opaque and are never replaced by current definitions", () => {
  for (const version of [1, 2]) {
    const source = fixture(version);
    // Opaque fixture metadata, not a proposed binding schema or resolved context.
    const future = { definitionId: advancedMethodDefinitions[0].definitionId, revision: 99 };
    currentPlan(source).cycles[2].methodBindings = { "incline-db-press": future };
    mainLog(source).sets[2].methodLog = {
      definitionId: "future/opaque-definition", revision: 99,
      choice: "record", phases: { "future-phase": { execution: "performed", reps: "500", futureMetric: { unit: "unknown", value: 7 } } },
    };
    const result = selectStoredAppState({ v1: version === 1 ? source : null, v2: version === 2 ? source : null });
    const output = version === 1 ? result.candidate : result.wrapper;
    assert.equal(result.status, version === 1 ? "migration-pending" : "ready");
    assert.deepEqual(output, { ...source, version: 2 });
    assert.equal(mainLog(output).sets[2].methodLog.revision, 99);
    assert.ok(result.diagnostics.some((item) => item.code === "method-context-unresolved"));
    assert.ok(result.diagnostics.some((item) => item.code === "method-bindings-unresolved"));
  }
});

test("even a familiar exercise/phase ID cannot supply a missing trusted revision context", () => {
  const source = fixture(2);
  mainLog(source).sets[2].methodLog = { choice: "record", phases: {
    "extra-reps": { execution: "performed", reps: "500" },
  } };
  const result = inspectStoredAppState(source, 2);
  assert.equal(result.status, "valid");
  assert.equal(mainLog(result.wrapper).sets[2].methodLog.phases["extra-reps"].reps, "500");
  assert.ok(result.diagnostics.some((item) => item.code === "method-context-unresolved"));
});

test("recognizably malformed method envelopes block migration, retaining all valid base values", () => {
  for (const log of [null, [], 7, {}, { choice: "invalid", phases: {} },
    { choice: "record", phases: [] }, { choice: "record", phases: { extra: null } },
    { choice: "record", phases: { extra: { execution: "done" } } }]) {
    const source = fixture(2);
    mainLog(source).sets[2].methodLog = log;
    const originalBase = copy(mainLog(source).sets[0]);
    const result = selectStoredAppState({ v1: fixture(), v2: source });
    assertRecovery(result, "v2");
    assert.ok(result.diagnostics.some((item) => item.path.startsWith(`${mainPath}/sets/2/methodLog`) && item.severity === "error"));
    assert.deepEqual(mainLog(result.input).sets[0], originalBase);
    assert.equal(mainLog(result.input).sets[2].methodLog, log);
  }
});

test("non-JSON-safe parsed inputs are rejected before serialization can lose values or invoke getters", () => {
  const cycle = {};
  cycle.self = cycle;
  const invalid = [undefined, NaN, Infinity, -0, 9007199254740992, 1n, () => 1,
    Symbol("value"), new Date(), new Map(), cycle, Array(2),
    Object.assign([1], { extra: 2 }), Object.assign({}, { [Symbol("key")]: true }),
    Object.defineProperty({}, "hidden", { value: 1 }),
    { get value() { throw Error("must not invoke getter"); } },
    { toJSON() { throw Error("must not invoke serializer"); } },
  ];
  for (const extra of invalid) {
    const source = fixture();
    source.extra = extra;
    const inspected = inspectStoredAppState(source, 1);
    assert.equal(inspected.status, "invalid");
    assert.ok(inspected.diagnostics.some((item) => item.code.startsWith("non-json") || item.code === "circular-reference"));
    assert.equal(inspected.input, source);
  }
});

test("diagnostic paths use escaped JSON pointers for unusual metadata keys", () => {
  const source = fixture();
  source.extra = { "slash/~key": undefined };
  const result = inspectStoredAppState(source, 1);
  assert.equal(result.status, "invalid");
  assert.equal(result.diagnostics[0].path, "/extra/slash~1~0key");
});

test("raw duplicate keys require recovery instead of losing the earlier value during JSON parsing", () => {
  const valid = JSON.stringify(fixture());
  for (const replacement of [
    '"version":2,"version":1',
    '"version":1,"extra":{"history":"first","history":"second"}',
    '"version":1,"extra":{"history":"first","hist\\u006fry":"second"}',
    '"version":1,"extra":[{"same":1,"same":2}]',
  ]) {
    const raw = valid.replace('"version":1', replacement);
    const result = migrateV1ToV2(raw);
    assertRecovery(result, "v1");
    assert.equal(result.input, raw);
    assert.equal(result.diagnostics[0].code, "duplicate-json-key");
  }
  const source = fixture();
  source.extra = [{ key: "strings with , } [ and escaped \\\" characters" }, { key: ["key", "key"] }];
  assert.equal(inspectStoredAppState(JSON.stringify(source), 1).status, "valid");
});
