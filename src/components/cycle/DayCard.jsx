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
  const compactStatus = statusDetail ? `${status} · ${statusDetail}` : status;
  const title = isFinished ? `${day.label} ${day.name}` : day.name;

  return (
    <Link
      to={`/plan/${planId}/day/${day.id}`}
      className={[
        "group flex items-center gap-3 rounded-2xl border px-3 py-3 transition-colors",
        isFinished
          ? "border-emerald-900/30 bg-slate-900/45 hover:border-emerald-800/45"
          : "border-white/10 bg-slate-900/55 hover:border-white/20",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
          isFinished
            ? "border border-emerald-800/35 bg-emerald-950/28 text-emerald-300/85"
            : "bg-white/5.5 text-slate-200",
        ].join(" ")}
      >
        {isFinished ? (
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        ) : (
          day.label
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-[0.98rem] font-semibold leading-snug text-slate-100">
          {title}
        </h3>

        <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-400">
          {compactStatus}
        </p>

        {meta ? (
          <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{meta}</p>
        ) : null}
      </div>

      <ChevronRight
        className="h-5 w-5 shrink-0 text-slate-600 transition-colors group-hover:text-slate-300"
        aria-hidden="true"
      />
    </Link>
  );
}
