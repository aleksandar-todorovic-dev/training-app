import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SecondaryButton from "../components/common/SecondaryButton";
import PlanCard from "../components/plans/PlanCard";
import { plans } from "../data/plans";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { clearStoredAppState } from "../storage/appStateStorage";
import { UI_STACK_LG } from "../styles/ui";

/**
 * Landing page for selecting one of the predefined MVP plans.
 *
 * Runtime note:
 * Rendering plan cards does not create user progress. Runtime cycle creation
 * starts from the plan overview flow.
 *
 * Persistence note:
 * The reset action clears local runtime progress for this device only. Static
 * source data remains unchanged because it ships with the app.
 */
export default function HomePage() {
  const { dispatch } = useAppState();

  function handleResetLocalProgress() {
    const shouldReset = window.confirm(
      "This will clear all local training progress on this device. Continue?",
    );

    if (!shouldReset) {
      return;
    }

    clearStoredAppState();

    dispatch({
      type: APP_ACTIONS.RESET_APP_STATE,
    });
  }

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

        <div className="pt-2">
          <SecondaryButton
            type="button"
            className="w-full"
            onClick={handleResetLocalProgress}
          >
            Reset local progress
          </SecondaryButton>
        </div>
      </div>
    </AppShell>
  );
}
