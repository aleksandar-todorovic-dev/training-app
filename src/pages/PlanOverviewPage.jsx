import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import { UI_ACTION_ROW, UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

export default function PlanOverviewPage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <BackButton to="/">Back to Home</BackButton>

        <ScreenHeader
          title="Plan Overview"
          subtitle="Placeholder plan entry point for cycle and guide navigation."
        />

        <SectionCard>
          <div className={UI_ACTION_ROW}>
            <p className={UI_TEXT_MUTED}>
              This screen will later summarize the selected plan.
            </p>

            <PrimaryButton to="/plan/bulk-pro/cycle">Open Cycle</PrimaryButton>

            <SecondaryButton to="/plan/bulk-pro/guide">
              Open Guide
            </SecondaryButton>

            <SecondaryButton to="/plan/bulk-pro/end-cycle">
              Open End Cycle
            </SecondaryButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
