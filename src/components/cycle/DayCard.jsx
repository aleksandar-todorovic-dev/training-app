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
        "group relative overflow-hidden rounded-2xl border shadow-sm transition-colors",
        isFinished
          ? "border-[#24515A]/75 bg-[#0D2227] hover:border-[#3FA8B6]/60"
          : "border-white/8 bg-[#171C1F] hover:border-[#3FA8B6]/40",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-none absolute inset-y-0 left-0 w-1.5",
          isFinished ? "bg-[#3FA8B6]/55" : "bg-[#2A5962]",
        ].join(" ")}
        aria-hidden="true"
      />

      <div className="flex items-center gap-3 px-3 py-3.5">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold",
            isFinished
              ? "border border-[#3FA8B6]/35 bg-[#123039] text-[#8FDCE5]"
              : "border border-white/10 bg-white/4 text-[#E8ECEE]",
          ].join(" ")}
        >
          {isFinished ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            day.label
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-[1rem] font-semibold leading-snug text-[#F4F7F8]">
            {title}
          </h3>

          <p className="mt-1 line-clamp-1 text-sm font-medium text-[#A9B0B5]">
            {compactStatus}
          </p>

          {meta ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-[#747D84]">{meta}</p>
          ) : null}
        </div>

        <ChevronRight
          className="h-5 w-5 shrink-0 text-[#59636B] transition-colors group-hover:text-[#8FDCE5]"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
