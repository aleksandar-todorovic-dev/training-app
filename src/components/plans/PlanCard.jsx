import { Link } from "react-router-dom";
import { ArrowUpRight, TrendingDown, TrendingUp } from "lucide-react";

// Home-specific presentation metadata for plan cards.
// Static plan source data still comes from src/data/plans.
const PLAN_CARD_META = {
  "bulk-pro": {
    code: "BUILD / 01",
    badge: "Growth phase",
    promise: "Build muscle through repeatable volume and clear progression.",
    chips: ["Growth", "Progression", "Volume"],
    icon: TrendingUp,
    accentBar: "bg-[#B8F36B]",
    accentText: "text-[#C8F78F]",
    accentBorder: "border-[#B8F36B]/30",
    accentSoft: "bg-[#B8F36B]/[0.07]",
  },
  "cut-pro": {
    code: "PRESERVE / 02",
    badge: "Cut phase",
    promise: "Preserve strength while keeping fatigue under control.",
    chips: ["Retention", "Fatigue control", "Recovery aware"],
    icon: TrendingDown,
    accentBar: "bg-[#F1B864]",
    accentText: "text-[#F4C87F]",
    accentBorder: "border-[#F1B864]/30",
    accentSoft: "bg-[#F1B864]/[0.07]",
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
    <Link
      to={`/plan/${plan.id}`}
      className="group relative block overflow-hidden rounded-[1.35rem] border border-[#2A3138] bg-[#13181D] transition duration-150 ease-out hover:border-[#3A444E] hover:bg-[#151B20] active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1F4ED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E11] motion-reduce:transition-none motion-reduce:active:scale-100"
      aria-label={`View ${plan.name}`}
    >
      <div
        className={`absolute left-0 right-0 top-0 h-0.5 ${meta.accentBar}`}
        aria-hidden="true"
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-[0.65rem] font-bold uppercase tracking-[0.17em] ${meta.accentText}`}>
              {meta.code}
            </p>

            <h3 className="mt-2 text-[1.65rem] font-semibold leading-none tracking-[-0.05em] text-[#F3F5F1]">
              {plan.name}
            </h3>

            <p className="mt-2 max-w-[18rem] text-sm leading-5 text-[#AAB2BA]">
              {meta.promise}
            </p>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.accentBorder} ${meta.accentSoft} ${meta.accentText}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 border-y border-[#272E35]">
          {meta.chips.map((chip, index) => (
            <span
              key={chip}
              className={`flex min-h-12 items-center justify-center px-2 text-center text-[0.65rem] font-semibold uppercase leading-4 tracking-[0.08em] text-[#89949E] ${
                index > 0 ? "border-l border-[#272E35]" : ""
              }`}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#69747E]">
            {meta.badge}
          </span>

          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#F3F5F1]">
            View plan
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
