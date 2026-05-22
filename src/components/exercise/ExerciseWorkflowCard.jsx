import { useState } from "react";

import SectionCard from "../layout/SectionCard";
import PrimaryButton from "../common/PrimaryButton";
import HelpSheet from "../common/HelpSheet";
import SetRow from "./SetRow";
import {
  exerciseHelp,
  advancedTechniqueHelpByType,
} from "../../data/contextualHelp";
import { UI_TEXT_MUTED } from "../../styles/ui";

function cleanSummaryValue(value) {
  if (!value || typeof value !== "string") {
    return "—";
  }

  return value.replace(/^≈\s*/, "").trim();
}

function DetailBlock({ title, children }) {
  if (!children) {
    return null;
  }

  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      <div className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>{children}</div>
    </div>
  );
}

export default function ExerciseWorkflowCard({
  exercise,
  sets = [],
  onToggleSetDone,
  onUpdateSetField,
  onCloseExercise,
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAdvancedHelpOpen, setIsAdvancedHelpOpen] = useState(false);

  if (!exercise) {
    return null;
  }

  const prescriptionDisplay = exercise.prescription ?? "—";

  const {
    tempo = "—",
    targetRir = "—",
    rest = "—",
    progression,
    advancedTechnique,
    advancedTechniqueType,
    extraCues = [],
  } = exercise.details ?? {};

  const cleanedPrescriptionDisplay = cleanSummaryValue(prescriptionDisplay);
  const cleanedTempo = cleanSummaryValue(tempo);
  const cleanedTargetRir = cleanSummaryValue(targetRir);
  const cleanedRest = cleanSummaryValue(rest);

  const advancedTechniqueHelp = advancedTechniqueType
    ? advancedTechniqueHelpByType[advancedTechniqueType]
    : null;

  return (
    <>
      <SectionCard>
        <div className="space-y-4">
          <div className="space-y-4">
            {progression && (
              <DetailBlock title="Progression">
                <p>{progression}</p>
              </DetailBlock>
            )}

            <DetailBlock title="Cue">
              <p>{exercise.cue ?? "—"}</p>
            </DetailBlock>

            {advancedTechnique && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Advanced technique
                  </h3>

                  {advancedTechniqueHelp && (
                    <button
                      type="button"
                      onClick={() => setIsAdvancedHelpOpen(true)}
                      className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-50"
                    >
                      ? Help
                    </button>
                  )}
                </div>

                <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                  {advancedTechnique}
                </p>
              </div>
            )}

            {extraCues.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-100">
                  Extra cues
                </h3>
                <ul className="space-y-1">
                  {extraCues.map((cue) => (
                    <li
                      key={cue}
                      className={`text-sm leading-6 ${UI_TEXT_MUTED}`}
                    >
                      - {cue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-zinc-800/80 pt-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                Pre-filled from previous workout
              </p>
              <p className={`mt-1 text-sm leading-6 ${UI_TEXT_MUTED}`}>
                Update the numbers below based on today’s performance.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Working rules
              </p>

              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-50"
              >
                ? Help
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="grid grid-cols-[1.4fr_1fr_0.9fr_1.1fr] gap-3 text-center">
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                  Sets
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                  Tempo
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                  RIR
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                  Rest
                </p>
              </div>

              <div className="grid grid-cols-[1.4fr_1fr_0.9fr_1.1fr] gap-3 text-center">
                <p className="text-base font-semibold leading-5 tracking-tight tabular-nums text-zinc-100">
                  {cleanedPrescriptionDisplay}
                </p>
                <p className="text-base font-semibold leading-5 tracking-tight tabular-nums text-zinc-100">
                  {cleanedTempo}
                </p>
                <p className="text-base font-semibold leading-5 tracking-tight tabular-nums text-zinc-100">
                  {cleanedTargetRir}
                </p>
                <p className="text-base font-semibold leading-5 tracking-tight tabular-nums text-zinc-100">
                  {cleanedRest}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-0 border-t border-zinc-800/80 pt-2">
            {/* Set rows are runtime-derived; done changes are delegated upward. */}
            {sets.map((set, index) => (
              <SetRow
                key={`${exercise.id}-set-${set.setNumber}`}
                setNumber={set.setNumber}
                weight={set.weight}
                reps={set.reps}
                rir={set.rir}
                isDone={set.isDone}
                isLast={index === sets.length - 1}
                onToggleDone={() => onToggleSetDone?.(set.setNumber)}
                onSetFieldChange={(field, value) =>
                  onUpdateSetField?.(set.setNumber, field, value)
                }
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <PrimaryButton type="button" onClick={onCloseExercise}>
              Close exercise
            </PrimaryButton>
          </div>
        </div>
      </SectionCard>

      <HelpSheet
        isOpen={isHelpOpen}
        title={exerciseHelp.title}
        intro={exerciseHelp.intro}
        sections={exerciseHelp.sections}
        onClose={() => setIsHelpOpen(false)}
      />

      {advancedTechniqueHelp && (
        <HelpSheet
          isOpen={isAdvancedHelpOpen}
          title={advancedTechniqueHelp.title}
          intro={advancedTechniqueHelp.intro}
          sections={advancedTechniqueHelp.sections}
          onClose={() => setIsAdvancedHelpOpen(false)}
        />
      )}
    </>
  );
}
