import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  History,
  Repeat2,
  RotateCcw,
  X,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import AppMark from "../components/brand/AppMark";
import PlanCard from "../components/plans/PlanCard";
import { plans } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { clearStoredAppState } from "../storage/appStateStorage";
import { pressableTap, revealPanelVariants } from "../styles/motion";

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

const PLAN_ACCENTS = {
  "bulk-pro": {
    dot: "bg-[#B8F36B]",
    text: "text-[#C8F78F]",
    border: "border-[#B8F36B]/24",
  },
  "cut-pro": {
    dot: "bg-[#F1B864]",
    text: "text-[#F4C87F]",
    border: "border-[#F1B864]/24",
  },
};

function getActiveCycleEntries(state) {
  return plans.flatMap((plan) => {
    const planProgress = state.progressByPlan?.[plan.id];
    const currentCycleNumber = planProgress?.currentCycleNumber;

    if (!Number.isInteger(currentCycleNumber) || currentCycleNumber < 1) {
      return [];
    }

    const currentCycle = planProgress?.cycles?.[currentCycleNumber];

    if (
      !currentCycle ||
      currentCycle.planId !== plan.id ||
      currentCycle.completedAt !== null
    ) {
      return [];
    }

    const currentDay = getDaysByPlanId(plan.id).find(
      (day) => day.id === currentCycle.currentDayId,
    );

    if (!currentDay) {
      return [];
    }

    return [
      {
        plan,
        currentCycleNumber,
        currentDay,
        currentDayRoute: `/plan/${plan.id}/day/${currentDay.id}`,
        cycleRoute: `/plan/${plan.id}/cycle`,
      },
    ];
  });
}

