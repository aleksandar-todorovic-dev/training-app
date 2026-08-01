/**
 * Displays the ordered warm-up steps from static warm-up data.
 *
 * UI note:
 * Warm-up steps are informational only; they are not logged as runtime tasks.
 */
export default function WarmupStepsCard({ steps }) {
  return (
    <section aria-labelledby="warmup-flow-title">
      <div className="flex items-end justify-between gap-3 border-b border-[#C9C1AF] pb-2">
        <h3
          id="warmup-flow-title"
          className="font-display text-xl font-bold uppercase leading-none text-[#191A16]"
        >
          Three-step flow
        </h3>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#5F6158]">
          Guidance only
        </p>
      </div>

      <ol>
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 border-b border-[#D8D1C2] py-4"
          >
            <div className="flex h-8 w-8 items-center justify-center border border-[#B77A20] bg-[#E5A13A]/10 font-display text-sm font-bold text-[#7A4B09]">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-[#191A16]">
                {step.title}
              </h4>

              <ul className="mt-1.5 space-y-1.5">
                {step.items.map((item) => (
                  <li
                    key={item}
                    className="border-l border-[#C9C1AF] pl-2.5 text-sm leading-5 text-[#5F6158]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
