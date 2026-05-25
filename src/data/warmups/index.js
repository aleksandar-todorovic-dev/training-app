import { bulkProWarmups } from "./bulkProWarmups";
import { cutProWarmups } from "./cutProWarmups";

/**
 * Warm-up data access helper.
 *
 * Data note:
 * Warm-ups are static day-preparation guidance selected by plan/day. They are
 * separate from runtime day logs and completion state.
 */
const warmupsByPlan = {
  "bulk-pro": bulkProWarmups,
  "cut-pro": cutProWarmups,
};

export function getWarmupById(planId, warmupId) {
  return warmupsByPlan[planId]?.find((warmup) => warmup.id === warmupId);
}
