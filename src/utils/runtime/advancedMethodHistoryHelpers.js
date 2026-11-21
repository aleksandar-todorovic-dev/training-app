import { resolveCycleMethodBinding } from "./advancedMethodContextHelpers.js";
import { deriveMethodState, getApplicableSetIndexes } from "./advancedMethodHelpers.js";

// Exact revisions supply phase semantics. Only the currently understood base and
// phase load conventions may participate in comparisons; unknown ones stay opaque.
function hasKnownSemantics(definition, dayId) {
  if (definition.base?.semantics !== "pre-extension" || definition.base.loadUnit !== "kg") return false;
  if (definition.type === "cluster") {
    const [burst] = definition.phases;
    return definition.planId === "bulk-pro" && dayId === "d5" &&
      definition.exerciseId === "assisted-pull-up-cluster" &&
      definition.definitionId === "bulk-pro/assisted-pull-up-cluster/cluster" && definition.revision === 1 &&
      definition.prescribedSetCount === 2 && definition.appliesTo === "all" &&
      definition.base.loadKind === "machine-assistance" && definition.phases.length === 1 &&
      burst.phaseId === "additional-burst" && burst.loadRule === "adjustable-machine-assistance";
  }
  return definition.base.loadKind === "external" &&
    definition.phases.length > 0 && definition.phases.every((phase) => phase.loadRule === "same-as-base");
}

/**
 * Find one earlier confirmed attempt, or null. Current rows need not exist yet.
 * Exact bindings/revisions imply the same phase, target and load semantics.
 * Search actual cycle keys, never the numeric gaps. Closure and base Done do not
 * confirm a method and do not gate its historical evidence.
 * The selected result is detached so later consumers cannot edit stored history.
 * An optional trusted catalog supports synthetic revision/semantic fixtures, as
 * in the accepted binding resolver; application calls use its static default.
 * @param {{cycles: object, currentCycleNumber: number, planId: string,
 *   dayId: string, exerciseId: string, setIndex: number}} context
 * @returns {null|{planId: string, cycleNumber: number, cycleStartedAt: string|null,
 *   dayId: string, exerciseId: string, setIndex: number, binding: object,
 *   baseSet: object, methodLog: object, derived: object}}
 */
export function findPreviousCompatibleMethodAttempt({ cycles, currentCycleNumber, planId, dayId, exerciseId, setIndex }, catalog) {
  if (!cycles || typeof cycles !== "object" || Array.isArray(cycles) ||
      !Number.isSafeInteger(currentCycleNumber) || currentCycleNumber < 1 ||
      !Number.isSafeInteger(setIndex) || setIndex < 1) return null;
  const current = cycles[currentCycleNumber];
  if (current?.cycleNumber !== currentCycleNumber) return null;
  const context = resolveCycleMethodBinding({ planId, cycle: current, dayId, exerciseId }, catalog);
  if (context.status !== "resolved" || !hasKnownSemantics(context.definition, dayId)) return null;
  const numbers = Object.keys(cycles).filter((key) => {
    const number = Number(key);
    return String(number) === key && Number.isSafeInteger(number) && number > 0 && number < currentCycleNumber;
  }).map(Number).sort((a, b) => b - a);
  for (const number of numbers) {
    const previous = cycles[number];
    if (previous?.cycleNumber !== number) continue;
    const resolved = resolveCycleMethodBinding({ planId, cycle: previous, dayId, exerciseId }, catalog);
    if (resolved.status !== "resolved" || resolved.binding.definitionId !== context.binding.definitionId ||
        resolved.binding.revision !== context.binding.revision || resolved.binding.setCount !== context.binding.setCount) continue;
    const dayLog = previous.dayLogs?.[dayId];
    const exerciseLog = dayLog?.mainExerciseLogs?.[exerciseId];
    if (dayLog?.dayId !== dayId || exerciseLog?.exerciseId !== exerciseId ||
        !getApplicableSetIndexes(resolved.definition, exerciseLog.sets).includes(setIndex)) continue;
    const row = exerciseLog.sets.find((set) => set.setIndex === setIndex);
    if (typeof row.isDone !== "boolean" || !["weight", "reps", "rir"].every((field) => typeof row[field] === "string")) continue;
    const { methodLog, ...baseSet } = row;
    const derived = deriveMethodState(resolved.definition, methodLog);
    if (!derived.valid || !["partial", "performed"].includes(derived.status)) continue;
    return structuredClone({ planId, cycleNumber: number, cycleStartedAt: previous.startedAt,
      dayId, exerciseId, setIndex, binding: resolved.binding, baseSet, methodLog, derived });
  }
  return null;
}
