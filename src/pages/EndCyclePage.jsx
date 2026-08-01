import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";
import ContinuityRail from "../components/cycle/ContinuityRail";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { getDayDetails } from "../data/dayDetails";
import { getPlanById } from "../data/plans";
import { getCycleSummary } from "../utils/runtime/cycleSummaryHelpers";
import { getDayStatus } from "../utils/runtime/dayStatusHelpers";

function getPerformedMainSetCount(dayLog) {
  return Object.values(dayLog?.mainExerciseLogs ?? {}).reduce(
    (count, exerciseLog) =>
      count + (exerciseLog.sets?.filter((set) => set.isDone).length ?? 0),
    0,
  );
}

function buildCompletedRailItems({ planId, dayDetailsList, cycle }) {
  return dayDetailsList.flatMap((dayDetails, index) => {
    const dayLog = cycle?.dayLogs?.[dayDetails.id];
    const dayStatus = getDayStatus(dayLog, dayDetails.exerciseIds);
    const performedSetCount = getPerformedMainSetCount(dayLog);
    const state =
      dayStatus === "complete"
        ? "complete"
        : performedSetCount > 0
          ? "partial"
          : "empty";
    const stateLabel =
      state === "complete"
        ? "Closed · full main work"
        : state === "partial"
          ? `Closed · ${performedSetCount} performed sets`
          : "Closed · no performed sets";
    const items = [
      {
        id: dayDetails.id,
        kind: "day",
        label: dayDetails.label,
        shortTitle:
          state === "complete" ? "Full" : state === "partial" ? "Partial" : "Empty",
        state,
        stateLabel,
        ariaLabel: `${dayDetails.label} ${dayDetails.name}, ${stateLabel}`,
        to: `/plan/${planId}/day/${dayDetails.id}`,
      },
    ];

    if ([1, 3, 5].includes(index)) {
      items.push({
        id: `rest-${index}`,
        kind: "rest",
        label: "Rest",
        shortTitle: "Recovery",
        state: "rest",
        stateLabel: "Recovery",
        ariaLabel: `Recovery slot after ${dayDetails.label}`,
      });
    }

    return items;
  });
}

