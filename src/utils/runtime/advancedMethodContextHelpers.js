import { getMethodDefinition } from "../../data/advancedMethods/definitions.js";
import { getExercisesByPlanId } from "../../data/exercises/index.js";
import { getDayDetailsByPlanId } from "../../data/dayDetails/index.js";
import { getPlanById } from "../../data/plans/index.js";

// Activation is explicit. Historical registry additions never activate a method.
const activeMethodsByPlan = Object.freeze({
  "bulk-pro": Object.freeze([
    Object.freeze({ exerciseId: "incline-db-press", dayId: "d1", definitionId: "bulk-pro/incline-db-press/rest-pause", revision: 1, type: "rest-pause" }),
    Object.freeze({ exerciseId: "cable-stretch-fly", dayId: "d1", definitionId: "bulk-pro/cable-stretch-fly/iso-stretch", revision: 1, type: "iso-stretch" }),
    Object.freeze({ exerciseId: "face-away-cable-curl", dayId: "d4", definitionId: "bulk-pro/face-away-cable-curl/rest-pause", revision: 1, type: "rest-pause" }),
    Object.freeze({ exerciseId: "assisted-pull-up-cluster", dayId: "d5", definitionId: "bulk-pro/assisted-pull-up-cluster/cluster", revision: 1, type: "cluster" }),
    Object.freeze({ exerciseId: "leg-extension", dayId: "d3", definitionId: "bulk-pro/leg-extension/dropset", revision: 1, type: "dropset" }),
    Object.freeze({ exerciseId: "overhead-rope-extension", dayId: "d1", definitionId: "bulk-pro/overhead-rope-extension/dropset", revision: 1, type: "dropset" }),
    Object.freeze({ exerciseId: "machine-lateral-raise", dayId: "d4", definitionId: "bulk-pro/machine-lateral-raise/dropset", revision: 1, type: "dropset" }),
    Object.freeze({ exerciseId: "leg-press-calf-raise", dayId: "d6", definitionId: "bulk-pro/leg-press-calf-raise/dropset", revision: 1, type: "dropset" }),
  ]),
  "cut-pro": Object.freeze([]),
});

const staticCatalog = { activeMethodsByPlan, getMethodDefinition, getExercisesByPlanId, getDayDetailsByPlanId, getPlanById };
const isPositiveInteger = (value) => Number.isSafeInteger(value) && value > 0;
const isIdentity = (value) => typeof value === "string" && value.trim() !== "";
const result = (status, reason) => ({ status, reason });

// Read only ordinary data properties; never execute accessors in opaque input.
function isRecord(value) {
  return value !== null && typeof value === "object" &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value)) &&
    Reflect.ownKeys(value).every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return typeof key === "string" && descriptor.enumerable && "value" in descriptor;
    });
}

function getOwnedExercise(catalog, plan, dayId, exerciseId) {
  const allExercises = catalog.getExercisesByPlanId(plan.id);
  const days = catalog.getDayDetailsByPlanId(plan.id);
  if (!Array.isArray(allExercises) || !Array.isArray(days) || !Array.isArray(plan.dayOrder) ||
      days.some((day) => !Array.isArray(day?.exerciseIds))) return null;
  const exercises = allExercises.filter((exercise) => exercise?.id === exerciseId);
  const owners = days.flatMap((day) => day.exerciseIds
    .filter((id) => id === exerciseId).map(() => day.id));
  if (exercises.length !== 1 || owners.length !== 1 || owners[0] !== dayId ||
      days.filter((day) => day.id === dayId).length !== 1 ||
      plan.dayOrder.filter((id) => id === dayId).length !== 1) return null;
  return exercises[0];
}

/**
 * Build the complete approved snapshot, or fail without returning a partial map.
 * Only START_PLAN_CYCLE installs it. The optional catalog supplies pure synthetic
 * fixtures; application callers always use the static catalog and exact lookup.
 * @returns {{status: 'ready', bindings: object}|{status: 'invalid', reason: string}}
 */
