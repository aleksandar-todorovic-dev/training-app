import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function getStatusClasses(status, isNext) {
  if (isNext) {
    return "border-emerald-800/40 bg-emerald-950/35 text-emerald-200";
  }

  if (status === "Complete") {
    return "border-emerald-800/35 bg-emerald-950/25 text-emerald-200";
  }

  if (status === "Partial") {
    return "border-amber-800/35 bg-amber-950/20 text-amber-100";
  }

  return "border-white/10 bg-slate-950/35 text-slate-400";
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
        "group flex items-center gap-3 border-b border-white/7 px-3 py-3 last:border-b-0 transition-colors hover:bg-white/3",
        isNext ? "bg-emerald-950/18" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
          isNext
            ? "border-emerald-700/50 bg-emerald-950/35 text-emerald-200"
            : "border-white/10 bg-slate-950/45 text-slate-300",
        ].join(" ")}
      >
        {orderNumber}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-100">
          {exercise.name}
        </h3>

        <p className="mt-0.5 line-clamp-1 text-xs font-medium text-slate-400">
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
        className="h-5 w-5 shrink-0 text-slate-600 transition-colors group-hover:text-slate-300"
        aria-hidden="true"
      />
    </Link>
  );
}
