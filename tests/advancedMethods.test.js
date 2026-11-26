import assert from "node:assert/strict";
import { test } from "node:test";
import { advancedMethodDefinitions, getMethodDefinition } from "../src/data/advancedMethods/definitions.js";
import { deriveMethodState, getApplicableSetIndexes, transitionMethodLog } from "../src/utils/runtime/advancedMethodHelpers.js";
import { isValidMethodMetricValue, normalizeAssistanceKg, validateMethodLog } from "../src/utils/runtime/advancedMethodValidation.js";
import { bulkProDayDetails } from "../src/data/dayDetails/bulkProDayDetails.js";
import { bulkProExercises } from "../src/data/exercises/bulkProExercises.js";
import { cutProExercises } from "../src/data/exercises/cutProExercises.js";

const [incline, curl, stretch, cluster] = advancedMethodDefinitions;
const previousDefinitions = [incline, curl, stretch, cluster];
const clusterPhaseId = "additional-burst";
const setAssistance = (mode, kg, phaseId = clusterPhaseId) => ({ type: "set-assistance", phaseId, mode, kg });
const clearAssistance = (phaseId = clusterPhaseId) => ({ type: "clear-assistance", phaseId });
const metric = (value, field = "reps", phaseId = "extra-reps") =>
  ({ type: "set-metric", phaseId, field, value });
const execution = (value, phaseId = "extra-reps") =>
  ({ type: "set-execution", phaseId, execution: value });
const choice = (value) => ({ type: "set-choice", choice: value });
const recordWith = (definition, ...changes) => changes.reduce(
  (record, change) => transitionMethodLog(definition, record, change), undefined,
);

function freezeTree(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freezeTree);
    Object.freeze(value);
  }
  return value;
}

const preacher = freezeTree({
  planId: "bulk-pro", exerciseId: "preacher-curl-mechanical",
  definitionId: "bulk-pro/preacher-curl-mechanical/mechanical-set",
  revision: 1, type: "mechanical-set", prescribedSetCount: 1, appliesTo: "last",
  base: { semantics: "pre-extension", variationId: "wide-grip", loadKind: "external", loadUnit: "kg" },
  phases: [{
    phaseId: "narrow-grip", loadRule: "same-as-base", metrics: ["reps"], requiredMetrics: ["reps"], targets: {},
  }],
});
const narrowReps = (value) => metric(value, "reps", "narrow-grip");
const narrowExecution = (value) => execution(value, "narrow-grip");

test("synthetic Preacher records attempt and numeric completeness independently, without a target", () => {
  assert.deepEqual(getApplicableSetIndexes(preacher, [{ setIndex: 1 }]), [1]);
  assert.equal(deriveMethodState(preacher, undefined).status, "unknown");
  const draft = recordWith(preacher, narrowReps("30"));
  assert.deepEqual(draft, { choice: "record", phases: { "narrow-grip": { execution: "unconfirmed", reps: "30" } } });
  assert.deepEqual(deriveMethodState(preacher, draft), {
    valid: true, errors: [], status: "draft", numericComplete: true, missingMetrics: [], targetComparisons: {},
  });
  assert.equal(deriveMethodState(preacher, recordWith(preacher, narrowExecution("partial"))).status, "partial");

  for (const value of ["", "0", "30"]) {
    const confirmed = recordWith(preacher, narrowReps(value), narrowExecution("performed"));
    assert.deepEqual(confirmed, { choice: "record", phases: { "narrow-grip": { execution: "performed", reps: value } } });
    assert.deepEqual(deriveMethodState(preacher, confirmed), {
      valid: true, errors: [], status: "performed", numericComplete: value !== "",
      missingMetrics: value === "" ? ["narrow-grip.reps"] : [], targetComparisons: {},
    });
  }
  const withoutMetric = { choice: "record", phases: { "narrow-grip": { execution: "performed" } } };
  assert.equal(deriveMethodState(preacher, withoutMetric).numericComplete, false);
  for (const value of ["31", "-1", "1.5", "1,5", "01", " 3", "2\n", "1e1", 0, null]) {
    assert.equal(transitionMethodLog(preacher, draft, narrowReps(value)), draft, String(value));
    assert.equal(validateMethodLog(preacher, {
      choice: "record", phases: { "narrow-grip": { execution: "unconfirmed", reps: value } },
    }).valid, false, String(value));
  }
});

test("production Preacher matches the independent rev1 contract and every nested value is frozen", () => {
  const definition = getMethodDefinition(preacher);
  assert.deepEqual(definition, preacher);
  const { base, phases } = definition;
  const [phase] = phases;
  assert.ok([definition, base, phases, phase, phase.metrics, phase.requiredMetrics, phase.targets].every(Object.isFrozen));
  assert.equal(getMethodDefinition({ ...preacher, revision: 2 }), null);
  assert.equal(getMethodDefinition({ ...preacher, planId: "cut-pro" }), null);
  assert.equal(getMethodDefinition({
    ...preacher, exerciseId: "push-up-mechanical-dropset", definitionId: "bulk-pro/push-up-mechanical-dropset/mechanical-dropset",
  }), null);
});

test("Preacher Skip/Resume, clearing, rejected changes and repeated edits preserve evidence", () => {
  const confirmed = freezeTree(recordWith(preacher, narrowReps("0"), narrowExecution("performed")));
  const skipped = freezeTree(transitionMethodLog(preacher, confirmed, choice("skip")));
  assert.equal(deriveMethodState(preacher, skipped).status, "skipped");
  assert.equal(skipped.phases["narrow-grip"], confirmed.phases["narrow-grip"]);
  assert.equal(transitionMethodLog(preacher, skipped, choice("skip")), skipped);
  assert.equal(transitionMethodLog(preacher, skipped, narrowReps("2")), skipped);
  assert.equal(transitionMethodLog(preacher, skipped, narrowExecution("partial")), skipped);
  assert.deepEqual(transitionMethodLog(preacher, skipped, choice("record")), confirmed);

  const cleared = transitionMethodLog(preacher, confirmed, narrowReps(""));
  assert.deepEqual(cleared, { choice: "record", phases: { "narrow-grip": { execution: "performed", reps: "" } } });
  assert.equal(transitionMethodLog(preacher, cleared, narrowReps("")), cleared);
  assert.equal(transitionMethodLog(preacher, undefined, narrowReps("")), undefined);
  assert.equal(transitionMethodLog(preacher, undefined, narrowExecution("unconfirmed")), undefined);

  for (const change of [
    choice("record"), narrowReps("0"), narrowExecution("performed"),
    { ...choice("skip"), extra: true }, { ...narrowReps("5"), extra: true },
    { ...narrowExecution("partial"), extra: true }, narrowExecution("done"),
    metric("5", "reps", "wide-grip"), metric("5", "reps", "extra-reps"),
    ...["loadKg", "restSeconds", "durationSeconds", "rir", "assistance"].map((field) => metric("5", field, "narrow-grip")),
    setAssistance("entered", "5", "narrow-grip"), clearAssistance("narrow-grip"),
    { type: "finish-dropset", phaseId: "narrow-grip" }, { type: "extend-dropset", phaseId: "narrow-grip" },
  ]) assert.equal(transitionMethodLog(preacher, confirmed, change), confirmed, JSON.stringify(change));
});

