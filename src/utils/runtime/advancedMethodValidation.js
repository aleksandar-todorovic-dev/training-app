/**
 * Empty means unrecorded. Zero is an explicit measurement. Reps use whole
 * numbers from 0–30 and seconds use whole numbers from 0–999. External drop
 * load uses canonical dot decimals from 0–999.9 kg with at most one decimal
 * digit and no redundant zeros. These bounds are for input, not targets.
 * The domain neither coerces nor rounds measurements.
 *
 * @param {string} metric
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidMethodMetricValue(metric, value) {
  if (metric === "loadKg") {
    return typeof value === "string" && (
      value === "" || (value === value.trim() && /^(0|[1-9]\d{0,2})(\.[1-9])?$/.test(value))
    );
  }
  if (!["reps", "restSeconds", "durationSeconds"].includes(metric)) return false;
  const maxValue = metric === "reps" ? 30 : 999;
  return typeof value === "string" && (
    value === "" || (value === value.trim() && /^(0|[1-9]\d*)$/.test(value) && Number(value) <= maxValue)
  );
}

export function isValidMethodPhaseMetricValue(definition, phase, field, value) {
  const supported = definition.type === "dropset" ? ["reps", "loadKg"].includes(field) : field !== "loadKg";
  return supported && phase.metrics.includes(field) && isValidMethodMetricValue(field, value);
}

// Reject prototypes, accessors, symbols and hidden fields that JSON would lose.
export function isPlainRecord(value) {
  return value !== null && typeof value === "object" &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
    Reflect.ownKeys(value).every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return typeof key === "string" && descriptor.enumerable && "value" in descriptor;
    });
}

/**
 * Normalize a completed dot-decimal assistance value (0–999.9 kg).
 * Leading zeros and a redundant .0 are accepted at this boundary only.
 * Blank, incomplete, comma-decimal and non-string values return null.
 * @param {unknown} value
 * @returns {string|null}
 */
export function normalizeAssistanceKg(value) {
  if (typeof value !== "string" || value !== value.trim() ||
      !/^\d{1,3}(\.\d)?$/.test(value)) return null;
  return value.replace(/^0+(?=\d)/, "").replace(/\.0$/, "");
}

function supportsAssistance(definition, phase) {
  return definition.type === "cluster" &&
    definition.base?.semantics === "pre-extension" &&
    definition.base.loadKind === "machine-assistance" && definition.base.loadUnit === "kg" &&
    phase.phaseId === "additional-burst" && phase.loadRule === "adjustable-machine-assistance";
}

// The caller must first check that record is a plain data object.
export function hasExactFields(record, fields) {
  return Object.keys(record).length === fields.length && fields.every((field) => Object.hasOwn(record, field));
}

const preacherExerciseId = "preacher-curl-mechanical";
const preacherDefinitionId = "bulk-pro/preacher-curl-mechanical/mechanical-set";

export function isPreacherMechanicalAddress({ planId, dayId, exerciseId }) {
  return planId === "bulk-pro" && dayId === "d6" && exerciseId === preacherExerciseId;
}

// A corrupted type must not route a known Preacher identity through generic validation.
export function isPreacherMechanicalCandidate(definition) {
  return Object.getOwnPropertyDescriptor(definition, "definitionId")?.value === preacherDefinitionId ||
    Object.getOwnPropertyDescriptor(definition, "exerciseId")?.value === preacherExerciseId ||
    definition.type === "mechanical-set";
}

// A singleton array must contain one ordinary data entry and no extension metadata.
function onlyItem(items) {
  if (!Array.isArray(items) || Object.getPrototypeOf(items) !== Array.prototype ||
      items.length !== 1 || Reflect.ownKeys(items).length !== 2) return undefined;
  const entry = Object.getOwnPropertyDescriptor(items, "0");
  return entry?.enumerable ? entry.value : undefined;
}

export function isPreacherMechanicalDefinition(definition) {
  if (!isPlainRecord(definition) || !hasExactFields(definition, [
    "definitionId", "planId", "exerciseId", "type", "revision", "prescribedSetCount", "appliesTo", "base", "phases",
  ]) || definition.definitionId !== preacherDefinitionId || definition.planId !== "bulk-pro" ||
    definition.exerciseId !== preacherExerciseId || definition.type !== "mechanical-set" ||
    definition.revision !== 1 || definition.prescribedSetCount !== 1 || definition.appliesTo !== "last") return false;

  const { base } = definition;
  const phase = onlyItem(definition.phases);
  return isPlainRecord(base) && hasExactFields(base, ["semantics", "variationId", "loadKind", "loadUnit"]) &&
    base.semantics === "pre-extension" && base.variationId === "wide-grip" &&
    base.loadKind === "external" && base.loadUnit === "kg" &&
    isPlainRecord(phase) && hasExactFields(phase, ["phaseId", "loadRule", "metrics", "requiredMetrics", "targets"]) &&
    phase.phaseId === "narrow-grip" && phase.loadRule === "same-as-base" &&
    onlyItem(phase.metrics) === "reps" && onlyItem(phase.requiredMetrics) === "reps" &&
    isPlainRecord(phase.targets) && hasExactFields(phase.targets, []);
}

