import assert from "node:assert/strict";
import { test } from "node:test";
import { createAppStatePersistence, WORKOUT_STORAGE_KEYS } from "../src/storage/appStateStorage.js";
import { appInitialState } from "../src/state/appInitialState.js";

const { v1, v2, reset, recoveryPrefix } = WORKOUT_STORAGE_KEYS;
const locale = "training-app:v1:locale";
const safety = "training-app:v1:safety-acknowledged";
const state = (selectedPlanId = null) => ({ selectedPlanId, progressByPlan: {} });
const raw = (version = 2, selectedPlanId = null) => JSON.stringify({ version, savedAt: "original-time", state: state(selectedPlanId), metadata: { keep: true } });

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const calls = [];
  const store = {
    values, calls, fault: () => {}, afterSet: () => {},
    getItem(key) { calls.push(["get", key]); store.fault("get", key); return values.get(key) ?? null; },
    setItem(key, value) {
      calls.push(["set", key, value]); store.fault("set", key); values.set(key, value); store.afterSet(key, value);
    },
    removeItem(key) { calls.push(["remove", key]); store.fault("remove", key); values.delete(key); },
    key(index) { return [...values.keys()][index] ?? null; },
    get length() { return values.size; },
  };
  return store;
}
function session(store) {
  let sequence = 0;
  return createAppStatePersistence({ getStorage: () => store, now: () => "new-save-time", newId: () => `test-${++sequence}` });
}
const writes = (store) => store.calls.filter(([op]) => op !== "get");

test("fresh hydration and repeated StrictMode start are read-only; explicit updates write only V2", () => {
  const store = storage();
  const first = session(store);
  const second = session(store);
  assert.equal(first.getSnapshot().mode, "ready");
  first.startMigration(); first.startMigration(); second.startMigration();
  assert.deepEqual(writes(store), []);
  assert.equal(first.save(state("bulk-pro")), true);
  assert.equal(JSON.parse(store.values.get(v2)).state.selectedPlanId, "bulk-pro");
  assert.equal(store.values.has(v1), false);
  assert.equal(second.save(state("cut-pro")), false);
  assert.equal(second.getSnapshot().mode, "storage-conflict");
});

test("read reset then V2; valid V2 never reads the legacy key", () => {
  const store = storage({ [v1]: "broken", [v2]: raw() });
  store.fault = (_op, key) => { if (key === v1) throw Error("V1 is unavailable"); };
  assert.equal(session(store).getSnapshot().mode, "ready");
  assert.deepEqual(store.calls, [["get", reset], ["get", v2]]);
});

test("V1 migration preserves the original, metadata and savedAt; repeated commits are idempotent", () => {
  const legacy = raw(1, "bulk-pro");
  const store = storage({ [v1]: legacy, [locale]: "sr-Latn", [safety]: "accepted" });
  const value = session(store);
  assert.equal(value.getSnapshot().mode, "migration-pending");
  assert.equal(value.exportMemory(state()), null);
  assert.equal(value.canEdit(), false);
  assert.equal(value.save(state()), false);
  assert.equal(value.startMigration().mode, "ready");
  assert.equal(value.startMigration().mode, "ready");
  assert.equal(value.retryMigration().mode, "ready");
  assert.deepEqual(JSON.parse(store.values.get(v2)), { ...JSON.parse(legacy), version: 2 });
  assert.equal(store.values.get(v1), legacy);
  assert.equal(writes(store).filter(([, key]) => key === v2).length, 1);
  assert.equal(store.values.get(locale), "sr-Latn");
  assert.equal(store.values.get(safety), "accepted");
});

test("migration rechecks V1 and adopts an already created valid V2 without overwriting it", () => {
  const store = storage({ [v1]: raw(1) });
  const value = session(store);
  store.values.set(v1, raw(1, "bulk-pro"));
  assert.equal(value.startMigration().mode, "storage-conflict");
  assert.deepEqual(writes(store), []);
  const other = session(store);
  store.values.set(v2, raw(2, "cut-pro"));
  assert.equal(other.startMigration().state.selectedPlanId, "cut-pro");
  assert.deepEqual(writes(store), []);
});

