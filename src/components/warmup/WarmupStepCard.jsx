import SectionCard from "../layout/SectionCard";
import { UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

export default function WarmupStepCard({ step, stepNumber }) {
  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <div className="flex items-start justify-between gap-4">
          <div className={UI_STACK_MD}>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Step {stepNumber}
            </p>

            <h2 className="text-base font-semibold text-zinc-100">
              {step.title}
            </h2>
          </div>
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
    </SectionCard>
  );
}
