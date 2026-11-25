import {
  hasDropsetPhaseData, hasExactFields, isPlainRecord, isValidMethodAssistanceChange,
  isValidMethodPhaseMetricValue, validateMethodLog,
} from "./advancedMethodValidation.js";

/**
 * @typedef {'unconfirmed'|'partial'|'performed'} PhaseExecution
 * @typedef {{mode: 'same'|'entered', kg: string}} MethodAssistance
 * @typedef {{execution: PhaseExecution, reps?: string, restSeconds?: string,
 *   durationSeconds?: string, assistance?: MethodAssistance, loadKg?: string}} MethodPhaseLog
 * @typedef {{choice: 'record'|'skip', phases: Object<string, MethodPhaseLog>, endPhaseId?: string}} MethodLog
 * @typedef {{type: 'set-choice', choice: 'record'|'skip'} |
 *   {type: 'set-metric', phaseId: string, field: string, value: string} |
 *   {type: 'set-execution', phaseId: string, execution: PhaseExecution} |
 *   {type: 'set-assistance', phaseId: string, mode: 'same'|'entered', kg: string} |
 *   {type: 'clear-assistance', phaseId: string} |
 *   {type: 'finish-dropset'|'extend-dropset', phaseId: string}} MethodChange
 */

const phaseChangeFields = {
  "set-choice": ["type", "choice"],
  "set-metric": ["type", "phaseId", "field", "value"],
  "set-execution": ["type", "phaseId", "execution"],
};
const dropsetChangeFields = {
  ...phaseChangeFields,
  "finish-dropset": ["type", "phaseId"],
  "extend-dropset": ["type", "phaseId"],
};

/**
 * Uses prescribed rows, never isDone. Rejects incomplete/duplicate scaffolds.
 * The definition is already plan-scoped; this helper does not bind a cycle.
 * @param {import('../../data/advancedMethods/definitions.js').MethodDefinition|null} definition
 * @param {Array<{setIndex: number}>} setRows
 * @returns {number[]}
 */
export function getApplicableSetIndexes(definition, setRows) {
  if (!definition || !Array.isArray(setRows) ||
      setRows.length !== definition.prescribedSetCount) return [];
  const indexes = Array.from(setRows, (row) => row?.setIndex);
  if (!indexes.every(Number.isSafeInteger)) return [];
  indexes.sort((a, b) => a - b);
  if (!indexes.every((index, position) => index === position + 1)) return [];
  if (definition.appliesTo === "all") return indexes;
  return definition.appliesTo === "last" ? indexes.slice(-1) : [];
}

/**
 * Pure immutable edits. Rejected changes return the original record unchanged.
 * Editing retained phases under skip is rejected; explicitly resume record first.
 * No main-set fields or definition references are stored in this record.
 * The "same" assistance kg is a snapshot. Checking it against the actual base
 * row at confirmation time is the caller's responsibility.
 * Dropsets confirm the final drop and set the end together. Extending names the
 * current end and reopens recording without changing any recorded drops.
 * @param {import('../../data/advancedMethods/definitions.js').MethodDefinition|null} definition
 * @param {MethodLog|undefined} record
 * @param {MethodChange} change
 * @returns {MethodLog|undefined}
 */
