import {
  ChevronDown,
  ChevronRight,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import CoreSetRow from "./CoreSetRow";
import { revealPanelVariants } from "../../styles/motion";
import {
  UI_TEXT_BODY,
  UI_TEXT_BODY_STRONG,
  UI_TEXT_CARD_TITLE,
  UI_TEXT_EYEBROW,
  UI_TEXT_SECTION_TITLE,
  UI_TEXT_STAT_LABEL,
  UI_TEXT_STAT_VALUE,
} from "../../styles/ui";

const MotionDiv = motion.div;

function cleanSummaryValue(value) {
  if (!value || typeof value !== "string") {
    return "—";
  }

  return value.replace(/^≈\s*/, "").trim();
}

// Keeps preview targets shorter so row cells stay readable on mobile.
function normalizeCoreTarget(target) {
  return target
    .replace(/\s*\/\s*side\b/i, "")
    .replace(/\s*total\b/i, "")
    .replace(/\s*-\s*/g, "-")
    .replace(/(\d)\s*s\b/gi, "$1 s")
    .trim();
}

function getCoreTargetValue(exercise) {
  const prescription = exercise?.prescription;

  if (!prescription || typeof prescription !== "string") {
    return "—";
  }

  const targetValue = prescription.split("x").slice(1).join("x").trim();

  if (!targetValue) {
    return "—";
  }

  return normalizeCoreTarget(targetValue);
}

/**
 * Builds display-only fallback rows for core previews.
 *
 * Runtime note:
 * These rows are not runtime scaffolding. Real core logs are created by the
 * reducer/helper layer from structured metadata such as `setCount`, `logType`,
 * and `tracksLoad`.
 *
 * `prescription` remains display copy. It is used only to show the target value,
 * not to decide how many rows should exist.
 */
function buildStaticRows(exercise) {
  const setCount = Number.isInteger(exercise?.setCount) ? exercise.setCount : 0;

  const targetValue = getCoreTargetValue(exercise);

  return Array.from({ length: setCount }, (_, index) => ({
    setNumber: index + 1,
    target: targetValue,
    load: "—",
    logged: "—",
    effort: "—",
    isDone: false,
  }));
}

function getCoreValueLabel(exercise) {
  if (exercise?.logType === "time") {
    return "Time";
  }

  return "Reps";
}

function getCoreSetSummary(exercise, tracksLoad) {
  if (tracksLoad) {
    return cleanSummaryValue(exercise?.prescription);
  }

  return Number.isInteger(exercise?.setCount) ? exercise.setCount : "—";
}

function SummaryMetric({ label, value }) {
  return (
    <div className="min-w-0 px-2 py-1.5 text-center">
      <p className={UI_TEXT_STAT_LABEL}>
        {label}
      </p>

      <p className={`mt-1 leading-none ${UI_TEXT_STAT_VALUE}`}>
        {value}
      </p>
    </div>
  );
}

function CoreExerciseSection({
  exercise,
  exerciseNumber,
  rows,
  isReadOnly,
  showDoneControls,
  valueLabel,
  tracksLoad,
  onToggleCoreSetDone,
  onUpdateCoreSetField,
}) {
  const setSummary = getCoreSetSummary(exercise, tracksLoad);
  const tempo = cleanSummaryValue(exercise.details?.tempo);
  const rest = cleanSummaryValue(exercise.details?.rest);

  return (
    <section className="border-t border-white/8 pt-4 first:border-t-0 first:pt-0">
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#A78BFA]/24 bg-[#4C1D95]/18 text-sm font-semibold tabular-nums text-[#DDD6FE]">
            {exerciseNumber}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-[#F4F7F8]">
              {exercise.name}
            </h2>

            {exercise.subtitle ? (
              <p className={UI_TEXT_BODY}>
                {exercise.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {exercise.cue ? (
          <div className="border-l border-[#A78BFA]/24 pl-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#C4B5FD]">
              Cue
            </p>

            <p className={`mt-1 ${UI_TEXT_BODY_STRONG}`}>
              {exercise.cue}
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-3 divide-x divide-white/7 overflow-hidden rounded-lg bg-white/[0.018]">
          <SummaryMetric label="Sets" value={setSummary} />
          <SummaryMetric label="Tempo" value={tempo} />
          <SummaryMetric label="Rest" value={rest} />
        </div>

        <div className="space-y-2 pt-0.5">
          <div className="flex flex-col gap-1.5">
            {rows.map((row, index) => (
              <CoreSetRow
                key={`${exercise.id}-set-${row.setNumber}`}
                isReadOnly={isReadOnly}
                setNumber={row.setNumber}
                target={row.target}
                load={row.load}
                logged={row.logged}
                valueLabel={valueLabel}
                effort={row.effort}
                tracksLoad={tracksLoad}
                isLast={index === rows.length - 1}
                isDone={row.isDone}
                showDoneControl={showDoneControls}
                onToggleDone={() =>
                  onToggleCoreSetDone?.(exercise.id, row.setNumber)
                }
                onSetFieldChange={(field, value) =>
                  onUpdateCoreSetField?.(
                    exercise.id,
                    row.setNumber,
                    field,
                    value,
                  )
                }
              />
            ))}
          </div>
        </div>

        {exercise.details?.extraCues?.length > 0 ? (
          <details className="group rounded-lg bg-white/[0.014] px-2.5 py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#D3D8DB] [&::-webkit-details-marker]:hidden">
              Extra cues
              <ChevronDown
                className="h-4 w-4 text-[#8B949B] transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>

            <ul className="mt-2 space-y-1">
              {exercise.details.extraCues.map((item) => (
                <li key={item} className={UI_TEXT_BODY}>
                  - {item}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Displays one full core block workflow.
 *
 * Runtime note:
 * The card receives runtime core logs from the page layer and delegates all
 * row updates upward. It may show static preview rows, but it does not create
 * or mutate runtime logs itself.
 */
export default function CoreWorkflowCard({
  coreBlock,
  exercises = [],
  isReadOnly = false,
  dayMode = "inactive",
  coreBlockLog,
  onToggleCoreSetDone,
  onUpdateCoreSetField,
  onCloseCoreBlock,
}) {
  const [isCoachNotesOpen, setIsCoachNotesOpen] = useState(false);

  if (!coreBlock) {
    return null;
  }

  const hasCoreNotes =
    Boolean(coreBlock.details?.progression) ||
    Boolean(coreBlock.note) ||
    coreBlock.details?.notes?.length > 0;

  // Preview is read-only plan review. Finished days are saved logs and remain editable for MVP.
  const showDoneControls = !isReadOnly;
  const isSavedLog = dayMode === "finished";
  const finishButtonLabel = isSavedLog ? "Save changes" : "Finish core block";

  const coreStatusLabel =
    dayMode === "upcoming" ? "Preview" : isSavedLog ? "Saved log" : "Active";
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#A78BFA]/14 bg-[#121519]/88 px-4 py-3.5 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#A78BFA]/24 bg-[#4C1D95]/18 text-[#DDD6FE]">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>

              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#C4B5FD]">
                Core work
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-[#A78BFA]/22 bg-[#4C1D95]/14 px-2.5 py-0.5 text-xs font-semibold text-[#DDD6FE]">
              {coreStatusLabel}
            </span>
          </div>

          <p className={UI_TEXT_BODY}>
            {coreBlock.details?.purpose ?? "Flexible core block"}
          </p>

          {isSavedLog ? (
            <MotionDiv
              className="rounded-xl border border-[#A78BFA]/14 bg-[#4C1D95]/10 px-3 py-2.5"
              variants={revealPanelVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#DDD6FE]">
                Closed day log
              </p>
              <p className={`mt-1 ${UI_TEXT_BODY}`}>
                Review or adjust the values you saved.
              </p>
            </MotionDiv>
          ) : null}

          <div className="grid grid-cols-3 divide-x divide-white/7 overflow-hidden rounded-lg bg-white/[0.018]">
            <SummaryMetric
              label="Exercises"
              value={coreBlock.mainInfo?.exercises ?? exercises.length}
            />

            <SummaryMetric
              label="Sets"
              value={coreBlock.mainInfo?.sets ?? "—"}
            />

            <SummaryMetric
              label="Focus"
              value={coreBlock.mainInfo?.targetRir ? "Effort" : "Control"}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111518]/92 px-3.5 py-3.5 shadow-[0_14px_34px_rgba(0,0,0,0.2)]">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ListChecks
                  className="h-4 w-4 text-[#C4B5FD]"
                  aria-hidden="true"
                />

                <p className={UI_TEXT_EYEBROW}>
                  {isReadOnly ? "Preview sets" : "Log core sets"}
                </p>
              </div>

              <h2 className={`mt-1.5 ${UI_TEXT_SECTION_TITLE}`}>
                {isReadOnly ? "Set preview" : "Core work"}
              </h2>
            </div>

            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.026] px-2.5 py-0.5 text-xs font-semibold text-[#A9B0B5]">
              {exercises.length} exercises
            </span>
          </div>

          {exercises.map((exercise, exerciseIndex) => {
            const coreExerciseLog =
              coreBlockLog?.coreExerciseLogs?.[exercise.id] ?? null;

            const staticRows = buildStaticRows(exercise);

            const rows =
              coreExerciseLog?.sets.map((set, index) => ({
                setNumber: set.setIndex,
                target: staticRows[index]?.target ?? "—",
                load: set.load,
                logged: exercise.logType === "time" ? set.time : set.reps,
                effort: set.rir,
                isDone: set.isDone,
              })) ?? staticRows;

            const valueLabel = getCoreValueLabel(exercise);
            const tracksLoad = Boolean(exercise.tracksLoad);

            return (
              <CoreExerciseSection
                key={exercise.id}
                exercise={exercise}
                exerciseNumber={exerciseIndex + 1}
                rows={rows}
                isReadOnly={isReadOnly}
                showDoneControls={showDoneControls}
                valueLabel={valueLabel}
                tracksLoad={tracksLoad}
                onToggleCoreSetDone={onToggleCoreSetDone}
                onUpdateCoreSetField={onUpdateCoreSetField}
              />
            );
          })}
        </div>
      </section>

      {hasCoreNotes ? (
        <section className="rounded-2xl border border-white/8 bg-white/[0.018] px-3 py-3">
          <button
            type="button"
            className="flex w-full items-start justify-between gap-4 text-left"
            onClick={() => setIsCoachNotesOpen((currentValue) => !currentValue)}
            aria-expanded={isCoachNotesOpen}
          >
            <div>
              <h2 className={UI_TEXT_CARD_TITLE}>
                Core notes
              </h2>

              <p className={`mt-1 ${UI_TEXT_BODY}`}>
                Progression and reminders for this block.
              </p>
            </div>

            <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#C4B5FD]">
              {isCoachNotesOpen ? "Hide" : "View"}

              <ChevronDown
                className={[
                  "h-4 w-4 text-[#A78BFA]/80 transition-transform",
                  isCoachNotesOpen ? "rotate-180" : "",
                ].join(" ")}
                aria-hidden="true"
              />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {isCoachNotesOpen ? (
              <MotionDiv
                className="mt-3 space-y-4 rounded-xl border border-white/7 bg-[#071012]/30 px-3 py-3"
                variants={revealPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {coreBlock.details?.progression ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-[#F4F7F8]">
                      Progression
                    </h3>

                    <p className={UI_TEXT_BODY}>
                      {coreBlock.details.progression}
                    </p>
                  </div>
                ) : null}

                {coreBlock.details?.notes?.length > 0 ? (
                  <div className="space-y-2 border-t border-white/7 pt-4">
                    <h3 className="text-sm font-semibold text-[#F4F7F8]">
                      Key reminders
                    </h3>

                    <ul className="space-y-1">
                      {coreBlock.details.notes.map((note) => (
                        <li
                          key={note}
                          className={UI_TEXT_BODY}
                        >
                          - {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {coreBlock.note ? (
                  <p className={`border-t border-white/7 pt-4 ${UI_TEXT_BODY}`}>
                    {coreBlock.note}
                  </p>
                ) : null}
              </MotionDiv>
            ) : null}
          </AnimatePresence>
        </section>
      ) : null}

      {!isReadOnly ? (
        <button
          type="button"
          onClick={onCloseCoreBlock}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#A78BFA]/32 bg-[#6D28D9] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(109,40,217,0.14)] transition duration-150 ease-out hover:bg-[#7C3AED] active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          {finishButtonLabel}
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
