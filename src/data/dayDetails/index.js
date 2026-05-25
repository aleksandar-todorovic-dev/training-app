import { bulkProDayDetails } from "./bulkProDayDetails";
import { cutProDayDetails } from "./cutProDayDetails";

/**
 * Day-detail data access helpers.
 *
 * Data note:
 * These helpers resolve static day structure for a selected plan/day. Runtime
 * day logs live separately in app state and are created lazily by the reducer.
 */
const dayDetailsByPlan = {
  "bulk-pro": bulkProDayDetails,
  "cut-pro": cutProDayDetails,
};

export function getDayDetailsByPlanId(planId) {
  return dayDetailsByPlan[planId] ?? [];
}

export function getDayDetails(planId, dayId) {
  const dayDetails = getDayDetailsByPlanId(planId);
  return dayDetails.find((day) => day.id === dayId) ?? null;
}
