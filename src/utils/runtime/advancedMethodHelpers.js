import { isValidMethodMetricValue, validateMethodLog } from "./advancedMethodValidation.js";

/**
 * @typedef {'unconfirmed'|'partial'|'performed'} PhaseExecution
 * @typedef {{execution: PhaseExecution, reps?: string, restSeconds?: string,
 *   durationSeconds?: string}} MethodPhaseLog
 * @typedef {{choice: 'record'|'skip', phases: Object<string, MethodPhaseLog>}} MethodLog
 * @typedef {{type: 'set-choice', choice: 'record'|'skip'} |
 *   {type: 'set-metric', phaseId: string, field: string, value: string} |
 *   {type: 'set-execution', phaseId: string, execution: PhaseExecution}} MethodChange
 */

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
  const indexes = Array.from(setRows, (row) => row?.setIndex).sort((a, b) => a - b);
  if (!indexes.every((index, position) => index === position + 1)) return [];
  if (definition.appliesTo === "all") return indexes;
  return definition.appliesTo === "last" ? indexes.slice(-1) : [];
}

/**
 * Pure immutable edits. Rejected changes return the original record unchanged.
 * Editing retained phases under skip is rejected; explicitly resume record first.
 * No main-set fields or definition references are stored in this record.
 * @param {import('../../data/advancedMethods/definitions.js').MethodDefinition|null} definition
 * @param {MethodLog|undefined} record
 * @param {MethodChange} change
 * @returns {MethodLog|undefined}
 */
export function transitionMethodLog(definition, record, change) {
  if (!validateMethodLog(definition, record).valid || !change) return record;
  if (change.type === "set-choice") {
    if (!["record", "skip"].includes(change.choice)) return record;
    return { choice: change.choice, phases: { ...record?.phases } };
  }
  if (record?.choice === "skip") return record;
  const phaseDefinition = definition.phases.find((phase) => phase.phaseId === change.phaseId);
  if (!phaseDefinition) return record;
  if (change.type === "set-metric") {
    if (!phaseDefinition.metrics.includes(change.field) ||
        !isValidMethodMetricValue(change.field, change.value)) return record;
  } else if (change.type === "set-execution") {
    if (!["unconfirmed", "partial", "performed"].includes(change.execution)) return record;
  } else return record;

  const phase = record?.phases[change.phaseId] ?? {
    execution: "unconfirmed",
    ...Object.fromEntries(phaseDefinition.metrics.map((metric) => [metric, ""])),
  };
  const updatedPhase = change.type === "set-metric"
    ? { ...phase, [change.field]: change.value }
    : { ...phase, execution: change.execution };
  return {
    choice: "record",
    phases: { ...record?.phases, [change.phaseId]: updatedPhase },
  };
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

  const executions = definition.phases.map((phase) => record.phases[phase.phaseId]?.execution);
  result.status = executions.every((execution) => execution === "performed")
    ? "performed"
    : executions.some((execution) => ["partial", "performed"].includes(execution))
      ? "partial" : "draft";

  for (const phase of definition.phases) {
    const actual = record.phases[phase.phaseId];
    for (const metric of phase.requiredMetrics) {
      if (actual?.[metric] === undefined || actual[metric] === "") {
        result.missingMetrics.push(`${phase.phaseId}.${metric}`);
      }
    }
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
