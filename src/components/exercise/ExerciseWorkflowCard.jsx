import { useState } from "react";

import HelpSheet from "../common/HelpSheet";
import PrimaryButton from "../common/PrimaryButton";
import SetRow from "./SetRow";
import {
  exerciseHelp,
  advancedTechniqueHelpByType,
} from "../../data/contextualHelp";

const METHOD_SUMMARY_BY_TYPE = {
  mechanicalDropset: "Mechanical dropset sequence",
  mechanicalSet: "Mechanical set sequence",
  restPause: "Rest-pause method",
  dropset: "Dropset method",
  cluster: "Cluster structure",
  isoHold: "Iso hold timing",
  isoStretch: "Iso stretch timing",
};

function cleanSummaryValue(value) {
  if (!value || typeof value !== "string") return "—";
  return value
    .replace(/^≈\s*/, "")
    .replace(/\s*x\s*/i, " × ")
    .replace(/\s*-\s*/g, "–")
    .replace(/(\d)\s*s\b/gi, "$1 s")
    .trim();
}

function TargetItem({ label, value }) {
  return (
    <div className="min-w-0 border-l border-[#3B3D34] px-2 py-3 first:border-l-0">
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[#87877E]">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-semibold leading-none tabular-nums text-[#F2EEE4]">
        {value}
      </p>
    </div>
  );
}

/** Presentation-only exercise ledger; all mutations are delegated upward. */
export default function ExerciseWorkflowCard({
  exercise,
  sets = [],
  previousSets = [],
  isReadOnly = false,
  hasPreviousValues = false,
  dayMode = "inactive",
  onToggleSetDone,
  onUpdateSetField,
  onCloseExercise,
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAdvancedHelpOpen, setIsAdvancedHelpOpen] = useState(false);

  if (!exercise) return null;

  const {
    tempo = "—",
    targetRir = "—",
    rest = "—",
    progression,
    advancedTechnique,
    advancedTechniqueType,
    extraCues = [],
  } = exercise.details ?? {};

  const advancedTechniqueHelp = advancedTechniqueType
    ? advancedTechniqueHelpByType[advancedTechniqueType]
    : null;
  const isSavedLog = dayMode === "finished";
  const completedSetCount = sets.filter((set) => set.isDone).length;
  const setProgressLabel = `${completedSetCount}/${sets.length} performed`;
  const finishButtonLabel = isSavedLog ? "Save changes" : "Finish exercise";

  return (
    <>
      <div className="space-y-5">
        {isReadOnly || isSavedLog ? (
          <aside className="border-l-2 border-[#B7C0C4] bg-[#232722] px-3 py-3">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#B7C0C4]">
              {isReadOnly ? "Read-only preview" : "Saved day log"}
            </p>
            <p className="mt-1 text-sm leading-6 text-[#C8C5BB]">
              {isReadOnly
                ? "Review the prescription now. Logging unlocks when this day becomes current."
                : "Values and performed markers remain editable after the day is closed."}
            </p>
          </aside>
        ) : null}

        <section className="cut-corner border border-[#4A4C42] bg-[#21221D]">
          <div className="border-b border-[#3B3D34] px-4 py-4">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#FF8B73]">
              Movement intent
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-[#E0DDD3]">
              {exercise.cue ??
                "Keep the movement controlled and log the work you actually perform."}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-[#3B3D34] px-4 py-3">
            <div>
              <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#87877E]">
                Prescription
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold uppercase leading-none text-[#F2EEE4]">
                Work ledger
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="min-h-11 border border-[#55574D] px-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#C8C5BB] hover:border-[#FF795F] hover:text-[#F2EEE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
            >
              Field help
            </button>
          </div>

          <div className="grid grid-cols-2 border-b border-[#3B3D34] min-[390px]:grid-cols-4">
            <TargetItem label="Sets" value={cleanSummaryValue(exercise.prescription)} />
            <TargetItem label="Tempo" value={cleanSummaryValue(tempo)} />
            <TargetItem label="Rest" value={cleanSummaryValue(rest)} />
            <TargetItem label="Target RIR" value={cleanSummaryValue(targetRir)} />
          </div>

          {!isReadOnly ? (
            <div className="flex items-start justify-between gap-4 border-b border-[#3B3D34] bg-[#1D1E19] px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#E0DDD3]">
                  {hasPreviousValues
                    ? "Previous-cycle references shown per set"
                    : "No previous performed values yet"}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#87877E]">
                  {hasPreviousValues
                    ? "LAST is read-only history; TODAY remains editable."
                    : "Today’s performed work can become the next cycle’s reference."}
                </p>
              </div>
              <span className="shrink-0 font-display text-lg font-bold tabular-nums text-[#9EB096]">
                {setProgressLabel}
              </span>
            </div>
          ) : null}

          <ol aria-label={isReadOnly ? "Set targets" : "Exercise set log"}>
            {sets.map((set) => (
              <SetRow
                key={`${exercise.id}-set-${set.setNumber}`}
                isReadOnly={isReadOnly}
                showDoneControl={!isReadOnly}
                setNumber={set.setNumber}
                weight={set.weight}
                reps={set.reps}
                rir={set.rir}
                previousValues={previousSets.find(
                  (previousSet) => previousSet.setNumber === set.setNumber,
                )}
                isDone={set.isDone}
                onToggleDone={() => onToggleSetDone?.(set.setNumber)}
                onSetFieldChange={(field, value) =>
                  onUpdateSetField?.(set.setNumber, field, value)
                }
              />
            ))}
          </ol>

          {!isReadOnly ? (
            <div className="border-t border-[#3B3D34] p-4">
              <p className="mb-3 text-xs leading-5 text-[#87877E]">
                Closing records your intent to leave this exercise. Unchecked
                sets stay unperformed.
              </p>
              <PrimaryButton onClick={onCloseExercise} className="w-full">
                {finishButtonLabel}
                <span aria-hidden="true">→</span>
              </PrimaryButton>
            </div>
          ) : null}
        </section>

        {advancedTechnique ? (
          <details className="group border-l-4 border-[#E5A13A] bg-[#E5A13A]/8 px-4 py-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-left [&::-webkit-details-marker]:hidden">
              <div>
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#E7B562]">
                  Prescribed method
                </p>
                <p className="mt-1 text-sm font-medium text-[#E0DDD3]">
                  {METHOD_SUMMARY_BY_TYPE[advancedTechniqueType] ??
                    "Advanced method"}
                </p>
              </div>
              <span className="text-sm font-semibold text-[#E7B562] group-open:hidden">
                Open
              </span>
              <span className="hidden text-sm font-semibold text-[#E7B562] group-open:inline">
                Close
              </span>
            </summary>
            <div className="border-t border-[#6D5631] pt-3">
              <p className="text-sm leading-6 text-[#C8C5BB]">
                {advancedTechnique}
              </p>
              {advancedTechniqueHelp ? (
                <button
                  type="button"
                  onClick={() => setIsAdvancedHelpOpen(true)}
                  className="mt-3 min-h-11 border border-[#8E6C35] px-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#E7B562] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
                >
                  Open method note
                </button>
              ) : null}
            </div>
          </details>
        ) : null}

        {progression || extraCues.length ? (
          <details className="group border-y border-[#3B3D34] px-1 py-2">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-left [&::-webkit-details-marker]:hidden">
              <div>
                <h2 className="font-display text-xl font-bold uppercase leading-none text-[#F2EEE4]">
                  Coach notes
                </h2>
                <p className="mt-1 text-xs text-[#87877E]">
                  Progression and local movement cues
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#FF8B73] group-open:hidden">
                View
              </span>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.1em] text-[#FF8B73] group-open:inline">
                Hide
              </span>
            </summary>
            <div className="space-y-4 border-t border-[#3B3D34] py-4">
              {progression ? (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#87877E]">
                    Progression
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-[#C8C5BB]">
                    {progression}
                  </p>
                </div>
              ) : null}
              {extraCues.length ? (
                <ul className="space-y-2 border-l border-[#55574D] pl-3 text-sm leading-6 text-[#C8C5BB]">
                  {extraCues.map((cue) => (
                    <li key={cue}>{cue}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </details>
        ) : null}
      </div>

      <HelpSheet
        isOpen={isHelpOpen}
        title={exerciseHelp.title}
        intro={exerciseHelp.intro}
        sections={exerciseHelp.sections}
        onClose={() => setIsHelpOpen(false)}
      />

      {advancedTechniqueHelp ? (
        <HelpSheet
          isOpen={isAdvancedHelpOpen}
          title={advancedTechniqueHelp.title}
          intro={advancedTechniqueHelp.intro}
          sections={advancedTechniqueHelp.sections}
          onClose={() => setIsAdvancedHelpOpen(false)}
        />
      ) : null}
    </>
  );
}