test("migration write failure blocks edits until verified retry and keeps V1 untouched", () => {
  const legacy = raw(1);
  const store = storage({ [v1]: legacy });
  const value = session(store);
  store.fault = (op) => { if (op === "set") throw Error("quota"); };
  assert.equal(value.startMigration().mode, "migration-pending");
  assert.equal(value.getSnapshot().operationError, "migration-failed");
  assert.equal(value.canEdit(), false);
  assert.equal(store.values.get(v1), legacy);
  store.fault = () => {};
  assert.equal(value.retryMigration().mode, "ready");
  assert.equal(store.values.get(v1), legacy);
});

test("migration readback failure is not success; retry verifies an existing V2", () => {
  const store = storage({ [v1]: raw(1) });
  const value = session(store);
  store.afterSet = () => { store.fault = (op, key) => { if (op === "get" && key === v2) throw Error("readback"); }; };
  assert.equal(value.startMigration().mode, "migration-pending");
  assert.equal(value.getSnapshot().operationError, "migration-failed");
  store.fault = () => {}; store.afterSet = () => {};
  assert.equal(value.retryMigration().mode, "ready");
  assert.equal(writes(store).length, 1);
});

for (const bad of ["", "broken", JSON.stringify({ version: 99, state: state() })]) {
  test(`unsafe V2 (${bad || "empty"}) blocks V1 fallback, editing and writes`, () => {
    const store = storage({ [v1]: raw(1), [v2]: bad });
    const value = session(store);
    assert.equal(value.getSnapshot().mode, "recovery-required");
    assert.equal(value.canEdit(), false);
    assert.equal(value.save(state()), false);
    assert.equal(value.exportOriginal(), bad);
    assert.equal(value.exportMemory(state()), null);
    assert.deepEqual(writes(store), []);
  });
}

test("bad V1 and storage read errors never become a fresh usable app", () => {
  assert.equal(session(storage({ [v1]: "broken" })).getSnapshot().mode, "recovery-required");
  const value = createAppStatePersistence({ getStorage: () => { throw Error("denied"); } });
  assert.equal(value.getSnapshot().mode, "storage-unavailable");
  assert.equal(value.canEdit(), false);
  assert.equal(value.save(state()), false);
});

test("normal quota failure preserves unsaved input, permits memory edits and supports verified retry", () => {
  const store = storage({ [v2]: raw() });
  const value = session(store);
  const edited = Object.freeze(state("bulk-pro"));
  store.fault = (op) => { if (op === "set") throw Error("quota"); };
  assert.equal(value.save(edited), false);
  assert.equal(value.getSnapshot().mode, "ready");
  assert.equal(value.getSnapshot().saveStatus, "failed");
  assert.equal(value.canEdit(), true);
  assert.deepEqual(JSON.parse(value.exportMemory(edited)).state, edited);
  assert.equal(store.values.get(v2), raw());
  store.fault = () => {};
  assert.equal(value.save(edited), true);
  assert.equal(value.getSnapshot().saveStatus, "saved");
  assert.equal(JSON.parse(store.values.get(v2)).state.selectedPlanId, "bulk-pro");
  assert.deepEqual(JSON.parse(store.values.get(v2)).metadata, { keep: true });
});

test("normal readback failure can verify its own bytes on retry, never an unrelated write", () => {
  for (const changed of [false, true]) {
    const store = storage({ [v2]: raw() });
    const value = session(store);
    store.afterSet = () => { store.fault = (op, key) => { if (op === "get" && key === v2) throw Error("readback"); }; };
    assert.equal(value.save(state("bulk-pro")), false);
    store.fault = () => {}; store.afterSet = () => {};
    if (changed) store.values.set(v2, raw(2, "cut-pro"));
    assert.equal(value.save(state("bulk-pro")), !changed);
    assert.equal(value.getSnapshot().mode, changed ? "storage-conflict" : "ready");
  }
});

