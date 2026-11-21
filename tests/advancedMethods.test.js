import assert from "node:assert/strict";
import { test } from "node:test";
import { advancedMethodDefinitions, getMethodDefinition } from "../src/data/advancedMethods/definitions.js";
import { deriveMethodState, getApplicableSetIndexes, transitionMethodLog } from "../src/utils/runtime/advancedMethodHelpers.js";
import { isValidMethodMetricValue, normalizeAssistanceKg, validateMethodLog } from "../src/utils/runtime/advancedMethodValidation.js";
import { bulkProDayDetails } from "../src/data/dayDetails/bulkProDayDetails.js";
import { bulkProExercises } from "../src/data/exercises/bulkProExercises.js";
import { cutProExercises } from "../src/data/exercises/cutProExercises.js";

const [incline, curl, stretch, cluster] = advancedMethodDefinitions;
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
  assert.equal(advancedMethodDefinitions.length, 4);
  assert.equal(new Set(advancedMethodDefinitions.map((item) => item.definitionId)).size, 4);
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
  for (const definition of advancedMethodDefinitions) {
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
  for (const definition of advancedMethodDefinitions) {
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
