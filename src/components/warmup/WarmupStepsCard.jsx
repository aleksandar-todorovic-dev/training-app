import SectionCard from "../layout/SectionCard";
import { UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

/**
 * Displays the ordered warm-up steps from static warm-up data.
 *
 * UI note:
 * Warm-up steps are informational only; they are not logged as runtime tasks.
 */
export default function WarmupStepsCard({ steps }) {
  return (
    <SectionCard>
      <div className="divide-y divide-zinc-800">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={index === 0 ? "pb-4" : "py-4 last:pb-0"}
          >
            <div className={UI_STACK_MD}>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Step {index + 1}
                </p>

                <h2 className="text-base font-semibold text-zinc-100">
                  {step.title}
                </h2>
              </div>

              <ul className="space-y-2">
                {step.items.map((item) => (
                  <li
                    key={item}
                    className={`text-sm leading-relaxed ${UI_TEXT_MUTED}`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
