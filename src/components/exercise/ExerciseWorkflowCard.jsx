import { useState } from "react";

import { Crosshair, ListChecks, Zap, ChevronRight } from "lucide-react";
import HelpSheet from "../common/HelpSheet";
import SetRow from "./SetRow";
import {
  exerciseHelp,
  advancedTechniqueHelpByType,
} from "../../data/contextualHelp";
import { UI_TEXT_MUTED } from "../../styles/ui";

const METHOD_SUMMARY_BY_TYPE = {
  mechanicalDropset: "Mechanical dropset · view exact sequence",
  mechanicalSet: "Mechanical set · view exact sequence",
  restPause: "Rest-pause · view exact method",
  dropset: "Dropset · view exact method",
  cluster: "Cluster set · view exact structure",
  isoHold: "Iso hold · view exact timing",
  isoStretch: "Iso stretch · view exact timing",
};

function cleanSummaryValue(value) {
  if (!value || typeof value !== "string") {
    return "—";
  }

  return value.replace(/^≈\s*/, "").trim();
}

// Normalizes compact target values for metric cells without changing source data.
function compactSummaryValue(value) {
  return cleanSummaryValue(value)
    .replace(/\s*x\s*/i, " x ")
    .replace(/\s*-\s*/g, "-")
    .replace(/(\d)\s*s\b/gi, "$1 s");
}

function getMethodSummary(advancedTechniqueType) {
  return (
    METHOD_SUMMARY_BY_TYPE[advancedTechniqueType] ??
    "Advanced method · view exact sequence"
  );
}

function DetailBlock({ title, children, hasDivider = false }) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={`space-y-1.5 ${
        hasDivider ? "border-t border-zinc-800/70 pt-4" : ""
      }`}
    >
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      <div className={`text-sm leading-5 ${UI_TEXT_MUTED}`}>{children}</div>
    </div>
  );
}

function TargetItem({ label, value }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 whitespace-nowrap text-sm font-semibold tracking-tight tabular-nums text-zinc-100">
        {value}
      </p>
    </div>
  );
}

/**
 * Displays one full exercise workflow.
 *
 * Runtime note:
 * The card receives runtime or preview set rows from the page layer and
 * delegates all row updates upward. It does not create or mutate runtime logs.
 */
