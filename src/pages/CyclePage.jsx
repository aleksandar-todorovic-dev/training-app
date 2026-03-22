import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import { UI_ACTION_ROW, UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

export default function CyclePage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <BackButton to="/plan/bulk-pro">Back to Plan Overview</BackButton>

        <ScreenHeader
          title="Cycle"
          subtitle="Placeholder cycle screen for the selected plan."
        />

        <SectionCard>
          <div className={UI_ACTION_ROW}>
            <p className={UI_TEXT_MUTED}>
              This screen will later represent cycle progression and day entry.
            </p>

            <PrimaryButton to="/plan/bulk-pro/day/d1">
              Open Day D1
            </PrimaryButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
