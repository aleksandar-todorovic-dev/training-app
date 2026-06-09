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
        hasDivider ? "border-t border-zinc-800/70 pt-5" : ""
      }`}
    >
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      <div className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>{children}</div>
    </div>
  );
}

function TargetItem({ label, value }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 whitespace-nowrap text-base font-semibold tracking-tight tabular-nums text-zinc-100">
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

  return (
    <>
      <div className="space-y-6">
        {isReadOnly ? (
          <section className="rounded-2xl bg-cyan-400/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              Preview mode
            </p>
            <p className={`mt-1 text-sm leading-6 ${UI_TEXT_MUTED}`}>
              Review the targets now. Logging unlocks when this day becomes
              current.
            </p>
          </section>
        ) : null}

        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Crosshair aria-hidden="true" className="h-4 w-4 text-cyan-300" />

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Today&apos;s focus
            </p>
          </div>
          <p className="text-base leading-7 text-zinc-100">
            {exercise.cue ??
              "Keep the movement controlled and log the work you actually perform."}
          </p>
        </section>

        {advancedTechnique ? (
          <section className="space-y-3">
            <button
              type="button"
              aria-expanded={isMethodOpen}
              onClick={() => setIsMethodOpen((current) => !current)}
              className="flex w-full items-start justify-between gap-4 text-left"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Zap aria-hidden="true" className="h-4 w-4 text-cyan-300" />

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Prescribed method
                  </p>
                </div>
                <p className={`mt-1 text-sm leading-6 ${UI_TEXT_MUTED}`}>
                  {isMethodOpen
                    ? "Review the exact method before logging."
                    : methodSummary}
                </p>
              </div>

              <span className="shrink-0 pt-0.5 text-sm font-semibold text-cyan-200">
                {isMethodOpen ? "Hide" : "View"}
              </span>
            </button>

            {isMethodOpen ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Method
                  </h3>
                  <p className={`mt-1 text-sm leading-6 ${UI_TEXT_MUTED}`}>
                    {advancedTechnique}
                  </p>
                </div>

                {advancedTechniqueHelp ? (
                  <button
                    type="button"
                    onClick={() => setIsAdvancedHelpOpen(true)}
                    className="rounded-full border border-cyan-400/25 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
                  >
                    Method help
                  </button>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="-mx-3 space-y-4 rounded-4xl bg-linear-to-b from-cyan-950/20 via-zinc-950/10 to-transparent px-4 pt-5 pb-3">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListChecks
                  aria-hidden="true"
                  className="h-4 w-4 text-cyan-300/80"
                />

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Working targets
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
              >
                Help
              </button>
            </div>

            <div className="grid grid-cols-[1.35fr_1fr_1.1fr_0.75fr] gap-3 py-1">
              <TargetItem label="Sets" value={cleanedPrescriptionDisplay} />
              <TargetItem label="Tempo" value={cleanedTempo} />
              <TargetItem label="Rest" value={cleanedRest} />
              <TargetItem label="RIR" value={cleanedTargetRir} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {logEyebrow}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
                  {logTitle}
                </h2>
              </div>

              <p className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-xs font-semibold text-zinc-400">
                {sets.length} {sets.length === 1 ? "set" : "sets"}
              </p>
            </div>

            <div className="grid grid-cols-[34px_1fr_1fr_1fr_32px] items-center gap-2 border-b border-zinc-800/80 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              <span className="text-center">Set</span>
              <span className="text-center">Kg</span>
              <span className="text-center">Reps</span>
              <span className="text-center">RIR</span>
              <span className="text-center">Done</span>
            </div>

            <div>
              {/* Set rows may be runtime logs or read-only preview rows; updates are delegated upward. */}
              {sets.map((set, index) => (
                <SetRow
                  key={`${exercise.id}-set-${set.setNumber}`}
                  isReadOnly={isReadOnly}
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
              <div className="pt-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  Previous values loaded
                </p>
                <p className={`mt-1 text-sm leading-6 ${UI_TEXT_MUTED}`}>
                  Adjust today based on performance.
                </p>
              </div>
            ) : null}

            {!isReadOnly ? (
              <button
                type="button"
                onClick={onCloseExercise}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-300 px-5 py-4 text-base font-semibold tracking-wide text-zinc-950 shadow-[0_18px_50px_rgba(34,211,238,0.22)] transition hover:bg-cyan-200"
              >
                Finish exercise
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </section>

        {hasCoachNotes ? (
          <section className="space-y-4 pt-1">
            <button
              type="button"
              aria-expanded={isCoachNotesOpen}
              onClick={() => setIsCoachNotesOpen((current) => !current)}
              className="flex w-full items-start justify-between gap-4 text-left"
            >
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                  Coach notes
                </h2>
                <p className={`mt-1 text-sm leading-6 ${UI_TEXT_MUTED}`}>
                  Progression and extra cues for this exercise.
                </p>
              </div>

              <span className="pt-1 text-sm font-semibold text-cyan-200">
                {isCoachNotesOpen ? "Hide" : "View"}
              </span>
            </button>

            {isCoachNotesOpen ? (
              <div className="space-y-5">
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
