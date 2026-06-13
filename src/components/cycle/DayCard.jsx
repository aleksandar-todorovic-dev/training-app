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
        "group relative overflow-hidden rounded-xl border transition-colors",
        isFinished
          ? "border-white/7 bg-white/[0.018] hover:border-white/12"
          : "border-white/8 bg-[#171C1F]/72 hover:border-[#3FA8B6]/26",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold",
            isFinished
              ? "border border-white/8 bg-white/[0.026] text-[#A9B0B5]"
              : "border border-white/10 bg-white/4 text-[#E8ECEE]",
          ].join(" ")}
        >
          {isFinished ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            day.label
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={[
              "line-clamp-1 text-[1rem] font-semibold leading-snug",
              isFinished ? "text-[#D3D8DB]" : "text-[#F4F7F8]",
            ].join(" ")}
          >
            {title}
          </h3>

          <p className="mt-0.5 line-clamp-1 text-xs font-medium text-[#A9B0B5]">
            {compactStatus}
          </p>

          {meta ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-[#747D84]">{meta}</p>
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
