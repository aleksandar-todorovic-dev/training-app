import SectionCard from "../layout/SectionCard";
import PrimaryButton from "../common/PrimaryButton";
import {
  UI_PILL_PRODUCT,
  UI_PILL_PRODUCT_ACCENT,
  UI_TEXT_MUTED_PRODUCT,
  UI_TITLE_PRODUCT,
} from "../../styles/ui";

const PLAN_CARD_META = {
  "bulk-pro": {
    badge: "Growth phase",
    promise: "Build size through repeatable volume and clear progression.",
    accentClassName: "bg-emerald-400",
  },
  "cut-pro": {
    badge: "Cut phase",
    promise: "Preserve strength while keeping fatigue under control.",
    accentClassName: "bg-lime-400",
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
  const meta = PLAN_CARD_META[plan.id] ?? {
    badge: "Structured plan",
    promise: plan.goal,
    accentClassName: "bg-emerald-400",
  };

  return (
    <SectionCard variant="product" className="overflow-hidden p-0">
      <div className={`h-1 ${meta.accentClassName}`} />

      <div className="flex flex-col gap-5 p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <span className={UI_PILL_PRODUCT_ACCENT}>{meta.badge}</span>
            <span className={UI_PILL_PRODUCT}>{plan.cycleLabel}</span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className={UI_TITLE_PRODUCT}>{plan.name}</h2>
            <p className="text-sm font-medium leading-6 text-zinc-800">
              {meta.promise}
            </p>
          </div>
        </div>

        <p className={UI_TEXT_MUTED_PRODUCT}>{plan.shortDescription}</p>

        <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Best for
          </p>
          <p className="mt-1 text-sm leading-6 text-zinc-700">
            {plan.audience}
          </p>
        </div>

        <PrimaryButton variant="product" to={`/plan/${plan.id}`}>
          View plan
        </PrimaryButton>
      </div>
    </SectionCard>
  );
}