test("Preacher validation rejects altered protocol semantics and malformed records", () => {
  const mismatches = [
    (d) => { d.planId = "cut-pro"; }, (d) => { d.exerciseId = "preacher-curl-ez"; },
    (d) => { d.definitionId += "-foreign"; }, (d) => { d.type = "rest-pause"; },
    (d) => { d.revision = 2; }, (d) => { d.appliesTo = "all"; }, (d) => { d.prescribedSetCount = 2; },
    (d) => { d.base.semantics = "post-extension"; }, (d) => { d.base.variationId = "narrow-grip"; },
    (d) => { d.base.loadKind = "machine-assistance"; }, (d) => { d.base.loadUnit = "lb"; },
    (d) => { d.base.loadConvention = "per-side"; }, (d) => { d.reductionPercent = 20; },
    (d) => { d.phases = []; }, (d) => { d.phases.push(d.phases[0]); },
    (d) => { d.phases[0].phaseId = "wide-grip"; }, (d) => { d.phases[0].loadRule = "reduced-from-previous"; },
    (d) => { d.phases[0].metrics.push("loadKg"); }, (d) => { d.phases[0].requiredMetrics = []; },
    (d) => { d.phases[0].targets = { reps: { min: 6, max: 8 } }; },
    (d) => { d.phases[0].equipment = "EZ"; }, (d) => { d.phases[0].metrics.extra = "loadKg"; },
    (d) => { Object.setPrototypeOf(d.phases[0].metrics, null); },
    (d) => { Object.defineProperty(d.phases[0].metrics, "0", { get: () => assert.fail("executed a getter") }); },
  ];
  for (const alter of mismatches) {
    const definition = structuredClone(preacher);
    alter(definition);
    assert.equal(validateMethodLog(definition, undefined).valid, false, alter.toString());
    assert.equal(transitionMethodLog(definition, undefined, narrowExecution("performed")), undefined);
  }
  assert.equal(validateMethodLog(Object.create(preacher), undefined).valid, false);

  for (const record of [
    null, { choice: "record", phases: [] }, { choice: "record", phases: { "narrow-grip": { reps: "5" } } },
    { choice: "skip", phases: { "narrow-grip": { execution: "done", reps: "0" } } },
    { choice: "record", phases: { "wide-grip": { execution: "performed", reps: "8" } } },
    { choice: "record", endPhaseId: "narrow-grip", phases: {} },
    ...["loadKg", "restSeconds", "durationSeconds", "rir", "assistance", "equipment", "targets"].map((field) => ({
      choice: "record", phases: { "narrow-grip": { execution: "performed", [field]: "5" } },
    })),
  ]) {
    assert.equal(validateMethodLog(preacher, record).valid, false, JSON.stringify(record));
    assert.equal(transitionMethodLog(preacher, record, choice("skip")), record);
  }
});

test("pilot definitions match actual Bulk exercise identity, counts and prescriptions", () => {
  const expected = [
    [incline, "incline-db-press", 3, "rest-pause", "extra-reps", { reps: { min: 2, max: 3 }, restSeconds: { min: 15, max: 15 } },
      "Last set rest-pause: rack the dumbbells for 15 seconds, then perform 2-3 extra reps."],
    [curl, "face-away-cable-curl", 1, "rest-pause", "extra-reps", { reps: { min: 5, max: 6 }, restSeconds: { min: 15, max: 15 } },
      "Rest-pause: after the main set, rest 15 seconds and perform 5-6 extra reps."],
    [stretch, "cable-stretch-fly", 1, "iso-stretch", "loaded-stretch", { durationSeconds: { min: 15, max: 15 } },
      "Finish the set with a 15-second loaded stretch in the bottom position."],
  ];
  for (const [definition, id, count, type, phaseId, targets, guidance] of expected) {
    const exercise = bulkProExercises.find((item) => item.id === id);
    assert.equal(definition.planId, "bulk-pro");
    assert.equal(definition.exerciseId, id);
    assert.equal(definition.definitionId, `bulk-pro/${id}/${type}`);
    assert.equal(definition.revision, 1);
    assert.equal(definition.type, type);
    assert.equal(exercise.details.advancedTechniqueType, type);
    assert.equal(exercise.details.advancedTechnique, guidance);
    assert.equal(definition.prescribedSetCount, exercise.setCount);
    assert.equal(exercise.setCount, count);
    assert.equal(definition.appliesTo, "last");
    assert.deepEqual(definition.base, { semantics: "pre-extension", loadKind: "external", loadUnit: "kg" });
    assert.equal(definition.phases.length, 1);
    assert.equal(definition.phases[0].phaseId, phaseId);
    assert.equal(definition.phases[0].loadRule, "same-as-base");
    assert.deepEqual(definition.phases[0].targets, targets);
    assert.deepEqual(definition.phases[0].metrics, Object.keys(targets));
    assert.deepEqual(definition.phases[0].requiredMetrics, [type === "iso-stretch" ? "durationSeconds" : "reps"]);
    assert.deepEqual(JSON.parse(JSON.stringify(definition)), definition);
  }
  assert.throws(() => { incline.phases[0].targets.reps.min = 9; }, TypeError);
});

test("Cluster revision 1 matches the D5 prescription and is deeply frozen", () => {
  assert.deepEqual(cluster, {
    definitionId: "bulk-pro/assisted-pull-up-cluster/cluster",
    revision: 1,
    planId: "bulk-pro",
    exerciseId: "assisted-pull-up-cluster",
    type: "cluster",
    prescribedSetCount: 2,
    appliesTo: "all",
    base: { semantics: "pre-extension", loadKind: "machine-assistance", loadUnit: "kg" },
    phases: [{
      phaseId: "additional-burst",
      metrics: ["reps", "restSeconds"],
      requiredMetrics: ["reps"],
      targets: { reps: { min: 4, max: 5 }, restSeconds: { min: 15, max: 15 } },
      loadRule: "adjustable-machine-assistance",
    }],
  });
  const day = bulkProDayDetails.find(({ id }) => id === "d5");
  const exercise = bulkProExercises.find(({ id }) => id === cluster.exerciseId);
  assert.ok(day.exerciseIds.includes(exercise.id));
  assert.equal(exercise.setCount, cluster.prescribedSetCount);
  assert.equal(exercise.prescription, "2 x 8-10");
  assert.equal(exercise.details.rest, "120 s");
  assert.equal(exercise.details.advancedTechniqueType, cluster.type);
  assert.equal(exercise.details.advancedTechnique,
    "Cluster set: perform 8-10 reps, rest 15 seconds, then perform 4-5 more reps.");
  assert.throws(() => { cluster.base.loadKind = "external"; }, TypeError);
  assert.throws(() => { cluster.phases[0].targets.restSeconds.max = 120; }, TypeError);
  assert.throws(() => { cluster.phases[0].metrics.push("assistance"); }, TypeError);
});

