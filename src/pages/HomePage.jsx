import { createElement } from "react";
import {
  CalendarClock,
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
    icon: CalendarClock,
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
    <AppShell mode="training">
      <div className="relative isolate flex flex-col gap-8 py-2">
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#3FA8B6]/10 blur-3xl"
          aria-hidden="true"
        />

        <header className="flex flex-col gap-7">
          <div className="inline-flex w-fit items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3FA8B6]/22 bg-[#10292E]/70 text-[#8FDCE5]">
              <Repeat2 className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="flex flex-col">
              <p className="text-lg font-semibold tracking-tight text-[#F4F7F8]">
                Cycle Coach
              </p>
              <p className="text-sm font-medium text-[#A9B0B5]">
                Structured training companion
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="max-w-sm text-[2.85rem] font-semibold leading-[0.98] tracking-tight text-[#F4F7F8]">
              Your training cycle, organized
              <span className="text-[#5EC7D5]">.</span>
            </h1>

            <p className="max-w-sm text-base leading-7 text-[#A9B0B5]">
              Follow Bulk or Cut cycles with guided workouts, previous values,
              and flexible progress when real life changes the schedule.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {HOME_VALUE_CHIPS.map(({ label, icon }) => (
              <span
                key={label}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.032] px-3 py-2 text-sm font-medium text-[#D3D8DB]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#3FA8B6]/14 bg-[#10292E]/60 text-[#8FDCE5]/82">
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

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-semibold tracking-tight text-[#F4F7F8]">
              Choose your plan
            </h2>
            <p className="text-sm leading-6 text-[#A9B0B5]">
              Pick the phase that matches your current goal.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        <div className="-mt-4 -mb-6 border-t border-white/8 pt-2">
          <button
            type="button"
            className="mx-auto flex min-h-8 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium text-zinc-700 transition-colors hover:text-zinc-400"
            onClick={handleResetLocalProgress}
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset local progress
          </button>
        </div>
      </div>
    </AppShell>
  );
}