export function transitionMethodLog(definition, record, change) {
  if (!validateMethodLog(definition, record).valid || !isPlainRecord(change)) return record;
  const dropset = definition.type === "dropset";
  const strictChanges = dropset || definition.type === "mechanical-set";
  const changeFields = dropset ? dropsetChangeFields : phaseChangeFields;
  if (strictChanges && (typeof change.type !== "string" || !Object.hasOwn(changeFields, change.type) ||
      !hasExactFields(change, changeFields[change.type]))) return record;
  if (change.type === "set-choice") {
    if (!["record", "skip"].includes(change.choice)) return record;
    if (strictChanges && record?.choice === change.choice) return record;
    return { ...record, choice: change.choice, phases: { ...record?.phases } };
  }
  if (record?.choice === "skip") return record;
  const phaseDefinition = definition.phases.find((phase) => phase.phaseId === change.phaseId);
  if (!phaseDefinition) return record;

  if (dropset && change.type === "extend-dropset") {
    if (record?.endPhaseId !== change.phaseId || phaseDefinition === definition.phases.at(-1)) return record;
    const reopened = { ...record };
    delete reopened.endPhaseId;
    return reopened;
  }
  if (dropset && record?.endPhaseId !== undefined && change.type !== "set-metric") return record;

  const finishing = dropset && change.type === "finish-dropset";
  const previousPhase = record?.phases[change.phaseId];
  if (change.type === "set-metric") {
    if (!isValidMethodPhaseMetricValue(definition, phaseDefinition, change.field, change.value)) return record;
    if (strictChanges && (previousPhase?.[change.field] ?? "") === change.value) return record;
  } else if (change.type === "set-execution") {
    if (!["unconfirmed", "partial", "performed"].includes(change.execution)) return record;
    if (strictChanges && (previousPhase?.execution ?? "unconfirmed") === change.execution) return record;
  } else if (!finishing && !isValidMethodAssistanceChange(definition, phaseDefinition, change)) {
    return record;
  }

  if (change.type === "clear-assistance" && !previousPhase?.assistance) return record;
  const updatedPhase = previousPhase ? { ...previousPhase } : {
    execution: "unconfirmed",
    ...Object.fromEntries(phaseDefinition.metrics.map((metric) => [metric, ""])),
  };
  if (change.type === "set-metric") updatedPhase[change.field] = change.value;
  else if (finishing) updatedPhase.execution = "performed";
  else if (change.type === "set-execution") updatedPhase.execution = change.execution;
  else if (change.type === "set-assistance") updatedPhase.assistance = { mode: change.mode, kg: change.kg };
  else delete updatedPhase.assistance;
  const nextRecord = {
    ...record,
    choice: "record",
    phases: { ...record?.phases, [change.phaseId]: updatedPhase },
  };
  if (finishing) nextRecord.endPhaseId = change.phaseId;
  return dropset && !validateMethodLog(definition, nextRecord).valid ? record : nextRecord;
}

/**
 * Derives execution, numeric completeness and per-metric target comparisons
 * independently. "within" means within the written target, not a quality score.
 * Comparisons may describe draft values; they never confirm execution.
 * Skipped retained phases contribute no active metrics or comparisons.
 * Invalid records return status null plus diagnostics, never fake "unknown".
 * @param {import('../../data/advancedMethods/definitions.js').MethodDefinition|null} definition
 * @param {MethodLog|undefined} record
 * @returns {{valid: boolean, errors: string[], status: string|null,
 *   numericComplete: boolean|null, missingMetrics: string[],
 *   targetComparisons: Object<string, Object<string, string>>}}
 */
export function deriveMethodState(definition, record) {
  const validation = validateMethodLog(definition, record);
  const result = {
    ...validation,
    status: null,
    numericComplete: null,
    missingMetrics: [],
    targetComparisons: {},
  };
  if (!validation.valid) return result;
  if (record === undefined) return { ...result, status: "unknown" };
  if (record.choice === "skip") return { ...result, status: "skipped" };

  const dropset = definition.type === "dropset";
  const phases = dropset ? definition.phases.filter(({ phaseId }) => hasDropsetPhaseData(record.phases[phaseId]))
    : definition.phases;
  const executions = phases.map((phase) => record.phases[phase.phaseId]?.execution);
  const performed = dropset ? Object.hasOwn(record, "endPhaseId") : executions.every((execution) => execution === "performed");
  result.status = performed
    ? "performed"
    : executions.some((execution) => ["partial", "performed"].includes(execution))
      ? "partial" : "draft";

  // Evaluate only recorded drops. An empty attempt can still record its first drop.
  const measuredPhases = dropset && phases.length === 0 ? definition.phases.slice(0, 1) : phases;
  for (const phase of measuredPhases) {
    const actual = record.phases[phase.phaseId];
    for (const metric of phase.requiredMetrics) {
      if (actual?.[metric] === undefined || actual[metric] === "") {
        result.missingMetrics.push(`${phase.phaseId}.${metric}`);
      }
    }
    if (dropset || definition.type === "mechanical-set") continue;
    result.targetComparisons[phase.phaseId] = {};
    for (const [metric, target] of Object.entries(phase.targets)) {
      const value = actual?.[metric];
      result.targetComparisons[phase.phaseId][metric] = value === undefined || value === ""
        ? "unrecorded"
        : Number(value) < target.min ? "below"
          : Number(value) > target.max ? "above" : "within";
    }
  }
  result.numericComplete = result.missingMetrics.length === 0;
  return result;
}