export function buildCycleMethodBindings({ planId }, catalog = staticCatalog) {
  const plan = catalog.getPlanById(planId);
  if (!plan || plan.id !== planId || !Object.hasOwn(catalog.activeMethodsByPlan, planId)) {
    return result("invalid", "unknown-plan");
  }
  const active = catalog.activeMethodsByPlan[planId];
  if (!Array.isArray(active)) return result("invalid", "invalid-active-catalog");
  const exercises = {};
  for (const ref of active) {
    if (!isRecord(ref) || !isIdentity(ref.exerciseId) || !isIdentity(ref.dayId) ||
        !isIdentity(ref.definitionId) || !isPositiveInteger(ref.revision) || !isIdentity(ref.type)) {
      return result("invalid", "invalid-active-reference");
    }
    if (Object.hasOwn(exercises, ref.exerciseId)) return result("invalid", "duplicate-active-exercise");
    const exercise = getOwnedExercise(catalog, plan, ref.dayId, ref.exerciseId);
    if (!exercise) return result("invalid", "exercise-ownership-mismatch");
    const definition = catalog.getMethodDefinition({ planId, ...ref });
    if (!definition || definition.planId !== planId || definition.exerciseId !== ref.exerciseId ||
        definition.definitionId !== ref.definitionId || definition.revision !== ref.revision) {
      return result("invalid", "definition-unresolved");
    }
    if (definition.type !== ref.type || exercise.details?.advancedTechniqueType !== ref.type) {
      return result("invalid", "method-type-mismatch");
    }
    if (!isPositiveInteger(definition.prescribedSetCount) || definition.prescribedSetCount !== exercise.setCount) {
      return result("invalid", "prescribed-count-mismatch");
    }
    Object.defineProperty(exercises, ref.exerciseId, { enumerable: true, configurable: true, writable: true,
      value: { definitionId: ref.definitionId, revision: ref.revision, dayId: ref.dayId, setCount: definition.prescribedSetCount } });
  }
  return { status: "ready", bindings: { version: 1, exercises } };
}

/**
 * Resolve an owned binding BEFORE rows exist. Never backfill, upgrade or repair.
 * Historical definitions/counts need not match today's active protocol/count.
 * JSON extension fields remain untouched; an unknown schema/revision is opaque.
 * A resolved binding alone grants no editing permission: callers must separately
 * validate actual rows with getApplicableSetIndexes and enforce workflow guards.
 */
export function resolveCycleMethodBinding({ planId, cycle, dayId, exerciseId }, catalog = staticCatalog) {
  const plan = catalog.getPlanById(planId);
  if (!plan || plan.id !== planId || !isRecord(cycle) || cycle.planId !== planId ||
      !isPositiveInteger(cycle.cycleNumber)) return result("invalid", "cycle-identity-mismatch");
  if (!Object.hasOwn(cycle, "methodBindings")) return result("unbound", "legacy-cycle");
  const container = cycle.methodBindings;
  if (!isRecord(container) || !isPositiveInteger(container.version)) return result("invalid", "invalid-container");
  if (container.version !== 1) return result("unresolved", "unknown-schema-version");
  if (!isRecord(container.exercises)) return result("invalid", "invalid-binding-map");
  if (!isIdentity(exerciseId) || !isIdentity(dayId)) return result("invalid", "invalid-address");
  if (!Object.hasOwn(container.exercises, exerciseId)) return result("unbound", "missing-binding");
  const binding = container.exercises[exerciseId];
  if (!isRecord(binding) || !isIdentity(binding.definitionId) || !isPositiveInteger(binding.revision) ||
      !isIdentity(binding.dayId) || !isPositiveInteger(binding.setCount)) return result("invalid", "invalid-binding");
  if (binding.dayId !== dayId || !getOwnedExercise(catalog, plan, dayId, exerciseId)) {
    return result("invalid", "exercise-ownership-mismatch");
  }
  const definition = catalog.getMethodDefinition({ planId, exerciseId,
    definitionId: binding.definitionId, revision: binding.revision });
  if (!definition) return result("unresolved", "unknown-definition-revision");
  if (definition.planId !== planId || definition.exerciseId !== exerciseId ||
      definition.definitionId !== binding.definitionId || definition.revision !== binding.revision ||
      !isPositiveInteger(definition.prescribedSetCount) || definition.prescribedSetCount !== binding.setCount) {
    return result("invalid", "definition-binding-mismatch");
  }
  return { status: "resolved", binding, definition };
}
