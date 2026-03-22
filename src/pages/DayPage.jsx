import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import { UI_ACTION_ROW, UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

export default function DayPage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <BackButton to="/plan/bulk-pro/cycle">Back to Cycle</BackButton>

        <ScreenHeader
          title="Day"
          subtitle="Placeholder day screen with entry points into workout flow."
        />

        <SectionCard>
          <div className={UI_ACTION_ROW}>
            <p className={UI_TEXT_MUTED}>
              This screen will later contain the guided workout structure for a
              selected day.
            </p>

            <PrimaryButton to="/plan/bulk-pro/day/d1/exercise/bench-press">
              Open Exercise
            </PrimaryButton>

            <SecondaryButton to="/plan/bulk-pro/day/d1/core/core-a">
              Open Core
            </SecondaryButton>

            <SecondaryButton to="/plan/bulk-pro/day/d1/warmup">
              Open Warm-up
            </SecondaryButton>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
