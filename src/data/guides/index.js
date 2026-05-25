import { bulkProGuide } from "./bulkProGuide";
import { cutProGuide } from "./cutProGuide";

/**
 * Guide data access helper.
 *
 * Data note:
 * Guides are static educational content selected by plan. They are separate
 * from runtime workout logs and cycle progress.
 */
const guidesByPlanId = {
  "bulk-pro": bulkProGuide,
  "cut-pro": cutProGuide,
};

export function getGuideByPlanId(planId) {
  return guidesByPlanId[planId] ?? null;
}
