/**
 * Displays the ordered warm-up steps from static warm-up data.
 *
 * UI note:
 * Warm-up steps are guidance only. They are not checkable runtime tasks.
 */
export default function WarmupStepsCard({ steps }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[0.67rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
            Preparation flow
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-[-0.015em] text-[#E4E8E3]">
            Three quick steps
          </h3>
        </div>

        <p className="shrink-0 text-xs font-medium text-[#77818B]">
          Guidance only
        </p>
      </div>

      <div className="mt-4 border-y border-[#2A3138]">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 py-4 ${
              index > 0 ? "border-t border-[#2A3138]" : ""
            }`}
          >
            <span className="text-sm font-semibold tabular-nums text-[#F1B864]">
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-[#E4E8E3]">
                {step.title}
              </h4>

              <ul className="mt-2 space-y-2">
                {step.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm leading-6 text-[#AAB2BA]"
                  >
                    <span className="mt-[0.68rem] h-1 w-1 shrink-0 rounded-full bg-[#77818B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
