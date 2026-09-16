import { Link } from "react-router-dom";
import { Check, ChevronRight, ShieldCheck } from "lucide-react";

function getStatusLabel(status) {
  if (status === "Logged") {
    return "Logged";
  }

  if (status === "Partial") {
    return "Partial";
  }

  return "Flexible";
}

/**
 * Day-screen entry point for the separate Core support workflow.
 *
 * Runtime note:
 * Core status remains separate from the main exercise progress and this row
 * only routes to CorePage.
 */
export default function CoreBlockCard({
  planId,
  dayId,
  coreBlock,
  status,
  coreExerciseCount = 3,
}) {
  const isLogged = status === "Logged";
  const isPartial = status === "Partial";
  const statusLabel = getStatusLabel(status);

  return (
    <Link
      to={`/plan/${planId}/day/${dayId}/core/${coreBlock.id}`}
      className="group flex min-h-16 items-center gap-3 px-3 py-3 transition-colors hover:bg-[#A7A2D8]/[0.045]"
    >
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
          isLogged
            ? "border-[#79C89A]/24 bg-[#79C89A]/8 text-[#9BD8B2]"
            : isPartial
              ? "border-[#F1B864]/24 bg-[#F1B864]/8 text-[#F4C87F]"
              : "border-[#A7A2D8]/24 bg-[#A7A2D8]/8 text-[#C2BEE7]",
        ].join(" ")}
      >
        {isLogged ? (
          <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        ) : (
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h3 className="min-w-0 text-[0.94rem] font-semibold leading-snug text-[#D7DCDE]">
            {coreBlock.name}
          </h3>

          <span
            className={[
              "shrink-0 pt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.11em]",
              isLogged
                ? "text-[#8FD0A8]"
                : isPartial
                  ? "text-[#F4C87F]"
                  : "text-[#C2BEE7]",
            ].join(" ")}
          >
            {statusLabel}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-xs font-medium leading-5 text-[#77818B]">
          {coreExerciseCount} core exercises · Movable support block
        </p>
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-[#696783] transition-colors group-hover:text-[#C2BEE7]"
        aria-hidden="true"
      />
    </Link>
  );
}
