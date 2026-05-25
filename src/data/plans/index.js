import { bulkPro } from "./bulkPro";
import { cutPro } from "./cutPro";

/**
 * Plan data registry and lookup helper.
 *
 * Data note:
 * Plans are static product definitions. User progress, selected plan, active
 * cycle, and workout logs live separately in app state.
 */
export const plans = [bulkPro, cutPro];

export function getPlanById(planId) {
  return plans.find((plan) => plan.id === planId);
}
