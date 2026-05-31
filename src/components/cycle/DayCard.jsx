import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function DayCard({
  planId,
  day,
  status,
  meta,
  mode = "upcoming",
}) {
  const isFinished = mode === "finished";

  return (
    <Link
      to={`/plan/${planId}/day/${day.id}`}
      className={[
        "group flex items-center gap-4 rounded-2xl border p-4 transition-colors",
        isFinished
          ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-400/30"
          : "border-white/10 bg-white/4 hover:border-white/20",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
          isFinished
            ? "bg-emerald-500/15 text-emerald-200"
            : "bg-white/6 text-slate-200",
        ].join(" ")}
      >
        {isFinished ? (
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        ) : (
          day.label
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-semibold text-slate-100">
          {day.label} {day.name}
        </h3>

        <p className="mt-1 text-sm font-medium text-slate-400">{status}</p>

        {meta ? (
          <p className="mt-1 line-clamp-1 text-sm text-slate-500">{meta}</p>
        ) : null}
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-slate-500 transition-colors group-hover:text-slate-300"
        aria-hidden="true"
      />
    </Link>
  );
}
