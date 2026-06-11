import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Dumbbell,
  Layers3,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { getDayDetails } from "../data/dayDetails";
import { getPlanById } from "../data/plans";
import { getCycleSummary } from "../utils/runtime/cycleSummaryHelpers";

/**
 * Compact metric tile for the completed cycle recap.
 *
 * Runtime note:
 * Values shown here must stay runtime-derived. This card should not display
 * placeholder or fake analytics.
 */
function CycleMetricTile({ icon, label, value, helper }) {
  const MetricIcon = icon;

  return (
    <div className="flex items-center gap-3 border-b border-white/7 px-3 py-2.5 last:border-b-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.026] text-[#8FDCE5]/70">
        <MetricIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-400">{label}</p>
        {helper ? (
          <p className="mt-0.5 text-xs leading-5 text-zinc-500">{helper}</p>
        ) : null}
      </div>

      <p className="shrink-0 text-base font-semibold tracking-tight text-zinc-50">
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
  const nextCycleNumber = currentCycleNumber + 1;
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

  const hasPartialDays = cycleSummary.partialDaysCount > 0;
  const hasCoreBlocks = cycleSummary.totalCoreBlocksCount > 0;
  const hasLoggedMainWork = cycleSummary.loggedMainExercisesCount > 0;
  const hasLoggedCoreWork = cycleSummary.loggedCoreBlocksCount > 0;
  const hasAnyLoggedWork = hasLoggedMainWork || hasLoggedCoreWork;
  const isEmptyClosedCycle = !hasAnyLoggedWork;

  // Partial logged work is supportive context, not failure. Cycle completion
  // still comes from closed training days, not perfect workout logging.
  const hasPartialLoggedWork =
    hasAnyLoggedWork &&
    (cycleSummary.loggedMainExercisesCount <
      cycleSummary.totalMainExercisesCount ||
      cycleSummary.loggedCoreBlocksCount < cycleSummary.totalCoreBlocksCount);

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
        <div className="flex flex-col gap-7">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>

          <header className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
              Cycle review
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-50">
              Cycle not found
            </h1>

            <p className="max-w-sm text-base leading-7 text-zinc-400">
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
        <div className="flex flex-col gap-7">
          <Link
            to={`/plan/${planId}/cycle`}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Cycle
          </Link>

          <header className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
              Cycle checkpoint
            </p>

            <p className="text-sm font-medium text-zinc-500">
              {plan.name} — Cycle {currentCycleNumber}
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-50">
              Cycle is not complete yet
            </h1>

            <p className="max-w-sm text-base leading-7 text-zinc-400">
              Finish all training days before starting the next cycle.
            </p>
          </header>

          <section className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <RotateCcw className="h-5 w-5" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-50">
                  Current progress
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Training days finished:{" "}
                  <span className="font-semibold text-zinc-200">
                    {cycleSummary.finishedTrainingDaysCount}/
                    {cycleSummary.totalTrainingDaysCount}
                  </span>
                </p>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  A new cycle should only be started after all training days in
                  the current cycle are closed.
                </p>
              </div>
            </div>
          </section>

          <Link
            to={`/plan/${planId}/cycle`}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200"
          >
            Back to Cycle
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <Link
          to={`/plan/${planId}/cycle`}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Cycle
        </Link>

        <header className="rounded-2xl border border-[#3FA8B6]/14 bg-[radial-gradient(circle_at_top_right,rgba(94,199,213,0.06),transparent_42%),linear-gradient(180deg,rgba(16,41,46,0.34),rgba(17,21,24,0.92))] p-4 shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-cyan-300/78">
                Cycle complete
              </p>

              <p className="mt-2 text-xs font-medium text-zinc-500">
                {plan.name} — Cycle {currentCycleNumber}
              </p>

              <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-zinc-50">
                Cycle {currentCycleNumber} complete
              </h1>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/8 text-cyan-200">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          <p className="mt-3 border-l border-cyan-300/28 pl-3 text-sm leading-5 text-zinc-300">
            You closed all training days. Your next cycle starts with context
            from your logged work.
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-2.5 py-0.5 text-xs font-semibold text-cyan-100">
              {cycleSummary.finishedTrainingDaysCount}/
              {cycleSummary.totalTrainingDaysCount} training days closed
            </span>

            <span className="rounded-full border border-zinc-800 bg-zinc-950/55 px-2.5 py-0.5 text-xs font-semibold text-zinc-400">
              Cycle {nextCycleNumber} ready
            </span>
          </div>
        </header>

        <section className="flex flex-col gap-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Recap
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-50">
              What happened this cycle
            </h2>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.018]">
            <CycleMetricTile
              icon={CheckCircle2}
              label="Days closed"
              value={`${cycleSummary.finishedTrainingDaysCount}/${cycleSummary.totalTrainingDaysCount}`}
              helper="Training days"
            />

            <CycleMetricTile
              icon={Dumbbell}
              label="Main work logged"
              value={`${cycleSummary.loggedMainExercisesCount}/${cycleSummary.totalMainExercisesCount}`}
              helper="Exercises"
            />

            <CycleMetricTile
              icon={Layers3}
              label="Partial days"
              value={cycleSummary.partialDaysCount}
              helper={
                isEmptyClosedCycle
                  ? "No workout values"
                  : hasPartialDays
                    ? "Logged work varies"
                    : "No partial days"
              }
            />

            <CycleMetricTile
              icon={ShieldCheck}
              label="Core work logged"
              value={`${cycleSummary.loggedCoreBlocksCount}/${cycleSummary.totalCoreBlocksCount}`}
              helper={hasCoreBlocks ? "Core blocks" : "No core blocks"}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-white/8 bg-white/[0.018] p-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-50">
                What this means
              </h2>

              <div className="mt-2 space-y-2 text-sm leading-5 text-zinc-400">
                {isEmptyClosedCycle ? (
                  <p>
                    This cycle is closed, but no workout values were logged.
                    Earlier valid references may still be used.
                  </p>
                ) : hasPartialLoggedWork ? (
                  <p>
                    Partial days are valid. Your next cycle uses the logged work
                    it can trust.
                  </p>
                ) : (
                  <p>
                    Your logged work gives the next cycle useful reference
                    points.
                  </p>
                )}

                <p>
                  This recap shows what you logged, not an idealized version of
                  the plan.
                </p>
              </div>
            </div>

            {hasCoreBlocks ? (
              <div className="border-t border-white/8 pt-4">
                <div className="flex gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-400/26 bg-violet-500/10 text-violet-200">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight text-zinc-50">
                      Core stays separate
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-zinc-400">
                      Core is support work. Missed or partial core blocks do not
                      erase the main cycle.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="border-t border-white/8 pt-4">
              <div className="flex gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/8 text-cyan-200">
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-semibold tracking-tight text-zinc-50">
                    Next cycle uses this context
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-zinc-400">
                    Logged set values can help guide the next pass through the
                    plan.
                  </p>

                  <p className="mt-1.5 text-sm leading-5 text-zinc-500">
                    Nothing new is created until you choose to move on.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-3 pb-2">
          <button
            type="button"
            onClick={handleStartNewCycle}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200"
          >
            Start Cycle {nextCycleNumber}
          </button>

          <Link
            to={`/plan/${planId}/cycle`}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/55 px-5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            Review days
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