test("Cluster applies independently to both prescribed indexes on a complete scaffold", () => {
  const rows = freezeTree([{ setIndex: 2, isDone: true }, { setIndex: 1, isDone: false }]);
  assert.deepEqual(getApplicableSetIndexes(cluster, rows), [1, 2]);
  for (const invalid of [
    [{ setIndex: 1 }], Array(2), [{ setIndex: 1 }, null],
    [{ setIndex: 1 }, { setIndex: 1 }], [{ setIndex: 1 }, { setIndex: 3 }],
    ...["2", 1.5, Symbol("2"), 2n].map((setIndex) => [{ setIndex: 1 }, { setIndex }]),
  ]) {
    assert.deepEqual(getApplicableSetIndexes(cluster, invalid), []);
  }
});

test("exercise IDs are unique within each current plan; Cut never resolves Bulk methods", () => {
  for (const exercises of [bulkProExercises, cutProExercises]) {
    assert.equal(new Set(exercises.map((item) => item.id)).size, exercises.length);
  }
  assert.equal(bulkProExercises.length, 54);
  assert.equal(cutProExercises.length, 52);
  assert.ok(cutProExercises.some((item) => item.id === incline.exerciseId));
  for (const definition of advancedMethodDefinitions) {
    assert.equal(getMethodDefinition({ ...definition, planId: "cut-pro" }), null);
  }
  assert.ok(cutProExercises.every((item) => !item.details.advancedTechnique));
});

test("lookup requires exact plan, exercise, ID and explicit numeric revision", () => {
  for (const definition of advancedMethodDefinitions) {
    assert.equal(getMethodDefinition(definition), definition);
    for (const mismatch of [
      { planId: "unknown" }, { exerciseId: "unknown" }, { definitionId: "unknown" },
      { revision: undefined }, { revision: "1" }, { revision: 0 }, { revision: 2 },
    ]) assert.equal(getMethodDefinition({ ...definition, ...mismatch }), null);
  }
  assert.equal(getMethodDefinition(), null);
  assert.equal(getMethodDefinition(null), null);
  assert.equal(validateMethodLog(null, undefined).valid, false);
});

test("last means last prescribed row regardless of Done; all uses the same scaffold", () => {
  const rows = freezeTree([{ setIndex: 3, isDone: false }, { setIndex: 1, isDone: true }, { setIndex: 2, isDone: false }]);
  assert.deepEqual(getApplicableSetIndexes(incline, rows), [3]);
  // Synthetic metadata exercises the all rule without enabling another protocol.
  assert.deepEqual(getApplicableSetIndexes({ ...incline, appliesTo: "all" }, rows), [1, 2, 3]);
  for (const definition of [curl, stretch]) {
    assert.deepEqual(getApplicableSetIndexes(definition, [{ setIndex: 1, isDone: false }]), [1]);
  }
  for (const invalid of [undefined, null, [], Array(3), [{ setIndex: 1 }],
    [{ setIndex: 1 }, { setIndex: 1 }, { setIndex: 3 }],
    [{ setIndex: 0 }, { setIndex: 2 }, { setIndex: 3 }],
    [{ setIndex: 1 }, { setIndex: 2 }, { setIndex: 4 }]]) {
    assert.deepEqual(getApplicableSetIndexes(incline, invalid), []);
  }
  assert.deepEqual(getApplicableSetIndexes(null, rows), []);
});

test("unknown, explicit skip and draft selection are distinct and have no fabricated actuals", () => {
  assert.equal(deriveMethodState(incline, undefined).status, "unknown");
  const skipped = recordWith(incline, choice("skip"));
  assert.deepEqual(skipped, { choice: "skip", phases: {} });
  assert.equal(deriveMethodState(incline, skipped).status, "skipped");
  const draft = recordWith(incline, choice("record"));
  assert.deepEqual(draft, { choice: "record", phases: {} });
  assert.equal(deriveMethodState(incline, draft).status, "draft");
  assert.equal(deriveMethodState(incline, draft).numericComplete, false);
  const entered = recordWith(incline, metric("3"));
  assert.deepEqual(entered.phases["extra-reps"], { execution: "unconfirmed", reps: "3", restSeconds: "" });
  const derived = deriveMethodState(incline, entered);
  assert.equal(derived.status, "draft");
  assert.equal(derived.numericComplete, true);
  assert.deepEqual(derived.targetComparisons, { "extra-reps": { reps: "within", restSeconds: "unrecorded" } });
});

test("phase confirmation, numeric completeness and targets change independently", () => {
  let record = recordWith(incline, execution("partial"));
  assert.equal(deriveMethodState(incline, record).status, "partial");
  assert.equal(deriveMethodState(incline, record).numericComplete, false);
  record = transitionMethodLog(incline, record, execution("performed"));
  assert.equal(deriveMethodState(incline, record).status, "performed");
  assert.deepEqual(deriveMethodState(incline, record).missingMetrics, ["extra-reps.reps"]);
  record = transitionMethodLog(incline, record, metric("1"));
  assert.equal(deriveMethodState(incline, record).status, "performed");
  assert.equal(deriveMethodState(incline, record).numericComplete, true);
  assert.equal(deriveMethodState(incline, record).targetComparisons["extra-reps"].reps, "below");
  record = transitionMethodLog(incline, record, metric("4"));
  assert.equal(deriveMethodState(incline, record).targetComparisons["extra-reps"].reps, "above");
  record = transitionMethodLog(incline, record, metric(""));
  assert.equal(deriveMethodState(incline, record).status, "performed");
  assert.equal(deriveMethodState(incline, record).numericComplete, false);
  record = transitionMethodLog(incline, record, execution("unconfirmed"));
  assert.equal(deriveMethodState(incline, record).status, "draft");
});

test("iso-stretch records measured seconds without copying the 15-second target", () => {
  const confirmed = recordWith(stretch, execution("performed", "loaded-stretch"));
  assert.equal(confirmed.phases["loaded-stretch"].durationSeconds, "");
  assert.equal(deriveMethodState(stretch, confirmed).numericComplete, false);
  const measured = transitionMethodLog(stretch, confirmed, metric("8", "durationSeconds", "loaded-stretch"));
  assert.equal(deriveMethodState(stretch, measured).status, "performed");
  assert.equal(deriveMethodState(stretch, measured).numericComplete, true);
  assert.equal(deriveMethodState(stretch, measured).targetComparisons["loaded-stretch"].durationSeconds, "below");
  const onTarget = transitionMethodLog(stretch, measured, metric("15", "durationSeconds", "loaded-stretch"));
  assert.equal(deriveMethodState(stretch, onTarget).targetComparisons["loaded-stretch"].durationSeconds, "within");
});

