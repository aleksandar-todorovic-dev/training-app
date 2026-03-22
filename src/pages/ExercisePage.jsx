import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import { UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

export default function ExercisePage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <ScreenHeader
          title="Exercise"
          subtitle="Foundation placeholder for exercise detail flow."
        />

        <SectionCard>
          <p className={UI_TEXT_MUTED}>
            This is the Exercise page placeholder.
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
