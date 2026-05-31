import { createElement } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Leaf,
  Moon,
  Repeat2,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import { getPlanById } from "../data/plans";
import { getDaysByPlanId } from "../data/days";
import { UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

const PLAN_OVERVIEW_META = {
  "bulk-pro": {
    eyebrow: "Plan overview",
    title: "Bulk Pro",
    lead: "Build muscle through repeatable volume.",
    description:
      "A structured 6-day cycle built for progression, productive workload, and clear next steps.",
    chips: [
      { label: "Growth", icon: ArrowUpRight },
      { label: "Progression", icon: TrendingUp },
      { label: "6 training days", icon: CalendarCheck },
      { label: "Cycle-based", icon: Repeat2 },
    ],
    statusAccentClassName: "text-emerald-700",
    ctaClassName:
      "bg-emerald-950 text-white hover:bg-emerald-900 focus-visible:ring-emerald-700",
    rhythmActiveClassName: "border-emerald-100 bg-emerald-50 text-emerald-950",
    rhythmIconClassName: "text-emerald-700",
    facts: [
      { label: "Training days", value: "6 days", icon: CalendarCheck },
      { label: "Rhythm", value: "2 on / 1 off", icon: BarChart3 },
      {
        label: "Previous values",
        value: "Saved",
        icon: TrendingUp,
      },
      { label: "Partial days", value: "Allowed", icon: ShieldCheck },
    ],
    principlesTitle: "How this plan works",
    principles: [
      {
        title: "Add reps first",
        body: "Progress inside the rep range before adding load.",
        icon: BarChart3,
      },
      {
        title: "Volume is planned",
        body: "The workload is structured so you can repeat it.",
        icon: Dumbbell,
      },
      {
        title: "Advanced methods are selective",
        body: "Only use them where the plan calls for them.",
        icon: Target,
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
    lead: "Preserve strength while fatigue is higher.",
    description:
      "A recovery-aware cut built to preserve strength, control fatigue, and keep momentum through real-life scheduling.",
    chips: [
      { label: "Recovery aware", icon: Leaf },
      { label: "Fast logging", icon: Zap },
      { label: "Previous values", icon: TrendingUp },
      { label: "Partial days allowed", icon: CalendarCheck },
    ],
    statusAccentClassName: "text-emerald-700",
    ctaClassName:
      "bg-emerald-950 text-white hover:bg-emerald-900 focus-visible:ring-emerald-700",
    rhythmActiveClassName: "border-emerald-100 bg-emerald-50 text-emerald-950",
    rhythmIconClassName: "text-emerald-700",
    facts: [
      { label: "Goal", value: "Retention", icon: Target },
      { label: "Focus", value: "Fatigue control", icon: BarChart3 },
      { label: "Mindset", value: "Hold strength", icon: ShieldCheck },
      { label: "Recovery", value: "Built in", icon: Leaf },
    ],
    principlesTitle: "Key rules",
    principles: [
      {
        title: "Keep reps clean and controlled.",
        body: "Quality over quantity always.",
        icon: Target,
      },
      {
        title: "Use partial days when needed.",
        body: "Progress beats perfection.",
        icon: CalendarCheck,
      },
      {
        title: "Maintaining strength is already a win.",
        body: "Protect what you have built.",
        icon: ShieldCheck,
      },
    ],
  },
};

const RHYTHM_DAY_LABELS = {
  d1: "Chest",
  d2: "Back",
  d3: "Quads",
  d4: "Shoulders",
  d5: "Pump",
  d6: "Posterior",
};

function StatusRing() {
  return (
    <svg
      className="pointer-events-none absolute right-5 top-10 h-20 w-20 text-emerald-700"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="200 28"
        transform="rotate(-70 50 50)"
        opacity="0.9"
      />
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
 * Runtime note:
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

  if (!plan) {
    return (
      <AppShell mode="product">
        <div className={UI_STACK_LG}>
          <BackButton variant="product" to="/">
            Back to Home
          </BackButton>

          <ScreenHeader
            variant="product"
            title="Plan not found"
            subtitle="The selected plan could not be loaded."
          />

          <SectionCard variant="product">
            <p className={UI_TEXT_MUTED}>
              Check the selected route or return to Home and choose a valid
              plan.
            </p>
          </SectionCard>
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
    <AppShell mode="product">
      <div className="flex flex-col gap-6 py-2">
        <header className="flex flex-col gap-4">
          <Link
            to="/"
            className="inline-flex self-start items-center gap-2 rounded-xl px-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
              {meta.eyebrow}
            </p>

            <div className="flex flex-col gap-3">
              <h1 className="text-5xl font-semibold leading-none tracking-tight text-zinc-950">
                {meta.title}
              </h1>

              <div className="flex flex-col gap-2">
                <p className="text-lg font-medium leading-7 text-zinc-700">
                  {meta.lead}
                </p>
                <p className="max-w-sm text-base leading-7 text-zinc-600">
                  {meta.description}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {meta.chips.map(({ label, icon }) => (
              <span
                key={label}
                className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  {createElement(icon, {
                    className: "h-3.5 w-3.5",
                    "aria-hidden": "true",
                  })}
                </span>
                <span className="leading-tight">{label}</span>
              </span>
            ))}
          </div>
        </header>

        <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-md">
          <div className="relative flex flex-col gap-5 overflow-hidden p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.16),transparent_34%),radial-gradient(circle_at_18%_92%,rgba(132,204,22,0.12),transparent_38%)]" />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/85 via-white/70 to-emerald-50/25" />
            <StatusRing />

            <div className="relative max-w-[70%]">
              <p
                className={`text-xs font-semibold uppercase tracking-[0.18em] ${meta.statusAccentClassName}`}
              >
                {primaryCta.eyebrow}
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                {primaryCta.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600">
                {primaryCta.body}
              </p>
            </div>

            <Link
              to={primaryCta.to}
              onClick={handlePrimaryCtaClick}
              className={`relative inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${meta.ctaClassName}`}
            >
              {primaryCta.label}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {meta.facts.map(({ label, value, icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  {createElement(icon, {
                    className: "h-3.5 w-3.5",
                    "aria-hidden": "true",
                  })}
                </div>

                <p className="text-xs font-medium leading-tight text-zinc-500">
                  {label}
                </p>
              </div>

              <p className="mt-3 text-base font-semibold leading-tight text-zinc-950">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
              Cycle rhythm
            </h2>
            <p className="text-sm leading-6 text-zinc-600">
              Your 9-day training rhythm keeps the plan moving in a fixed order.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {rhythmItems.map((item) => {
              const isRest = item.label === "Rest";
              const rhythmLabel = isRest
                ? item.name
                : (RHYTHM_DAY_LABELS[item.id] ?? item.name);
              const RhythmIcon = isRest ? Moon : Dumbbell;

              return (
                <div
                  key={item.id}
                  className={`flex min-h-20 flex-col justify-between rounded-2xl border p-2.5 text-center shadow-sm ${
                    isRest
                      ? "border-zinc-200 bg-zinc-50 text-zinc-500"
                      : meta.rhythmActiveClassName
                  }`}
                >
                  <p className="text-xs font-semibold">{item.label}</p>
                  <p className="text-sm font-medium leading-tight">
                    {rhythmLabel}
                  </p>

                  <div
                    className={`mx-auto flex h-6 w-6 items-center justify-center ${
                      isRest ? "text-zinc-500" : meta.rhythmIconClassName
                    }`}
                  >
                    <RhythmIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            {meta.principlesTitle}
          </h2>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {meta.principles.map(({ title, body, icon }, index) => (
              <div
                key={title}
                className={`flex items-center gap-3 p-4 ${
                  index > 0 ? "border-t border-zinc-100" : ""
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  {createElement(icon, {
                    className: "h-4 w-4",
                    "aria-hidden": "true",
                  })}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-zinc-950">{title}</p>
                  <p className="text-sm leading-5 text-zinc-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-100 bg-linear-to-br from-white to-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
              <BookOpen className="h-7 w-7" aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                Coach guide
              </h2>
              <p className="text-sm leading-6 text-zinc-600">
                Learn how RIR, progression, recovery, and cycle structure work.
              </p>
            </div>
          </div>

          <Link
            to={`/plan/${plan.id}/guide`}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-800 px-4 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Open guide
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