test("curl has its own rep target; measured rest is optional and never assumed", () => {
  let record = recordWith(curl, metric("3"), execution("performed"));
  assert.equal(deriveMethodState(curl, record).targetComparisons["extra-reps"].reps, "below");
  record = transitionMethodLog(curl, record, metric("6"));
  assert.equal(deriveMethodState(curl, record).targetComparisons["extra-reps"].reps, "within");
  assert.equal(deriveMethodState(curl, record).numericComplete, true);
  for (const [seconds, comparison] of [["0", "below"], ["15", "within"], ["20", "above"]]) {
    const timed = transitionMethodLog(curl, record, metric(seconds, "restSeconds"));
    assert.equal(deriveMethodState(curl, timed).targetComparisons["extra-reps"].restSeconds, comparison);
    assert.equal(deriveMethodState(curl, timed).status, "performed");
  }
});

test("skip retains inactive phase data and resume restores the prior confirmation", () => {
  const original = freezeTree(recordWith(incline, metric("3"), execution("performed")));
  const skipped = transitionMethodLog(incline, original, choice("skip"));
  assert.deepEqual(skipped.phases, original.phases);
  assert.equal(deriveMethodState(incline, skipped).status, "skipped");
  assert.equal(deriveMethodState(incline, skipped).numericComplete, null);
  assert.deepEqual(deriveMethodState(incline, skipped).missingMetrics, []);
  assert.deepEqual(deriveMethodState(incline, skipped).targetComparisons, {});
  assert.equal(transitionMethodLog(incline, skipped, metric("2")), skipped);
  assert.equal(transitionMethodLog(incline, skipped, execution("partial")), skipped);
  const resumed = transitionMethodLog(incline, skipped, choice("record"));
  assert.deepEqual(resumed, original);
  assert.equal(deriveMethodState(incline, resumed).status, "performed");
});

test("approved input limits accept empty and canonical integers: reps 0–30, seconds 0–999", () => {
  for (const field of ["reps", "restSeconds", "durationSeconds"]) {
    const maxValue = field === "reps" ? 30 : 999;
    for (const value of ["", "0", "1", String(maxValue - 1), String(maxValue)]) {
      assert.equal(isValidMethodMetricValue(field, value), true, `${field}: ${value}`);
    }
    for (const value of [String(maxValue + 1), "-1", "1.5", "1,5", "15.0", " 1", "1 ", "1\n", "0\r\n", "\t1", "00", "01", "+1", "1e2", "NaN", "Infinity",
      "9007199254740992", "999999999999999999999999999", 1, 0, NaN, Infinity, null, undefined, {}, []]) {
      assert.equal(isValidMethodMetricValue(field, value), false, `${field}: ${String(value)}`);
    }
  }
  assert.equal(isValidMethodMetricValue("weight", "24"), false);
  for (const definition of previousDefinitions) {
    const phase = definition.phases[0];
    for (const field of phase.metrics) {
      const maxValue = field === "reps" ? 30 : 999;
      const previous = freezeTree(recordWith(definition, metric(String(maxValue), field, phase.phaseId)));
      const rejected = transitionMethodLog(definition, previous, metric(String(maxValue + 1), field, phase.phaseId));
      assert.equal(rejected, previous);
      assert.equal(previous.phases[phase.phaseId][field], String(maxValue));
      const invalid = { ...previous, phases: {
        [phase.phaseId]: { ...previous.phases[phase.phaseId], [field]: String(maxValue + 1) },
      } };
      assert.equal(validateMethodLog(definition, invalid).valid, false);
    }
    const zero = recordWith(definition, metric("0", phase.requiredMetrics[0], phase.phaseId));
    assert.equal(deriveMethodState(definition, zero).status, "draft");
    assert.equal(deriveMethodState(definition, zero).numericComplete, true);
    // Approved: zero may describe a confirmed attempt; never infer confirmation.
    const confirmed = transitionMethodLog(definition, zero, execution("performed", phase.phaseId));
    assert.equal(deriveMethodState(definition, confirmed).status, "performed");
    assert.equal(deriveMethodState(definition, confirmed).targetComparisons[phase.phaseId][phase.requiredMetrics[0]], "below");
  }
});

test("invalid shapes and JSON-unsafe fields fail without being normalized away", () => {
  const valid = recordWith(incline, metric("3"));
  const invalid = [null, [], "record", 1, {}, { choice: "unknown", phases: {} },
    { choice: "record", phases: null }, { choice: "record", phases: [] },
    { ...valid, totalReps: "13" }, { ...valid, weight: "24" },
    { ...valid, phases: { unknown: { execution: "performed" } } },
    { ...valid, phases: { "extra-reps": null } },
    { ...valid, phases: { "extra-reps": { reps: "3" } } },
    { ...valid, phases: { "extra-reps": { execution: "done" } } },
    { ...valid, phases: { "extra-reps": { execution: "performed", reps: undefined } } },
    { ...valid, phases: { "extra-reps": { execution: "performed", reps: 3 } } },
    { ...valid, phases: { "extra-reps": { execution: "performed", weight: "24" } } },
    { ...valid, phases: { "extra-reps": { execution: "performed", durationSeconds: "15" } } },
    { ...valid, [Symbol("hidden")]: true },
    Object.create({ choice: "record", phases: {} }),
    Object.defineProperty({ choice: "record", phases: {} }, "hidden", { value: 1 }),
    { get choice() { throw new Error("must not invoke getters"); }, phases: {} },
  ];
  for (const record of invalid) {
    const validation = validateMethodLog(incline, record);
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.length > 0);
    assert.equal(deriveMethodState(incline, record).status, null);
    assert.equal(transitionMethodLog(incline, record, choice("skip")), record);
  }
  assert.equal(validateMethodLog(incline, undefined).valid, true);
  assert.equal(validateMethodLog(incline, { choice: "record", phases: {} }).valid, true);
});

test("invalid edits preserve the exact previous record, including absence", () => {
  for (const record of [undefined, freezeTree(recordWith(incline, metric("3")))]) {
    for (const change of [null, {}, choice("unknown"), execution("done"),
      execution("performed", "unknown"), metric("2", "weight"), metric("2", "reps", "unknown"),
      metric("-1"), metric("1.5"), metric("9007199254740992")]) {
      assert.equal(transitionMethodLog(incline, record, change), record);
    }
    assert.equal(transitionMethodLog(null, record, choice("record")), record);
  }
});

test("aggregation handles an incomplete sequence without implementing another method", () => {
  const definition = { ...incline, phases: [incline.phases[0], { ...incline.phases[0], phaseId: "test-second" }] };
  let record = recordWith(definition, execution("performed"));
  assert.equal(deriveMethodState(definition, record).status, "partial");
  record = transitionMethodLog(definition, record, execution("partial", "test-second"));
  assert.equal(deriveMethodState(definition, record).status, "partial");
  record = transitionMethodLog(definition, record, execution("performed", "test-second"));
  assert.equal(deriveMethodState(definition, record).status, "performed");
  assert.equal(deriveMethodState(definition, record).numericComplete, false);
});

