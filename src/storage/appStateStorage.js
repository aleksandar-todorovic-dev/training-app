import { appInitialState } from "../state/appInitialState.js";
import { inspectStoredAppState, selectStoredAppState } from "./appStateMigration.js";

export const WORKOUT_STORAGE_KEYS = Object.freeze({
  v1: "training-app:v1:app-state",
  v2: "training-app:v2:app-state",
  reset: "training-app:v2:reset-pending",
  recoveryPrefix: "training-app:v2:recovery:",
});
const { v1, v2, reset, recoveryPrefix } = WORKOUT_STORAGE_KEYS;

/**
 * Web-only persistence session. Construction/hydration only reads storage.
 * Snapshot state is the last loaded state; live edits belong to the React reducer.
 * Raw-token checks are best-effort protection, not atomic compare-and-swap.
 * @param {{getStorage?: () => Storage, now?: () => string, newId?: () => string}} options
 */
export function createAppStatePersistence({
  getStorage = () => window.localStorage,
  now = () => new Date().toISOString(),
  newId = () => globalThis.crypto.randomUUID(),
} = {}) {
  const listeners = new Set();
  let snapshot;
  let migrationAttempted = false;
  // A retry may acknowledge only the exact bytes of an uncertain own write.
  let uncertainWrite = null;

  function publish(next) {
    snapshot = { ...snapshot, ...next };
    listeners.forEach((listener) => listener());
    return snapshot;
  }

  function load() {
    let rawV2 = null;
    let rawV1 = null;
    try {
      const storage = getStorage();
      if (storage.getItem(reset) !== null) return { mode: "reset-incomplete", token: null, rawV1, rawV2 };
      rawV2 = storage.getItem(v2);
      if (rawV2 === null) rawV1 = storage.getItem(v1);
      const selected = selectStoredAppState({ v1: rawV1, v2: rawV2 });
      let canRestoreLegacy = false;
      if (selected.status === "recovery-required" && rawV2 !== null) {
        // Explicit recovery option discovery, never automatic fallback.
        try {
          rawV1 = storage.getItem(v1);
          canRestoreLegacy = inspectStoredAppState(rawV1, 1).status === "valid";
        } catch { /* Preserve the unsafe V2 for export even if V1 cannot be read. */ }
      }
      return { ...selected, mode: selected.status, token: rawV2, rawV1, rawV2, canRestoreLegacy };
    } catch {
      return { mode: "storage-unavailable", token: rawV2, rawV1, rawV2 };
    }
  }
  snapshot = { ...load(), saveStatus: "saved", operationError: null };
  snapshot.hasLoadedState = snapshot.mode === "ready";

  function adoptLoaded() {
    uncertainWrite = null;
    // Replace rather than merge: old state/candidates must not leak into recovery.
    const loaded = load();
    snapshot = { ...loaded, hasLoadedState: snapshot.hasLoadedState || loaded.mode === "ready",
      saveStatus: "saved", operationError: null };
    listeners.forEach((listener) => listener());
    return snapshot;
  }

  function conflict(mode = "storage-conflict") {
    publish({ mode, saveStatus: "conflict", operationError: null });
    return false;
  }
  function checkToken(storage) {
    if (storage.getItem(reset) !== null) return conflict("reset-incomplete");
    const current = storage.getItem(v2);
    if (uncertainWrite !== null && current === uncertainWrite) {
      snapshot = { ...snapshot, token: current };
      uncertainWrite = null;
    }
    if (current !== snapshot.token) return conflict();
    return true;
  }
  function writeVerified(storage, raw) {
    storage.setItem(v2, raw);
    uncertainWrite = raw;
    if (storage.getItem(v2) !== raw) {
      uncertainWrite = null;
      conflict();
      return false;
    }
    uncertainWrite = null;
    return true;
  }

  function commitMigration() {
    if (snapshot.mode !== "migration-pending") return snapshot;
    try {
      const storage = getStorage();
      if (storage.getItem(reset) !== null) { conflict("reset-incomplete"); return snapshot; }
      if (storage.getItem(v2) !== null) return adoptLoaded();
      if (storage.getItem(v1) !== snapshot.rawV1) { conflict(); return snapshot; }
      const raw = JSON.stringify(snapshot.candidate);
      if (!checkToken(storage) || !writeVerified(storage, raw)) return snapshot;
      return adoptLoaded();
    } catch {
      return publish({ operationError: "migration-failed" });
    }
  }

  function save(state) {
    if (snapshot.mode !== "ready") return false;
    try {
      const storage = getStorage();
      if (!checkToken(storage)) return false;
      const wrapper = { ...snapshot.wrapper, version: 2, savedAt: now(), state };
      if (inspectStoredAppState(wrapper, 2).status !== "valid") {
        publish({ saveStatus: "failed", operationError: "invalid-state" });
        return false;
      }
      const raw = JSON.stringify(wrapper);
      if (!checkToken(storage) || !writeVerified(storage, raw)) return false;
      publish({ token: raw, rawV2: raw, wrapper, source: "v2", saveStatus: "saved", operationError: null });
      return true;
    } catch {
      publish({ saveStatus: "failed", operationError: "save-failed" });
      return false;
    }
  }

  function canEdit() {
    if (snapshot.mode !== "ready") return false;
    try { return checkToken(getStorage()); }
    catch {
      // Safely hydrated users can continue in memory during a storage outage.
      publish({ saveStatus: "failed", operationError: "save-failed" });
      return true;
    }
  }

  function restoreLegacy() {
    if (snapshot.mode !== "recovery-required" || !snapshot.canRestoreLegacy) return snapshot;
    try {
      const storage = getStorage();
      if (!checkToken(storage)) return snapshot;
      const legacyRaw = storage.getItem(v1);
      const selected = selectStoredAppState({ v1: legacyRaw, v2: null });
      if (selected.status !== "migration-pending") throw new Error("Legacy source unavailable");
      const backupKey = `${recoveryPrefix}${newId()}`;
      if (storage.getItem(backupKey) !== null) throw new Error("Backup key already exists");
      storage.setItem(backupKey, snapshot.rawV2);
      if (storage.getItem(backupKey) !== snapshot.rawV2) throw new Error("Backup verification failed");
      if (!checkToken(storage)) return snapshot;
      if (storage.getItem(v1) !== legacyRaw) { conflict(); return snapshot; }
      if (!writeVerified(storage, JSON.stringify(selected.candidate))) return snapshot;
      return adoptLoaded();
    } catch {
      return publish({ operationError: "recovery-failed" });
    }
  }

  function resetProgress() {
    try {
      const storage = getStorage();
      let marker = storage.getItem(reset);
      if (marker === null) {
        // A latched conflict needs an explicit reload. A failed marker write may
        // retry, but only against the same verified source as the first attempt.
        const retryBeforeMarker = snapshot.mode === "storage-conflict" && snapshot.operationError === "reset-failed";
        if (!["ready", "migration-pending", "recovery-required"].includes(snapshot.mode) && !retryBeforeMarker) return snapshot;
        if (!checkToken(storage)) return snapshot;
        // V1 (including its absence) matters without V2 or as a recovery source.
        if ((snapshot.token === null || snapshot.status === "recovery-required") &&
            storage.getItem(v1) !== snapshot.rawV1) {
          conflict();
          return snapshot;
        }
        marker = newId();
      }
      // An existing marker resumes an already-started reset; its original source
      // may have been removed or replaced by the interrupted operation.
      storage.setItem(reset, marker);
      if (storage.getItem(reset) !== marker) throw new Error("Reset marker not verified");
      const removeKeys = [v1];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith(recoveryPrefix)) removeKeys.push(key);
      }
      for (const key of removeKeys) {
        storage.removeItem(key);
        if (storage.getItem(key) !== null) throw new Error("Reset removal not verified");
      }
      const raw = JSON.stringify({ version: 2, savedAt: now(), state: appInitialState });
      storage.setItem(v2, raw);
      if (storage.getItem(v2) !== raw || inspectStoredAppState(raw, 2).status !== "valid") {
        throw new Error("Empty V2 not verified");
      }
      storage.removeItem(reset);
      if (storage.getItem(reset) !== null) throw new Error("Reset marker not removed");
      return adoptLoaded();
    } catch {
      let mode = "storage-conflict";
      try { if (getStorage().getItem(reset) !== null) mode = "reset-incomplete"; }
      catch { mode = "storage-unavailable"; }
      return publish({ mode, operationError: "reset-failed" });
    }
  }

  function handleStorageEvent(event) {
    if (![null, v2, reset].includes(event.key)) return;
    try {
      if (event.storageArea && event.storageArea !== getStorage()) return;
      if (event.key === reset && event.newValue !== null) { conflict("reset-incomplete"); return; }
      if (event.key === null || event.key === reset || event.newValue !== snapshot.token) conflict();
    } catch { conflict(); }
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    canEdit,
    save,
    startMigration: () => {
      if (migrationAttempted) return snapshot;
      migrationAttempted = true;
      return commitMigration();
    },
    retryMigration: commitMigration,
    reload: adoptLoaded,
    restoreLegacy,
    resetProgress,
    handleStorageEvent,
    exportOriginal: () => snapshot.rawV2 ?? snapshot.rawV1,
    exportMemory: (state) => snapshot.hasLoadedState
      ? JSON.stringify({ ...snapshot.wrapper, version: 2, savedAt: now(), state }) : null,
  };
}
