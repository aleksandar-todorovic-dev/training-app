/**
 * Approved Phase 1 numeric contract:
 * measurements are canonical whole-number strings, including explicit zero.
 * Seconds use whole-second precision. Empty means unrecorded, never zero.
 * Reps are limited to 0–30 and seconds to 0–999 for input/UX consistency;
 * these bounds are not prescribed training targets.
 * Zero records an explicit result. A separate performed confirmation may
 * describe a confirmed attempt with zero achieved reps/seconds.
 * Decimal/comma input is rejected rather than rounded or silently coerced.
 *
 * @param {string} metric
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidMethodMetricValue(metric, value) {
  if (!["reps", "restSeconds", "durationSeconds"].includes(metric)) return false;
  const maxValue = metric === "reps" ? 30 : 999;
  return typeof value === "string" && (
    value === "" || (value === value.trim() && /^(0|[1-9]\d*)$/.test(value) && Number(value) <= maxValue)
  );
}

// Reject prototypes, accessors, symbols and hidden fields that JSON would lose.
function isPlainRecord(value) {
  return value !== null && typeof value === "object" &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
    Reflect.ownKeys(value).every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return typeof key === "string" && descriptor.enumerable && "value" in descriptor;
    });
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
  if (record === undefined) return { valid: true, errors };
  if (!isPlainRecord(record)) return { valid: false, errors: ["record: expected plain object"] };
  if (Object.keys(record).some((key) => !["choice", "phases"].includes(key))) {
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
      if (!phaseDefinition.metrics.includes(field) || !isValidMethodMetricValue(field, value)) {
        errors.push(`${phaseId}.${field}: invalid metric or value`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
