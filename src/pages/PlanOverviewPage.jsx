import { createElement } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  CalendarClock,
  ChevronLeft,
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

import { getPlanById } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import {
  revealPanelVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "../styles/motion";
import {
  UI_TEXT_BODY,
  UI_TEXT_BODY_RELAXED,
  UI_TEXT_BODY_STRONG,
  UI_TEXT_CARD_TITLE,
  UI_TEXT_EYEBROW_ACCENT,
  UI_TEXT_SECTION_TITLE,
  UI_TEXT_STAT_VALUE,
} from "../styles/ui";

const MotionDiv = motion.div;
const MotionSection = motion.section;

// Screen-specific presentation metadata for the Phase 5 Plan Overview UI.
// This does not replace the static plan source data from src/data/plans.
const PLAN_OVERVIEW_META = {
  "bulk-pro": {
    eyebrow: "Plan overview",
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
  },

  "cut-pro": {
    eyebrow: "Plan overview",
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
  },
};

// Screen-specific rhythm labels.
// The base day data stays unchanged; this only improves Plan Overview display.
const RHYTHM_DAY_LABELS = {
  d1: "Chest",
  d2: "Back",
  d3: "Quads",
  d4: "Shoulders",
  d5: "Upper",
  d6: "Posterior",
};

function StatusRing({ value, total }) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const safeTotal = total > 0 ? total : 6;
  const clampedValue = Math.min(Math.max(value, 0), safeTotal);
  const progress = clampedValue / safeTotal;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg
      className="absolute right-4 top-7 h-[4.5rem] w-[4.5rem] text-[#5EC7D5]"
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Cycle progress: ${clampedValue} of ${safeTotal} training days closed`}
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(143,220,229,0.16)"
        strokeWidth="6"
      />

      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 50 50)"
        opacity={clampedValue === safeTotal ? "0.95" : "0.72"}
      />

      <text
        x="50"
        y="45"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#F4F7F8"
        fontSize="17"
        fontWeight="800"
        letterSpacing="-0.05em"
      >
        {clampedValue}/{safeTotal}
      </text>

      <text
        x="50"
        y="62"
        textAnchor="middle"
        dominantBaseline="central"
        fill="rgba(199,208,212,0.76)"
        fontSize="7"
        fontWeight="800"
        letterSpacing="0.1em"
      >
        DAYS
      </text>
    </svg>
  );
}

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

  // Status ring tracks closed training days only.
  // Core blocks and exercise completion quality do not affect this value
  const totalTrainingDays = days.length || 6;
  const closedTrainingDays = currentCycle
    ? days.filter((day) => currentCycle.dayLogs?.[day.id]?.finishedAt).length
    : 0;

  if (!plan) {
    return (
      <AppShell mode="training">
        <div className="flex flex-col gap-6">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#5EC7D5]/85 transition-colors hover:text-[#8FDCE5]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </Link>

          <section className="rounded-3xl border border-white/10 bg-[#151A1D] p-5">
            <h1 className="text-2xl font-semibold tracking-tight text-[#F4F7F8]">
              Plan not found
            </h1>
            <p className={`mt-2 ${UI_TEXT_BODY_RELAXED}`}>
              The selected plan could not be loaded. Return to Home and choose a
              valid plan.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  const meta = PLAN_OVERVIEW_META[plan.id] ?? PLAN_OVERVIEW_META["bulk-pro"];

  const primaryCta = getPrimaryCta({
    currentCycle,
    currentCycleNumber,
    plan,
    planId,
  });

  // Rest items are display-only rhythm markers.
  // They do not create rest-day routes, logs, or runtime state.
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

  // Only the "start" CTA creates runtime progress.
  // Continue/review navigation is handled by the route target only.
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
    <AppShell mode="training">
      <div className="relative isolate flex flex-col gap-5 py-0">
        <div
          className="pointer-events-none absolute -top-14 left-1/2 -z-10 h-52 w-52 -translate-x-1/2 rounded-full bg-[#3FA8B6]/5 blur-3xl"
          aria-hidden="true"
        />

        <header className="flex flex-col gap-4">
          <Link
            to="/"
            className="inline-flex self-start items-center gap-1.5 rounded-lg px-1 text-xs font-medium text-[#8B949B] transition-colors hover:text-[#D3D8DB]"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back
          </Link>

          <div className="flex flex-col gap-3">
            <p className={UI_TEXT_EYEBROW_ACCENT}>
              {meta.eyebrow}
            </p>

            <div className="flex flex-col gap-2.5">
              <h1 className="text-3xl font-semibold leading-none tracking-tight text-[#F4F7F8]">
                {meta.title}
              </h1>

              <div className="flex flex-col gap-1.5">
                <p className="max-w-sm text-base font-semibold leading-6 text-[#E7ECEE]">
                  {meta.lead}
                </p>
                <p className={`max-w-sm ${UI_TEXT_BODY_RELAXED}`}>
                  {meta.description}
                </p>
              </div>
            </div>
          </div>
        </header>

        <MotionSection
          className="overflow-hidden rounded-2xl border border-[#3FA8B6]/14 bg-[#10292E]/58 shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
          variants={revealPanelVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative flex flex-col gap-4 overflow-hidden p-4">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(95,199,213,0.08),transparent_34%),radial-gradient(circle_at_12%_100%,rgba(63,168,182,0.06),transparent_40%)]"
              aria-hidden="true"
            />

            <StatusRing value={closedTrainingDays} total={totalTrainingDays} />

            <div className="relative max-w-[70%]">
              <p className={UI_TEXT_EYEBROW_ACCENT}>
                {primaryCta.eyebrow}
              </p>

              <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#F4F7F8]">
                {primaryCta.title}
              </h2>

              <p className={`mt-1.5 ${UI_TEXT_BODY_STRONG}`}>
                {primaryCta.body}
              </p>

              <p className="mt-3 inline-flex rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs font-semibold text-[#D3D8DB]">
                {closedTrainingDays}/{totalTrainingDays} days closed
              </p>
            </div>

            <Link
              to={primaryCta.to}
              onClick={handlePrimaryCtaClick}
              className="relative inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5EC7D5] px-4 text-sm font-semibold text-[#031014] shadow-[0_8px_18px_rgba(63,168,182,0.13)] transition duration-150 ease-out hover:bg-[#6DD6E2] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC7D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#10292E] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              {primaryCta.label}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </MotionSection>

        <MotionSection
          className="overflow-hidden rounded-2xl border border-white/8 bg-[#12181B]/72"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {meta.facts.map(({ label, value, icon }) => (
            <MotionDiv
              key={label}
              className="flex items-center gap-3 border-b border-white/7 px-3 py-2.5 last:border-b-0"
              variants={staggerItemVariants}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/[0.026] text-[#8FDCE5]/62">
                {createElement(icon, {
                  className: "h-3 w-3",
                  "aria-hidden": "true",
                })}
              </div>

              <p className={`min-w-0 flex-1 font-medium ${UI_TEXT_BODY}`}>
                {label}
              </p>

              <p className={`shrink-0 ${UI_TEXT_STAT_VALUE}`}>
                {value}
              </p>
            </MotionDiv>
          ))}
        </MotionSection>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className={UI_TEXT_SECTION_TITLE}>
              Cycle rhythm
            </h2>
            <p className={UI_TEXT_BODY}>
              Your 9-day rhythm keeps the order stable while your schedule stays
              flexible.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-white/8 bg-[#12181B]/82 p-2">
            {rhythmItems.map((item) => {
              const isRest = item.label === "Rest";
              const rhythmLabel = isRest
                ? "Recovery"
                : (RHYTHM_DAY_LABELS[item.id] ?? item.name);

              return (
                <div
                  key={item.id}
                  className={[
                    "min-h-12 rounded-xl px-2 py-2",
                    isRest ? "bg-white/[0.016]" : "bg-white/[0.032]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={[
                        "text-xs font-semibold",
                        isRest ? "text-zinc-500" : "text-[#D3D8DB]",
                      ].join(" ")}
                    >
                      {item.label}
                    </p>

                    {isRest ? (
                      <Moon
                        className="h-3.5 w-3.5 shrink-0 text-zinc-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8FDCE5]/64"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <p
                    className={[
                      "mt-1 truncate text-xs font-medium leading-tight",
                      isRest ? "text-zinc-500" : "text-[#F4F7F8]",
                    ].join(" ")}
                  >
                    {rhythmLabel}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className={UI_TEXT_SECTION_TITLE}>
            {meta.principlesTitle}
          </h2>

          <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#151A1D]/86">
            {meta.principles.map(({ title, body, icon }, index) => (
              <div
                key={title}
                className={`relative flex items-center gap-3 p-3 ${
                  index > 0 ? "border-t border-[#272923]" : ""
                }`}
              >
                <div
                  className="absolute bottom-0 left-0 top-0 w-0.5 bg-[#B69D68]/18"
                  aria-hidden="true"
                />

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#4A4433]/80 bg-[#1D1C16]/80 text-[#C9B57A]/90">
                  {createElement(icon, {
                    className: "h-3.5 w-3.5",
                    "aria-hidden": "true",
                  })}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={UI_TEXT_CARD_TITLE}>
                    {title}
                  </p>
                  <p className={UI_TEXT_BODY}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/[0.026] text-[#8FDCE5]/70">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className={UI_TEXT_CARD_TITLE}>
                Coach guide
              </h2>
              <p className={UI_TEXT_BODY}>
                Learn how RIR, progression, recovery, and cycle structure work.
              </p>
            </div>
          </div>

          <Link
            to={`/plan/${plan.id}/guide`}
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#3FA8B6]/24 px-4 text-sm font-semibold text-[#8FDCE5]/84 transition-colors hover:bg-[#10292E]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC7D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151A1D]"
          >
            Open guide
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
