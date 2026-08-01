import { ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

function formatTargetRir(targetRir) {
  return targetRir ? targetRir.replace("≈", "").trim() : null;
}

export default function ExerciseListCard({
  planId,
  dayId,
  exercise,
  status,
  orderNumber,
  isNext = false,
  isLast = false,
}) {
  const targetRir = formatTargetRir(exercise.details?.targetRir);
  const isComplete = status === "Logged";
  const isPartial = status === "Partial";

  return (
    <Link
      to={`/plan/${planId}/day/${dayId}/exercise/${exercise.id}`}
      className={`group grid min-h-16 grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C] ${
        isNext ? "bg-[#24221C]" : ""
      }`}
      aria-label={`${orderNumber}. ${exercise.name}. ${status}${isNext ? ". Next exercise" : ""}`}
    >
      <div className="relative flex justify-center pt-4">
        <span
          className={`z-10 flex h-7 w-7 items-center justify-center border font-display text-sm font-bold tabular-nums ${
            isNext
              ? "border-[#FF795F] bg-[#FF5A3C] text-[#171814]"
              : isComplete
                ? "border-[#B8CB70] bg-[#B8CB70] text-[#171814]"
                : isPartial
                  ? "border-[#E5A13A] bg-[#E5A13A] text-[#171814]"
                  : "border-[#55574D] bg-[#1B1C17] text-[#AAA99F]"
          }`}
        >
          {isComplete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : orderNumber}
        </span>
        {!isLast ? (
          <span
            className={`absolute bottom-0 top-11 w-px ${
              isComplete ? "bg-[#6C7640]" : "bg-[#45473E]"
            }`}
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="border-t border-[#3B3D34] py-3.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="font-display text-xl font-semibold leading-none text-[#F2EEE4]">
            {exercise.name}
          </h3>
          <span
            className={`text-[0.62rem] font-semibold uppercase tracking-[0.12em] ${
              isNext
                ? "text-[#FF8B73]"
                : isComplete
                  ? "text-[#B8CB70]"
                  : isPartial
                    ? "text-[#E5A13A]"
                    : "text-[#87877E]"
            }`}
          >
            {isNext ? "Next" : status}
          </span>
        </div>
        <p className="mt-1 line-clamp-1 text-xs leading-5 text-[#87877E]">
          {exercise.prescription}
          {targetRir ? ` · RIR ${targetRir}` : ""}
        </p>
      </div>

      <ArrowUpRight
        className="mt-4 h-4 w-4 text-[#6E7067] transition-colors group-hover:text-[#FF8B73]"
        aria-hidden="true"
      />
    </Link>
  );
}