test("mismatched readback latches conflict and does not falsely clear warnings", () => {
  const store = storage({ [v2]: raw() });
  const value = session(store);
  store.afterSet = (key) => { if (key === v2) store.values.set(v2, raw(2, "cut-pro")); };
  assert.equal(value.save(state("bulk-pro")), false);
  assert.equal(value.getSnapshot().mode, "storage-conflict");
  assert.equal(value.save(state("bulk-pro")), false);
  assert.equal(store.values.get(v2), raw(2, "cut-pro"));
});

test("safe legacy recovery verifies a unique raw backup before replacing V2", () => {
  const bad = "";
  const store = storage({ [v2]: bad, [v1]: raw(1, "bulk-pro") });
  const value = session(store);
  assert.equal(value.restoreLegacy().mode, "ready");
  assert.equal(store.values.get(`${recoveryPrefix}test-1`), bad);
  assert.equal(store.values.get(v1), raw(1, "bulk-pro"));
  const backupWrite = store.calls.findIndex(([op, key]) => op === "set" && key === `${recoveryPrefix}test-1`);
  assert.deepEqual(store.calls[backupWrite + 1], ["get", `${recoveryPrefix}test-1`]);
  const writeV2 = store.calls.findIndex(([op, key]) => op === "set" && key === v2);
  assert.ok(writeV2 > backupWrite + 1);
  assert.equal(value.getSnapshot().state.selectedPlanId, "bulk-pro");
});

for (const failure of ["write", "readback", "collision"]) {
  test(`recovery backup ${failure} leaves the original V2 untouched`, () => {
    const store = storage({ [v2]: "broken", [v1]: raw(1) });
    const value = session(store);
    if (failure === "collision") store.values.set(`${recoveryPrefix}test-1`, "existing backup");
    store.fault = (op, key) => { if (failure === "write" && op === "set" && key.startsWith(recoveryPrefix)) throw Error("quota"); };
    if (failure === "readback") store.afterSet = (key) => { if (key.startsWith(recoveryPrefix)) store.values.set(key, "wrong bytes"); };
    assert.equal(value.restoreLegacy().mode, "recovery-required");
    assert.equal(value.getSnapshot().operationError, "recovery-failed");
    assert.equal(store.values.get(v2), "broken");
    assert.equal(writes(store).some(([, key]) => key === v2), false);
    if (failure === "collision") assert.equal(store.values.get(`${recoveryPrefix}test-1`), "existing backup");
  });
}

test("recovery rechecks the original after backup instead of overwriting concurrent progress", () => {
  const store = storage({ [v2]: "broken", [v1]: raw(1) });
  const value = session(store);
  store.afterSet = (key) => { if (key.startsWith(recoveryPrefix)) store.values.set(v2, raw(2, "cut-pro")); };
  assert.equal(value.restoreLegacy().mode, "storage-conflict");
  assert.equal(store.values.get(v2), raw(2, "cut-pro"));
});

test("a stale session cannot reset newer progress saved by an independent session", () => {
  const store = storage({ [v1]: raw(1), [v2]: raw(), [`${recoveryPrefix}old`]: "backup" });
  const stale = session(store);
  const current = session(store);
  assert.equal(current.save(state("bulk-pro")), true);
  const before = new Map(store.values);
  const previousWrites = writes(store).length;

  assert.equal(stale.resetProgress().mode, "storage-conflict");
  assert.deepEqual(store.values, before);
  assert.equal(writes(store).length, previousWrites);
  assert.equal(store.values.has(reset), false);
  assert.equal(stale.canEdit(), false);
});

