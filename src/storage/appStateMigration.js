import { appInitialState } from "../state/appInitialState.js";

/**
 * @typedef {{severity: 'error'|'warning', code: string, path: string,
 *   message: string}} StorageDiagnostic
 * @typedef {{status: 'absent', diagnostics: StorageDiagnostic[]} |
 *   {status: 'valid', wrapper: Object, diagnostics: StorageDiagnostic[]} |
 *   {status: 'invalid'|'unsupported', input: unknown,
 *     diagnostics: StorageDiagnostic[]}} WrapperInspection
 * @typedef {{status: 'ready', source: 'fresh'|'v2', state: Object,
 *     wrapper: Object|null, canPersist: true, diagnostics: StorageDiagnostic[]} |
 *   {status: 'migration-pending', source: 'v1', candidate: Object,
 *     canPersist: false, diagnostics: StorageDiagnostic[]} |
 *   {status: 'recovery-required', source: 'v1'|'v2',
 *     reason: 'absent'|'invalid'|'unsupported', input: unknown,
 *     canPersist: false, diagnostics: StorageDiagnostic[]}} StorageSelection
 */

const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isPositiveInteger = (value) => Number.isSafeInteger(value) && value > 0;
const isNonEmptyString = (value) => typeof value === "string" && value.trim() !== "";
const isNullableString = (value) => value === null || typeof value === "string";
const at = (path, key) => `${path}/${String(key).replaceAll("~", "~0").replaceAll("/", "~1")}`;
const cloneJson = (value) => JSON.parse(JSON.stringify(value));

function add(diagnostics, code, path, message, severity = "error") {
  diagnostics.push({ severity, code, path, message });
}

/** JSON.parse accepts duplicate keys by dropping earlier values; refuse ambiguity. */
function hasDuplicateJsonKeys(text) {
  const stack = [];
  // Syntax has already been checked by JSON.parse. Only keys and nesting matter.
  for (const [token] of text.matchAll(/"(?:\\.|[^"\\])*"|[{}[\],]/g)) {
    const frame = stack.at(-1);
    if (token === "{") stack.push({ keys: new Set(), expectsKey: true });
    else if (token === "[") stack.push(null);
    else if (token === "}" || token === "]") stack.pop();
    else if (token === "," && frame) frame.expectsKey = true;
    else if (token.startsWith('"') && frame?.expectsKey) {
      const key = JSON.parse(token);
      if (frame.keys.has(key)) return true;
      frame.keys.add(key);
      frame.expectsKey = false;
    }
  }
  return false;
}

/** Reject values that JSON serialization would drop, transform or execute. */
function checkJson(value, path, diagnostics, ancestors = new Set()) {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number" && Number.isFinite(value) && !Object.is(value, -0) &&
      (!Number.isInteger(value) || Number.isSafeInteger(value))) return;
  if (typeof value !== "object" || value === null) {
    add(diagnostics, "non-json-value", path, "Expected a losslessly JSON-compatible value.");
    return;
  }
  if (ancestors.has(value)) {
    add(diagnostics, "circular-reference", path, "Circular references cannot be persisted.");
    return;
  }
  const array = Array.isArray(value);
  if (!array && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) {
    add(diagnostics, "non-json-object", path, "Expected an ordinary JSON object.");
    return;
  }
  ancestors.add(value);
  if (array && Object.keys(value).length !== value.length) {
    add(diagnostics, "non-json-array", path, "Sparse arrays or extra array properties are unsupported.");
  }
  for (const key of Reflect.ownKeys(value)) {
    if (array && key === "length") continue;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (typeof key !== "string" || !descriptor.enumerable || !("value" in descriptor) ||
        (array && (!/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length))) {
      add(diagnostics, "non-json-property", path, "Symbols, accessors and hidden/extra properties are unsupported.");
      continue;
    }
    checkJson(descriptor.value, at(path, key), diagnostics, ancestors);
  }
  ancestors.delete(value);
}

function expect(value, predicate, path, diagnostics, message) {
  if (predicate(value)) return true;
  add(diagnostics, "invalid-structure", path, message);
  return false;
}

function checkFields(value, fields, path, diagnostics) {
  for (const [field, predicate] of Object.entries(fields)) {
    expect(Object.hasOwn(value, field) ? value[field] : undefined, predicate,
      at(path, field), diagnostics, `Missing or invalid ${field}.`);
  }
}

function checkMap(value, path, diagnostics, visit) {
  if (!expect(value, isRecord, path, diagnostics, "Expected a record map.")) return;
  for (const [key, entry] of Object.entries(value)) {
    if (!expect(key, isNonEmptyString, at(path, key), diagnostics, "Map identity must be nonempty.")) continue;
    visit(entry, key, at(path, key));
  }
}

/**
 * Only the shared Phase 1 envelope is recognizable without a trusted binding.
 * Do not guess a definition from exercise/phase IDs or interpret metric ranges.
 * Extra JSON metadata is retained, including future references and phase fields.
 */
