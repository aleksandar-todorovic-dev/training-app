import { Link } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";

export default function DayCard({
  planId,
  day,
  status,
  statusDetail,
  coreDetail,
  meta,
  mode = "upcoming",
  evidenceState = "upcoming",
}) {
  const isFinished = mode === "finished";
  const isPartial = evidenceState === "partial";
  const isComplete = evidenceState === "complete";
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
          isComplete
            ? "border-[#79C89A]/28 bg-[#79C89A]/[0.08] text-[#9BD8B1]"
            : "",
          isPartial
            ? "border-[#F1B864]/30 bg-[#F1B864]/[0.08] text-[#F4C87F]"
            : "",
          isFinished && !isComplete && !isPartial
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
          className={`mt-0.5 text-xs font-semibold leading-5 ${
            isPartial
              ? "text-[#D9B06F]"
              : isComplete
                ? "text-[#8FCDA6]"
                : "text-[#8D969E]"
          }`}
        >
          {compactStatus}
        </p>

        {coreDetail ? (
          <p className="mt-0.5 text-xs leading-5 text-[#C5C1E7]">{coreDetail}</p>
        ) : null}

        {meta ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-[#7E8994]">{meta}</p>
        ) : null}
      </div>

      <ChevronRight
        className="h-4.5 w-4.5 shrink-0 text-[#55616B] transition-transform transition-colors group-hover:translate-x-0.5 group-hover:text-[#AAB2BA] motion-reduce:transform-none"
        aria-hidden="true"
      />
    </Link>
  );
}
