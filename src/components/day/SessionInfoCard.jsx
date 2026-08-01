import { useState } from "react";

/** Guidance-only day annotations; no runtime state is stored here. */
export default function SessionInfoCard({ sessionInfo, dayGoal, coreBlock }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasAdvancedTechnique = sessionInfo.advancedTechniques !== "None";
  const notes = [
    ["Effort", sessionInfo.rirRule],
    [hasAdvancedTechnique ? "Method" : "Focus", hasAdvancedTechnique ? sessionInfo.advancedTechniques : dayGoal],
  ];

  if (coreBlock) notes.push(["Core branch", `${coreBlock.name} · Flexible support work`]);

  return (
    <section className="border-y border-[#3B3D34]">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
      >
        <div>
          <p className="font-display text-xl font-semibold leading-none text-[#F2EEE4]">
            Session annotations
          </p>
          <p className="mt-1 text-xs leading-5 text-[#87877E]">
            Effort, method{coreBlock ? ", and support branch" : ""}
          </p>
        </div>
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[#FF8B73]">
          {isOpen ? "Close" : "Read"}
        </span>
      </button>

      {isOpen ? (
        <dl className="border-t border-[#3B3D34] pb-2">
          {notes.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[5rem_1fr] gap-3 border-b border-[#303229] py-3 last:border-b-0">
              <dt className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#87877E]">
                {label}
              </dt>
              <dd className="text-sm leading-6 text-[#C8C5BB]">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
