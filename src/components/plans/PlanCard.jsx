import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp } from "lucide-react";

import SectionCard from "../layout/SectionCard";

const PLAN_CARD_META = {
  "bulk-pro": {
    badge: "Growth phase",
    promise: "Build momentum through repeatable volume and clear progression.",
    chips: ["Growth", "Progression", "Volume"],
    icon: TrendingUp,
    iconClassName: "bg-emerald-100 text-emerald-800",
    accentClassName: "bg-emerald-500",
    ctaClassName:
      "bg-emerald-950 text-white hover:bg-emerald-900 focus-visible:ring-emerald-700",
    chipClassName: "bg-emerald-50 text-emerald-800",
  },
  "cut-pro": {
    badge: "Cut phase",
    promise: "Preserve strength while keeping fatigue under control.",
    chips: ["Retention", "Fatigue control", "Recovery-aware"],
    icon: TrendingDown,
    iconClassName: "bg-amber-100 text-amber-800",
    accentClassName: "bg-amber-700",
    ctaClassName:
      "bg-amber-800 text-white hover:bg-amber-700 focus-visible:ring-amber-700",
    chipClassName: "bg-amber-50 text-amber-900",
  },
};

/**
 * Displays one predefined plan entry on the Home screen.
 *
 * UI note:
 * PlanCard uses static plan metadata only. Opening a plan does not start a
 * runtime cycle by itself.
 */
export default function PlanCard({ plan }) {
  const meta = PLAN_CARD_META[plan.id] ?? PLAN_CARD_META["bulk-pro"];
  const Icon = meta.icon;

  return (
    <SectionCard
      variant="product"
      className="overflow-hidden border-zinc-200/80 bg-white/95 p-0 shadow-md"
    >
      <div className={`h-1.5 ${meta.accentClassName}`} />

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {meta.badge}
          </span>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.iconClassName}`}
          >
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950">
            {plan.name}
          </h2>

          <p className="text-base leading-7 text-zinc-700">{meta.promise}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {meta.chips.map((chip) => (
            <span
              key={chip}
              className={`rounded-full px-3 py-1 text-xs font-medium ${meta.chipClassName}`}
            >
              {chip}
            </span>
          ))}
        </div>

        <Link
          to={`/plan/${plan.id}`}
          className={`inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${meta.ctaClassName}`}
        >
          View plan
        </Link>
      </div>
    </SectionCard>
  );
}
