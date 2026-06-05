/**
 * Displays the ordered warm-up steps from static warm-up data.
 *
 * UI note:
 * Warm-up steps are informational only; they are not logged as runtime tasks.
 */
export default function WarmupStepsCard({ steps }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Flow
          </p>

          <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-100">
            Three quick steps
          </h3>
        </div>

        <p className="text-xs font-medium text-zinc-500">3-8 min</p>
      </div>

      <div className="flex flex-col">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="grid grid-cols-[2rem_1fr] gap-3 border-b border-zinc-800/70 py-3.5 first:pt-0 last:border-b-0 last:pb-0"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/8 text-xs font-semibold text-amber-200 shadow-[0_0_18px_rgba(252,211,77,0.08)]">
              {index + 1}
            </div>

            <div className="min-w-0">
              <h4 className="text-base font-semibold text-zinc-100">
                {step.title}
              </h4>

              <ul className="mt-2 space-y-1.5">
                {step.items.map((item) => (
                  <li
                    key={item}
                    className="text-sm leading-relaxed text-zinc-400"
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