function checkMethodLog(log, path, diagnostics) {
  if (!expect(log, isRecord, path, diagnostics, "Expected a method record object.")) return;
  checkFields(log, { choice: (value) => ["record", "skip"].includes(value) }, path, diagnostics);
  checkMap(log.phases, at(path, "phases"), diagnostics, (phase, _id, phasePath) => {
    if (!expect(phase, isRecord, phasePath, diagnostics, "Expected a phase record.")) return;
    checkFields(phase, {
      execution: (value) => ["unconfirmed", "partial", "performed"].includes(value),
    }, phasePath, diagnostics);
  });
  add(diagnostics, "method-context-unresolved", path,
    "Method data is opaque: exact definition, metrics and applicability await trusted cycle bindings.", "warning");
}

function checkSets(sets, path, diagnostics, core) {
  if (!expect(sets, Array.isArray, path, diagnostics, "Expected a set array.")) return;
  const indexes = new Set();
  sets.forEach((set, index) => {
    const setPath = at(path, index);
    if (!expect(set, isRecord, setPath, diagnostics, "Expected a set record.")) return;
    const stringFields = core ? ["load", "reps", "time", "rir"] : ["weight", "reps", "rir"];
    checkFields(set, {
      setIndex: isPositiveInteger,
      isDone: (value) => typeof value === "boolean",
      ...Object.fromEntries(stringFields.map((field) => [field, (value) => typeof value === "string"])),
    }, setPath, diagnostics);
    if (indexes.has(set.setIndex)) {
      add(diagnostics, "duplicate-set-index", at(setPath, "setIndex"), "Set identity is duplicated.");
    }
    indexes.add(set.setIndex);
    if (!core && Object.hasOwn(set, "methodLog")) checkMethodLog(set.methodLog, at(setPath, "methodLog"), diagnostics);
  });
}

function checkExercise(log, id, path, diagnostics, core = false) {
  if (!expect(log, isRecord, path, diagnostics, "Expected an exercise log.")) return;
  const identity = core ? "coreExerciseId" : "exerciseId";
  checkFields(log, { [identity]: (value) => value === id, closedAt: isNullableString }, path, diagnostics);
  checkSets(log.sets, at(path, "sets"), diagnostics, core);
}

function checkDay(day, id, path, diagnostics) {
  if (!expect(day, isRecord, path, diagnostics, "Expected a day log.")) return;
  checkFields(day, { dayId: (value) => value === id, finishedAt: isNullableString }, path, diagnostics);
  checkMap(day.mainExerciseLogs, at(path, "mainExerciseLogs"), diagnostics,
    (log, exerciseId, logPath) => checkExercise(log, exerciseId, logPath, diagnostics));
  if (day.coreBlockLog === null) return;
  const corePath = at(path, "coreBlockLog");
  if (!expect(day.coreBlockLog, isRecord, corePath, diagnostics, "Expected null or a Core block log.")) return;
  checkFields(day.coreBlockLog, { coreBlockId: isNonEmptyString, closedAt: isNullableString }, corePath, diagnostics);
  checkMap(day.coreBlockLog.coreExerciseLogs, at(corePath, "coreExerciseLogs"), diagnostics,
    (log, exerciseId, logPath) => checkExercise(log, exerciseId, logPath, diagnostics, true));
}

function checkPlan(plan, planId, path, diagnostics) {
  if (!expect(plan, isRecord, path, diagnostics, "Expected plan progress.")) return;
  checkFields(plan, { currentCycleNumber: isPositiveInteger }, path, diagnostics);
  checkMap(plan.cycles, at(path, "cycles"), diagnostics, (cycle, key, cyclePath) => {
    if (!expect(cycle, isRecord, cyclePath, diagnostics, "Expected a cycle log.")) return;
    checkFields(cycle, {
      cycleNumber: (value) => isPositiveInteger(value) && String(value) === key,
      planId: (value) => value === planId,
      currentDayId: isNonEmptyString,
      startedAt: isNullableString,
      completedAt: isNullableString,
    }, cyclePath, diagnostics);
    if (Object.hasOwn(cycle, "methodBindings")) {
      add(diagnostics, "method-bindings-unresolved", at(cyclePath, "methodBindings"),
        "Existing binding metadata is retained without interpreting an unapproved schema.", "warning");
    }
    checkMap(cycle.dayLogs, at(cyclePath, "dayLogs"), diagnostics,
      (day, dayId, dayPath) => checkDay(day, dayId, dayPath, diagnostics));
  });
  if (isRecord(plan.cycles) && !Object.hasOwn(plan.cycles, plan.currentCycleNumber)) {
    add(diagnostics, "missing-current-cycle", at(path, "currentCycleNumber"), "Current cycle must exist in cycles.");
  }
}

