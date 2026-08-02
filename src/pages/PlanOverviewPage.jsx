import { createElement } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  ChevronRight,
  Dumbbell,
  Gauge,
  History,
  Leaf,
  Moon,
  Repeat2,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Zap,
} from "lucide-react";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import BackControl from "../components/common/BackControl";
import GuardState from "../components/common/GuardState";
import { getPlanById } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import { revealPanelVariants } from "../styles/motion";

const MotionSection = motion.section;

// Screen-specific presentation metadata. Static plan source data remains in
// src/data/plans; these values only shape the overview presentation.
const PLAN_OVERVIEW_META = {
  "bulk-pro": {
    eyebrow: "Build phase",
    title: "Bulk Pro",
    lead: "Build muscle through repeatable volume.",
    description:
      "A progression-focused bulk built for repeatable volume, productive workload, and clear next steps.",
    chips: [
      { label: "Growth", icon: ArrowUpRight },
      { label: "Progression", icon: TrendingUp },
      { label: "6 training days", icon: CalendarCheck },
      { label: "Cycle-based", icon: Repeat2 },
    ],
    facts: [
      { label: "Training days", value: "6 days", icon: CalendarCheck },
      { label: "Rhythm", value: "2 on, 1 rest", icon: Repeat2 },
      { label: "Previous values", value: "Saved", icon: History },
      { label: "Partial days", value: "Allowed", icon: CalendarClock },
    ],
    principlesTitle: "How this plan works",
    principles: [
      {
        title: "Add reps first",
        body: "Progress inside the rep range before adding load.",
        icon: TrendingUp,
      },
      {
        title: "Volume is planned",
        body: "The workload is structured so you can repeat it.",
        icon: Dumbbell,
      },
      {
        title: "Advanced methods are selective",
        body: "Only use them where the plan calls for them.",
        icon: SlidersHorizontal,
      },
      {
        title: "Rest days matter",
        body: "Recovery is built into the cycle, not left to chance.",
        icon: Moon,
      },
    ],
    accentText: "text-[#C8F78F]",
    accentMutedText: "text-[#A7C97C]",
    accentBg: "bg-[#B8F36B]",
    accentSoft: "bg-[#B8F36B]/[0.07]",
    accentBorder: "border-[#B8F36B]/28",
    focusRing: "focus-visible:ring-[#B8F36B]",
  },

  "cut-pro": {
    eyebrow: "Cut phase",
    title: "Cut Pro",
    lead: "Preserve strength while managing fatigue.",
    description:
      "A recovery-aware cut built to preserve strength, control fatigue, and keep momentum through real-life scheduling.",
    chips: [
      { label: "Recovery aware", icon: Leaf },
      { label: "Fast logging", icon: Zap },
      { label: "Previous values", icon: History },
      { label: "Partial days allowed", icon: CalendarClock },
    ],
    facts: [
      { label: "Goal", value: "Retention", icon: ShieldCheck },
      { label: "Focus", value: "Fatigue control", icon: Gauge },
      { label: "Mindset", value: "Hold strength", icon: Dumbbell },
      { label: "Recovery", value: "Built in", icon: Leaf },
    ],
    principlesTitle: "Key rules",
    principles: [
      {
        title: "Keep reps clean and controlled.",
        body: "Quality over quantity always.",
        icon: SlidersHorizontal,
      },
      {
        title: "Use partial days when needed.",
        body: "Progress beats perfection.",
        icon: CalendarClock,
      },
      {
        title: "Maintaining strength is already a win.",
        body: "Protect what you have built.",
        icon: ShieldCheck,
      },
    ],
    accentText: "text-[#F4C87F]",
    accentMutedText: "text-[#CDA869]",
    accentBg: "bg-[#F1B864]",
    accentSoft: "bg-[#F1B864]/[0.07]",
    accentBorder: "border-[#F1B864]/28",
    focusRing: "focus-visible:ring-[#F1B864]",
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

function getPrimaryCta({ currentCycle, currentCycleNumber, plan, planId }) {
  if (!currentCycle) {
    return {
      mode: "start",
      eyebrow: "Current status",
      title: "Ready to start?",
      body: "Start your first cycle and follow the plan day by day.",
      label: currentCycleNumber ? "Start cycle" : "Start Cycle 1",
      to: plan ? `/plan/${plan.id}/cycle` : `/plan/${planId}/cycle`,
    };
  }

  if (currentCycle.completedAt) {
    return {
      mode: "review",
      eyebrow: "Current status",
      title: `Cycle ${currentCycleNumber} complete`,
      body: "Review your completed cycle before starting the next one.",
      label: "Review cycle",
      to: plan ? `/plan/${plan.id}/end-cycle` : `/plan/${planId}/end-cycle`,
    };
  }

  return {
    mode: "continue",
    eyebrow: "Current status",
    title: `Cycle ${currentCycleNumber} in progress`,
    body: "Continue from your current training day and keep the cycle moving.",
    label: "Continue cycle",
    to: plan ? `/plan/${plan.id}/cycle` : `/plan/${planId}/cycle`,
  };
}

function CycleProgress({ value, total, meta }) {
  const safeTotal = total > 0 ? total : 6;
  const clampedValue = Math.min(Math.max(value, 0), safeTotal);

  return (
    <div
      className="mt-4"
      role="progressbar"
      aria-label="Cycle progress"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={clampedValue}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[#7E8994]">Training days closed</p>
        <p className="text-xs font-bold tabular-nums text-[#DDE1DD]">
          {clampedValue}/{safeTotal}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1.5" aria-hidden="true">
        {Array.from({ length: safeTotal }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full ${
              index < clampedValue ? meta.accentBg : "bg-[#2A3138]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Page-level overview for one predefined plan.
 *
 * Runtime boundary:
 * This page decides whether the primary action should start, continue, or
 * review a cycle. Starting a cycle is the only action here that writes runtime
 * state.
 */
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

  const totalTrainingDays = days.length || 6;
  const closedTrainingDays = currentCycle
    ? days.filter((day) => currentCycle.dayLogs?.[day.id]?.finishedAt).length
    : 0;

  if (!plan) {
    return (
      <GuardState
        eyebrow="Plan unavailable"
        title="This training plan could not be loaded."
        description="Return home and choose one of the current structured plans to continue."
        primaryTo="/"
        primaryLabel="Back to home"
      />
    );
  }

  const meta = PLAN_OVERVIEW_META[plan.id] ?? PLAN_OVERVIEW_META["bulk-pro"];

  const primaryCta = getPrimaryCta({
    currentCycle,
    currentCycleNumber,
    plan,
    planId,
  });

  const rhythmItems = [
    days[0],
    days[1],
    { id: "rest-1", label: "Rest", name: "Recovery" },
    days[2],
    days[3],
    { id: "rest-2", label: "Rest", name: "Recovery" },
    days[4],
    days[5],
    { id: "rest-3", label: "Rest", name: "Recovery" },
  ].filter(Boolean);

  const rhythmGroups = [
    rhythmItems.slice(0, 3),
    rhythmItems.slice(3, 6),
    rhythmItems.slice(6, 9),
  ];

  function handlePrimaryCtaClick() {
    if (primaryCta.mode !== "start") {
      return;
    }

    dispatch({
      type: APP_ACTIONS.START_PLAN_CYCLE,
      payload: {
        planId: plan.id,
        startedAt: new Date().toISOString(),
      },
    });
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-7 pb-1">
        <header>
          <BackControl to="/">Back to home</BackControl>

          <div className="mt-4">
            <p className={`text-[0.68rem] font-bold uppercase tracking-[0.18em] ${meta.accentText}`}>
              {meta.eyebrow}
            </p>

            <h1 className="mt-2 text-[2.8rem] font-semibold leading-none tracking-[-0.075em] text-[#F3F5F1]">
              {meta.title}
            </h1>

            <p className="mt-3 text-base font-semibold leading-6 text-[#DDE1DD]">
              {meta.lead}
            </p>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-[#AAB2BA]">
              {meta.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
              {meta.chips.map(({ label }, index) => (
                <span key={label} className="inline-flex items-center gap-2">
                  {index > 0 ? (
                    <span className="h-1 w-1 rounded-full bg-[#46515B]" aria-hidden="true" />
                  ) : null}
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#7E8994]">
                    {label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </header>

        <MotionSection
          className="relative overflow-hidden rounded-[1.45rem] border border-[#303841] bg-[#13181D]"
          variants={revealPanelVariants}
          initial="hidden"
          animate="visible"
        >
          <div
            className={`absolute left-0 right-0 top-0 h-0.5 ${meta.accentBg}`}
            aria-hidden="true"
          />

          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.17em] text-[#7E8994]">
                  {primaryCta.eyebrow}
                </p>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] text-[#F3F5F1]">
                  {primaryCta.title}
                </h2>
                <p className="mt-1.5 text-sm leading-5 text-[#AAB2BA]">
                  {primaryCta.body}
                </p>
              </div>

              <div className={`shrink-0 rounded-xl border px-3 py-2 text-center ${meta.accentBorder} ${meta.accentSoft}`}>
                <p className={`text-2xl font-semibold leading-none tracking-[-0.06em] ${meta.accentText}`}>
                  {closedTrainingDays}
                </p>
                <p className="mt-1 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#74808A]">
                  of {totalTrainingDays}
                </p>
              </div>
            </div>

            <CycleProgress
              value={closedTrainingDays}
              total={totalTrainingDays}
              meta={meta}
            />

            <Link
              to={primaryCta.to}
              onClick={handlePrimaryCtaClick}
              className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-[#0A0D10] transition duration-150 ease-out hover:brightness-105 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#13181D] motion-reduce:transition-none motion-reduce:active:scale-100 ${meta.accentBg} ${meta.focusRing}`}
            >
              {primaryCta.label}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </MotionSection>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-[#7E8994]">
                Plan contract
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#F3F5F1]">
                What this phase asks from you.
              </h2>
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-2 border-y border-[#2A3138]">
            {meta.facts.map(({ label, value, icon }, index) => (
              <div
                key={label}
                className={`min-h-24 px-3 py-3 ${
                  index % 2 === 1 ? "border-l border-[#2A3138]" : ""
                } ${index > 1 ? "border-t border-[#2A3138]" : ""}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${meta.accentBorder} ${meta.accentSoft} ${meta.accentMutedText}`}>
                  {createElement(icon, {
                    className: "h-3.5 w-3.5",
                    "aria-hidden": "true",
                  })}
                </div>
                <dt className="mt-3 text-xs font-medium text-[#7E8994]">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-[#E2E6E1]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-[#7E8994]">
            Cycle rhythm
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#F3F5F1]">
            Two sessions. One recovery slot. Repeat.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#AAB2BA]">
            Your 9-day rhythm keeps the order stable while your schedule stays
            flexible. D1-D6 show the workout order, not days of the week. If
            your schedule shifts, continue with the next planned workout.
          </p>

          <div className="mt-4 flex flex-col gap-2.5">
            {rhythmGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="grid grid-cols-[3.4rem_1fr] items-stretch gap-2">
                <div className="flex items-center justify-center border-r border-[#2A3138] pr-2">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#59646E]">
                    Block {groupIndex + 1}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {group.map((item) => {
                    const isRest = item.label === "Rest";
                    const rhythmLabel = isRest
                      ? "Recovery"
                      : (RHYTHM_DAY_LABELS[item.id] ?? item.name);

                    return (
                      <div
                        key={item.id}
                        className={`min-h-[4.25rem] rounded-xl border px-2 py-2.5 ${
                          isRest
                            ? "border-[#242B32] bg-[#101419]"
                            : `${meta.accentBorder} ${meta.accentSoft}`
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <p className={`text-xs font-bold ${isRest ? "text-[#69747E]" : meta.accentText}`}>
                            {item.label}
                          </p>
                          {isRest ? (
                            <Moon className="h-3 w-3 text-[#59646E]" aria-hidden="true" />
                          ) : (
                            <span className={`h-1.5 w-1.5 rounded-full ${meta.accentBg}`} aria-hidden="true" />
                          )}
                        </div>
                        <p className={`mt-1.5 truncate text-[0.68rem] font-semibold leading-tight ${isRest ? "text-[#69747E]" : "text-[#DDE1DD]"}`}>
                          {rhythmLabel}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-[#7E8994]">
            Operating rules
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.035em] text-[#F3F5F1]">
            {meta.principlesTitle}
          </h2>

          <div className="mt-3 border-y border-[#2A3138]">
            {meta.principles.map(({ title, body, icon }, index) => (
              <div
                key={title}
                className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-[#232A31] py-4 last:border-b-0"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className={`text-[0.65rem] font-bold tabular-nums ${meta.accentText}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#2A3138] text-[#8E99A4]">
                    {createElement(icon, {
                      className: "h-3.5 w-3.5",
                      "aria-hidden": "true",
                    })}
                  </span>
                </div>

                <div className="min-w-0 pt-0.5">
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-[#E5E8E3]">
                    {title}
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-[#929CA6]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Link
          to={`/plan/${plan.id}/guide`}
          className={`group flex items-center gap-3 border-y border-[#2A3138] py-4 transition-colors hover:bg-white/[0.018] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E11] ${meta.focusRing}`}
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.accentBorder} ${meta.accentSoft} ${meta.accentText}`}>
            <BookOpen className="h-4 w-4" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-[#E5E8E3]">Coach guide</h2>
            <p className="mt-0.5 text-sm leading-5 text-[#929CA6]">
              Learn how RIR, progression, recovery, and cycle structure work.
            </p>
          </div>

          <ChevronRight
            className="h-4 w-4 shrink-0 text-[#66717C] transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </div>
    </AppShell>
  );
}
