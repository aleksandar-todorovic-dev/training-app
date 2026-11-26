const freeze = (value) => {
  Object.values(value).filter((item) => item && typeof item === "object").forEach(freeze);
  return Object.freeze(value);
};

export const pushUpDefinition = freeze({
  definitionId: "bulk-pro/push-up-mechanical-dropset/mechanical-dropset",
  planId: "bulk-pro", exerciseId: "push-up-mechanical-dropset", type: "mechanical-dropset",
  revision: 1, prescribedSetCount: 1, appliesTo: "last",
  base: { semantics: "pre-extension", variationId: "standard-push-up", loadKind: "bodyweight" },
  phases: [{
    phaseId: "knee-push-up", loadRule: "bodyweight-variation", metrics: ["reps"], requiredMetrics: ["reps"], targets: {},
  }],
});

// Inject only the trusted resolver lookup. Real cycle start still uses the production allowlist.
export function pushUpCatalogAlias() {
  const id = "\0push-up-catalog-test";
  return {
    name: "push-up-catalog-test",
    enforce: "pre",
    resolveId(source, importer) {
      if (source === "../../data/advancedMethods/definitions.js" &&
          importer?.endsWith("/utils/runtime/advancedMethodContextHelpers.js")) return id;
    },
    load(moduleId) {
      if (moduleId !== id) return;
      return `
        import { getMethodDefinition as lookup } from "/src/data/advancedMethods/definitions.js";
        const definition = ${JSON.stringify(pushUpDefinition)};
        export function getMethodDefinition(ref) {
          return ["planId", "exerciseId", "definitionId", "revision"].every(key => ref[key] === definition[key])
            ? definition : lookup(ref);
        }
      `;
    },
  };
}
