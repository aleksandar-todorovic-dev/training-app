import { bulkProDayDetails } from "./bulkProDayDetails";
import { cutProDayDetails } from "./cutProDayDetails";

const dayDetailsByPlan = {
  "bulk-pro": bulkProDayDetails,
  "full-cut-program": cutProDayDetails,
};

export function getDayDetailsByPlanId(planId) {
  return dayDetailsByPlan[planId] ?? [];
}

export function getDayDetails(planId, dayId) {
  const dayDetails = getDayDetailsByPlanId(planId);
  return dayDetails.find((day) => day.id === dayId) ?? null;
}
