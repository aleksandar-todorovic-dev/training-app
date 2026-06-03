import { ChevronDown } from "lucide-react";
import { useState } from "react";

/**
 * Displays compact day-level coaching guidance.
 *
 * Runtime note:
 * Session info is guidance only and does not affect completion.
 */
export default function SessionInfoCard({ sessionInfo, dayGoal, coreBlock }) {
  const [isOpen, setIsOpen] = useState(false);

  const hasAdvancedTechnique = sessionInfo.advancedTechniques !== "None";

  const notes = [
    {
      label: "Effort",
      value: sessionInfo.rirRule,
    },
    {
      label: hasAdvancedTechnique ? "Technique" : "Focus",
      value: hasAdvancedTechnique ? sessionInfo.advancedTechniques : dayGoal,
    },
  ];

  if (coreBlock) {
    notes.push({
      label: "Core",
      value: `${coreBlock.name} · Flexible block`,
    });
  }

  const helperText = coreBlock
    ? "Effort, technique, and core focus"
    : "Effort and technique focus";

  return (
    <div className="flex flex-col">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 rounded-2xl py-1.5 text-left"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-expanded={isOpen}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-[0.04em] text-[#D3D8DB]">
            Coach notes
          </p>

          <p className="mt-1 text-sm leading-6 text-[#747D84]">{helperText}</p>
        </div>

        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#8FDCE5]">
          {isOpen ? "Hide" : "View"}

          <ChevronDown
            className={[
              "h-4 w-4 text-[#59636B] transition-transform",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        </span>
      </button>

      {isOpen ? (
        <div className="mt-4 flex flex-col gap-4 rounded-3xl bg-white/[0.018] px-4 py-4">
          {notes.map((note) => (
            <div key={note.label} className="flex flex-col gap-1.5">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#747D84]">
                {note.label}
              </p>

              <p className="text-sm leading-6 text-[#A9B0B5]">{note.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