test("round trips, edits and derivation preserve main values, Done and prescribed row count", () => {
  const rows = freezeTree([1, 2, 3].map((setIndex) => ({ setIndex, weight: "24", reps: "10", rir: "2", isDone: false })));
  const before = JSON.stringify(rows);
  const record = freezeTree(recordWith(incline, metric("3"), execution("performed")));
  const newRows = rows.map((row) => row.setIndex === 3 ? { ...row, methodLog: record } : row);
  const doneRows = newRows.map((row) => ({ ...row, isDone: true }));
  const undoneRows = doneRows.map((row) => ({ ...row, isDone: false }));
  assert.equal(undoneRows[2].methodLog, record);
  assert.equal(deriveMethodState(incline, undoneRows[2].methodLog).status, "performed");
  assert.equal(newRows.filter((row) => row.isDone).length, 0);
  assert.equal(newRows.length, 3);
  for (const row of newRows) {
    const { methodLog: _methodLog, ...base } = row;
    assert.deepEqual(base, rows[row.setIndex - 1]);
  }
  const change = freezeTree(metric("2"));
  const changed = transitionMethodLog(incline, record, change);
  assert.deepEqual(change, metric("2"));
  assert.equal(record.phases["extra-reps"].reps, "3");
  assert.equal(changed.phases["extra-reps"].reps, "2");
  assert.equal(JSON.stringify(rows), before);
  for (const definition of previousDefinitions) {
    const phase = definition.phases[0];
    const original = recordWith(definition, metric("8", phase.requiredMetrics[0], phase.phaseId), execution("partial", phase.phaseId));
    for (const sample of [original, transitionMethodLog(definition, original, choice("skip"))]) {
      const restored = JSON.parse(JSON.stringify(sample));
      assert.deepEqual(restored, sample);
      assert.equal(validateMethodLog(definition, restored).valid, true);
      assert.deepEqual(deriveMethodState(definition, restored), deriveMethodState(definition, sample));
      assert.deepEqual(Object.keys(sample).sort(), ["choice", "phases"]);
      assert.equal(Object.hasOwn(sample.phases[phase.phaseId], "weight"), false);
      assert.equal(Object.hasOwn(sample.phases[phase.phaseId], "totalReps"), false);
    }
  }
});

test("assistance normalization accepts completed dot-decimal strings only", () => {
  for (const [raw, canonical] of [
    ["0", "0"], ["000.0", "0"], ["0.1", "0.1"], ["025.0", "25"], ["032.5", "32.5"], ["999.9", "999.9"],
  ]) {
    assert.equal(normalizeAssistanceKg(raw), canonical);
  }
  for (const invalid of [
    "", " ", " 25", "25 ", "25\n", "25.", ".5", "25,", "25,5", "-0", "-1", "+1",
    "25.50", "1000", "1000.0", "1e2", "Infinity", null, undefined, 25, false, {}, [],
  ]) {
    assert.equal(normalizeAssistanceKg(invalid), null);
  }
  assert.equal(isValidMethodMetricValue("assistance", "25"), false);
});

test("Cluster stores absent, same and independently entered assistance without inferring execution", () => {
  const base = { weight: "025.0", isDone: false };
  assert.equal(deriveMethodState(cluster, undefined).status, "unknown");
  assert.equal(transitionMethodLog(cluster, undefined, clearAssistance()), undefined);
  const same = freezeTree(recordWith(cluster, setAssistance("same", normalizeAssistanceKg(base.weight))));
  assert.deepEqual(same.phases[clusterPhaseId], {
    execution: "unconfirmed", reps: "", restSeconds: "", assistance: { mode: "same", kg: "25" },
  });
  const entered = transitionMethodLog(cluster, same, setAssistance("entered", normalizeAssistanceKg(base.weight)));
  assert.deepEqual(entered.phases[clusterPhaseId].assistance, { mode: "entered", kg: "25" });
  base.weight = "20";
  assert.equal(same.phases[clusterPhaseId].assistance.kg, "25");
  assert.equal(base.isDone, false);
  assert.equal(deriveMethodState(cluster, same).status, "draft");
  assert.equal(deriveMethodState(cluster, entered).numericComplete, false);
});

test("only canonical assistance with exact fields is accepted in Cluster records and changes", () => {
  const record = freezeTree(recordWith(cluster, setAssistance("entered", "32.5")));
  const withAssistance = (assistance) => ({
    ...record, phases: { [clusterPhaseId]: { ...record.phases[clusterPhaseId], assistance } },
  });
  for (const kg of ["0", "0.1", "32.5", "999.9"]) {
    for (const mode of ["same", "entered"]) {
      assert.equal(validateMethodLog(cluster, withAssistance({ mode, kg })).valid, true);
      const next = transitionMethodLog(cluster, record, setAssistance(mode, kg));
      assert.deepEqual(next.phases[clusterPhaseId].assistance, { mode, kg });
    }
  }
  for (const kg of ["", "00", "025.0", "25.0", "25.", "25,", "25,5", "25.50", "-1", "1000", null, undefined, 25, {}]) {
    assert.equal(validateMethodLog(cluster, withAssistance({ mode: "same", kg })).valid, false);
    assert.equal(transitionMethodLog(cluster, record, setAssistance("entered", kg)), record);
  }
  for (const invalid of [
    null, undefined, "25", [], {}, { mode: "unrecorded", kg: "0" }, { mode: "entered" },
    { mode: "same", kg: "25", extra: true }, { mode: "same", kg: "25", [Symbol("extra")]: 1 },
    Object.create({ mode: "same", kg: "25" }),
    { mode: "same", get kg() { throw new Error("must not read getters"); } },
  ]) {
    assert.equal(validateMethodLog(cluster, withAssistance(invalid)).valid, false);
  }
  for (const invalid of [
    setAssistance("unrecorded", "0"), setAssistance("entered", "25", "extra-reps"),
    { ...setAssistance("same", "25"), weight: "25" }, { ...clearAssistance(), kg: "0" },
    { ...setAssistance("same", "25"), get kg() { throw new Error("must not read getters"); } },
  ]) {
    assert.equal(transitionMethodLog(cluster, record, invalid), record);
  }
});

test("pilot methods and unsupported load semantics reject assistance", () => {
  for (const definition of [
    incline, curl, stretch,
    { ...cluster, base: { ...cluster.base, loadKind: "external" } },
    { ...cluster, base: { ...cluster.base, loadUnit: "lb" } },
    { ...cluster, phases: [{ ...cluster.phases[0], loadRule: "same-as-base" }] },
    { ...cluster, phases: [{ ...cluster.phases[0], phaseId: "other" }] },
  ]) {
    const { phaseId } = definition.phases[0];
    const record = freezeTree(recordWith(definition, execution("performed", phaseId)));
    assert.equal(transitionMethodLog(definition, record, setAssistance("entered", "32.5", phaseId)), record);
    const invalid = structuredClone(record);
    invalid.phases[phaseId].assistance = { mode: "same", kg: "25" };
    assert.equal(validateMethodLog(definition, invalid).valid, false);
  }
});

