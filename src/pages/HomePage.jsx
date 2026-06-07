import { createElement, useState } from "react";
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
    id: "cycle-based",
    label: "Cycle-based",
    icon: Repeat2,
    title: "A cycle, not a random week",
    description:
      "This is not a rigid weekly split. The app moves you through a stable 6-day training order inside a 9-day rhythm. If life or fatigue moves a workout, you continue from the next planned day instead of restarting the week or choosing randomly.",
  },
  {
    id: "guided-workouts",
    label: "Guided workouts",
    icon: Dumbbell,
    title: "Know what to do next",
    description:
      "Each session gives you the next exercise, targets, cues, warm-up guidance, coach notes, and a clear finish flow so you can focus on execution instead of piecing the workout together.",
  },
  {
    id: "previous-values",
    label: "Previous values",
    icon: History,
    title: "Your last work stays useful",
    description:
      "Completed sets become reference points for the next cycle. You can compare weight, reps, and RIR without relying on memory or old notes.",
  },
  {
    id: "partial-days",
    label: "Partial days",
    icon: CalendarClock,
    title: "Honest logs when life gets messy",
    description:
      "Partial days are for low time, high fatigue, or sessions you cannot finish properly. The app records what actually happened instead of forcing fake completion, while the goal stays to train well when you can.",
  },
];

/**
 * Landing page for explaining the product value and selecting one of the
 * predefined MVP plans.
 *
 * Runtime note:
 * Rendering plan cards or opening value chips does not create user progress.
 * Runtime cycle creation starts from the plan overview flow.
 *
 * Persistence note:
 * The reset action clears local runtime progress for this device only. Static
 * source data remains unchanged because it ships with the app.
 */
export default function HomePage() {
  const { dispatch } = useAppState();
  // Local product-education state only; it does not affect runtime progress.
  const [activeValueChipId, setActiveValueChipId] = useState(null);

  const activeValueChip = HOME_VALUE_CHIPS.find(
    (chip) => chip.id === activeValueChipId,
  );

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

  function handleValueChipClick(chipId) {
    setActiveValueChipId((currentChipId) =>
      currentChipId === chipId ? null : chipId,
    );
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
            {HOME_VALUE_CHIPS.map(({ id, label, icon }) => {
              const isActive = activeValueChipId === id;

              return (
                <button
                  key={id}
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={isActive ? "home-value-chip-panel" : undefined}
                  onClick={() => handleValueChipClick(id)}
                  className={[
                    "inline-flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm font-medium transition-colors",
                    isActive
                      ? "border-[#3FA8B6]/38 bg-[#10292E]/78 text-[#F4F7F8]"
                      : "border-white/8 bg-white/[0.032] text-[#D3D8DB] hover:border-[#3FA8B6]/24 hover:bg-white/5",
                  ].join(" ")}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#3FA8B6]/14 bg-[#10292E]/60 text-[#8FDCE5]/82">
                    {createElement(icon, {
                      className: "h-3.5 w-3.5",
                      "aria-hidden": "true",
                    })}
                  </span>
                  <span className="leading-tight">{label}</span>
                </button>
              );
            })}
          </div>

          {activeValueChip ? (
            <div
              id="home-value-chip-panel"
              className="rounded-3xl border border-[#3FA8B6]/18 bg-[linear-gradient(180deg,rgba(16,41,46,0.72),rgba(255,255,255,0.028))] px-4 py-4 shadow-[0_16px_42px_rgba(0,0,0,0.22)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8FDCE5]/82">
                    Why it matters
                  </p>

                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#F4F7F8]">
                    {activeValueChip.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveValueChipId(null)}
                  className="shrink-0 rounded-full border border-white/8 px-2.5 py-1 text-xs font-semibold text-[#A9B0B5] transition hover:text-[#F4F7F8]"
                >
                  Close
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#A9B0B5]">
                {activeValueChip.description}
              </p>
            </div>
          ) : null}
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
