import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function DayCard({
  planId,
  day,
  status,
  statusDetail,
  meta,
  mode = "upcoming",
}) {
  const isFinished = mode === "finished";

  return (
    <Link
      to={`/plan/${planId}/day/${day.id}`}
      className={[
        "group flex items-center gap-3 rounded-2xl border p-3.5 transition-colors",
        isFinished
          ? "border-emerald-900/35 bg-emerald-950/12 hover:border-emerald-800/50"
          : "border-white/10 bg-white/[0.032] hover:border-white/20",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
          isFinished
            ? "border border-emerald-800/35 bg-emerald-950/32 text-emerald-300/85"
            : "bg-white/[0.052] text-slate-200",
        ].join(" ")}
      >
        {isFinished ? (
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        ) : (
          day.label
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-100">
          {day.label} {day.name}
        </h3>

        <div className="mt-1 flex flex-col gap-0.5 text-sm font-medium leading-snug">
          <span className="text-slate-400">{status}</span>

          {statusDetail ? (
            <span className="text-slate-500">{statusDetail}</span>
          ) : null}
        </div>

        {meta ? (
          <p className="mt-1 line-clamp-1 text-sm text-slate-600">{meta}</p>
        ) : null}
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-slate-600 transition-colors group-hover:text-slate-300"
        aria-hidden="true"
      />
    </Link>
  );
}