test("Cluster replacement, clear and skip/resume preserve the other recorded evidence", () => {
  const record = freezeTree(recordWith(cluster, metric("4", "reps", clusterPhaseId),
    metric("12", "restSeconds", clusterPhaseId), execution("performed", clusterPhaseId), setAssistance("same", "25")));
  const replaced = freezeTree(transitionMethodLog(cluster, record, setAssistance("entered", "32.5")));
  assert.deepEqual(record.phases[clusterPhaseId].assistance, { mode: "same", kg: "25" });
  assert.deepEqual(replaced.phases[clusterPhaseId].assistance, { mode: "entered", kg: "32.5" });
  const skipped = freezeTree(transitionMethodLog(cluster, replaced, choice("skip")));
  assert.equal(deriveMethodState(cluster, skipped).status, "skipped");
  assert.deepEqual(deriveMethodState(cluster, skipped).targetComparisons, {});
  assert.equal(transitionMethodLog(cluster, skipped, clearAssistance()), skipped);
  assert.equal(transitionMethodLog(cluster, skipped, setAssistance("same", "0")), skipped);
  const resumed = transitionMethodLog(cluster, skipped, choice("record"));
  assert.deepEqual(resumed, replaced);
  const cleared = transitionMethodLog(cluster, resumed, clearAssistance());
  assert.deepEqual(cleared.phases[clusterPhaseId], { execution: "performed", reps: "4", restSeconds: "12" });
  assert.equal(transitionMethodLog(cluster, cleared, clearAssistance()), cleared);
  for (const sample of [record, replaced, skipped, resumed, cleared]) {
    const restored = JSON.parse(JSON.stringify(sample));
    assert.deepEqual(restored, sample);
    assert.equal(validateMethodLog(cluster, restored).valid, true);
  }
});

test("Cluster confirmation, required reps, optional assistance and targets stay independent", () => {
  for (const [reps, comparison, complete] of [
    ["", "unrecorded", false], ["0", "below", true], ["3", "below", true], ["4", "within", true], ["6", "above", true],
  ]) {
    const record = recordWith(cluster, execution("performed", clusterPhaseId), metric(reps, "reps", clusterPhaseId));
    const derived = deriveMethodState(cluster, record);
    assert.equal(derived.status, "performed");
    assert.equal(derived.numericComplete, complete);
    assert.deepEqual(derived.targetComparisons, { [clusterPhaseId]: { reps: comparison, restSeconds: "unrecorded" } });
    assert.equal(record.phases[clusterPhaseId].restSeconds, "");
    const withZeroAssistance = transitionMethodLog(cluster, record, setAssistance("entered", "0"));
    assert.deepEqual(deriveMethodState(cluster, withZeroAssistance), derived);
    const partial = transitionMethodLog(cluster, withZeroAssistance, execution("partial", clusterPhaseId));
    assert.equal(deriveMethodState(cluster, partial).status, "partial");
  }
});

const dropIds = ["drop-1", "drop-2", "drop-3"];
const expectedDropset = {
  definitionId: "bulk-pro/leg-extension/dropset",
  revision: 1,
  planId: "bulk-pro",
  exerciseId: "leg-extension",
  type: "dropset",
  prescribedSetCount: 3,
  appliesTo: "last",
  base: { semantics: "pre-extension", loadKind: "external", loadUnit: "kg" },
  reductionPercent: 25,
  phases: dropIds.map((phaseId) => ({
    phaseId,
    metrics: ["loadKg", "reps"],
    requiredMetrics: ["loadKg", "reps"],
    targets: {},
    loadRule: "reduced-from-previous",
  })),
};
const dropset = getMethodDefinition(expectedDropset);
assert.ok(dropset, "Missing registered D3 Leg Extension Dropset revision 1");
const finishDrop = (phaseId) => ({ type: "finish-dropset", phaseId });
const extendDropset = (phaseId) => ({ type: "extend-dropset", phaseId });

test("the registry has nine exact identities and all four frozen Dropsets match their prescriptions", () => {
  const expected = [
    ["d3", "leg-extension", "bulk-pro/leg-extension/dropset", 3, 25],
    ["d1", "overhead-rope-extension", "bulk-pro/overhead-rope-extension/dropset", 4, 20],
    ["d4", "machine-lateral-raise", "bulk-pro/machine-lateral-raise/dropset", 3, 20],
    ["d6", "leg-press-calf-raise", "bulk-pro/leg-press-calf-raise/dropset", 3, 25, "total-added-plates-or-marked-kg"],
  ];
  assert.equal(advancedMethodDefinitions.length, 9);
  assert.ok(Object.isFrozen(advancedMethodDefinitions));
  assert.equal(new Set(advancedMethodDefinitions.map(({ planId, exerciseId, definitionId, revision }) =>
    JSON.stringify([planId, exerciseId, definitionId, revision]))).size, 9);
  assert.deepEqual(dropset, expectedDropset);
  for (const [dayId, exerciseId, definitionId, prescribedSetCount, reductionPercent, loadConvention] of expected) {
    const contract = { ...expectedDropset, exerciseId, definitionId, prescribedSetCount, reductionPercent,
      base: { ...expectedDropset.base, ...(loadConvention ? { loadConvention } : {}) } };
    const definition = getMethodDefinition(contract);
    assert.deepEqual(definition, contract);
    const { phases, base } = definition;
    assert.ok([definition, base, phases, ...phases.flatMap((phase) =>
      [phase, phase.metrics, phase.requiredMetrics, phase.targets])].every(Object.isFrozen));
    const exercise = bulkProExercises.find(({ id }) => id === exerciseId);
    assert.deepEqual(bulkProDayDetails.filter((day) => day.exerciseIds.includes(exerciseId)).map(({ id }) => id), [dayId]);
    assert.equal(exercise.details.advancedTechniqueType, "dropset");
    assert.equal(exercise.setCount, prescribedSetCount);
    assert.match(exercise.details.advancedTechnique, new RegExp(`Optional.*${reductionPercent}%`));
    const rows = Array.from({ length: prescribedSetCount }, (_, index) => ({
      setIndex: prescribedSetCount - index, isDone: index !== 0,
    }));
    assert.deepEqual(getApplicableSetIndexes(definition, rows), [prescribedSetCount]);
    assert.equal(getMethodDefinition({ ...contract, planId: "cut-pro" }), null);
    assert.equal(getMethodDefinition({ ...contract, revision: 2 }), null);
  }
  assert.ok(cutProExercises.some(({ id }) => id === dropset.exerciseId));
});

