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
          subtitle="Choose a structured plan to enter the MVP flow."
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
