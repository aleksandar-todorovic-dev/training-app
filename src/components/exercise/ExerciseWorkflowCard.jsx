import { useState } from "react";

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

function compactSummaryValue(value) {
  return cleanSummaryValue(value)
    .replace(/\s*x\s*/i, "×")
    .replace(/\s*s\b/i, "s");
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

function TargetItem({ label, value }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold tracking-tight tabular-nums text-zinc-100">
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

  const hasCoachNotes =
    Boolean(progression) || Boolean(advancedTechnique) || extraCues.length > 0;

  return (
    <>
      <div className="space-y-5">
        <section className="rounded-3xl border border-cyan-400/15 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_46%),rgba(8,47,73,0.10)] p-4 shadow-[0_14px_55px_rgba(34,211,238,0.04)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Today&apos;s focus
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-100">
              {exercise.cue ??
                "Keep the movement controlled and log the work you actually perform."}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Working targets
            </p>

            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="rounded-full border border-zinc-800 px-2.5 py-1 text-xs font-semibold text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
            >
              Help
            </button>
          </div>
          <div className="grid grid-cols-4 border-y border-zinc-800/80 py-2.5">
            <TargetItem label="Sets" value={cleanedPrescriptionDisplay} />
            <TargetItem label="RIR" value={cleanedTargetRir} />
            <TargetItem label="Rest" value={cleanedRest} />
            <TargetItem label="Tempo" value={cleanedTempo} />
          </div>
        </section>

        {advancedTechnique ? (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/35 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  Advanced technique
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-300">
                  {advancedTechnique}
                </p>
              </div>

              {advancedTechniqueHelp ? (
                <button
                  type="button"
                  onClick={() => setIsAdvancedHelpOpen(true)}
                  className="shrink-0 rounded-full border border-cyan-400/25 px-2.5 py-1 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
                >
                  Help
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/45 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.20)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Log your sets
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
                Today&apos;s work
              </h2>
            </div>

            <p className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-xs font-semibold text-zinc-400">
              {sets.length} sets
            </p>
          </div>

          <div className="mt-5 grid grid-cols-[34px_1fr_1fr_1fr_32px] items-center gap-2 border-b border-zinc-800/80 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
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

          <div className="mt-4 border-t border-zinc-800/70 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
              {isReadOnly ? "Preview only" : "Previous values loaded"}
            </p>
            <p className={`mt-1 text-sm leading-6 ${UI_TEXT_MUTED}`}>
              {isReadOnly
                ? "Logging is disabled until this day becomes current."
                : "Adjust today based on performance."}
            </p>
          </div>
        </section>

        {!isReadOnly ? (
          <button
            type="button"
            onClick={onCloseExercise}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-300 px-5 py-4 text-base font-semibold tracking-wide text-zinc-950 shadow-[0_18px_50px_rgba(34,211,238,0.22)] transition hover:bg-cyan-200"
          >
            Finish exercise
            <span aria-hidden="true">›</span>
          </button>
        ) : null}

        {hasCoachNotes ? (
          <section className="space-y-3">
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
                  Progression, extra cues, and method details.
                </p>
              </div>

              <span className="pt-1 text-sm font-semibold text-cyan-200">
                {isCoachNotesOpen ? "Hide" : "View"}
              </span>
            </button>

            {isCoachNotesOpen ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="space-y-4">
                  {progression ? (
                    <DetailBlock title="Progression">
                      <p>{progression}</p>
                    </DetailBlock>
                  ) : null}

                  {advancedTechnique ? (
                    <DetailBlock title="Advanced technique">
                      <p>{advancedTechnique}</p>
                    </DetailBlock>
                  ) : null}

                  {extraCues.length > 0 ? (
                    <DetailBlock title="Extra cues">
                      <ul className="space-y-1">
                        {extraCues.map((cue) => (
                          <li key={cue}>- {cue}</li>
                        ))}
                      </ul>
                    </DetailBlock>
                  ) : null}
                </div>
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
