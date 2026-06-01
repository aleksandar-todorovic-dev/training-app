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
    iconClassName: "border-[#3FA8B6]/22 bg-[#10292E]/78 text-[#8FDCE5]",
    chipClassName: "border-[#3FA8B6]/18 bg-[#10292E]/62 text-[#B9EEF4]",
  },
  "cut-pro": {
    badge: "Cut phase",
    promise: "Preserve strength while keeping fatigue under control.",
    chips: ["Retention", "Fatigue control", "Recovery aware"],
    icon: TrendingDown,
    accentClassName: "bg-[#C9B57A]",
    iconClassName: "border-[#4A4433]/80 bg-[#1D1C16]/82 text-[#C9B57A]",
    chipClassName: "border-[#4A4433]/72 bg-[#1D1C16]/72 text-[#D8C891]",
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
      className="group relative overflow-hidden border-white/10 bg-[#151A1D] p-0 shadow-[0_16px_38px_rgba(0,0,0,0.22)] transition-colors hover:border-[#3FA8B6]/28"
    >
      <div
        className={`pointer-events-none absolute left-5 right-5 top-4 h-1 rounded-full ${meta.accentClassName}`}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-5 px-5 pb-5 pt-9">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-3.5">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B949B]">
              {meta.badge}
            </span>

            <div className="flex flex-col gap-2.5">
              <h2 className="text-4xl font-semibold leading-none tracking-tight text-[#F4F7F8]">
                {plan.name}
              </h2>

              <p className="max-w-[18rem] text-base leading-7 text-[#A9B0B5]">
                {meta.promise}
              </p>
            </div>
          </div>

          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${meta.iconClassName}`}
          >
            <Icon className="h-7 w-7" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {meta.chips.map((chip) => (
            <span
              key={chip}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.chipClassName}`}
            >
              {chip}
            </span>
          ))}
        </div>

        <Link
          to={`/plan/${plan.id}`}
          className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#5EC7D5] px-4 text-sm font-semibold text-[#031014] shadow-[0_8px_20px_rgba(63,168,182,0.13)] transition-colors hover:bg-[#6DD6E2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC7D5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151A1D]"
        >
          View plan
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </SectionCard>
  );
}