export function isValidPreacherMechanicalBaseRow(row) {
  return isPlainRecord(row) && Object.hasOwn(row, "setIndex") && row.setIndex === 1 &&
    Object.hasOwn(row, "isDone") && typeof row.isDone === "boolean" &&
    ["weight", "reps", "rir"].every((field) => Object.hasOwn(row, field) && typeof row[field] === "string");
}

function isValidAssistanceValue(mode, kg) {
  return ["same", "entered"].includes(mode) && typeof kg === "string" && normalizeAssistanceKg(kg) === kg;
}

// Accepts a plain change record. The caller must verify "same" against the
// targeted base row before passing the canonical snapshot to the transition.
export function isValidMethodAssistanceChange(definition, phase, change) {
  if (!supportsAssistance(definition, phase)) return false;
  if (change.type === "clear-assistance") return hasExactFields(change, ["type", "phaseId"]);
  return change.type === "set-assistance" && hasExactFields(change, ["type", "phaseId", "mode", "kg"]) &&
    isValidAssistanceValue(change.mode, change.kg);
}

function hasValidDropsetPhaseOrder({ base, phases }) {
  if (base?.semantics !== "pre-extension" || base.loadKind !== "external" || base.loadUnit !== "kg" ||
      !Array.isArray(phases) || phases.length < 1 || phases.length > 3) return false;
  const phaseIds = Array.from(phases, (phase) => phase?.phaseId);
  return phaseIds.every((id) => typeof id === "string" && id.trim() !== "") &&
    new Set(phaseIds).size === phaseIds.length && phases.every((phase) => phase.loadRule === "reduced-from-previous");
}

// An empty, unconfirmed scaffold does not extend the recorded attempt.
export function hasDropsetPhaseData(phase) {
  return Boolean(phase && (phase.execution !== "unconfirmed" || phase.reps || phase.loadKg));
}

function checkDropsetSequence(definition, record, errors) {
  const hasEnd = Object.hasOwn(record, "endPhaseId");
  const endIndex = hasEnd ? definition.phases.findIndex(({ phaseId }) => phaseId === record.endPhaseId)
    : definition.phases.length - 1;
  if (endIndex < 0) {
    errors.push("endPhaseId: unknown phase");
    return;
  }

  let prefixConfirmed = true;
  for (const [index, { phaseId }] of definition.phases.entries()) {
    const phase = record.phases[phaseId];
    if (hasDropsetPhaseData(phase) && (!prefixConfirmed || index > endIndex)) {
      errors.push(`${phaseId}: recorded drop is out of sequence`);
    }
    prefixConfirmed = prefixConfirmed && phase?.execution === "performed";
    if (hasEnd && index === endIndex && !prefixConfirmed) {
      errors.push("endPhaseId: all drops through the end must be confirmed");
    }
  }
}

/**
 * Validates only the optional method record, never the parent main set.
 * Definition must come from an exact registry lookup (trusted static metadata).
 * Undefined is the sole absent representation; null is malformed input.
 * Sparse phase maps are allowed; missing phases are unconfirmed/unrecorded.
 * Unknown fields fail validation instead of being silently discarded.
 *
 * @param {import('../../data/advancedMethods/definitions.js').MethodDefinition|null} definition
 * @param {unknown} record
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateMethodLog(definition, record) {
  const errors = [];
  if (!definition) return { valid: false, errors: ["definition: unresolved"] };
  if (isPreacherMechanicalCandidate(definition) && !isPreacherMechanicalDefinition(definition)) {
    return { valid: false, errors: ["definition: unsupported Preacher Mechanical protocol"] };
  }
  const dropset = definition.type === "dropset";
  if (dropset && !hasValidDropsetPhaseOrder(definition)) {
    return { valid: false, errors: ["definition: invalid dropset phase order or load semantics"] };
  }
  if (record === undefined) return { valid: true, errors };
  if (!isPlainRecord(record)) return { valid: false, errors: ["record: expected plain object"] };
  if (Object.keys(record).some((key) => key !== "choice" && key !== "phases" && !(dropset && key === "endPhaseId"))) {
    errors.push("record: unknown field");
  }
  if (!["record", "skip"].includes(record.choice)) errors.push("choice: invalid");
  if (!isPlainRecord(record.phases)) {
    return { valid: false, errors: [...errors, "phases: expected plain object"] };
  }
  for (const [phaseId, phase] of Object.entries(record.phases)) {
    const phaseDefinition = definition.phases.find((item) => item.phaseId === phaseId);
    if (!phaseDefinition || !isPlainRecord(phase)) {
      errors.push(`${phaseId}: unknown phase or invalid object`);
      continue;
    }
    if (!["unconfirmed", "partial", "performed"].includes(phase.execution)) {
      errors.push(`${phaseId}.execution: invalid`);
    }
    for (const [field, value] of Object.entries(phase)) {
      if (field === "execution") continue;
      if (field === "assistance") {
        if (!supportsAssistance(definition, phaseDefinition) || !isPlainRecord(value) ||
            !hasExactFields(value, ["mode", "kg"]) || !isValidAssistanceValue(value.mode, value.kg)) {
          errors.push(`${phaseId}.assistance: invalid assistance`);
        }
        continue;
      }
      if (!isValidMethodPhaseMetricValue(definition, phaseDefinition, field, value)) {
        errors.push(`${phaseId}.${field}: invalid metric or value`);
      }
    }
  }
  if (dropset && errors.length === 0) checkDropsetSequence(definition, record, errors);
  return { valid: errors.length === 0, errors };
}
