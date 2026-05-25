import { bulkProDays } from "./bulkProDays";
import { cutProDays } from "./cutProDays";

/**
 * Overview day data access helpers.
 *
 * Data note:
 * These helpers resolve plan-level day summaries only. Detailed day structure,
 * required exercise IDs, warm-up links, and core block links live in
 * `data/dayDetails`.
 */
const daysByPlanId = {
  "bulk-pro": bulkProDays,
  "cut-pro": cutProDays,
};

export function getDaysByPlanId(planId) {
  return daysByPlanId[planId] ?? [];
}
