import { useState } from "react";
import SectionCard from "../layout/SectionCard";
import { UI_TEXT_MUTED } from "../../styles/ui";

export default function ExerciseDetailsToggle({ details }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!details) {
    return null;
  }

  const { progression, advancedTechnique, extraCues = [] } = details;

  const hasExtraDetails =
    Boolean(progression) || Boolean(advancedTechnique) || extraCues.length > 0;

  return (
    <SectionCard>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <span className="text-sm font-semibold text-zinc-100">
            View details
          </span>
          <span className="text-sm text-zinc-300">{isOpen ? "▲" : "▼"}</span>
        </button>

        {isOpen && (
          <div className="space-y-4">
            {hasExtraDetails ? (
              <>
                {progression && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-zinc-100">
                      Progression
                    </h3>
                    <p className={UI_TEXT_MUTED}>{progression}</p>
                  </div>
                )}

                {advancedTechnique && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-zinc-100">
                      Advanced technique
                    </h3>
                    <p className={UI_TEXT_MUTED}>{advancedTechnique}</p>
                  </div>
                )}

                {extraCues.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-zinc-100">
                      Extra cues
                    </h3>
                    <ul className="space-y-1">
                      {extraCues.map((cue) => (
                        <li key={cue} className={UI_TEXT_MUTED}>
                          - {cue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className={UI_TEXT_MUTED}>
                No extra details added for this exercise yet.
              </p>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
