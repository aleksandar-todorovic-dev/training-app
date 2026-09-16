import { Link } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";

function formatTargetRir(targetRir) {
  if (!targetRir) {
    return null;
  }

  return targetRir.replace("≈", "").trim();
}

function getStateLabel({ isNext, isComplete, isPartial }) {
  if (isNext) {
    return "Next";
  }

  if (isComplete) {
    return "Logged";
  }

  if (isPartial) {
    return "Partial";
  }

  return null;
}

/**
 * One ordered main-exercise row inside the Day workout flow.
 *
 * Runtime note:
 * This component only presents the already-derived exercise status and routes
 * to the Exercise screen. It does not create or mutate exercise logs.
 */
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
  const stateLabel = getStateLabel({ isNext, isComplete, isPartial });

  return (
    <Link
      to={`/plan/${planId}/day/${dayId}/exercise/${exercise.id}`}
      className={[
        "group relative flex min-h-16 items-center gap-3 px-3 py-3 transition-colors",
        !isLast ? "border-b border-[#2A3138]/75" : "",
        isNext
          ? "bg-[#B8F36B]/[0.055] hover:bg-[#B8F36B]/[0.085]"
          : "hover:bg-white/[0.025]",
      ].join(" ")}
    >
      {isNext ? (
        <span
          className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-[#B8F36B]"
          aria-hidden="true"
        />
      ) : null}

      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold tabular-nums",
          isNext
            ? "border-[#B8F36B]/32 bg-[#B8F36B]/10 text-[#C8F78F]"
            : isComplete
              ? "border-[#79C89A]/24 bg-[#79C89A]/8 text-[#9BD8B2]"
              : isPartial
                ? "border-[#F1B864]/26 bg-[#F1B864]/8 text-[#F4C87F]"
                : "border-[#2A3138] bg-[#0F1317] text-[#8C969F]",
        ].join(" ")}
      >
        {isComplete ? (
          <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
        ) : (
          orderNumber
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <h3
            className={[
              "min-w-0 text-[0.94rem] font-semibold leading-snug",
              isNext ? "text-[#F3F5F1]" : "text-[#D7DCDE]",
            ].join(" ")}
          >
            {exercise.name}
          </h3>

          {stateLabel ? (
            <span
              className={[
                "shrink-0 pt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.11em]",
                isNext
                  ? "text-[#C8F78F]"
                  : isComplete
                    ? "text-[#8FD0A8]"
                    : "text-[#F4C87F]",
              ].join(" ")}
            >
              {stateLabel}
            </span>
          ) : null}
        </div>

        <p className="mt-1 line-clamp-1 text-xs font-medium leading-5 text-[#77818B]">
          {exercise.prescription}
          {targetRir ? ` · RIR ${targetRir}` : ""}
        </p>
      </div>

      <ChevronRight
        className={[
          "h-4 w-4 shrink-0 transition-colors",
          isNext
            ? "text-[#B8F36B]/78 group-hover:text-[#C8F78F]"
            : "text-[#58626B] group-hover:text-[#AAB2BA]",
        ].join(" ")}
        aria-hidden="true"
      />
    </Link>
  );
}
