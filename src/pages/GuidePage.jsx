import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import { UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

export default function GuidePage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <ScreenHeader
          title="Guide"
          subtitle="Foundation placeholder for educational guidance content."
        />

        <SectionCard>
          <p className={UI_TEXT_MUTED}>This is the Guide page placeholder.</p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
