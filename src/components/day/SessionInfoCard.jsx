import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Compact disclosure for day-level coaching guidance.
 *
 * Runtime note:
 * Session information is guidance only and does not affect workout state.
 */
export default function SessionInfoCard({ sessionInfo, dayGoal, coreBlock }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  const hasAdvancedTechnique = sessionInfo.advancedTechniques !== "None";

  const notes = [
    {
      label: "Effort",
      value: sessionInfo.rirRule,
    },
    {
      label: hasAdvancedTechnique ? "Method" : "Focus",
      value: hasAdvancedTechnique ? sessionInfo.advancedTechniques : dayGoal,
    },
  ];

  if (coreBlock) {
    notes.push({
      label: "Support",
      value: `${coreBlock.name} is a flexible block and stays separate from main-day completion.`,
    });
  }

  const helperText = coreBlock
    ? "Effort, method, and support context"
    : "Effort and execution context";

  return (
    <section className="border-y border-[#2A3138]/75 py-3">
      <button
        type="button"
        className="group flex min-h-12 w-full items-center justify-between gap-4 text-left"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#DCE1E2]">Coach notes</p>
          <p className="mt-0.5 text-xs leading-5 text-[#77818B]">
            {helperText}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#AAB2BA] transition-colors group-hover:text-[#F3F5F1]">
          {isOpen ? "Hide" : "View"}
          <ChevronDown
            className={[
              "h-4 w-4 text-[#68727B] transition-transform",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen ? (
        <div id={contentId} className="mt-3 border-t border-[#2A3138]/65 pt-1">
          {notes.map((note, index) => (
            <div
              key={note.label}
              className={[
                "grid grid-cols-[4.25rem_1fr] gap-3 py-3",
                index < notes.length - 1 ? "border-b border-[#2A3138]/55" : "",
              ].join(" ")}
            >
              <p className="pt-0.5 text-[0.64rem] font-semibold uppercase tracking-[0.11em] text-[#77818B]">
                {note.label}
              </p>
              <p className="text-sm leading-5 text-[#AAB2BA]">{note.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