/**
 * Inspect a raw storage string or an already parsed wrapper, without IO.
 * Only raw null means absent; an empty string or parsed JSON null is invalid.
 * All JSON-safe extension fields are preserved. Base values are checked only
 * for stored types, never re-sanitized against today's UI or training content.
 * savedAt was not required by the V1 loader: preserve it verbatim when present
 * (a string); warn if absent, without inventing a migration/workout timestamp.
 * Definition-specific method validation is deliberately deferred to Phase 2b.
 * @param {unknown} input
 * @param {1|2} expectedVersion Version of the source slot, not a fallback hint.
 * @returns {WrapperInspection}
 */
export function inspectStoredAppState(input, expectedVersion) {
  const diagnostics = [];
  if (input === null) return { status: "absent", diagnostics };
  let wrapper;
  try {
    wrapper = typeof input === "string" ? JSON.parse(input) : input;
    if (typeof input === "string" && hasDuplicateJsonKeys(input)) {
      add(diagnostics, "duplicate-json-key", "", "Duplicate object keys make the stored source ambiguous.");
      return { status: "invalid", input, diagnostics };
    }
  } catch {
    add(diagnostics, "invalid-json", "", "Stored text is not valid JSON.");
    return { status: "invalid", input, diagnostics };
  }
  try {
    checkJson(wrapper, "", diagnostics);
  } catch {
    add(diagnostics, "unsupported-json-input", "", "Input could not be safely inspected (for example, excessive nesting).");
  }
  if (diagnostics.length || !expect(wrapper, isRecord, "", diagnostics, "Expected a versioned wrapper.")) {
    return { status: "invalid", input, diagnostics };
  }
  if (!Object.hasOwn(wrapper, "version") || !isPositiveInteger(wrapper.version)) {
    add(diagnostics, "invalid-version", "/version", "Expected an explicit positive integer version.");
    return { status: "invalid", input, diagnostics };
  }
  if (![1, 2].includes(expectedVersion) || wrapper.version !== expectedVersion) {
    add(diagnostics, "unsupported-version", "/version", "Wrapper version is unsupported in this source slot.");
    return { status: "unsupported", input, diagnostics };
  }
  if (Object.hasOwn(wrapper, "savedAt")) {
    expect(wrapper.savedAt, (value) => typeof value === "string", "/savedAt", diagnostics, "Expected a savedAt string.");
  } else {
    add(diagnostics, "missing-saved-at", "/savedAt", "Source has no savedAt; no timestamp will be fabricated.", "warning");
  }
  if (expect(wrapper.state, isRecord, "/state", diagnostics, "Expected workout state.")) {
    checkFields(wrapper.state, { selectedPlanId: isNullableString }, "/state", diagnostics);
    checkMap(wrapper.state.progressByPlan, "/state/progressByPlan", diagnostics,
      (plan, planId, planPath) => checkPlan(plan, planId, planPath, diagnostics));
  }
  if (diagnostics.some((entry) => entry.severity === "error")) return { status: "invalid", input, diagnostics };
  return { status: "valid", wrapper: cloneJson(wrapper), diagnostics };
}

/**
 * Produce a detached V2 candidate; only wrapper.version changes. Preserve the
 * original savedAt, all extension metadata, history and legacy base semantics.
 * A candidate is not a completed migration and never grants a normal write gate.
 * @param {unknown} input Raw/parsed V1 source.
 * @returns {StorageSelection}
 */
export function migrateV1ToV2(input) {
  const inspected = inspectStoredAppState(input, 1);
  if (inspected.status !== "valid") {
    return { status: "recovery-required", source: "v1", reason: inspected.status,
      input, canPersist: false, diagnostics: inspected.diagnostics };
  }
  return { status: "migration-pending", source: "v1", canPersist: false,
    candidate: { ...inspected.wrapper, version: 2 }, diagnostics: inspected.diagnostics };
}

/**
 * Strict source precedence. Both slots must be supplied explicitly as raw values
 * or parsed wrappers; null alone means a missing key. V1 is not inspected when
 * V2 exists. There is no merge or recovery fallback. ready.canPersist describes
 * data eligibility only; web orchestration still owns reset/conflict/write gates.
 * Unsafe results expose no usable workout state or partial migration candidate.
 * @param {{v1: unknown, v2: unknown}} sources
 * @returns {StorageSelection}
 */
export function selectStoredAppState({ v1, v2 }) {
  if (v2 !== null) {
    const inspected = inspectStoredAppState(v2, 2);
    if (inspected.status === "valid") {
      return { status: "ready", source: "v2", canPersist: true,
        state: inspected.wrapper.state, wrapper: inspected.wrapper, diagnostics: inspected.diagnostics };
    }
    return { status: "recovery-required", source: "v2", reason: inspected.status,
      input: v2, canPersist: false, diagnostics: inspected.diagnostics };
  }
  if (v1 !== null) return migrateV1ToV2(v1);
  return { status: "ready", source: "fresh", canPersist: true,
    state: cloneJson(appInitialState), wrapper: null, diagnostics: [] };
}
