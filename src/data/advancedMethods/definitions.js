/**
 * @typedef {{min: number, max: number}} MethodTarget
 * @typedef {{phaseId: string, metrics: string[], requiredMetrics: string[],
 *   targets: Object<string, MethodTarget>,
 *   loadRule: 'same-as-base'|'adjustable-machine-assistance'|'reduced-from-previous'}} MethodPhase
 * @typedef {{definitionId: string, revision: number, planId: string,
 *   exerciseId: string, type: 'rest-pause'|'iso-stretch'|'cluster'|'dropset'|'mechanical-set',
 *   prescribedSetCount: number, appliesTo: 'last'|'all',
 *   base: {semantics: 'pre-extension', loadKind: 'external'|'machine-assistance', loadUnit: 'kg',
 *     variationId?: 'wide-grip', loadConvention?: 'total-added-plates-or-marked-kg'},
 *   phases: MethodPhase[], reductionPercent?: number}} MethodDefinition
 */

function freezeDefinition(value) {
  if (value !== null && typeof value === "object") {
    Object.values(value).forEach(freezeDefinition);
    Object.freeze(value);
  }
  return value;
}

export const LEG_PRESS_LOAD_CONVENTION = "total-added-plates-or-marked-kg";

// Exact historical protocols, independent of the list activated for new cycles.
export const knownDropsetProtocols = freezeDefinition([
  { dayId: "d3", exerciseId: "leg-extension", definitionId: "bulk-pro/leg-extension/dropset",
    revision: 1, prescribedSetCount: 3, reductionPercent: 25 },
  { dayId: "d1", exerciseId: "overhead-rope-extension", definitionId: "bulk-pro/overhead-rope-extension/dropset",
    revision: 1, prescribedSetCount: 4, reductionPercent: 20 },
  { dayId: "d4", exerciseId: "machine-lateral-raise", definitionId: "bulk-pro/machine-lateral-raise/dropset",
    revision: 1, prescribedSetCount: 3, reductionPercent: 20 },
  { dayId: "d6", exerciseId: "leg-press-calf-raise", definitionId: "bulk-pro/leg-press-calf-raise/dropset",
    revision: 1, prescribedSetCount: 3, reductionPercent: 25, loadConvention: LEG_PRESS_LOAD_CONVENTION },
]);

function createDropsetDefinition({ exerciseId, definitionId, revision, prescribedSetCount, reductionPercent, loadConvention }) {
  return {
    definitionId,
    revision,
    planId: "bulk-pro",
    exerciseId,
    type: "dropset",
    prescribedSetCount,
    appliesTo: "last",
    base: { semantics: "pre-extension", loadKind: "external", loadUnit: "kg",
      ...(loadConvention ? { loadConvention } : {}) },
    reductionPercent,
    phases: ["drop-1", "drop-2", "drop-3"].map((phaseId) => ({
      phaseId,
      metrics: ["loadKg", "reps"],
      requiredMetrics: ["loadKg", "reps"],
      targets: {},
      loadRule: "reduced-from-previous",
    })),
  };
}

/**
 * Immutable protocols. Registration does not activate a method for new cycles.
 * Targets describe prescriptions, never measurements.
 * Retain old revisions when protocols change. No UI text is parsed at runtime.
 * @type {ReadonlyArray<MethodDefinition>}
 */
export const advancedMethodDefinitions = freezeDefinition([
  {
    definitionId: "bulk-pro/incline-db-press/rest-pause",
    revision: 1,
    planId: "bulk-pro",
    exerciseId: "incline-db-press",
    type: "rest-pause",
    prescribedSetCount: 3,
    appliesTo: "last",
    base: { semantics: "pre-extension", loadKind: "external", loadUnit: "kg" },
    phases: [{
      phaseId: "extra-reps",
      metrics: ["reps", "restSeconds"],
      requiredMetrics: ["reps"],
      targets: { reps: { min: 2, max: 3 }, restSeconds: { min: 15, max: 15 } },
      loadRule: "same-as-base",
    }],
  },
  {
    definitionId: "bulk-pro/face-away-cable-curl/rest-pause",
    revision: 1,
    planId: "bulk-pro",
    exerciseId: "face-away-cable-curl",
    type: "rest-pause",
    prescribedSetCount: 1,
    appliesTo: "last",
    base: { semantics: "pre-extension", loadKind: "external", loadUnit: "kg" },
    phases: [{
      phaseId: "extra-reps",
      metrics: ["reps", "restSeconds"],
      requiredMetrics: ["reps"],
      targets: { reps: { min: 5, max: 6 }, restSeconds: { min: 15, max: 15 } },
      loadRule: "same-as-base",
    }],
  },
  {
    definitionId: "bulk-pro/cable-stretch-fly/iso-stretch",
    revision: 1,
    planId: "bulk-pro",
    exerciseId: "cable-stretch-fly",
    type: "iso-stretch",
    prescribedSetCount: 1,
    appliesTo: "last",
    base: { semantics: "pre-extension", loadKind: "external", loadUnit: "kg" },
    phases: [{
      phaseId: "loaded-stretch",
      metrics: ["durationSeconds"],
      requiredMetrics: ["durationSeconds"],
      targets: { durationSeconds: { min: 15, max: 15 } },
      loadRule: "same-as-base",
    }],
  },
  {
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
  },
  ...knownDropsetProtocols.map(createDropsetDefinition),
  {
    definitionId: "bulk-pro/preacher-curl-mechanical/mechanical-set",
    planId: "bulk-pro",
    exerciseId: "preacher-curl-mechanical",
    type: "mechanical-set",
    revision: 1,
    prescribedSetCount: 1,
    appliesTo: "last",
    base: { semantics: "pre-extension", variationId: "wide-grip", loadKind: "external", loadUnit: "kg" },
    phases: [{
      phaseId: "narrow-grip",
      loadRule: "same-as-base",
      metrics: ["reps"],
      requiredMetrics: ["reps"],
      targets: {},
    }],
  },
]);

/**
 * Exact, plan-scoped lookup. Missing identity/revision never selects a default.
 * @param {{planId: string, exerciseId: string, definitionId: string, revision: number}} ref
 * @returns {MethodDefinition|null}
 */
export function getMethodDefinition(ref) {
  return advancedMethodDefinitions.find((definition) =>
    definition.planId === ref?.planId &&
    definition.exerciseId === ref?.exerciseId &&
    definition.definitionId === ref?.definitionId &&
    definition.revision === ref?.revision,
  ) ?? null;
}