function EvidenceRow({ index, label, value, detail, tone = "ink" }) {
  const valueClassName =
    tone === "support"
      ? "text-[#59686E]"
      : tone === "partial"
        ? "text-[#8A570F]"
        : "text-[#191A16]";

  return (
    <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-3 border-b border-[#C9C1AF] py-4 last:border-b-0">
      <span className="font-display text-sm font-bold text-[#66675E]">{index}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#191A16]">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[#66675E]">{detail}</p>
      </div>
      <strong className={`font-display text-2xl font-bold tabular-nums ${valueClassName}`}>
        {value}
      </strong>
    </div>
  );
}

/** Completed-cycle review and the only explicit next-cycle start surface. */
export default function EndCyclePage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();
  const plan = getPlanById(planId);
  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber ?? 1;
  const nextCycleNumber = currentCycleNumber + 1;
  const currentCycle = planProgress?.cycles?.[currentCycleNumber] ?? null;
  const isCycleComplete = Boolean(currentCycle?.completedAt);
  const dayDetailsList = useMemo(() => {
    if (!plan) return [];
    return plan.dayOrder
      .map((dayId) => getDayDetails(planId, dayId))
      .filter(Boolean);
  }, [plan, planId]);
  const cycleSummary = getCycleSummary({
    cycle: currentCycle,
    dayDetailsList,
  });
  const railItems = buildCompletedRailItems({
    planId,
    dayDetailsList,
    cycle: currentCycle,
  });
  const hasCoreBlocks = cycleSummary.totalCoreBlocksCount > 0;
  const hasAnyLoggedWork =
    cycleSummary.loggedMainExercisesCount > 0 ||
    cycleSummary.loggedCoreBlocksCount > 0;
  const isEmptyClosedCycle = !hasAnyLoggedWork;
  const hasPartialLoggedWork =
    hasAnyLoggedWork &&
    (cycleSummary.loggedMainExercisesCount <
      cycleSummary.totalMainExercisesCount ||
      cycleSummary.loggedCoreBlocksCount < cycleSummary.totalCoreBlocksCount);

  function handleStartNewCycle() {
    dispatch({
      type: APP_ACTIONS.START_PLAN_CYCLE,
      payload: { planId, startedAt: new Date().toISOString() },
    });
    navigate(`/plan/${planId}/cycle`);
  }

  if (!plan) {
    return (
      <AppShell mode="product">
        <div className="space-y-7">
          <Link to="/" className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E]">← Home</Link>
          <section className="cut-corner border border-[#C9C1AF] bg-[#F8F5EB] p-5">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">Cycle review</p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase leading-[0.9] text-[#191A16]">Cycle not found</h1>
          </section>
        </div>
      </AppShell>
    );
  }

  if (!isCycleComplete) {
    return (
      <AppShell mode="product" width="wide">
        <div className="space-y-7">
          <Link to={`/plan/${planId}/cycle`} className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E]">← Cycle instrument</Link>
          <header className="border-b border-[#C9C1AF] pb-6">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">Cycle checkpoint · {plan.name}</p>
            <h1 className="mt-3 max-w-3xl font-display text-6xl font-extrabold uppercase leading-[0.84] tracking-[-0.03em] text-[#191A16]">The handoff is not ready yet.</h1>
            <p className="mt-5 max-w-xl border-l-2 border-[#FF5A3C] pl-4 text-sm leading-6 text-[#4E5048]">All six training-day logs must be closed before another cycle can begin.</p>
          </header>
          <section className="cut-corner grid gap-4 border border-[#34362E] bg-[#1B1C17] p-5 text-[#F2EEE4] sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#FF8B73]">Current lifecycle</p>
              <p className="mt-2 font-display text-5xl font-bold tabular-nums">{cycleSummary.finishedTrainingDaysCount}<span className="text-[#77796D]">/{cycleSummary.totalTrainingDaysCount}</span></p>
              <p className="mt-2 text-sm leading-6 text-[#AAA99F]">Partial and empty days may still be closed; perfection is not required.</p>
            </div>
            <SecondaryButton variant="training" to={`/plan/${planId}/cycle`}>Return to cycle</SecondaryButton>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mode="product" width="wide">
      <div className="space-y-8 pb-4">
        <Link to={`/plan/${planId}/cycle`} className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E]">← Cycle instrument</Link>

        <header className="grid gap-6 border-b border-[#C9C1AF] pb-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#49623F]">Cycle {currentCycleNumber} · handoff ready</p>
            <h1 className="mt-3 max-w-3xl font-display text-6xl font-extrabold uppercase leading-[0.84] tracking-[-0.035em] text-[#191A16] min-[390px]:text-7xl">The sequence closed.<span className="block text-[#77796D]">The evidence stays.</span></h1>
            <p className="mt-5 max-w-xl border-l-2 border-[#6E8B63] pl-4 text-sm leading-6 text-[#4E5048]">All six day records are closed. The next cycle can use only the performed field values that actually exist.</p>
          </div>
          <div className="border-l border-[#C9C1AF] pl-4">
            <p className="font-display text-5xl font-bold tabular-nums text-[#38502F]">06<span className="text-[#6F7068]">/06</span></p>
            <p className="mt-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#5F6158]">Day logs closed</p>
          </div>
        </header>

        <section className="border-y border-[#C9C1AF] py-5" aria-labelledby="closed-path-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#5F6158]">Six days · three recovery positions</p>
              <h2 id="closed-path-title" className="mt-1 font-display text-3xl font-bold uppercase leading-none text-[#191A16]">Closed path</h2>
            </div>
            <p className="hidden text-right text-xs text-[#66675E] sm:block">Select a day to review its saved record.</p>
          </div>
          <ContinuityRail items={railItems} tone="paper" animate ariaLabel={`${plan.name}, completed cycle ${currentCycleNumber}`} />
        </section>

        <section aria-labelledby="cycle-evidence-title">
          <div className="flex items-end justify-between gap-4 border-b border-[#AFA796] pb-2">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#5F6158]">Runtime-derived recap</p>
              <h2 id="cycle-evidence-title" className="mt-1 font-display text-4xl font-bold uppercase leading-none text-[#191A16]">Evidence ledger</h2>
            </div>
            <span className="text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#5F6158]">No idealized totals</span>
          </div>
          <EvidenceRow index="01" label="Training days closed" value={`${cycleSummary.finishedTrainingDaysCount}/${cycleSummary.totalTrainingDaysCount}`} detail="Lifecycle evidence; this is what makes the cycle complete." />
          <EvidenceRow index="02" label="Main exercises with useful performed values" value={`${cycleSummary.loggedMainExercisesCount}/${cycleSummary.totalMainExercisesCount}`} detail="Unchecked sets and empty fields are not treated as logged work." />
          <EvidenceRow index="03" label="Partial closed days" value={cycleSummary.partialDaysCount} detail={isEmptyClosedCycle ? "The cycle closed without useful workout values." : "Partial records are valid and remain visible."} tone="partial" />
          <EvidenceRow index="C" label="Core blocks with useful performed values" value={`${cycleSummary.loggedCoreBlocksCount}/${cycleSummary.totalCoreBlocksCount}`} detail="Support work remains separate from main exercise completion." tone="support" />
        </section>

        <section className="cut-corner grid gap-5 border border-[#34362E] bg-[#1B1C17] p-5 text-[#F2EEE4] sm:grid-cols-[minmax(0,1fr)_minmax(15rem,0.7fr)]">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B8CB70]">What carries forward</p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase leading-none">Context, not completion.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#AAA99F]">
              {isEmptyClosedCycle
                ? "No useful values were logged in this cycle. Earlier valid references may still be found."
                : hasPartialLoggedWork
                  ? "The next cycle will use the latest valid performed values field by field, wherever they exist."
                  : "This cycle provides a complete set of useful reference points for the next pass."}
            </p>
          </div>
          <div className="border-t border-[#45473E] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="text-sm font-semibold text-[#D7DFE1]">Core remains a support branch.</p>
            <p className="mt-2 text-xs leading-5 text-[#8D989D]">{hasCoreBlocks ? "Its values can carry over, but missed Core work never erases the main cycle." : "This plan has no Core blocks in its current static structure."}</p>
          </div>
        </section>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <PrimaryButton variant="product" onClick={handleStartNewCycle}>Start Cycle {nextCycleNumber} <span aria-hidden="true">→</span></PrimaryButton>
          <SecondaryButton variant="product" to={`/plan/${planId}/cycle`}>Review closed days</SecondaryButton>
        </div>
      </div>
    </AppShell>
  );
}
