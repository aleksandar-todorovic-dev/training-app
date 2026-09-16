import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import CoreSetRow from "./CoreSetRow";
import { revealPanelVariants } from "../../styles/motion";
import {
  getCoreBlockStatus,
  getCoreExerciseStatus,
} from "../../utils/runtime/coreStatusHelpers";

const MotionDiv = motion.div;

function cleanSummaryValue(value) {
  if (!value || typeof value !== "string") {
    return "—";
  }

  return value.replace(/^≈\s*/, "").trim();
}

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
  return exercise?.logType === "time" ? "Time" : "Reps";
}

function getCoreSetSummary(exercise, tracksLoad) {
  if (tracksLoad) {
    return cleanSummaryValue(exercise?.prescription);
  }

  return Number.isInteger(exercise?.setCount) ? exercise.setCount : "—";
}

function SummaryMetric({ label, value }) {
  return (
    <div className="min-w-0 px-2 py-2 text-center">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#77818B]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-none tracking-tight text-[#F3F5F1]">
        {value}
      </p>
    </div>
  );
}

function getExerciseState(coreExerciseLog) {
  const status = getCoreExerciseStatus(coreExerciseLog);

  if (status === "complete") {
    return {
      label: "Logged",
      className: "text-[#79C89A]",
    };
  }

  if (status === "partial") {
    return {
      label: "Partial",
      className: "text-[#F1B864]",
    };
  }

  return {
    label: "Ready",
    className: "text-[#77818B]",
  };
}

function ColumnHeaders({ tracksLoad, valueLabel, showDoneControl }) {
  const gridClass = showDoneControl
    ? "grid-cols-[1.9rem_minmax(0,1fr)_2.75rem]"
    : "grid-cols-[1.9rem_minmax(0,1fr)]";

  return (
    <div
      className={`grid ${gridClass} items-center gap-1 px-2 pb-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#77818B]`}
      aria-hidden="true"
    >
      <span className="text-center">Set</span>
      <div className="grid min-w-0 grid-cols-3 text-center">
        <span>{tracksLoad ? "Kg" : "Target"}</span>
        <span>{valueLabel}</span>
        <span>RIR</span>
      </div>
      {showDoneControl ? <span className="text-center">Done</span> : null}
    </div>
  );
}

