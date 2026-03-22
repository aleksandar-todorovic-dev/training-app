import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import { UI_ACTION_ROW, UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

export default function HomePage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <ScreenHeader
          title="Home"
          subtitle="Choose a placeholder plan to enter the foundation flow."
        />

        <SectionCard>
          <div className={UI_ACTION_ROW}>
            <p className={UI_TEXT_MUTED}>
              Start by opening one of the MVP plan routes.
            </p>

            <PrimaryButton to="/plan/bulk-pro">Open Bulk Pro</PrimaryButton>

            <SecondaryButton to="/plan/full-cut-program">
              Open Full Cut Program
            </SecondaryButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
