import { bulkPro } from "./bulkPro";
import { cutPro } from "./cutPro";

export const plans = [bulkPro, cutPro];

export function getPlanById(planId) {
  return plans.find((plan) => plan.id === planId);
}