export default function ExerciseWorkflowCard({
  exercise,
  sets = [],
  isReadOnly = false,
  hasPreviousValues = false,
  dayMode = "inactive",
  onToggleSetDone,
  onUpdateSetField,
  onCloseExercise,
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAdvancedHelpOpen, setIsAdvancedHelpOpen] = useState(false);
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [isCoachNotesOpen, setIsCoachNotesOpen] = useState(false);

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

  const cleanedPrescriptionDisplay = compactSummaryValue(prescriptionDisplay);
  const cleanedTempo = compactSummaryValue(tempo);
  const cleanedTargetRir = compactSummaryValue(targetRir);
  const cleanedRest = compactSummaryValue(rest);

  const advancedTechniqueHelp = advancedTechniqueType
    ? advancedTechniqueHelpByType[advancedTechniqueType]
    : null;

  const methodSummary = getMethodSummary(advancedTechniqueType);
  const hasCoachNotes = Boolean(progression) || extraCues.length > 0;

  const logEyebrow = isReadOnly ? "Preview sets" : "Log your sets";
  const logTitle = isReadOnly ? "Set preview" : "Today's work";

  // Preview mode is read-only plan review, not disabled logging.
  // Active and finished days keep DONE controls because saved logs remain editable.
  const showDoneControls = !isReadOnly;
  const focusLabel = isReadOnly ? "Exercise focus" : "Today's focus";
  const isClosedLog = dayMode === "finished";
  const finishButtonLabel = isClosedLog ? "Save changes" : "Finish exercise";
  const completedSetCount = sets.filter((set) => set.isDone).length;
  const setProgressLabel = `${completedSetCount}/${sets.length} sets checked`;

  return (
    <>
      <div className="space-y-5">
        {isReadOnly ? (
          <section className="rounded-xl border border-[#3FA8B6]/12 bg-[#10292E]/22 p-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#8FDCE5]">
              Preview mode
            </p>
            <p className={`mt-1 text-sm leading-5 ${UI_TEXT_MUTED}`}>
              Review the targets now. Logging unlocks when this day becomes
              current.
            </p>
          </section>
        ) : null}

        {isClosedLog ? (
          <section className="rounded-xl border border-[#3FA8B6]/12 bg-[#10292E]/22 p-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#8FDCE5]">
              Closed day log
            </p>
            <p className={`mt-1 text-sm leading-5 ${UI_TEXT_MUTED}`}>
              Review or adjust the values you saved.
            </p>
          </section>
        ) : null}

        <section className="rounded-2xl border border-white/8 bg-white/[0.02] px-3 py-3">
          <div className="flex items-center gap-2">
            <Crosshair
              aria-hidden="true"
              className="h-4 w-4 text-[#8FDCE5]"
            />

            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#8FDCE5]">
              {focusLabel}
            </p>
          </div>

          <p className="mt-1.5 text-sm leading-5 text-[#D3D8DB]">
            {exercise.cue ??
              "Keep the movement controlled and log the work you actually perform."}
          </p>
        </section>

        {advancedTechnique ? (
          <section className="rounded-2xl border border-amber-300/14 bg-amber-300/[0.035] px-3 py-3">
            <button
              type="button"
              aria-expanded={isMethodOpen}
              onClick={() => setIsMethodOpen((current) => !current)}
              className="flex w-full items-start justify-between gap-4 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Zap
                    aria-hidden="true"
                    className="h-4 w-4 text-amber-200"
                  />

                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-amber-200">
                    Prescribed method
                  </p>
                </div>

                <p className={`mt-1 text-sm leading-5 ${UI_TEXT_MUTED}`}>
                  {isMethodOpen
                    ? "Review the exact method before logging."
                    : methodSummary}
                </p>
              </div>

              <span className="shrink-0 pt-0.5 text-sm font-semibold text-amber-100">
                {isMethodOpen ? "Hide" : "View"}
              </span>
            </button>

            {isMethodOpen ? (
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Method
                  </h3>
                  <p className={`mt-1 text-sm leading-5 ${UI_TEXT_MUTED}`}>
                    {advancedTechnique}
                  </p>
                </div>

                {advancedTechniqueHelp ? (
                  <button
                    type="button"
                    onClick={() => setIsAdvancedHelpOpen(true)}
                    className="rounded-full border border-amber-300/22 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/10"
                  >
                    Method help
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="space-y-3 rounded-2xl border border-[#3FA8B6]/12 bg-[#10292E]/38 px-3.5 py-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <div>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListChecks
                  aria-hidden="true"
                  className="h-4 w-4 text-[#8FDCE5]/80"
                />

                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#747D84]">
                  Working targets
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="rounded-full border border-white/10 bg-white/[0.026] px-2.5 py-1 text-xs font-semibold text-[#8FDCE5] transition hover:border-[#3FA8B6]/28 hover:bg-[#10292E]/50"
              >
                Help
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 rounded-xl border border-white/7 bg-[#071012]/34 px-2 py-2">
              <TargetItem label="Sets" value={cleanedPrescriptionDisplay} />
              <TargetItem label="Tempo" value={cleanedTempo} />
              <TargetItem label="Rest" value={cleanedRest} />
              <TargetItem label="RIR" value={cleanedTargetRir} />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#747D84]">
                  {logEyebrow}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#F4F7F8]">
                  {logTitle}
                </h2>
              </div>

              <p className="shrink-0 rounded-full border border-white/10 bg-white/[0.026] px-2.5 py-0.5 text-xs font-semibold text-[#A9B0B5]">
                {showDoneControls ? setProgressLabel : `${sets.length} sets`}
              </p>
            </div>

            {!isReadOnly ? (
              <div className="rounded-xl border border-white/7 bg-white/[0.018] px-3 py-2.5">
                <p className="text-xs font-semibold text-[#D3D8DB]">
                  {hasPreviousValues
                    ? "Previous values available"
                    : "No previous values yet"}
                </p>
                <p className={`mt-1 text-sm leading-5 ${UI_TEXT_MUTED}`}>
                  {hasPreviousValues
                    ? "Use your last logged work as a guide while you fill today's sets."
                    : "Log today to build the next-cycle reference."}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              {/* Set rows may be runtime logs or read-only preview rows; updates are delegated upward. */}
              {sets.map((set, index) => (
                <SetRow
                  key={`${exercise.id}-set-${set.setNumber}`}
                  isReadOnly={isReadOnly}
                  showDoneControl={showDoneControls}
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

            {!isReadOnly ? (
              <div className="space-y-2 pt-1">
                <p className="text-center text-xs font-medium text-[#747D84]">
                  {setProgressLabel}
                </p>

                <button
                  type="button"
                  onClick={onCloseExercise}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5EC7D5] px-5 py-3 text-sm font-semibold text-[#031014] shadow-[0_10px_24px_rgba(63,168,182,0.14)] transition hover:bg-[#6DD6E2]"
                >
                  {finishButtonLabel}
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {hasCoachNotes ? (
          <section className="rounded-2xl border border-white/8 bg-white/[0.018] px-3 py-3">
            <button
              type="button"
              aria-expanded={isCoachNotesOpen}
              onClick={() => setIsCoachNotesOpen((current) => !current)}
              className="flex w-full items-start justify-between gap-4 text-left"
            >
              <div>
                <h2 className="text-base font-semibold tracking-tight text-[#E7ECEE]">
                  Coach notes
                </h2>
                <p className={`mt-1 text-sm leading-5 ${UI_TEXT_MUTED}`}>
                  Progression and extra cues for this exercise.
                </p>
              </div>

              <span className="pt-1 text-sm font-semibold text-[#8FDCE5]">
                {isCoachNotesOpen ? "Hide" : "View"}
              </span>
            </button>

            {isCoachNotesOpen ? (
              <div className="space-y-4">
                {progression ? (
                  <DetailBlock title="Progression">
                    <p>{progression}</p>
                  </DetailBlock>
                ) : null}

                {extraCues.length > 0 ? (
                  <DetailBlock
                    title="Extra cues"
                    hasDivider={Boolean(progression)}
                  >
                    <ul className="space-y-1">
                      {extraCues.map((cue) => (
                        <li key={cue}>- {cue}</li>
                      ))}
                    </ul>
                  </DetailBlock>
                ) : null}
              </div>
            ) : null}
          </section>
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
