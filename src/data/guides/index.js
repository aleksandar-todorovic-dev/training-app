import { bulkProGuide } from "./bulkProGuide";
import { cutProGuide } from "./cutProGuide";

const guidesByPlanId = {
  "bulk-pro": bulkProGuide,
  "cut-pro": cutProGuide,
};

export function getGuideByPlanId(planId) {
  return guidesByPlanId[planId] ?? null;
}
