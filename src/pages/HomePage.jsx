import { RotateCcw } from "lucide-react";

import AppMark from "../components/brand/AppMark";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import ContinuityRail from "../components/cycle/ContinuityRail";
import AppShell from "../components/layout/AppShell";
import PlanCard from "../components/plans/PlanCard";
import { getDaysByPlanId } from "../data/days";
import { plans } from "../data/plans";
import { clearStoredAppState } from "../storage/appStateStorage";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";

const HOME_RHYTHM_ITEMS = [
  { id: "d1", kind: "day", label: "D1", shortTitle: "Train", state: "planned" },
  { id: "d2", kind: "day", label: "D2", shortTitle: "Train", state: "planned" },
  { id: "r1", kind: "rest", label: "Rest", shortTitle: "Recover", state: "rest" },
  { id: "d3", kind: "day", label: "D3", shortTitle: "Train", state: "planned" },
  { id: "d4", kind: "day", label: "D4", shortTitle: "Train", state: "planned" },
  { id: "r2", kind: "rest", label: "Rest", shortTitle: "Recover", state: "rest" },
  { id: "d5", kind: "day", label: "D5", shortTitle: "Train", state: "planned" },
  { id: "d6", kind: "day", label: "D6", shortTitle: "Train", state: "planned" },
  { id: "r3", kind: "rest", label: "Rest", shortTitle: "Recover", state: "rest" },
];

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

function ActiveCycleEntry({ entry, index }) {
  const { plan, currentCycleNumber, currentDay, currentDayRoute, cycleRoute } =
    entry;

  return (
    <article
      className={`grid gap-4 px-4 py-5 sm:grid-cols-[1fr_auto] sm:items-end ${
        index > 0 ? "border-t border-[#45473E]" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#FF8B73]">
            Active cycle {currentCycleNumber}
          </p>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[#87877E]">
            {plan.name}
          </p>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <span className="flex h-9 min-w-9 items-center justify-center border border-[#FF795F] bg-[#FF5A3C] px-1.5 font-display text-lg font-bold text-[#171814]">
            {currentDay.label}
          </span>
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold leading-none text-[#F2EEE4]">
              {currentDay.name}
            </p>
            <p className="mt-1 text-sm leading-5 text-[#AAA99F]">
              Your next planned step is already fixed.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:w-64">
        <PrimaryButton to={currentDayRoute} className="w-full">
          Continue
        </PrimaryButton>
        <SecondaryButton to={cycleRoute} className="w-full">
          Cycle map
        </SecondaryButton>
      </div>
    </article>
  );
}

/**
 * Product entry for new and returning users.
 *
 * Rendering plans, the rhythm specimen, or resume entries is read-only. A
 * cycle is still created only from the explicit Plan Overview start action.
 */
export default function HomePage() {
  const { state, dispatch } = useAppState();
  const activeCycleEntries = getActiveCycleEntries(state);

  function handleResetLocalProgress() {
    const shouldReset = window.confirm(
      "This will clear all local training progress on this device. Continue?",
    );

    if (!shouldReset) {
      return;
    }

    clearStoredAppState();
    dispatch({ type: APP_ACTIONS.RESET_APP_STATE });
  }

  return (
    <AppShell mode="product" width="wide">
      <div className="flex flex-col gap-10 pb-2">
        <header>
          <div className="flex items-center justify-between gap-4 border-b border-[#C9C1AF] pb-4">
            <div className="flex items-center gap-3">
              <AppMark className="h-10 w-10" tone="paper" />
              <div>
                <p className="font-display text-xl font-bold uppercase leading-none tracking-wide text-[#191A16]">
                  Cycle Coach
                </p>
                <p className="mt-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#5F6158]">
                  Structured training companion
                </p>
              </div>
            </div>
            <span className="font-display text-lg font-semibold text-[#6F7068]">
              06 / 09
            </span>
          </div>

          {activeCycleEntries.length > 0 ? (
            <section className="mt-4" aria-labelledby="active-cycles-heading">
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
                    Resume
                  </p>
                  <p
                    id="active-cycles-heading"
                    className="mt-1 font-display text-3xl font-bold uppercase leading-none text-[#191A16]"
                  >
                    Pick up the rail
                  </p>
                </div>
                <p className="hidden max-w-52 text-right text-xs leading-5 text-[#66675E] min-[390px]:block">
                  Each plan keeps its own local cycle.
                </p>
              </div>

              <div className="cut-corner overflow-hidden border border-[#34362E] bg-[#1B1C17]">
                {activeCycleEntries.map((entry, index) => (
                  <ActiveCycleEntry
                    key={entry.plan.id}
                    entry={entry}
                    index={index}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="grid gap-7 py-8 sm:grid-cols-[1.25fr_0.75fr] sm:items-end">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#B33521]">
                The cycle is the system
              </p>
              <h1 className="mt-3 max-w-xl font-display text-[3.6rem] font-extrabold uppercase leading-[0.82] tracking-[-0.035em] text-[#191A16] min-[390px]:text-[4.25rem] sm:text-[5.2rem]">
                The calendar moves.
                <span className="block text-[#C83C24]">The order stays.</span>
              </h1>
            </div>

            <p className="max-w-md border-l-2 border-[#FF5A3C] pl-4 text-base leading-7 text-[#4E5048]">
              Follow a predefined Bulk or Cut cycle, log what actually happened,
              and return to one clear next action—even after a partial day.
            </p>
          </div>

          <div className="border-y border-[#C9C1AF] py-5">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#5F6158]">
                Nine-slot rhythm
              </p>
              <p className="text-xs text-[#66675E]">2 train · 1 recover · repeat</p>
            </div>
            <ContinuityRail
              items={HOME_RHYTHM_ITEMS}
              tone="paper"
              animate
              ariaLabel="Six training days inside a nine-slot recovery rhythm"
            />
          </div>

          <div className="grid border-b border-[#C9C1AF] sm:grid-cols-2">
            <div className="py-5 pr-0 sm:border-r sm:border-[#C9C1AF] sm:pr-6">
              <p className="font-display text-2xl font-bold uppercase leading-none text-[#191A16]">
                Stable sequence
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5B5D54]">
                D1–D6 keep their order. Recovery creates room without turning the
                plan into random sessions.
              </p>
            </div>
            <div className="border-t border-[#C9C1AF] py-5 sm:border-t-0 sm:pl-6">
              <p className="font-display text-2xl font-bold uppercase leading-none text-[#191A16]">
                Honest evidence
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5B5D54]">
                Checked sets record performed work. Partial days remain useful,
                and previous values carry the next cycle forward.
              </p>
            </div>
          </div>
        </header>

        <section aria-labelledby="choose-plan-heading">
          <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
                Two prescribed phases
              </p>
              <h2
                id="choose-plan-heading"
                className="mt-1 font-display text-4xl font-bold uppercase leading-none text-[#191A16]"
              >
                Choose the work
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#5B5D54]">
              Same stable cycle. Different training priority and fatigue logic.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-[#A9A292] bg-[#A9A292] sm:grid-cols-2">
            {plans.map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} index={index} />
            ))}
          </div>
        </section>

        <footer className="border-t border-[#C9C1AF] pt-4">
          <button
            type="button"
            onClick={handleResetLocalProgress}
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#5F6158] transition-colors hover:text-[#B33521] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset local progress
          </button>
        </footer>
      </div>
    </AppShell>
  );
}
