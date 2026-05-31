export default function CycleHeader({
  planName,
  cycleLabel,
  statusSummary,
  progressPercent = 0,
}) {
  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-semibold tracking-tight text-white">
          {planName}
        </h1>

        {cycleLabel ? (
          <p className="text-lg font-medium text-slate-300">{cycleLabel}</p>
        ) : null}
      </div>

      {statusSummary ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-slate-300">{statusSummary}</p>

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
