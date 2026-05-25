import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import SectionCard from "../components/layout/SectionCard";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { getDayDetails } from "../data/dayDetails";
import { getPlanById } from "../data/plans";
import { getCycleSummary } from "../utils/runtime/cycleSummaryHelpers";
import { UI_STACK_LG, UI_TEXT_MUTED, UI_TITLE } from "../styles/ui";

/**
 * Small display card for one cycle summary metric.
 */
function SummaryMetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
        {value}
      </p>
    </div>
  );
}

/**
 * Page-level review for a completed cycle.
 *
 * Runtime note:
 * EndCyclePage blocks new-cycle creation until the current cycle is complete.
 * Starting a new cycle dispatches START_PLAN_CYCLE and keeps previous cycle
 * logs available in runtime state.
 */
export default function EndCyclePage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();

  const plan = getPlanById(planId);
  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber ?? 1;
  const currentCycle = planProgress?.cycles?.[currentCycleNumber] ?? null;
  const isCycleComplete = Boolean(currentCycle?.completedAt);

  // Static day details are needed so the summary can compare runtime logs
  // against the expected training-day structure.
  const dayDetailsList = useMemo(() => {
    if (!plan) {
      return [];
    }

    return plan.dayOrder
      .map((dayId) => getDayDetails(planId, dayId))
      .filter(Boolean);
  }, [plan, planId]);

  const cycleSummary = getCycleSummary({
    cycle: currentCycle,
    dayDetailsList,
  });

  // Start the next cycle while preserving previous cycle logs in app state.
  function handleStartNewCycle() {
    dispatch({
      type: APP_ACTIONS.START_PLAN_CYCLE,
      payload: {
        planId,
        startedAt: new Date().toISOString(),
      },
    });

    navigate(`/plan/${planId}/cycle`);
  }

  if (!plan) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to="/">Back to Home</BackButton>
          </div>

          <header className="flex flex-col gap-3">
            <h1 className={UI_TITLE}>Cycle not found</h1>
            <p className={UI_TEXT_MUTED}>
              The selected plan could not be loaded.
            </p>
          </header>
        </div>
      </AppShell>
    );
  }

  // Guard against starting a new cycle before all training days are closed.
  if (!isCycleComplete) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to={`/plan/${planId}/cycle`}>Back to Cycle</BackButton>
          </div>

          <header className="flex flex-col gap-3">
            <p className="text-sm font-medium text-zinc-500">
              {plan.name} — Cycle {currentCycleNumber}
            </p>

            <h1 className={UI_TITLE}>Cycle is not complete yet</h1>

            <p className={UI_TEXT_MUTED}>
              This cycle has not been fully closed. Return to the cycle screen
              and finish the remaining training days before starting a new
              cycle.
            </p>
          </header>

          <SectionCard>
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-zinc-100">
                Current progress
              </h2>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                Training days finished: {cycleSummary.finishedTrainingDaysCount}
                /{cycleSummary.totalTrainingDaysCount}
              </p>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                A new cycle should only be started after all training days in
                the current cycle are closed.
              </p>
            </div>
          </SectionCard>

          <PrimaryButton to={`/plan/${planId}/cycle`}>
            Back to Cycle
          </PrimaryButton>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <div className="flex justify-start">
          <BackButton to={`/plan/${planId}/cycle`}>Back to Cycle</BackButton>
        </div>

        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-500">
            {plan.name} — Cycle {currentCycleNumber}
          </p>

          <h1 className={UI_TITLE}>Cycle complete</h1>

          <p className={UI_TEXT_MUTED}>
            All training days in this cycle have been closed. Review the
            summary, then start the next cycle when you are ready.
          </p>
        </header>

        <SectionCard>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold text-zinc-100">
                Cycle recap
              </h2>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                This recap uses your saved runtime logs from the completed
                cycle.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SummaryMetricCard
                label="Training days"
                value={`${cycleSummary.finishedTrainingDaysCount}/${cycleSummary.totalTrainingDaysCount}`}
              />

              <SummaryMetricCard
                label="Main exercises"
                value={`${cycleSummary.completedMainExercisesCount}/${cycleSummary.totalMainExercisesCount}`}
              />

              <SummaryMetricCard
                label="Partial days"
                value={cycleSummary.partialDaysCount}
              />

              <SummaryMetricCard
                label="Core blocks"
                value={`${cycleSummary.completedCoreBlocksCount}/${cycleSummary.totalCoreBlocksCount}`}
              />
            </div>

            <div className="space-y-2 border-t border-zinc-800 pt-5">
              <h2 className="text-sm font-semibold text-zinc-100">
                Next cycle
              </h2>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                Start a new cycle when you are ready. Logged values from this
                cycle can be used as the starting point for the next one.
              </p>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                Starting a new cycle creates a fresh Cycle{" "}
                {currentCycleNumber + 1} and keeps this completed cycle
                available in runtime state.
              </p>
            </div>
          </div>
        </SectionCard>

        <PrimaryButton type="button" onClick={handleStartNewCycle}>
          Start new cycle
        </PrimaryButton>
      </div>
    </AppShell>
  );
}