test("Dropset external load accepts blank and canonical kg up to 999.9 without rounding", () => {
  const previous = freezeTree(recordWith(dropset, metric("27.5", "loadKg", "drop-1")));
  for (const value of ["", "0", "0.1", "1", "37.5", "999", "999.9"]) {
    assert.equal(isValidMethodMetricValue("loadKg", value), true, value);
    const next = transitionMethodLog(dropset, previous, metric(value, "loadKg", "drop-1"));
    assert.equal(next.phases["drop-1"].loadKg, value);
    assert.equal(deriveMethodState(dropset, next).status, "draft");
  }
  for (const value of ["27.", "27,", "27,5", "27.55", "27.50", "27.0", "00", "01.5", ".5", "-0", "-1", "+1",
    "1000", "1000.1", "1e2", " 1", "1 ", "1\n", "\t", null, undefined, 27.5, false, {}]) {
    assert.equal(isValidMethodMetricValue("loadKg", value), false, String(value));
    assert.equal(transitionMethodLog(dropset, previous, metric(value, "loadKg", "drop-1")), previous);
    const invalid = structuredClone(previous);
    invalid.phases["drop-1"].loadKg = value;
    assert.equal(validateMethodLog(dropset, invalid).valid, false);
  }
  assert.equal(previous.phases["drop-1"].loadKg, "27.5");
  const atRepLimit = transitionMethodLog(dropset, previous, metric("30", "reps", "drop-1"));
  assert.equal(atRepLimit.phases["drop-1"].reps, "30");
  for (const value of ["31", "-1", "1.0", 1]) {
    assert.equal(transitionMethodLog(dropset, atRepLimit, metric(value, "reps", "drop-1")), atRepLimit);
  }
});

test("open Dropset drafts separate measurements from confirmation and do not create later phases", () => {
  assert.equal(deriveMethodState(dropset, undefined).status, "unknown");
  assert.equal(transitionMethodLog(dropset, undefined, metric("", "loadKg", "drop-1")), undefined);
  assert.equal(transitionMethodLog(dropset, undefined, execution("unconfirmed", "drop-1")), undefined);
  const started = recordWith(dropset, choice("record"));
  assert.deepEqual(deriveMethodState(dropset, started).missingMetrics, ["drop-1.loadKg", "drop-1.reps"]);

  const draft = freezeTree(recordWith(dropset, metric("37.5", "loadKg", "drop-1"), metric("8", "reps", "drop-1")));
  assert.deepEqual(draft, { choice: "record", phases: { "drop-1": { execution: "unconfirmed", loadKg: "37.5", reps: "8" } } });
  assert.equal(deriveMethodState(dropset, draft).status, "draft");
  assert.equal(deriveMethodState(dropset, draft).numericComplete, true);
  const attempted = transitionMethodLog(dropset, draft, execution("partial", "drop-1"));
  assert.equal(deriveMethodState(dropset, attempted).status, "partial");
  assert.equal(deriveMethodState(dropset, attempted).numericComplete, true);
  assert.deepEqual(transitionMethodLog(dropset, attempted, execution("unconfirmed", "drop-1")), draft);
});

test("Dropset can explicitly finish after one, two or three confirmed drops", () => {
  const actualLoads = ["37.5", "30", "22.5"];
  let open;
  for (const [index, phaseId] of dropIds.entries()) {
    open = transitionMethodLog(dropset, open, metric(actualLoads[index], "loadKg", phaseId));
    open = freezeTree(transitionMethodLog(dropset, open, metric(String(8 - index), "reps", phaseId)));
    const finished = freezeTree(transitionMethodLog(dropset, open, freezeTree(finishDrop(phaseId))));
    assert.equal(finished.endPhaseId, phaseId);
    assert.deepEqual(Object.keys(finished.phases), dropIds.slice(0, index + 1));
    assert.deepEqual(finished.phases[phaseId], { ...open.phases[phaseId], execution: "performed" });
    assert.equal(open.phases[phaseId].execution, "unconfirmed");
    assert.equal(Object.hasOwn(open, "endPhaseId"), false);
    assert.deepEqual(deriveMethodState(dropset, finished), {
      valid: true, errors: [], status: "performed", numericComplete: true, missingMetrics: [], targetComparisons: {},
    });
    assert.equal(transitionMethodLog(dropset, finished, finishDrop(phaseId)), finished);

    // Even three phase confirmations do not imply an intentional end.
    const confirm = execution("performed", phaseId);
    open = freezeTree(transitionMethodLog(dropset, open, confirm));
    assert.equal(deriveMethodState(dropset, open).status, "partial");
    assert.equal(deriveMethodState(dropset, open).numericComplete, true);
    assert.equal(transitionMethodLog(dropset, open, confirm), open);
  }
});

test("a confirmed Dropset can contain no measurements, one measurement or explicit zeros", () => {
  for (const [loadKg, reps, missingMetrics] of [
    ["", "", ["drop-1.loadKg", "drop-1.reps"]],
    ["", "4", ["drop-1.loadKg"]],
    ["37.5", "", ["drop-1.reps"]],
    ["0", "0", []],
  ]) {
    const record = recordWith(dropset, metric(loadKg, "loadKg", "drop-1"), metric(reps, "reps", "drop-1"), finishDrop("drop-1"));
    assert.deepEqual(record.phases["drop-1"], { execution: "performed", loadKg, reps });
    const derived = deriveMethodState(dropset, record);
    assert.equal(derived.status, "performed");
    assert.equal(derived.numericComplete, missingMetrics.length === 0);
    assert.deepEqual(derived.missingMetrics, missingMetrics);
    assert.deepEqual(derived.targetComparisons, {});
  }
  const sparse = { choice: "record", endPhaseId: "drop-1", phases: { "drop-1": { execution: "performed" } } };
  assert.equal(deriveMethodState(dropset, sparse).status, "performed");
  assert.deepEqual(deriveMethodState(dropset, sparse).missingMetrics, ["drop-1.loadKg", "drop-1.reps"]);
});

test("Dropset ordering rejects gaps and never hides recorded data behind an earlier end", () => {
  for (const change of [metric("10", "loadKg", "drop-2"), execution("performed", "drop-3"), finishDrop("drop-2"), finishDrop("drop-4")]) {
    assert.equal(transitionMethodLog(dropset, undefined, change), undefined);
  }
  const open = freezeTree(recordWith(dropset, metric("37.5", "loadKg", "drop-1"), metric("8", "reps", "drop-1"),
    execution("performed", "drop-1"), metric("0", "reps", "drop-2")));
  assert.equal(transitionMethodLog(dropset, open, finishDrop("drop-1")), open);
  assert.equal(transitionMethodLog(dropset, open, execution("unconfirmed", "drop-1")), open);
  assert.equal(transitionMethodLog(dropset, open, finishDrop("drop-3")), open);

  const cleared = freezeTree(transitionMethodLog(dropset, open, metric("", "reps", "drop-2")));
  const finished = transitionMethodLog(dropset, cleared, finishDrop("drop-1"));
  assert.equal(finished.phases["drop-2"], cleared.phases["drop-2"]);
  assert.equal(finished.phases["drop-2"].execution, "unconfirmed");
  assert.equal(finished.endPhaseId, "drop-1");
  assert.equal(deriveMethodState(dropset, finished).status, "performed");
  assert.deepEqual(deriveMethodState(dropset, finished).missingMetrics, []);
});

