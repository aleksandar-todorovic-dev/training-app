import { CheckCircle2 } from "lucide-react";

export default function CycleHeader({
  planName,
  cycleLabel,
  statusSummary,
  progressPercent = 0,
}) {
  const safeProgressPercent = Math.min(Math.max(progressPercent, 0), 100);

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-5xl font-semibold tracking-tight text-white">
          {planName}
        </h1>

        {cycleLabel ? (
          <p className="text-lg font-medium text-slate-300">{cycleLabel}</p>
        ) : null}
      </div>

      {statusSummary ? (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3">
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-emerald-400/90"
              aria-hidden="true"
            />

            <p className="text-sm font-medium text-slate-300">
              {statusSummary}
            </p>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400/90 transition-all"
              style={{ width: `${safeProgressPercent}%` }}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}