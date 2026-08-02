import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import GuardState from "../components/common/GuardState";
import PrimaryButton from "../components/common/PrimaryButton";
import SecondaryButton from "../components/common/SecondaryButton";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { getDayDetails } from "../data/dayDetails";
import { getPlanById } from "../data/plans";
import { getCycleSummary } from "../utils/runtime/cycleSummaryHelpers";

const PLAN_META = {
  "bulk-pro": {
    phaseCode: "BUILD / 01",
    phaseText: "text-[#C8F78F]",
  },
  "cut-pro": {
    phaseCode: "PRESERVE / 02",
    phaseText: "text-[#F4C87F]",
  },
};

const EVIDENCE_TONES = {
  mint: {
    marker: "bg-[#79C89A]",
    value: "text-[#9FD9B6]",
  },
  amber: {
    marker: "bg-[#F1B864]",
    value: "text-[#F4C87F]",
  },
  core: {
    marker: "bg-[#A7A2D8]",
    value: "text-[#C5C1E7]",
  },
  neutral: {
    marker: "bg-[#56616B]",
    value: "text-[#D7DCD7]",
  },
};

function ClosedDayProgress({ value, total }) {
  const safeTotal = total > 0 ? total : 6;
  const clampedValue = Math.min(Math.max(value, 0), safeTotal);

  return (
    <div
      className="mt-5"
      role="progressbar"
      aria-label="Closed training days"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={clampedValue}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[#8B949D]">Training days closed</p>
        <p className="text-xs font-bold tabular-nums text-[#DDE1DD]">
          {clampedValue}/{safeTotal}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1.5" aria-hidden="true">
        {Array.from({ length: safeTotal }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full ${
              index < clampedValue ? "bg-[#79C89A]" : "bg-[#2A3138]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function CycleEvidenceRow({ index, label, helper, value, tone = "neutral" }) {
  const toneClasses = EVIDENCE_TONES[tone] ?? EVIDENCE_TONES.neutral;

  return (
    <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#2A3138] px-1 py-4 last:border-b-0">
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className={`h-1.5 w-1.5 rounded-full ${toneClasses.marker}`} />
        <span className="text-[0.65rem] font-semibold tabular-nums text-[#66717B]">
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#E4E8E4]">{label}</p>
        <p className="mt-1 text-xs leading-5 text-[#7F8993]">{helper}</p>
      </div>

      <p
        className={`shrink-0 text-base font-semibold tabular-nums tracking-tight ${toneClasses.value}`}
      >
        {value}
      </p>
    </div>
  );
}

function ContinuityRow({ index, title, children }) {
  return (
    <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-[#2A3138] py-4 last:border-b-0">
      <span className="pt-0.5 text-[0.65rem] font-semibold tabular-nums text-[#66717B]">
        {String(index).padStart(2, "0")}
      </span>

      <div>
        <h3 className="text-sm font-semibold text-[#E4E8E4]">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-[#98A2AC]">{children}</p>
      </div>
    </div>
  );
}

/**
 * Runtime-derived review and handoff for a completed cycle.
 *
 * Runtime boundary:
 * Rendering the page never creates a cycle. START_PLAN_CYCLE is dispatched only
 * after the user explicitly chooses to start the next cycle.
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
  const meta = PLAN_META[planId] ?? PLAN_META["bulk-pro"];

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

  const hasPartialLoggedWork =
    hasAnyLoggedWork &&
    (cycleSummary.loggedMainExercisesCount <
      cycleSummary.totalMainExercisesCount ||
      cycleSummary.loggedCoreBlocksCount <
        cycleSummary.totalCoreBlocksCount);

  const mainWorkTone = !hasLoggedMainWork
    ? "neutral"
    : cycleSummary.loggedMainExercisesCount <
        cycleSummary.totalMainExercisesCount
      ? "amber"
      : "mint";

  const coreWorkTone = !hasLoggedCoreWork ? "neutral" : "core";

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
      <GuardState
        eyebrow="Cycle review"
        title="This plan is unavailable."
        description="The requested cycle does not belong to a current training plan. Return home and choose a valid plan to continue."
        primaryTo="/"
        primaryLabel="Back to home"
      />
    );
  }

  if (!isCycleComplete) {
    return (
      <GuardState
        eyebrow="Cycle checkpoint"
        context={`${plan.name} · Cycle ${currentCycleNumber}`}
        title="Finish the current cycle first."
        description="A new cycle becomes available after all six training days are intentionally closed. Your logged work can stay partial and honest."
        icon={RotateCcw}
        primaryTo={`/plan/${planId}/cycle`}
        primaryLabel="Back to cycle"
        secondaryTo={`/plan/${planId}`}
        secondaryLabel="View plan"
      >
        <section className="rounded-[1.15rem] border border-[#2A3138] bg-[#13181D] px-4 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[#8B949D]">
                Current progress
              </p>
              <p className="mt-2 text-sm leading-6 text-[#AAB2BA]">
                Close the remaining training days from the Cycle Dashboard.
              </p>
            </div>

            <p className="shrink-0 text-lg font-semibold tabular-nums text-[#F4C87F]">
              {cycleSummary.finishedTrainingDaysCount}/
              {cycleSummary.totalTrainingDaysCount}
            </p>
          </div>

          <ClosedDayProgress
            value={cycleSummary.finishedTrainingDaysCount}
            total={cycleSummary.totalTrainingDaysCount}
          />
        </section>
      </GuardState>
    );
  }

  return (
    <AppShell mode="performance">
      <div className="flex flex-col gap-8 pb-3">
        <Link
          to={`/plan/${planId}/cycle`}
          className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-lg pr-2 text-xs font-medium text-[#8B949D] transition-colors hover:text-[#D7DCD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101419]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to cycle
        </Link>

        <header>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#79C89A]/28 bg-[#79C89A]/[0.08] text-[#9FD9B6]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </span>

              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#9FD9B6]">
                  Cycle complete
                </p>
                <p className={`mt-1 text-xs font-semibold ${meta.phaseText}`}>
                  {meta.phaseCode}
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-[#8B949D]">{plan.name}</p>
          </div>

          <h1 className="mt-6 text-[2.65rem] font-semibold leading-[0.98] tracking-[-0.04em] text-[#F3F5F1]">
            Cycle {currentCycleNumber} closed.
          </h1>

          <p className="mt-4 max-w-sm text-[0.95rem] leading-7 text-[#AAB2BA]">
            All training days are closed. This recap reflects what you actually
            logged, including partial work and separate Core support.
          </p>

          <ClosedDayProgress
            value={cycleSummary.finishedTrainingDaysCount}
            total={cycleSummary.totalTrainingDaysCount}
          />
        </header>

        <section aria-labelledby="cycle-evidence-title">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[#8B949D]">
              Cycle evidence
            </p>
            <h2
              id="cycle-evidence-title"
              className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#F3F5F1]"
            >
              What happened this cycle
            </h2>
          </div>

          <div className="mt-4 rounded-[1.15rem] border border-[#2A3138] bg-[#13181D] px-4">
            <CycleEvidenceRow
              index={1}
              label="Training days"
              helper="Lifecycle progress"
              value={`${cycleSummary.finishedTrainingDaysCount}/${cycleSummary.totalTrainingDaysCount}`}
              tone="mint"
            />

            <CycleEvidenceRow
              index={2}
              label="Main exercises"
              helper="Exercises with useful performed values"
              value={`${cycleSummary.loggedMainExercisesCount}/${cycleSummary.totalMainExercisesCount}`}
              tone={mainWorkTone}
            />

            <CycleEvidenceRow
              index={3}
              label="Partial days"
              helper={
                isEmptyClosedCycle
                  ? "No workout values were logged"
                  : hasPartialDays
                    ? "Closed with some prescribed work unfinished"
                    : "No partial days"
              }
              value={cycleSummary.partialDaysCount}
              tone={hasPartialDays ? "amber" : "neutral"}
            />

            <CycleEvidenceRow
              index={4}
              label="Core blocks"
              helper={
                hasCoreBlocks
                  ? "Separate support work with useful logged values"
                  : "No Core blocks in this plan"
              }
              value={`${cycleSummary.loggedCoreBlocksCount}/${cycleSummary.totalCoreBlocksCount}`}
              tone={coreWorkTone}
            />
          </div>
        </section>

        <section aria-labelledby="continuity-title">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[#8B949D]">
            Continuity
          </p>
          <h2
            id="continuity-title"
            className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[#F3F5F1]"
          >
            What carries forward
          </h2>

          <div className="mt-3 border-y border-[#2A3138]">
            <ContinuityRow index={1} title="Logged work stays useful">
              {isEmptyClosedCycle
                ? "This cycle is closed without new workout values. Earlier valid references can still remain available."
                : hasPartialLoggedWork
                  ? "The next cycle uses the performed values it can trust. Partial work remains honest instead of being treated as perfect completion."
                  : "Your performed set values provide useful reference points for the next pass through the plan."}
            </ContinuityRow>

            <ContinuityRow index={2} title="The next cycle waits for you">
              Nothing new starts automatically. Cycle {nextCycleNumber} is
              created only when you choose to begin it.
            </ContinuityRow>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-[#3A434C] bg-[#171D22] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[#C8F78F]">
                Next cycle
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#F3F5F1]">
                Cycle {nextCycleNumber} is ready.
              </h2>
            </div>

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#B8F36B]/28 bg-[#B8F36B]/[0.08] text-[#C8F78F]">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-[#AAB2BA]">
            Begin again at D1 while keeping this completed cycle available as
            training context.
          </p>

          <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#8F9A91]">
            <Check className="h-3.5 w-3.5 text-[#79C89A]" aria-hidden="true" />
            Previous cycle preserved
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <PrimaryButton
              variant="performance"
              className="w-full"
              onClick={handleStartNewCycle}
            >
              Start Cycle {nextCycleNumber}
            </PrimaryButton>

            <SecondaryButton
              to={`/plan/${planId}/cycle`}
              variant="performance"
              className="w-full"
            >
              Review days
            </SecondaryButton>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