test("editing finished Dropset metrics preserves its end; extension requires explicit current intent", () => {
  const first = freezeTree(recordWith(dropset, metric("37.5", "loadKg", "drop-1"), finishDrop("drop-1")));
  const edited = freezeTree(transitionMethodLog(dropset, first, metric("8", "reps", "drop-1")));
  assert.equal(edited.endPhaseId, "drop-1");
  assert.equal(edited.phases["drop-1"].execution, "performed");
  assert.equal(deriveMethodState(dropset, edited).numericComplete, true);
  for (const change of [extendDropset("drop-2"), metric("30", "loadKg", "drop-2"),
    finishDrop("drop-2"), execution("partial", "drop-1")]) {
    assert.equal(transitionMethodLog(dropset, edited, change), edited);
  }

  const reopened = freezeTree(transitionMethodLog(dropset, edited, extendDropset("drop-1")));
  assert.equal(Object.hasOwn(reopened, "endPhaseId"), false);
  assert.equal(reopened.phases, edited.phases);
  assert.equal(deriveMethodState(dropset, reopened).status, "partial");
  assert.equal(transitionMethodLog(dropset, reopened, extendDropset("drop-1")), reopened);
  const second = freezeTree(transitionMethodLog(dropset, reopened, finishDrop("drop-2")));
  assert.equal(second.endPhaseId, "drop-2");
  assert.equal(second.phases["drop-1"], edited.phases["drop-1"]);
  assert.equal(transitionMethodLog(dropset, second, finishDrop("drop-1")), second);
  assert.equal(transitionMethodLog(dropset, second, extendDropset("drop-1")), second);
  const cleared = transitionMethodLog(dropset, second, metric("", "loadKg", "drop-1"));
  assert.equal(cleared.endPhaseId, "drop-2");
  assert.equal(cleared.phases["drop-2"], second.phases["drop-2"]);
  assert.equal(deriveMethodState(dropset, cleared).status, "performed");
  assert.deepEqual(deriveMethodState(dropset, cleared).missingMetrics, ["drop-1.loadKg", "drop-2.loadKg", "drop-2.reps"]);

  const secondReopened = transitionMethodLog(dropset, second, extendDropset("drop-2"));
  const third = freezeTree(transitionMethodLog(dropset, secondReopened, finishDrop("drop-3")));
  assert.equal(third.endPhaseId, "drop-3");
  assert.equal(third.phases["drop-2"], second.phases["drop-2"]);
  assert.equal(transitionMethodLog(dropset, third, extendDropset("drop-3")), third);
});

test("Dropset Skip and Resume retain drafts and finished attempts through a JSON round trip", () => {
  const draft = freezeTree(recordWith(dropset, metric("0", "reps", "drop-1")));
  const finished = freezeTree(transitionMethodLog(dropset, draft, finishDrop("drop-1")));
  for (const original of [draft, finished]) {
    const skipped = freezeTree(transitionMethodLog(dropset, original, choice("skip")));
    assert.deepEqual(skipped, { ...original, choice: "skip" });
    assert.deepEqual(deriveMethodState(dropset, skipped), {
      valid: true, errors: [], status: "skipped", numericComplete: null, missingMetrics: [], targetComparisons: {},
    });
    for (const change of [choice("skip"), metric("20", "loadKg", "drop-1"), execution("performed", "drop-1"),
      finishDrop("drop-1"), extendDropset("drop-1")]) {
      assert.equal(transitionMethodLog(dropset, skipped, change), skipped);
    }
    const restored = JSON.parse(JSON.stringify(skipped));
    assert.deepEqual(restored, skipped);
    assert.deepEqual(transitionMethodLog(dropset, restored, choice("record")), original);
  }
});

test("malformed Dropset records or changes leave valid evidence untouched", () => {
  const valid = freezeTree(recordWith(dropset, metric("27.5", "loadKg", "drop-1"), execution("performed", "drop-1")));
  const validPhase = valid.phases["drop-1"];
  for (const record of [
    { ...valid, endPhaseId: "drop-2" }, { ...valid, endPhaseId: null }, { ...valid, endPhaseId: undefined },
    { ...valid, endPhaseId: "drop-4" }, { ...valid, done: true },
    { ...valid, endPhaseId: "drop-1", phases: { "drop-1": { ...validPhase, execution: "partial" } } },
    { ...valid, endPhaseId: "drop-1", phases: { ...valid.phases, "drop-2": { execution: "performed" } } },
    { ...valid, phases: { "drop-2": { execution: "performed" } } },
    { ...valid, phases: { ...valid.phases, "drop-4": { execution: "unconfirmed" } } },
    { ...valid, phases: { "drop-1": { ...validPhase, restSeconds: "0" } } },
    { ...valid, phases: { "drop-1": { ...validPhase, assistance: { mode: "entered", kg: "27.5" } } } },
    { ...valid, get endPhaseId() { throw new Error("must not read getters"); } },
  ]) {
    assert.equal(validateMethodLog(dropset, record).valid, false);
    assert.equal(deriveMethodState(dropset, record).status, null);
    assert.equal(transitionMethodLog(dropset, record, choice("skip")), record);
  }
  for (const change of [
    null, [], { type: "finish-dropset" }, finishDrop(1), finishDrop("drop-4"),
    { ...finishDrop("drop-1"), reps: "5" }, { ...extendDropset("drop-1"), [Symbol("extra")]: true },
    { ...choice("skip"), endPhaseId: "drop-1" }, { ...execution("performed", "drop-1"), done: true },
    Object.defineProperty(finishDrop("drop-1"), "hidden", { value: 1 }), Object.create(finishDrop("drop-1")),
    { type: "finish-dropset", get phaseId() { throw new Error("must not read getters"); } },
    metric("27.5", "weight", "drop-1"), metric("5", "restSeconds", "drop-1"), setAssistance("entered", "25", "drop-1"),
    { ...metric("8", "reps", "drop-1"), value: undefined },
  ]) {
    assert.equal(transitionMethodLog(dropset, valid, change), valid);
  }
});

test("Dropset validates bounded, distinct phases and keeps external load out of other methods", () => {
  for (const definition of [
    { ...dropset, phases: [] }, { ...dropset, phases: Array(2) },
    { ...dropset, phases: [...dropset.phases, { ...dropset.phases[0], phaseId: "drop-4" }] },
    { ...dropset, phases: [dropset.phases[0], dropset.phases[0]] },
    { ...dropset, base: cluster.base }, { ...dropset, phases: [incline.phases[0]] },
  ]) {
    assert.equal(validateMethodLog(definition, undefined).valid, false);
    assert.equal(transitionMethodLog(definition, undefined, finishDrop("drop-1")), undefined);
  }
  for (const definition of previousDefinitions) {
    const [phase] = definition.phases;
    const existing = freezeTree(recordWith(definition, execution("performed", phase.phaseId)));
    const withUnexpectedLoad = structuredClone(existing);
    withUnexpectedLoad.phases[phase.phaseId].loadKg = "27.5";
    assert.equal(validateMethodLog(definition, withUnexpectedLoad).valid, false);
    assert.equal(validateMethodLog(definition, { ...existing, endPhaseId: phase.phaseId }).valid, false);
    for (const change of [finishDrop(phase.phaseId), extendDropset(phase.phaseId), metric("27.5", "loadKg", phase.phaseId)]) {
      assert.equal(transitionMethodLog(definition, existing, change), existing);
    }
  }
});
