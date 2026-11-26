function freeze(value) {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

export const preacherDefinition = freeze({
  planId: "bulk-pro", exerciseId: "preacher-curl-mechanical",
  definitionId: "bulk-pro/preacher-curl-mechanical/mechanical-set",
  revision: 1, type: "mechanical-set", prescribedSetCount: 1, appliesTo: "last",
  base: { semantics: "pre-extension", variationId: "wide-grip", loadKind: "external", loadUnit: "kg" },
  phases: [{
    phaseId: "narrow-grip", loadRule: "same-as-base", metrics: ["reps"], requiredMetrics: ["reps"], targets: {},
  }],
});

// Only the resolver's registry import sees the synthetic definition. Cycle
// creation still uses the application's real allowlist and all normal guards.
export function preacherCatalogAlias() {
  const id = "\0preacher-catalog-test";
  return {
    name: "preacher-catalog-test",
    enforce: "pre",
    resolveId(source, importer) {
      if (source === "../../data/advancedMethods/definitions.js" &&
          importer?.endsWith("/utils/runtime/advancedMethodContextHelpers.js")) return id;
    },
    load(moduleId) {
      if (moduleId !== id) return;
      return `
        import { getMethodDefinition as lookup } from "/src/data/advancedMethods/definitions.js";
        const preacher = ${JSON.stringify(preacherDefinition)};
        export function getMethodDefinition(ref) {
          return ["planId", "exerciseId", "definitionId", "revision"].every(key => ref[key] === preacher[key])
            ? preacher : lookup(ref);
        }
      `;
    },
  };
}
