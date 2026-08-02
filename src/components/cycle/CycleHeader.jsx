export default function CycleHeader({
  planName,
  cycleLabel,
  closedCount = 0,
  totalCount = 6,
}) {
  const safeTotalCount = totalCount > 0 ? totalCount : 6;
  const safeClosedCount = Math.min(
    Math.max(closedCount, 0),
    safeTotalCount,
  );

  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.17em] text-[#77818B]">
            {planName}
          </p>

          <h1 className="mt-1.5 text-[2.45rem] font-semibold leading-none tracking-[-0.065em] text-[#F3F5F1]">
            {cycleLabel}
          </h1>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[1.85rem] font-semibold leading-none tracking-[-0.06em] text-[#DDE1DD] tabular-nums">
            {safeClosedCount}
            <span className="text-base font-medium tracking-normal text-[#77818B]">
              /{safeTotalCount}
            </span>
          </p>
          <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#77818B]">
            Days closed
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-6 gap-1.5"
        role="progressbar"
        aria-label="Training days closed"
        aria-valuemin={0}
        aria-valuemax={safeTotalCount}
        aria-valuenow={safeClosedCount}
      >
        {Array.from({ length: safeTotalCount }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-colors ${
              index < safeClosedCount ? "bg-[#79C89A]" : "bg-[#2A3138]"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </header>
  );
}
