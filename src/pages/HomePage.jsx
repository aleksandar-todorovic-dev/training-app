import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import PlanCard from "../components/plans/PlanCard";
import { plans } from "../data/plans";
import { UI_STACK_LG } from "../styles/ui";

export default function HomePage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <ScreenHeader
          title="Training App"
          subtitle="Structured training for real life. Choose a plan and start your cycle."
        />

        <div className={UI_STACK_LG}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
