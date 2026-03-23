import { bulkProDays } from "./bulkProDays";
import { cutProDays } from "./cutProDays";

const daysByPlanId = {
  "bulk-pro": bulkProDays,
  "cut-pro": cutProDays,
};

export function getDaysByPlanId(planId) {
  return daysByPlanId[planId] ?? [];
}
