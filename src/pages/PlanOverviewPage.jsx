import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ContinuityRail from "../components/cycle/ContinuityRail";
import AppShell from "../components/layout/AppShell";
import { getDaysByPlanId } from "../data/days";
import { getPlanById } from "../data/plans";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";

const PLAN_OVERVIEW_META = {
  "bulk-pro": {
    phaseNumber: "01",
    phase: "Growth phase",
    verb: "Build",
    lead: "Repeatable volume. Measurable progression. Enough recovery to do it again.",
    description:
      "Bulk Pro organizes productive workload across a stable cycle so the user can add reps, add load, and keep the sequence clear when the calendar shifts.",
    facts: [
      ["Training days", "6"],
      ["Rhythm", "2 on · 1 rest"],
      ["Primary aim", "Growth"],
      ["Partial days", "Valid"],
    ],
    principlesTitle: "How the work compounds",
    principles: [
      ["Add reps first", "Progress inside the prescribed rep range before adding load."],
      ["Volume has a job", "Main, support, and top-up work create repeatable signals—not filler."],
      ["Intensity stays selective", "Advanced methods appear only where the prescription earns them."],
      ["Recovery keeps the rail intact", "Rest slots protect the quality of the next training day."],
    ],
  },
  "cut-pro": {
    phaseNumber: "02",
    phase: "Cut phase",
    verb: "Preserve",
    lead: "Hold strength. Control fatigue. Keep the next training step obvious.",
    description:
      "Cut Pro keeps the same stable cycle while reducing unnecessary fatigue. The target is useful performance and recovery discipline, not punishment.",
    facts: [
      ["Training days", "6"],
      ["Rhythm", "2 on · 1 rest"],
      ["Primary aim", "Retention"],
      ["Recovery", "Protected"],
    ],
    principlesTitle: "How the plan holds ground",
    principles: [
      ["Keep the signal clean", "Use controlled reps and preserve the work that matters most."],
      ["Fatigue is a constraint", "Do not spend recovery on intensity methods the phase does not need."],
      ["Partial is still honest", "Log the work that happened and continue the stable sequence."],
      ["Maintenance is progress", "Holding strength in a deficit is a valid, measurable outcome."],
    ],
  },
};

const RHYTHM_DAY_LABELS = {
  d1: "Chest",
  d2: "Back",
  d3: "Quads",
  d4: "Shoulders",
  d5: "Upper",
  d6: "Posterior",
};

function getPrimaryCta({ currentCycle, currentCycleNumber, plan }) {
  if (!currentCycle) {
    return {
      mode: "start",
      label: currentCycleNumber ? "Start cycle" : "Start Cycle 1",
      title: "Ready at D1",
      body: "Starting creates the cycle shell. Your first day log begins only when you open D1.",
      to: `/plan/${plan.id}/cycle`,
    };
  }

  if (currentCycle.completedAt) {
    return {
      mode: "review",
      label: "Review cycle",
      title: `Cycle ${currentCycleNumber} closed`,
      body: "Review the path and the work that becomes useful evidence for the next cycle.",
      to: `/plan/${plan.id}/end-cycle`,
    };
  }

  return {
    mode: "continue",
    label: "Continue cycle",
    title: `Cycle ${currentCycleNumber} in motion`,
    body: "Return to the current node. The remaining training order has not changed.",
    to: `/plan/${plan.id}/cycle`,
  };
}

