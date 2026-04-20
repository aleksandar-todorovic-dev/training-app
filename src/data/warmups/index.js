import { bulkProWarmups } from "./bulkProWarmups";
import { cutProWarmups } from "./cutProWarmups";

const warmupsByPlan = {
  "bulk-pro": bulkProWarmups,
  "cut-pro": cutProWarmups,
};

export function getWarmupById(planId, warmupId) {
  return warmupsByPlan[planId]?.find((warmup) => warmup.id === warmupId);
}
