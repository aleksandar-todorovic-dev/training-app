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
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#747D84]">
            Flow
          </p>

          <h3 className="mt-0.5 text-base font-semibold tracking-tight text-[#F4F7F8]">
            Three quick steps
          </h3>
        </div>

        <p className="text-xs font-medium text-[#747D84]">Guidance only</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.014]">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`grid grid-cols-[1.9rem_1fr] gap-2.5 px-3 py-3 ${
              index > 0 ? "border-t border-white/7" : ""
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-300/24 bg-amber-300/8 text-xs font-semibold text-amber-200">
              {index + 1}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-[#F4F7F8]">
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