export default function PlanOverviewPage() {
  const { planId } = useParams();
  const { state, dispatch } = useAppState();
  const plan = getPlanById(planId);
  const days = getDaysByPlanId(planId);
  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber;
  const currentCycle = currentCycleNumber
    ? planProgress?.cycles?.[currentCycleNumber]
    : null;

  if (!plan) {
    return (
      <AppShell mode="product">
        <div className="flex flex-col gap-7">
          <Link
            to="/"
            className="inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Home
          </Link>
          <section className="cut-corner border border-[#C9C1AF] bg-[#F8F5EB] p-5">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
              Invalid plan
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-none text-[#191A16]">
              Plan not found
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#5B5D54]">
              Return home and choose one of the predefined training phases.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  const meta = PLAN_OVERVIEW_META[plan.id] ?? PLAN_OVERVIEW_META["bulk-pro"];
  const totalTrainingDays = days.length || 6;
  const closedTrainingDays = currentCycle
    ? days.filter((day) => currentCycle.dayLogs?.[day.id]?.finishedAt).length
    : 0;
  const primaryCta = getPrimaryCta({ currentCycle, currentCycleNumber, plan });

  const rhythmItems = [
    days[0],
    days[1],
    { id: "rest-1", label: "Rest", kind: "rest" },
    days[2],
    days[3],
    { id: "rest-2", label: "Rest", kind: "rest" },
    days[4],
    days[5],
    { id: "rest-3", label: "Rest", kind: "rest" },
  ]
    .filter(Boolean)
    .map((item) => ({
      id: item.id,
      kind: item.kind ?? "day",
      label: item.label,
      shortTitle:
        item.kind === "rest" ? "Recover" : RHYTHM_DAY_LABELS[item.id],
      state: item.kind === "rest" ? "rest" : "planned",
    }));

  function handlePrimaryCtaClick() {
    if (primaryCta.mode !== "start") {
      return;
    }

    dispatch({
      type: APP_ACTIONS.START_PLAN_CYCLE,
      payload: { planId: plan.id, startedAt: new Date().toISOString() },
    });
  }

  return (
    <AppShell mode="product" width="wide">
      <div className="flex flex-col gap-9 pb-3">
        <Link
          to="/"
          className="inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E] transition-colors hover:text-[#191A16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All plans
        </Link>

        <section className="cut-corner grid overflow-hidden border border-[#34362E] bg-[#1B1C17] text-[#F2EEE4] sm:grid-cols-[1fr_13rem]">
          <div className="p-5 sm:p-6">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#FF8B73]">
              Current status · {plan.name}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-none">
              {primaryCta.title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#AAA99F]">
              {primaryCta.body}
            </p>

            <Link
              to={primaryCta.to}
              onClick={handlePrimaryCtaClick}
              className="cut-corner-sm mt-5 inline-flex min-h-12 w-full items-center justify-between border border-[#FF795F] bg-[#FF5A3C] px-4 text-sm font-semibold text-[#171814] transition-colors hover:bg-[#FF765C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B1C17] sm:max-w-xs"
            >
              {primaryCta.label}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="border-t border-[#45473E] p-5 sm:border-l sm:border-t-0 sm:p-6">
            <p className="font-display text-6xl font-extrabold leading-none tabular-nums">
              {String(closedTrainingDays).padStart(2, "0")}
              <span className="text-[#686A60]">/{String(totalTrainingDays).padStart(2, "0")}</span>
            </p>
            <p className="mt-2 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#87877E]">
              Days intentionally closed
            </p>
            <div className="mt-5 h-1 bg-[#34362E]">
              <div
                className="h-full bg-[#B8CB70]"
                style={{ width: `${(closedTrainingDays / totalTrainingDays) * 100}%` }}
              />
            </div>
          </div>
        </section>

        <header className="grid gap-8 border-b border-[#C9C1AF] pb-8 sm:grid-cols-[0.72fr_1.28fr]">
          <div className="flex items-start justify-between gap-4 sm:flex-col">
            <p className="font-display text-7xl font-extrabold leading-none text-[#C9C1AF] sm:text-8xl">
              {meta.phaseNumber}
            </p>
            <div className="text-right sm:text-left">
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#5F6158]">
                {meta.phase}
              </p>
              <p className="mt-1 font-display text-2xl font-bold uppercase text-[#C83C24]">
                {meta.verb}
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-6xl font-extrabold uppercase leading-[0.86] tracking-[-0.035em] text-[#191A16] min-[390px]:text-7xl">
              {plan.name}
            </h2>
            <p className="mt-4 max-w-xl text-xl font-semibold leading-7 text-[#2B2D27]">
              {meta.lead}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#5B5D54]">
              {meta.description}
            </p>
          </div>
        </header>

        <section aria-labelledby="plan-rhythm-heading">
          <div className="grid gap-4 sm:grid-cols-[0.72fr_1.28fr] sm:items-end">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
                Sequence contract
              </p>
              <h2
                id="plan-rhythm-heading"
                className="mt-1 font-display text-4xl font-bold uppercase leading-none text-[#191A16]"
              >
                Nine slots. One order.
              </h2>
            </div>
            <p className="text-sm leading-6 text-[#5B5D54]">
              D1–D6 are training order, not weekdays. Recovery slots let the
              calendar breathe without changing what comes next.
            </p>
          </div>

          <div className="mt-5 border-y border-[#C9C1AF] py-5">
            <ContinuityRail
              items={rhythmItems}
              tone="paper"
              animate
              ariaLabel={`${plan.name} nine-slot training rhythm`}
            />
          </div>
        </section>

        <section className="grid gap-8 sm:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#5F6158]">
              At a glance
            </p>
            <dl className="mt-3 border-t border-[#C9C1AF]">
              {meta.facts.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-4 border-b border-[#C9C1AF] py-3"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#5F6158]">
                    {label}
                  </dt>
                  <dd className="font-display text-xl font-semibold text-[#191A16]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
              Working logic
            </p>
            <h2 className="mt-1 font-display text-4xl font-bold uppercase leading-none text-[#191A16]">
              {meta.principlesTitle}
            </h2>
            <ol className="mt-4 border-t border-[#C9C1AF]">
              {meta.principles.map(([title, body], index) => (
                <li
                  key={title}
                  className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-[#C9C1AF] py-4"
                >
                  <span className="font-display text-xl font-semibold text-[#C83C24]">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold leading-none text-[#191A16]">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5B5D54]">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cut-corner flex flex-col gap-4 border border-[#A9A292] bg-[#E4DECF] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[#C83C24]" aria-hidden="true" />
            <div>
              <h2 className="font-display text-2xl font-bold uppercase leading-none text-[#191A16]">
                Read the system
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#5B5D54]">
                RIR, progression, recovery, support work, and phase decisions live
                in the coach guide.
              </p>
            </div>
          </div>
          <Link
            to={`/plan/${plan.id}/guide`}
            className="inline-flex min-h-11 shrink-0 items-center justify-between gap-4 border-b-2 border-[#191A16] px-1 text-sm font-semibold text-[#191A16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
          >
            Open guide
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
