import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import { UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

export default function EndCyclePage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <ScreenHeader
          title="End Cycle"
          subtitle="Foundation placeholder for cycle completion flow."
        />

        <SectionCard>
          <p className={UI_TEXT_MUTED}>
            This is the End Cycle page placeholder.
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
