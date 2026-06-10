import { CheckCircle2 } from "lucide-react";

export default function CycleHeader({
  planName,
  cycleLabel,
  statusSummary,
  progressPercent = 0,
}) {
  const safeProgressPercent = Math.min(Math.max(progressPercent, 0), 100);

  return (
    <header className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1">
        <h1 className="text-[2rem] font-semibold leading-none tracking-tight text-[#F4F7F8]">
          {planName}
        </h1>

        {cycleLabel ? (
          <p className="text-sm font-medium text-[#A9B0B5]">{cycleLabel}</p>
        ) : null}
      </div>

      {statusSummary ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-[#5EC7D5]/78"
              aria-hidden="true"
            />

            <p className="text-sm font-medium text-[#D3D8DB]">
              {statusSummary}
            </p>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#3FA8B6] transition-all"
              style={{ width: `${safeProgressPercent}%` }}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
