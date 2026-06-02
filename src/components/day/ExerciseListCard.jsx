import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function getStatusClasses(status, isNext) {
  if (isNext) {
    return "border-[#3FA8B6]/30 bg-[#10292E]/70 text-[#B9EEF4]";
  }

  if (status === "Complete") {
    return "border-[#3FA8B6]/22 bg-[#10292E]/45 text-[#8FDCE5]";
  }

  if (status === "Partial") {
    return "border-[#C9B57A]/28 bg-[#1D1C16]/62 text-[#D8C891]";
  }

  return "border-white/10 bg-[#070A0B]/35 text-[#747D84]";
}

function getNumberClasses(status, isNext) {
  if (isNext) {
    return "border-[#3FA8B6]/42 bg-[#10292E]/72 text-[#B9EEF4]";
  }

  if (status === "Complete") {
    return "border-[#3FA8B6]/28 bg-[#10292E]/48 text-[#8FDCE5]";
  }

  if (status === "Partial") {
    return "border-[#C9B57A]/26 bg-[#1D1C16]/58 text-[#D8C891]";
  }

  return "border-white/10 bg-[#070A0B]/38 text-[#D3D8DB]";
}

export default function ExerciseListCard({
  planId,
  dayId,
  exercise,
  status,
  orderNumber,
  isNext = false,
}) {
  const targetRir = exercise.details?.targetRir;

  return (
    <Link
      to={`/plan/${planId}/day/${dayId}/exercise/${exercise.id}`}
      className={[
        "group flex items-center gap-3 border-b border-white/8 px-3 py-3 last:border-b-0 transition-colors hover:bg-white/3",
        isNext ? "bg-[#10292E]/32" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
          getNumberClasses(status, isNext),
        ].join(" ")}
      >
        {orderNumber}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-[#F4F7F8]">
          {exercise.name}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#8B949B]">
          {exercise.prescription}
          {targetRir ? ` · RIR ${targetRir}` : ""}
        </p>
      </div>

      <span
        className={[
          "hidden shrink-0 rounded-full border px-3 py-1 text-xs font-medium sm:inline-flex",
          getStatusClasses(status, isNext),
        ].join(" ")}
      >
        {isNext ? "Next" : status}
      </span>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-[#59636B] transition-colors group-hover:text-[#8FDCE5]"
        aria-hidden="true"
      />
    </Link>
  );
}
