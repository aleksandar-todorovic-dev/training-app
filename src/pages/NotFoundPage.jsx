import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import { UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

/**
 * Fallback page for unmatched routes.
 *
 * UI note:
 * This page is static and does not read or mutate runtime state.
 */

export default function NotFoundPage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <ScreenHeader
          title="404"
          subtitle="The page you are looking for does not exist."
        />

        <SectionCard>
          <p className={UI_TEXT_MUTED}>
            This is the Not Found page placeholder.
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
