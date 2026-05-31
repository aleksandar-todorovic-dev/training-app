import { createElement } from "react";
import {
  CalendarCheck,
  Dumbbell,
  History,
  Repeat2,
  RotateCcw,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import PlanCard from "../components/plans/PlanCard";
import { plans } from "../data/plans";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { clearStoredAppState } from "../storage/appStateStorage";

const HOME_VALUE_CHIPS = [
  {
    label: "Cycle-based",
    icon: Repeat2,
  },
  {
    label: "Guided workouts",
    icon: Dumbbell,
  },
  {
    label: "Previous values",
    icon: History,
  },
  {
    label: "Partial days",
    icon: CalendarCheck,
  },
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
      <div className="flex flex-col gap-7 py-2">
        <header className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800">
              <Repeat2 className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="flex flex-col">
              <p className="text-base font-semibold tracking-tight text-zinc-950">
                Cycle Coach
              </p>
              <p className="text-xs font-medium text-zinc-500">
                Structured training companion
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold leading-[1.03] tracking-tight text-zinc-950">
              Your training cycle, organized
              <span className="text-emerald-600">.</span>
            </h1>

            <p className="max-w-sm text-base leading-7 text-zinc-600">
              Follow Bulk or Cut cycles with guided workouts, previous values,
              and flexible progress when real life changes the schedule.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {HOME_VALUE_CHIPS.map(({ label, icon }) => (
              <span
                key={label}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  {createElement(icon, {
                    className: "h-3.5 w-3.5",
                    "aria-hidden": "true",
                  })}
                </span>
                <span className="leading-tight">{label}</span>
              </span>
            ))}
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
              Choose your plan
            </h2>
            <p className="text-sm leading-6 text-zinc-600">
              Pick the phase that matches your current goal.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        <div className="-mb-4 border-t border-zinc-200 pt-2">
          <button
            type="button"
            className="mx-auto flex min-h-9 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950"
            onClick={handleResetLocalProgress}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset local progress
          </button>
        </div>
      </div>
    </AppShell>
  );
}