function ActiveCycleEntry({ entry }) {
  const { plan, currentCycleNumber, currentDay, currentDayRoute, cycleRoute } =
    entry;
  const accent = PLAN_ACCENTS[plan.id] ?? PLAN_ACCENTS["bulk-pro"];

  return (
    <article className="bg-[#101419] px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${accent.dot}`}
            aria-hidden="true"
          />
          <p className={`text-[0.68rem] font-bold uppercase tracking-[0.16em] ${accent.text}`}>
            Active cycle
          </p>
        </div>

        <p className="text-xs font-semibold text-[#7E8994]">
          Cycle {currentCycleNumber}
        </p>
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold tracking-[-0.025em] text-[#F3F5F1]">
            {plan.name}
          </h3>
          <p className="mt-1 truncate text-sm leading-5 text-[#AAB2BA]">
            {currentDay.label} · {currentDay.name}
          </p>
        </div>

        <span className="shrink-0 text-3xl font-semibold tracking-[-0.07em] text-[#4A545E]">
          {currentDay.label}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2 min-[380px]:flex-row">
        <Link
          to={currentDayRoute}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F1F4ED] px-4 text-sm font-bold text-[#0A0D10] transition duration-150 ease-out hover:bg-white active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1F4ED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101419] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          Continue training
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>

        <Link
          to={cycleRoute}
          className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border bg-transparent px-4 text-sm font-semibold text-[#C7CDD2] transition-colors hover:bg-white/[0.035] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E99A4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101419] ${accent.border}`}
        >
          View cycle
        </Link>
      </div>
    </article>
  );
}

/**
 * Landing page for explaining the product value and selecting one of the
 * predefined MVP plans.
 *
 * Runtime note:
 * Rendering plan cards or opening value items does not create user progress.
 * Runtime cycle creation starts from the plan overview flow.
 *
 * Persistence note:
 * The reset action clears local runtime progress for this device only. Static
 * source data remains unchanged because it ships with the app.
 */
export default function HomePage() {
  const { state, dispatch } = useAppState();
  const [activeValueChipId, setActiveValueChipId] = useState(null);

  const activeValueChip = HOME_VALUE_CHIPS.find(
    (chip) => chip.id === activeValueChipId,
  );
  const activeCycleEntries = getActiveCycleEntries(state);
  const hasActiveCycles = activeCycleEntries.length > 0;

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
    <AppShell mode="performance">
      <div className="flex flex-col gap-7 pb-1">
        <header className="flex items-center justify-between gap-4">
          <div className="inline-flex min-w-0 items-center gap-3">
            <AppMark
              className="h-11 w-11 shrink-0"
              title="Cycle Coach"
            />

            <div className="min-w-0">
              <p className="text-base font-semibold tracking-[-0.025em] text-[#F3F5F1]">
                Cycle Coach
              </p>
              <p className="mt-0.5 text-xs font-medium text-[#7E8994]">
                Structured training companion
              </p>
            </div>
          </div>

        </header>

        {hasActiveCycles ? (
          <section
            className="flex flex-col gap-3"
            aria-label="Active training cycles"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-[#7E8994]">
                  Continue
                </p>
                <h2 className="mt-1 text-[1.7rem] font-semibold leading-none tracking-[-0.045em] text-[#F3F5F1]">
                  Pick up where you stopped.
                </h2>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.35rem] border border-[#2A3138]">
              {activeCycleEntries.map((entry, index) => (
                <div
                  key={entry.plan.id}
                  className={index > 0 ? "border-t border-[#2A3138]" : ""}
                >
                  <ActiveCycleEntry entry={entry} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-4">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-[#8C97A2]">
              Training that keeps its order
            </p>

            <h1 className="mt-2 max-w-sm text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.065em] text-[#F3F5F1]">
              Your training cycle, organized
              <span className="text-[#B8F36B]">.</span>
            </h1>

            <p className="mt-4 max-w-sm text-[0.96rem] leading-6 text-[#AAB2BA]">
              Follow Bulk or Cut cycles with guided workouts, previous values,
              and flexible progress when real life changes the schedule.
            </p>
          </div>

          <div className="border-y border-[#2A3138]">
            {HOME_VALUE_CHIPS.map(({ id, label, icon }, index) => {
              const isActive = activeValueChipId === id;
              const Icon = icon;

              return (
                <MotionButton
                  key={id}
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={
                    isActive ? `home-value-panel-${id}` : undefined
                  }
                  onClick={() => handleValueChipClick(id)}
                  whileTap={pressableTap}
                  className={[
                    "flex min-h-14 w-full items-center gap-3 border-b border-[#232A31] px-1 py-3 text-left transition-colors last:border-b-0 motion-reduce:transition-none",
                    isActive ? "bg-white/[0.025]" : "hover:bg-white/[0.018]",
                  ].join(" ")}
                >
                  <span className="w-6 shrink-0 text-[0.68rem] font-bold tabular-nums tracking-[0.12em] text-[#59646E]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2A3138] bg-[#11161A] text-[#AAB2BA]">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1 text-sm font-semibold text-[#DDE1DD]">
                    {label}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#66717C] transition-transform duration-150 motion-reduce:transition-none ${
                      isActive ? "rotate-180 text-[#B8F36B]" : ""
                    }`}
                    aria-hidden="true"
                  />
                </MotionButton>
              );
            })}
          </div>

          <AnimatePresence initial={false} mode="wait">
            {activeValueChip ? (
              <MotionDiv
                key={activeValueChip.id}
                id={`home-value-panel-${activeValueChip.id}`}
                className="relative overflow-hidden rounded-[1.25rem] border border-[#303841] bg-[#14191E] px-4 py-4"
                variants={revealPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div
                  className="absolute bottom-0 left-0 top-0 w-0.5 bg-[#B8F36B]"
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[#9BA5AF]">
                      Why it matters
                    </p>
                    <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.025em] text-[#F3F5F1]">
                      {activeValueChip.title}
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveValueChipId(null)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#303841] text-[#8C97A2] transition-colors hover:bg-white/[0.035] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14191E]"
                    aria-label="Close explanation"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#AAB2BA]">
                  {activeValueChip.description}
                </p>
              </MotionDiv>
            ) : null}
          </AnimatePresence>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-[#7E8994]">
                Choose your phase
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#F3F5F1]">
                One system. Two goals.
              </h2>
            </div>

            <p className="max-w-[8rem] text-right text-xs leading-4 text-[#6F7A85]">
              Pick the phase that matches your current goal.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </section>

        <div className="border-t border-[#232A31] pt-3">
          <button
            type="button"
            className="mx-auto flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium text-[#59646E] transition-colors hover:text-[#98A2AC]"
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
