import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import { UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

export default function WarmupPage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <ScreenHeader
          title="Warm-up"
          subtitle="Foundation placeholder for warm-up instructions."
        />

        <SectionCard>
          <p className={UI_TEXT_MUTED}>This is the Warm-up page placeholder.</p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
