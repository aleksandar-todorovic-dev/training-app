import { Link } from "react-router-dom";
import { ChevronRight, TrendingDown, TrendingUp } from "lucide-react";

import SectionCard from "../layout/SectionCard";

// Home-specific presentation metadata for plan cards.
// Static plan source data still comes from src/data/plans.
const PLAN_CARD_META = {
  "bulk-pro": {
    badge: "Growth phase",
    promise: "Build muscle through repeatable volume and clear progression.",
    chips: ["Growth", "Progression", "Volume"],
    icon: TrendingUp,
    accentClassName: "bg-[#5EC7D5]",
    iconClassName: "border-[#3FA8B6]/18 bg-[#10292E]/48 text-[#8FDCE5]",
    chipClassName: "border-[#3FA8B6]/14 bg-[#10292E]/34 text-[#B9EEF4]",
  },
  "cut-pro": {
    badge: "Cut phase",
    promise: "Preserve strength while keeping fatigue under control.",
    chips: ["Retention", "Fatigue control", "Recovery aware"],
    icon: TrendingDown,
    accentClassName: "bg-[#C9B57A]",
    iconClassName: "border-[#4A4433]/72 bg-[#1D1C16]/58 text-[#C9B57A]",
    chipClassName: "border-[#4A4433]/60 bg-[#1D1C16]/44 text-[#D8C891]",
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
      variant="training"
      className="group relative overflow-hidden border-white/8 bg-[#12181B]/78 p-0 shadow-[0_10px_24px_rgba(0,0,0,0.14)] transition-colors hover:border-[#3FA8B6]/22"
    >
      <div
        className={`pointer-events-none absolute bottom-0 left-0 top-0 w-0.5 ${meta.accentClassName}`}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-3.5 px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-3">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#8B949B]">
              {meta.badge}
            </span>

            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold leading-none tracking-tight text-[#F4F7F8]">
                {plan.name}
              </h2>

              <p className="max-w-[18rem] text-sm leading-5 text-[#A9B0B5]">
                {meta.promise}
              </p>
            </div>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.iconClassName}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {meta.chips.map((chip) => (
            <span
              key={chip}
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.chipClassName}`}
            >
              {chip}
            </span>
          ))}
        </div>

        <Link
          to={`/plan/${plan.id}`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#5EC7D5] px-4 text-sm font-semibold text-[#031014] shadow-[0_6px_14px_rgba(63,168,182,0.1)] transition-colors hover:bg-[#6DD6E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC7D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151A1D]"
        >
          View plan
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </SectionCard>
  );
}