function CoreExerciseSection({
  exercise,
  exerciseNumber,
  rows,
  coreExerciseLog,
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
  const exerciseState = getExerciseState(coreExerciseLog);
  const completedSetCount = rows.filter((row) => row.isDone).length;

  return (
    <section className="border-t border-[#2A3138] pt-5 first:border-t-0 first:pt-0">
      <div className="space-y-4">
        <div className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-3">
          <span className="pt-0.5 text-sm font-semibold tabular-nums text-[#A7A2D8]">
            {String(exerciseNumber).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-tight tracking-[-0.025em] text-[#F3F5F1]">
              {exercise.name}
            </h2>
            {exercise.subtitle ? (
              <p className="mt-1.5 text-sm leading-5 text-[#AAB2BA]">
                {exercise.subtitle}
              </p>
            ) : null}
          </div>

          <span
            className={`pt-1 text-xs font-semibold ${exerciseState.className}`}
          >
            {isReadOnly ? "Preview" : exerciseState.label}
          </span>
        </div>

        {exercise.cue ? (
          <div className="border-l-2 border-[#A7A2D8]/55 pl-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#A7A2D8]">
              Today&apos;s cue
            </p>
            <p className="mt-1.5 text-sm leading-6 text-[#D7DBD6]">
              {exercise.cue}
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-3 divide-x divide-[#2A3138] border-y border-[#2A3138] py-1">
          <SummaryMetric label="Sets" value={setSummary} />
          <SummaryMetric label="Tempo" value={tempo} />
          <SummaryMetric label="Rest" value={rest} />
        </div>

        <div>
          <ColumnHeaders
            tracksLoad={tracksLoad}
            valueLabel={valueLabel}
            showDoneControl={showDoneControls}
          />

          <div className="overflow-hidden rounded-xl border border-[#2A3138] bg-[#13181D]">
            {rows.map((row) => (
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

          {!isReadOnly ? (
            <p className="mt-2 text-right text-xs font-semibold tabular-nums text-[#77818B]">
              {completedSetCount}/{rows.length} performed
            </p>
          ) : null}
        </div>

        {exercise.details?.extraCues?.length > 0 ? (
          <details className="group border-t border-[#2A3138] pt-3">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-[#D7DBD6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8F36B]/65 [&::-webkit-details-marker]:hidden">
              Extra cues
              <ChevronDown
                className="h-4 w-4 text-[#77818B] transition-transform group-open:rotate-180 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </summary>

            <ul className="space-y-2 pb-1 pt-1">
              {exercise.details.extraCues.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-6 text-[#AAB2BA]"
                >
                  <span className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-[#77818B]" />
                  <span>{item}</span>
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
 * The component receives runtime core logs from the page layer and delegates
 * all row updates upward. Static preview rows never create or mutate logs.
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
  const coachNotesPanelId = useId();

  if (!coreBlock) {
    return null;
  }

  const hasCoreNotes =
    Boolean(coreBlock.details?.progression) ||
    Boolean(coreBlock.note) ||
    coreBlock.details?.notes?.length > 0;

  const showDoneControls = !isReadOnly;
  const isSavedLog = dayMode === "finished";
  const isClosedLog = Boolean(coreBlockLog?.closedAt);
  const finishButtonLabel = isSavedLog
    ? "Save changes"
    : isClosedLog
      ? "Save core changes"
      : "Finish core block";

  const totalSetCount = exercises.reduce(
    (total, exercise) => total + (exercise.setCount ?? 0),
    0,
  );
  const completedSetCount = Object.values(
    coreBlockLog?.coreExerciseLogs ?? {},
  ).reduce(
    (total, exerciseLog) =>
      total + (exerciseLog.sets?.filter((set) => set.isDone).length ?? 0),
    0,
  );
  const coreBlockStatus = getCoreBlockStatus(coreBlockLog);

  return (
    <div className="space-y-5">
      <section className="rounded-[1.25rem] border border-[#2A3138] bg-[#13181D] p-4 shadow-[0_14px_36px_rgba(0,0,0,0.18)]">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#A7A2D8]/25 bg-[#A7A2D8]/[0.08] text-[#C5C1E8]">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#A7A2D8]">
              Support block
            </p>
            <p className="mt-2 text-sm leading-6 text-[#AAB2BA]">
              {coreBlock.details?.purpose ?? "Flexible core support work."}
            </p>
          </div>
        </div>

        {isSavedLog ? (
          <div className="mt-4 border-y border-[#2A3138] py-3">
            <p className="text-xs font-semibold text-[#79C89A]">
              Saved day log
            </p>
            <p className="mt-1 text-sm leading-5 text-[#AAB2BA]">
              Review or adjust the values already stored for this block.
            </p>
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-3 divide-x divide-[#2A3138] border-y border-[#2A3138] py-1">
          <SummaryMetric
            label="Exercises"
            value={coreBlock.mainInfo?.exercises ?? exercises.length}
          />
          <SummaryMetric
            label="Sets"
            value={coreBlock.mainInfo?.sets ?? totalSetCount}
          />
          <SummaryMetric
            label="Effort"
            value={coreBlock.mainInfo?.targetRir ?? "Control"}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-[#77818B]">
            Core remains separate from main-day progress.
          </span>
          <span
            className={`shrink-0 font-semibold tabular-nums ${
              coreBlockStatus === "complete"
                ? "text-[#79C89A]"
                : coreBlockStatus === "partial"
                  ? "text-[#F1B864]"
                  : "text-[#AAB2BA]"
            }`}
          >
            {isReadOnly
              ? `${totalSetCount} prescribed sets`
              : `${completedSetCount}/${totalSetCount} performed`}
          </span>
        </div>
      </section>

      <section className="rounded-[1.25rem] border border-[#2A3138] bg-[#101419] px-3.5 py-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#77818B]">
              {isReadOnly ? "Block structure" : "Core workbench"}
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-[#F3F5F1]">
              {isReadOnly ? "Set preview" : "Log the block"}
            </h2>
          </div>

          <span className="text-xs font-semibold text-[#A7A2D8]">
            {exercises.length} exercises
          </span>
        </div>

        <div className="space-y-5">
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

            return (
              <CoreExerciseSection
                key={exercise.id}
                exercise={exercise}
                exerciseNumber={exerciseIndex + 1}
                rows={rows}
                coreExerciseLog={coreExerciseLog}
                isReadOnly={isReadOnly}
                showDoneControls={showDoneControls}
                valueLabel={getCoreValueLabel(exercise)}
                tracksLoad={Boolean(exercise.tracksLoad)}
                onToggleCoreSetDone={onToggleCoreSetDone}
                onUpdateCoreSetField={onUpdateCoreSetField}
              />
            );
          })}
        </div>

        {!isReadOnly ? (
          <div className="mt-5 border-t border-[#2A3138] pt-4">
            <div className="mb-3 flex items-center justify-between gap-3 text-xs">
              <span className="text-[#77818B]">
                Done marks what was actually performed.
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-[#AAB2BA]">
                {completedSetCount}/{totalSetCount} sets
              </span>
            </div>

            <button
              type="button"
              onClick={onCloseCoreBlock}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B8F36B] px-5 text-sm font-semibold text-[#0B0E11] transition-colors hover:bg-[#C8F78F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F78F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101419]"
            >
              {finishButtonLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </section>

      {hasCoreNotes ? (
        <section className="border-y border-[#2A3138]">
          <button
            type="button"
            aria-expanded={isCoachNotesOpen}
            aria-controls={coachNotesPanelId}
            onClick={() => setIsCoachNotesOpen((current) => !current)}
            className="flex min-h-16 w-full items-center justify-between gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8F36B]/65"
          >
            <div>
              <h2 className="text-base font-semibold text-[#E4E8E3]">
                Core notes
              </h2>
              <p className="mt-1 text-sm leading-5 text-[#77818B]">
                Progression and reminders for this support block.
              </p>
            </div>

            <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#A7A2D8]">
              {isCoachNotesOpen ? "Hide" : "View"}
              <ChevronDown
                className={`h-4 w-4 transition-transform motion-reduce:transition-none ${
                  isCoachNotesOpen ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </span>
          </button>

          <AnimatePresence initial={false}>
            {isCoachNotesOpen ? (
              <MotionDiv
                id={coachNotesPanelId}
                className="space-y-4 border-t border-[#2A3138] pb-5 pt-4"
                variants={revealPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {coreBlock.details?.progression ? (
                  <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
                    <span className="text-sm font-semibold tabular-nums text-[#77818B]">
                      01
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#E4E8E3]">
                        Progression
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#AAB2BA]">
                        {coreBlock.details.progression}
                      </p>
                    </div>
                  </div>
                ) : null}

                {coreBlock.details?.notes?.length > 0 ? (
                  <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 border-t border-[#2A3138] pt-4">
                    <span className="text-sm font-semibold tabular-nums text-[#77818B]">
                      {coreBlock.details?.progression ? "02" : "01"}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#E4E8E3]">
                        Key reminders
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {coreBlock.details.notes.map((note) => (
                          <li
                            key={note}
                            className="flex gap-2 text-sm leading-6 text-[#AAB2BA]"
                          >
                            <span className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-[#77818B]" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}

                {coreBlock.note ? (
                  <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 border-t border-[#2A3138] pt-4">
                    <span className="text-sm font-semibold tabular-nums text-[#77818B]">
                      {coreBlock.details?.progression &&
                      coreBlock.details?.notes?.length > 0
                        ? "03"
                        : "02"}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-[#E4E8E3]">
                        Scheduling
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[#AAB2BA]">
                        {coreBlock.note}
                      </p>
                    </div>
                  </div>
                ) : null}
              </MotionDiv>
            ) : null}
          </AnimatePresence>
        </section>
      ) : null}
    </div>
  );
}
