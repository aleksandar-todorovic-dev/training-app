/**
 * Displays the ordered warm-up steps from static warm-up data.
 *
 * UI note:
 * Warm-up steps are informational only; they are not logged as runtime tasks.
 */
export default function WarmupStepsCard({ steps }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Flow
          </p>

          <h3 className="mt-0.5 text-base font-semibold tracking-tight text-zinc-100">
            Three quick steps
          </h3>
        </div>

        <p className="text-xs font-medium text-zinc-500">3-8 min</p>
      </div>

      <div className="flex flex-col">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="grid grid-cols-[1.75rem_1fr] gap-3 border-b border-zinc-800/60 py-2.5 first:pt-0 last:border-b-0 last:pb-0"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/24 bg-amber-300/7 text-xs font-semibold text-amber-200">
              {index + 1}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-zinc-100">
                {step.title}
              </h4>

              <ul className="mt-1.5 space-y-1">
                {step.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-5 text-zinc-400"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