for (const [label, initial, changedKey, changedRaw] of [
  ["valid V2 removed", { [v2]: raw() }, v2, null],
  ["new V2 during migration", { [v1]: raw(1) }, v2, raw(2, "bulk-pro")],
  ["changed migration V1", { [v1]: raw(1) }, v1, raw(1, "bulk-pro")],
  ["changed invalid V1", { [v1]: "broken" }, v1, raw(1, "bulk-pro")],
  ["changed invalid V2", { [v2]: "broken", [v1]: raw(1) }, v2, raw(2, "bulk-pro")],
  ["changed V1 recovery source beside invalid V2", { [v2]: "broken", [v1]: raw(1) }, v1, raw(1, "bulk-pro")],
  ["new V1 recovery source beside invalid V2", { [v2]: "broken" }, v1, raw(1, "bulk-pro")],
  ["new V1 after fresh hydration", {}, v1, raw(1, "bulk-pro")],
]) {
  test(`reset rejects ${label} before any marker, removal or backup mutation`, () => {
    const store = storage({ ...initial, [`${recoveryPrefix}old`]: "backup" });
    const value = session(store);
    if (changedRaw === null) store.values.delete(changedKey);
    else store.values.set(changedKey, changedRaw);
    const before = new Map(store.values);
    assert.equal(value.resetProgress().mode, "storage-conflict");
    assert.deepEqual(store.values, before);
    assert.deepEqual(writes(store), []);
  });
}

test("a known conflict requires explicit reload even if the original bytes return", () => {
  const store = storage({ [v2]: raw() });
  const value = session(store);
  value.handleStorageEvent({ key: v2, newValue: raw(2, "bulk-pro") });
  assert.equal(value.resetProgress().mode, "storage-conflict");
  assert.deepEqual(writes(store), []);
  value.reload();
  assert.equal(value.resetProgress().mode, "ready");
});

test("reset cannot start from an unverified hydration source after reads recover", () => {
  const store = storage({ [v2]: raw(2, "bulk-pro") });
  store.fault = (op) => { if (op === "get") throw Error("unavailable"); };
  const value = session(store);
  store.fault = () => {};
  assert.equal(value.resetProgress().mode, "storage-unavailable");
  assert.equal(store.values.get(v2), raw(2, "bulk-pro"));
  assert.deepEqual(writes(store), []);
});

for (const initial of [{}, { [v1]: raw(1) }, { [v1]: "broken" }, { [v2]: "broken", [v1]: raw(1) }]) {
  test(`an unchanged source allows explicit reset: ${JSON.stringify(initial)}`, () => {
    const store = storage(initial);
    assert.equal(session(store).resetProgress().mode, "ready");
    assert.deepEqual(JSON.parse(store.values.get(v2)).state, appInitialState);
    assert.equal(store.values.has(v1), false);
    assert.equal(store.values.has(reset), false);
  });
}

test("a failed marker write does not let a retry bypass changed V1 or V2", () => {
  for (const [key, version] of [[v1, 1], [v2, 2]]) {
    const store = storage({ [key]: raw(version), [`${recoveryPrefix}old`]: "backup" });
    const value = session(store);
    store.fault = (op, item) => { if (op === "set" && item === reset) throw Error("marker failed"); };
    assert.equal(value.resetProgress().operationError, "reset-failed");
    store.fault = () => {};
    store.values.set(key, raw(version, "bulk-pro"));
    const before = new Map(store.values);
    const previousWrites = writes(store).length;
    assert.equal(value.resetProgress().mode, "storage-conflict");
    assert.deepEqual(store.values, before);
    assert.equal(writes(store).length, previousWrites);
  }
});

test("reset resumes from its marker after V2 changed, including a newly hydrated session", () => {
  const store = storage({ [v1]: raw(1), [v2]: raw() });
  const value = session(store);
  store.fault = (op, key) => { if (op === "remove" && key === reset) throw Error("interrupted"); };
  assert.equal(value.resetProgress().mode, "reset-incomplete");
  assert.notEqual(store.values.get(v2), raw());
  store.fault = () => {};
  const resumed = session(store);
  assert.equal(resumed.getSnapshot().mode, "reset-incomplete");
  assert.equal(resumed.resetProgress().mode, "ready");
  assert.equal(store.values.has(reset), false);
  assert.deepEqual(JSON.parse(store.values.get(v2)).state, appInitialState);
});

