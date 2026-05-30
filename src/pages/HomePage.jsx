import AppShell from "../components/layout/AppShell";
import SecondaryButton from "../components/common/SecondaryButton";
import PlanCard from "../components/plans/PlanCard";
import { plans } from "../data/plans";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { clearStoredAppState } from "../storage/appStateStorage";
import {
  UI_PILL_PRODUCT,
  UI_PILL_PRODUCT_ACCENT,
  UI_STACK_LG,
} from "../styles/ui";

const HOME_VALUE_CHIPS = [
  "Cycle-based",
  "Fast logging",
  "Previous values",
  "Partial days allowed",
];

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
    <AppShell mode="product">
      <div className="flex flex-col gap-8 py-2">
        <header className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <span className={UI_PILL_PRODUCT_ACCENT}>
              Structured training system
            </span>
            <span className={UI_PILL_PRODUCT}>Local-first MVP</span>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950">
              Your training cycle, organized.
            </h1>

            <p className="text-base leading-7 text-zinc-600">
              Follow a structured Bulk or Cut plan, log working sets fast, and
              keep the cycle moving even when real life changes the schedule.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {HOME_VALUE_CHIPS.map((chip) => (
              <span key={chip} className={UI_PILL_PRODUCT}>
                {chip}
              </span>
            ))}
          </div>
        </header>

        <section className={UI_STACK_LG}>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
              Choose your plan
            </h2>
            <p className="text-sm leading-6 text-zinc-600">
              Start with the goal that matches your current phase. You can keep
              Bulk and Cut progress separate.
            </p>
          </div>

          <div className={UI_STACK_LG}>
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        <div className="border-t border-zinc-200 pt-4">
          <SecondaryButton
            type="button"
            variant="product"
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
