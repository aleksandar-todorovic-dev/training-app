import { ChevronDown, ListChecks, ShieldCheck } from "lucide-react";
import { useState } from "react";

import CoreSetRow from "./CoreSetRow";

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
    .replace(/\s*-\s*/g, "–")
    .replace(/\s+s\b/i, "s")
    .trim();
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
  const prescription = exercise?.prescription ?? "3 x 8-12";
  const match = prescription.match(/^(\d+)\s*x\s*(.+)$/i);

  const setCount = Number(match?.[1] ?? 3);
  const rawTargetValue = match?.[2] ?? "—";
  const targetValue = normalizeCoreTarget(rawTargetValue);

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

function getCoreSetCount(exercise) {
  const prescription = exercise?.prescription ?? "";
  const match = prescription.match(/^(\d+)\s*x\s*(.+)$/i);

  return match?.[1] ?? "—";
}

function getCoreSetSummary(exercise, tracksLoad) {
  if (tracksLoad) {
    return cleanSummaryValue(exercise?.prescription);
  }

  return cleanSummaryValue(getCoreSetCount(exercise));
}

function SummaryMetric({ label, value }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold leading-none tracking-tight text-zinc-100">
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
  valueLabel,
  tracksLoad,
  onToggleCoreSetDone,
  onUpdateCoreSetField,
}) {
  const setSummary = getCoreSetSummary(exercise, tracksLoad);
  const tempo = cleanSummaryValue(exercise.details?.tempo);
  const rest = cleanSummaryValue(exercise.details?.rest);

  return (
    <section className="border-t border-zinc-800/35 pt-6 first:border-t-0 first:pt-0">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-violet-300/18 bg-violet-300/4.5 text-sm font-semibold tabular-nums text-violet-200">
            {exerciseNumber}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-100">
              {exercise.name}
            </h2>

            {exercise.subtitle ? (
              <p className="text-sm leading-6 text-zinc-400">
                {exercise.subtitle}
              </p>
            ) : null}
          </div>
        </div>

        {exercise.cue ? (
          <div className="border-l border-violet-300/25 pl-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-200/85">
              Cue
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              {exercise.cue}
            </p>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-3">
          <SummaryMetric label="Sets" value={setSummary} />
          <SummaryMetric label="Tempo" value={tempo} />
          <SummaryMetric label="Rest" value={rest} />
        </div>

        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-[34px_1.25fr_1fr_0.85fr_32px] items-center gap-3 border-b border-zinc-800/35 pb-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Set
            </p>

            <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {tracksLoad ? "Kg" : "Target"}
            </p>

            <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {valueLabel}
            </p>

            <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              RIR
            </p>

            <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Done
            </p>
          </div>

          <div>
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
          <div className="space-y-1.5 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Extra cues
            </p>

            <ul className="space-y-1">
              {exercise.details.extraCues.map((item) => (
                <li key={item} className="text-sm leading-6 text-zinc-400">
                  - {item}
                </li>
              ))}
            </ul>
          </div>
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

  const coreStatusLabel =
    dayMode === "upcoming"
      ? "Preview"
      : dayMode === "finished"
        ? "Finished"
        : "Active";

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-violet-300/12 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.11),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.22),rgba(2,6,23,0.08))] px-5 py-5 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-300/18 bg-violet-300/5.5 text-violet-200">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
                Core work
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-violet-300/16 bg-violet-300/4 px-3 py-1 text-xs font-semibold text-violet-200/85">
              {coreStatusLabel}
            </span>
          </div>

          <p className="text-sm leading-6 text-zinc-400">
            {coreBlock.details?.purpose ?? "Flexible core block"}
          </p>

          <div className="grid grid-cols-3 gap-3">
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

      <section className="rounded-4xl border border-zinc-800/45 bg-[linear-gradient(180deg,rgba(15,23,42,0.18),rgba(2,6,23,0.06))] px-5 py-5">
        <div className="space-y-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ListChecks
                  className="h-5 w-5 text-violet-200/80"
                  aria-hidden="true"
                />

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  {isReadOnly ? "Preview sets" : "Log core sets"}
                </p>
              </div>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100">
                {isReadOnly ? "Set preview" : "Core work"}
              </h2>
            </div>

            <span className="shrink-0 rounded-full border border-zinc-700/70 bg-zinc-900/40 px-3 py-1 text-sm font-semibold text-zinc-400">
              {exercises.length} exercises
            </span>
          </div>

          {exercises.map((exercise, exerciseIndex) => {
            const coreExerciseLog =
              coreBlockLog?.coreExerciseLogs?.[exercise.id] ?? null;

            const staticRows = buildStaticRows(exercise);

            // Runtime rows are preferred when a core log exists.
            // Static rows are only a read-only preview/fallback display.
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
        <section className="space-y-4">
          <button
            type="button"
            className="flex w-full items-start justify-between gap-4 text-left"
            onClick={() => setIsCoachNotesOpen((currentValue) => !currentValue)}
            aria-expanded={isCoachNotesOpen}
          >
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
                Core notes
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Progression and reminders for this block.
              </p>
            </div>

            <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-violet-200">
              {isCoachNotesOpen ? "Hide" : "View"}

              <ChevronDown
                className={[
                  "h-4 w-4 text-zinc-500 transition-transform",
                  isCoachNotesOpen ? "rotate-180" : "",
                ].join(" ")}
                aria-hidden="true"
              />
            </span>
          </button>

          {isCoachNotesOpen ? (
            <div className="space-y-5 rounded-[1.75rem] border border-zinc-800/45 bg-white/[0.014] px-5 py-5">
              {coreBlock.details?.progression ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Progression
                  </h3>

                  <p className="text-sm leading-6 text-zinc-400">
                    {coreBlock.details.progression}
                  </p>
                </div>
              ) : null}

              {coreBlock.details?.notes?.length > 0 ? (
                <div className="space-y-2 border-t border-zinc-800/45 pt-5">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Key reminders
                  </h3>

                  <ul className="space-y-1">
                    {coreBlock.details.notes.map((note) => (
                      <li
                        key={note}
                        className="text-sm leading-6 text-zinc-400"
                      >
                        - {note}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {coreBlock.note ? (
                <p className="border-t border-zinc-800/45 pt-5 text-sm leading-6 text-zinc-400">
                  {coreBlock.note}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {!isReadOnly ? (
        <button
          type="button"
          onClick={onCloseCoreBlock}
          className="flex w-full items-center justify-center gap-3 rounded-3xl border border-violet-300/22 bg-violet-300/80 px-5 py-4 text-base font-semibold text-zinc-950 shadow-[0_18px_60px_rgba(139,92,246,0.18)] transition hover:bg-violet-200"
        >
          Finish core block
          <span aria-hidden="true">›</span>
        </button>
      ) : null}
    </div>
  );
}
