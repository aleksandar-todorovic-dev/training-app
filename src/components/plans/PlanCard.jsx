import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const PLAN_CARD_META = {
  "bulk-pro": {
    index: "01",
    phase: "Growth phase",
    promise: "Repeatable volume with a clear progression path.",
    signal: "Build",
    details: ["6 training days", "Productive workload", "Selective intensity"],
  },
  "cut-pro": {
    index: "02",
    phase: "Cut phase",
    promise: "Strength retention with recovery-aware fatigue control.",
    signal: "Preserve",
    details: ["6 training days", "Fatigue control", "Recovery protected"],
  },
};

/** Plan selection is static navigation; it never starts runtime progress. */
export default function PlanCard({ plan }) {
  const meta = PLAN_CARD_META[plan.id] ?? PLAN_CARD_META["bulk-pro"];

  return (
    <article className="group flex min-h-[23rem] flex-col bg-[#F8F5EB] p-5 transition-colors hover:bg-[#F2EDDF]">
      <div className="flex items-start justify-between gap-4">
        <span className="font-display text-5xl font-bold leading-none text-[#C9C1AF]">
          {meta.index}
        </span>
        <span className="border-b border-[#C9C1AF] pb-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#5F6158]">
          {meta.phase}
        </span>
      </div>

      <div className="mt-8">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
          {meta.signal}
        </p>
        <h3 className="mt-2 font-display text-5xl font-extrabold uppercase leading-none tracking-[-0.025em] text-[#191A16]">
          {plan.name}
        </h3>
        <p className="mt-3 max-w-xs text-base leading-6 text-[#4E5048]">
          {meta.promise}
        </p>
      </div>

      <ul className="mt-7 border-t border-[#C9C1AF]">
        {meta.details.map((detail, index) => (
          <li
            key={detail}
            className="flex items-center gap-3 border-b border-[#D7D0C0] py-2.5 text-sm text-[#5B5D54]"
          >
            <span className="font-display text-base font-semibold tabular-nums text-[#6F7068]">
              0{index + 1}
            </span>
            {detail}
          </li>
        ))}
      </ul>

      <Link
        to={`/plan/${plan.id}`}
        className="cut-corner-sm mt-auto inline-flex min-h-12 items-center justify-between border border-[#191A16] bg-[#191A16] px-4 text-sm font-semibold text-[#F8F5EB] transition-colors hover:bg-[#34362E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F5EB]"
      >
        View plan
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
