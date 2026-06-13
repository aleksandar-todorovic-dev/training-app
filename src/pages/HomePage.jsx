import { createElement, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarClock,
  Dumbbell,
  History,
  Repeat2,
  RotateCcw,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import AppMark from "../components/brand/AppMark";
import PlanCard from "../components/plans/PlanCard";
import { plans } from "../data/plans";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { clearStoredAppState } from "../storage/appStateStorage";
import { pressableTap, revealPanelVariants } from "../styles/motion";
import {
  UI_TEXT_BODY,
  UI_TEXT_BODY_RELAXED,
  UI_TEXT_CARD_TITLE,
  UI_TEXT_EYEBROW_ACCENT,
  UI_TEXT_META,
} from "../styles/ui";

const MotionButton = motion.button;
const MotionDiv = motion.div;

const HOME_VALUE_CHIPS = [
  {
    id: "cycle-based",
    label: "Cycle-based",
    icon: Repeat2,
    title: "A cycle that stays connected",
    description:
      "The plan is built around repeated training signals, not a perfect calendar week. Main work, support work, and smaller top-ups keep the cycle connected, so moving a rest day does not turn the plan random. Rest when needed, then continue with the next planned workout.",
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
      "Logged sets become reference points for the next cycle. You can compare weight, reps, and RIR without relying on memory or old notes.",
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
      <div className="relative isolate flex flex-col gap-5 py-1">
        <div
          className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-56 w-56 -translate-x-1/2 rounded-full bg-[#3FA8B6]/5 blur-3xl"
          aria-hidden="true"
        />

        <header className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3FA8B6]/14 bg-[#10292E]/46 text-[#8FDCE5]/90">
              <AppMark className="h-10 w-10 shrink-0" />
            </div>

            <div className="flex flex-col">
              <p className="text-base font-semibold tracking-tight text-[#F4F7F8]">
                Cycle Coach
              </p>
              <p className={UI_TEXT_META}>Structured training companion</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="max-w-sm text-[2.32rem] font-semibold leading-[1.03] tracking-tight text-[#F4F7F8]">
              Your training cycle, organized
              <span className="text-[#5EC7D5]">.</span>
            </h1>

            <p className={`max-w-sm ${UI_TEXT_BODY_RELAXED}`}>
              Follow Bulk or Cut cycles with guided workouts, previous values,
              and flexible progress when real life changes the schedule.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {HOME_VALUE_CHIPS.map(({ id, label, icon }) => {
              const isActive = activeValueChipId === id;

              return (
                <MotionButton
                  key={id}
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={isActive ? "home-value-chip-panel" : undefined}
                  onClick={() => handleValueChipClick(id)}
                  whileTap={pressableTap}
                  className={[
                    "inline-flex min-h-9 items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left text-xs font-medium transition duration-150 ease-out motion-reduce:transition-none",
                    isActive
                      ? "border-[#3FA8B6]/26 bg-[#10292E]/48 text-[#F4F7F8]"
                      : "border-white/8 bg-white/[0.018] text-[#D3D8DB] hover:border-[#3FA8B6]/18 hover:bg-white/[0.035]",
                  ].join(" ")}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[#8FDCE5]/78">
                    {createElement(icon, {
                      className: "h-3 w-3",
                      "aria-hidden": "true",
                    })}
                  </span>
                  <span className="leading-tight">{label}</span>
                </MotionButton>
              );
            })}
          </div>

          <AnimatePresence initial={false} mode="wait">
            {activeValueChip ? (
              <MotionDiv
                key={activeValueChip.id}
                id="home-value-chip-panel"
                className="rounded-2xl border border-[#3FA8B6]/12 bg-[#10292E]/32 px-3.5 py-3"
                variants={revealPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className={UI_TEXT_EYEBROW_ACCENT}>Why it matters</p>

                    <h2 className={`mt-1.5 ${UI_TEXT_CARD_TITLE}`}>
                      {activeValueChip.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveValueChipId(null)}
                    className="shrink-0 rounded-full border border-white/8 px-2.5 py-1 text-xs font-medium text-[#A9B0B5] transition duration-150 ease-out hover:text-[#F4F7F8] active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100"
                  >
                    Close
                  </button>
                </div>

                <p className={`mt-2 ${UI_TEXT_BODY}`}>
                  {activeValueChip.description}
                </p>
              </MotionDiv>
            ) : null}
          </AnimatePresence>
        </header>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className={UI_TEXT_CARD_TITLE}>Choose your plan</h2>
            <p className={UI_TEXT_BODY_RELAXED}>
              Pick the phase that matches your current goal.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        <div className="-mt-2 -mb-5 border-t border-white/8 pt-2">
          <button
            type="button"
            className="mx-auto flex min-h-8 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-400"
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