test("reset uses verified marker, removes only workout keys and leaves authoritative empty V2", () => {
  const store = storage({ [v1]: raw(1), [v2]: raw(), [`${recoveryPrefix}old`]: "backup", [locale]: "sr-Latn", [safety]: "accepted", unrelated: "keep" });
  const value = session(store);
  assert.equal(value.resetProgress().mode, "ready");
  assert.deepEqual(JSON.parse(store.values.get(v2)).state, appInitialState);
  assert.equal(store.values.has(v1), false);
  assert.equal(store.values.has(reset), false);
  assert.equal(store.values.has(`${recoveryPrefix}old`), false);
  assert.equal(store.values.get(locale), "sr-Latn");
  assert.equal(store.values.get(safety), "accepted");
  assert.equal(store.values.get("unrelated"), "keep");
  assert.deepEqual(writes(store).map(([op, key]) => [op, key]), [
    ["set", reset], ["remove", v1], ["remove", `${recoveryPrefix}old`], ["set", v2], ["remove", reset],
  ]);
  store.values.set(v1, raw(1, "bulk-pro"));
  assert.deepEqual(session(store).getSnapshot().state, appInitialState);
});

for (const [op, key] of [["set", reset], ["remove", v1], ["remove", `${recoveryPrefix}old`], ["set", v2], ["remove", reset]]) {
  test(`reset interruption at ${op} ${key} is not reported as success`, () => {
    const store = storage({ [v1]: raw(1), [v2]: raw(), [`${recoveryPrefix}old`]: "backup" });
    const value = session(store);
    store.fault = (operation, item) => { if (operation === op && item === key) throw Error("interrupted"); };
    const result = value.resetProgress();
    assert.notEqual(result.mode, "ready");
    assert.equal(result.operationError, "reset-failed");
    assert.equal(value.canEdit(), false);
    if (op === "set" && key === reset) assert.equal(store.values.get(v1), raw(1));
    else assert.equal(session(store).getSnapshot().mode, "reset-incomplete");
    store.fault = () => {};
    assert.equal(value.resetProgress().mode, "ready");
    assert.deepEqual(JSON.parse(store.values.get(v2)).state, appInitialState);
  });
}

test("an active reset marker blocks hydration and old-tab writes", () => {
  const store = storage({ [v2]: raw() });
  const oldTab = session(store);
  store.values.set(reset, "in-progress");
  const loaded = session(store);
  assert.equal(loaded.getSnapshot().mode, "reset-incomplete");
  assert.equal(oldTab.save(state("bulk-pro")), false);
  assert.equal(oldTab.getSnapshot().mode, "reset-incomplete");
  assert.equal(store.values.get(v2), raw());
});

for (const key of [reset, v2]) {
  test(`reset readback mismatch at ${key} retains protection and can be resumed`, () => {
    const store = storage({ [v1]: raw(1), [v2]: raw() });
    const value = session(store);
    store.afterSet = (item) => { if (item === key) store.values.set(item, "wrong readback"); };
    assert.equal(value.resetProgress().mode, "reset-incomplete");
    assert.equal(value.getSnapshot().operationError, "reset-failed");
    assert.equal(store.values.has(reset), true);
    if (key === reset) {
      assert.equal(store.values.get(v1), raw(1));
      assert.equal(store.values.get(v2), raw());
    }
    store.afterSet = () => {};
    assert.equal(value.resetProgress().mode, "ready");
    assert.deepEqual(JSON.parse(store.values.get(v2)).state, appInitialState);
  });
}

test("external V2/reset events latch protection while locale and unrelated storage are ignored", () => {
  const store = storage({ [v2]: raw() });
  const value = session(store);
  value.handleStorageEvent({ key: locale, newValue: "en" });
  assert.equal(value.getSnapshot().mode, "ready");
  value.handleStorageEvent({ key: v2, newValue: raw(2, "cut-pro") });
  assert.equal(value.getSnapshot().mode, "storage-conflict");
  value.handleStorageEvent({ key: v2, newValue: raw() });
  assert.equal(value.getSnapshot().mode, "storage-conflict");
  value.reload();
  value.handleStorageEvent({ key: reset, newValue: "pending" });
  assert.equal(value.getSnapshot().mode, "reset-incomplete");
});
