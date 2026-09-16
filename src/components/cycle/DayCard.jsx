import { Link } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";

export default function DayCard({
  planId,
  day,
  status,
  statusDetail,
  meta,
  mode = "upcoming",
  evidenceState = "upcoming",
}) {
  const isFinished = mode === "finished";
  const isPartial = evidenceState === "partial";
  const isLogged = evidenceState === "logged";
  const compactStatus = statusDetail ? `${status} · ${statusDetail}` : status;
  const title = isFinished ? `${day.label} ${day.name}` : day.name;

  return (
    <Link
      to={`/plan/${planId}/day/${day.id}`}
      className="group flex min-h-[4.6rem] items-center gap-3 border-b border-[#2A3138] px-3.5 py-3 transition-colors last:border-b-0 hover:bg-[#171D22] focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8F36B]"
    >
      <div
        className={[
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold",
          isLogged
            ? "border-[#79C89A]/28 bg-[#79C89A]/[0.08] text-[#9BD8B1]"
            : "",
          isPartial
            ? "border-[#F1B864]/30 bg-[#F1B864]/[0.08] text-[#F4C87F]"
            : "",
          isFinished && !isLogged && !isPartial
            ? "border-[#3A434C] bg-[#171D22] text-[#8D969E]"
            : "",
          !isFinished
            ? "border-[#3A434C] bg-[#171D22] text-[#DDE1DD]"
            : "",
        ].join(" ")}
      >
        {isFinished ? (
          <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
        ) : (
          day.label
        )}

        {isPartial ? (
          <span
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#13181D] bg-[#F1B864]"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3
          className={`line-clamp-1 text-[0.98rem] font-semibold leading-snug tracking-[-0.02em] ${
            isFinished ? "text-[#D3D8D3]" : "text-[#F3F5F1]"
          }`}
        >
          {title}
        </h3>

        <p
          className={`mt-0.5 line-clamp-1 text-xs font-semibold ${
            isPartial
              ? "text-[#D9B06F]"
              : isLogged
                ? "text-[#8FCDA6]"
                : "text-[#8D969E]"
          }`}
        >
          {compactStatus}
        </p>

        {meta ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-[#68737D]">{meta}</p>
        ) : null}
      </div>

      <ChevronRight
        className="h-4.5 w-4.5 shrink-0 text-[#55616B] transition-transform transition-colors group-hover:translate-x-0.5 group-hover:text-[#AAB2BA] motion-reduce:transform-none"
        aria-hidden="true"
      />
    </Link>
  );
}
