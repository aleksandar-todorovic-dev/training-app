import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function ExerciseListCard({
  planId,
  dayId,
  exercise,
  status,
  orderNumber,
  isNext = false,
}) {
  const targetRir = exercise.details?.targetRir;
  const isComplete = status === "Complete";
  const isPartial = status === "Partial";

  return (
    <Link
      to={`/plan/${planId}/day/${dayId}/exercise/${exercise.id}`}
      className={[
        "group flex items-center gap-3 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-white/3",
        isNext ? "bg-[#10292E]/28" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
          isNext
            ? "border-[#3FA8B6]/42 bg-[#10292E]/62 text-[#8FDCE5]"
            : isComplete
              ? "border-[#3FA8B6]/28 bg-[#10292E]/42 text-[#8FDCE5]"
              : isPartial
                ? "border-[#C9B57A]/28 bg-[#1D1C16]/50 text-[#D8C891]"
                : "border-white/10 bg-[#070A0B]/28 text-[#A9B0B5]",
        ].join(" ")}
      >
        {isComplete ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        ) : (
          orderNumber
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3
          className={[
            "line-clamp-1 text-[0.93rem] font-semibold leading-snug",
            isNext ? "text-[#F4F7F8]" : "text-[#D3D8DB]",
          ].join(" ")}
        >
          {exercise.name}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-xs font-medium leading-5 text-[#747D84]">
          {exercise.prescription}
          {targetRir ? ` · RIR ${targetRir}` : ""}
        </p>
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-[#59636B] transition-colors group-hover:text-[#8FDCE5]"
        aria-hidden="true"
      />
    </Link>
  );
}
