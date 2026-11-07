import { useTranslation } from "../i18n/useTranslation";
import { MapPinned } from "lucide-react";

import GuardState from "../components/common/GuardState";

/**
 * Fallback page for unmatched routes.
 *
 * Runtime boundary:
 * This page is static and never reads, creates, or mutates training progress.
 */
export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <GuardState
      eyebrow={t("Route unavailable")}
      title={t("This training screen does not exist.")}
      description={t("The address does not match a current plan, workout, or guide route. Return home and continue from a valid training entry point.")}
      icon={MapPinned}
      primaryTo="/"
      primaryLabel={t("Back to home")}
    />
  );
}
