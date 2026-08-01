import CoreSetRow from "./CoreSetRow";

function cleanSummaryValue(value) {
  if (!value || typeof value !== "string") return "—";
  return value
    .replace(/^≈\s*/, "")
    .replace(/\s*-\s*/g, "–")
    .replace(/(\d)\s*s\b/gi, "$1 s")
    .trim();
}

function normalizeCoreTarget(target) {
  return target
    .replace(/\s*\/\s*side\b/i, "")
    .replace(/\s*total\b/i, "")
    .replace(/\s*-\s*/g, "–")
    .replace(/(\d)\s*s\b/gi, "$1 s")
    .trim();
}

function getCoreTargetValue(exercise) {
  const prescription = exercise?.prescription;
  if (!prescription || typeof prescription !== "string") return "—";
  const targetValue = prescription.split("x").slice(1).join("x").trim();
  return targetValue ? normalizeCoreTarget(targetValue) : "—";
}

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

function CoreExerciseSection({
  exercise,
  exerciseNumber,
  rows,
  previousRows,
  isReadOnly,
  onToggleCoreSetDone,
  onUpdateCoreSetField,
}) {
  const valueLabel = exercise.logType === "time" ? "Time" : "Reps";
  const tracksLoad = Boolean(exercise.tracksLoad);
  const completedSetCount = rows.filter((row) => row.isDone).length;

  return (
    <section className="cut-corner border border-[#465056] bg-[#202522]">
      <header className="border-b border-[#465056] px-4 py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#829096] bg-[#303837] font-display text-sm font-bold text-[#D7DFE1]">
            {String(exerciseNumber).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-bold uppercase leading-none text-[#F2EEE4]">
              {exercise.name}
            </h2>
            {exercise.subtitle ? (
              <p className="mt-1.5 text-xs leading-5 text-[#9FA8AB]">
                {exercise.subtitle}
              </p>
            ) : null}
          </div>
          <span className="shrink-0 font-display text-lg font-bold tabular-nums text-[#B7C0C4]">
            {isReadOnly ? rows.length : `${completedSetCount}/${rows.length}`}
          </span>
        </div>

        {exercise.cue ? (
          <p className="mt-3 border-l-2 border-[#9BA7AD] pl-3 text-sm font-medium leading-6 text-[#D7DFE1]">
            {exercise.cue}
          </p>
        ) : null}
      </header>

      <div className="grid grid-cols-3 border-b border-[#465056] bg-[#252B29]">
        <div className="px-3 py-3">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8D989D]">
            Target
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-[#E2E7E8]">
            {cleanSummaryValue(exercise.prescription)}
          </p>
        </div>
        <div className="border-l border-[#465056] px-3 py-3">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8D989D]">
            Tempo
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-[#E2E7E8]">
            {cleanSummaryValue(exercise.details?.tempo)}
          </p>
        </div>
        <div className="border-l border-[#465056] px-3 py-3">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8D989D]">
            Rest
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-[#E2E7E8]">
            {cleanSummaryValue(exercise.details?.rest)}
          </p>
        </div>
      </div>

      <ol aria-label={`${exercise.name} core set log`}>
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
            showDoneControl={!isReadOnly}
            previousValues={previousRows?.find(
              (previousRow) => previousRow.setNumber === row.setNumber,
            )}
            onToggleDone={() =>
              onToggleCoreSetDone?.(exercise.id, row.setNumber)
            }
            onSetFieldChange={(field, value) =>
              onUpdateCoreSetField?.(exercise.id, row.setNumber, field, value)
            }
          />
        ))}
      </ol>

      {exercise.details?.extraCues?.length ? (
        <details className="group border-t border-[#465056] px-4 py-2">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#B7C0C4] [&::-webkit-details-marker]:hidden">
            Extra cues
            <span className="group-open:hidden">View</span>
            <span className="hidden group-open:inline">Hide</span>
          </summary>
          <ul className="space-y-2 border-l border-[#68757A] pb-3 pl-3 text-sm leading-6 text-[#C7D0D3]">
            {exercise.details.extraCues.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

/** Presentation-only support branch for one Core block. */
export default function CoreWorkflowCard({
  coreBlock,
  exercises = [],
  isReadOnly = false,
  dayMode = "inactive",
  coreBlockLog,
  previousValuesByExercise = {},
  onToggleCoreSetDone,
  onUpdateCoreSetField,
  onCloseCoreBlock,
}) {
  if (!coreBlock) return null;

  const isSavedLog = dayMode === "finished";
  const finishButtonLabel = isSavedLog ? "Save changes" : "Finish core block";
  const hasCoreNotes =
    Boolean(coreBlock.details?.progression) ||
    Boolean(coreBlock.note) ||
    coreBlock.details?.notes?.length > 0;

  return (
    <div className="space-y-5">
      <section className="cut-corner border border-[#647177] bg-[#252B29]">
        <div className="grid grid-cols-[3rem_minmax(0,1fr)]">
          <div className="flex items-center justify-center border-r border-[#647177] bg-[#303837] font-display text-xl font-bold text-[#D7DFE1]">
            C
          </div>
          <div className="p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[#B7C0C4]">
                Support branch
              </p>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#9FA8AB]">
                {isReadOnly ? "Preview" : isSavedLog ? "Saved log" : "Active"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#D7DFE1]">
              {coreBlock.details?.purpose ?? "Flexible core block"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 border-t border-[#647177] text-center">
          <div className="px-2 py-3">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8D989D]">Exercises</p>
            <p className="mt-1 font-display text-lg font-bold text-[#E2E7E8]">{exercises.length}</p>
          </div>
          <div className="border-l border-[#647177] px-2 py-3">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8D989D]">Structure</p>
            <p className="mt-1 font-display text-lg font-bold text-[#E2E7E8]">{coreBlock.mainInfo?.sets ?? "—"}</p>
          </div>
          <div className="border-l border-[#647177] px-2 py-3">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#8D989D]">Main work</p>
            <p className="mt-1 font-display text-lg font-bold text-[#E2E7E8]">Separate</p>
          </div>
        </div>
      </section>

      {isReadOnly || isSavedLog ? (
        <aside className="border-l-2 border-[#B7C0C4] bg-[#232722] px-3 py-3">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#B7C0C4]">
            {isReadOnly ? "Read-only preview" : "Saved day log"}
          </p>
          <p className="mt-1 text-sm leading-6 text-[#C7D0D3]">
            {isReadOnly
              ? "Review the support structure now. No Core log is created from this preview."
              : "Core values and performed markers remain editable after the day is closed."}
          </p>
        </aside>
      ) : null}

      <div className="space-y-4">
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
              previousRows={previousValuesByExercise[exercise.id]}
              isReadOnly={isReadOnly}
              onToggleCoreSetDone={onToggleCoreSetDone}
              onUpdateCoreSetField={onUpdateCoreSetField}
            />
          );
        })}
      </div>

      {hasCoreNotes ? (
        <details className="group border-y border-[#465056] px-1 py-2">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
            <div>
              <h2 className="font-display text-xl font-bold uppercase leading-none text-[#F2EEE4]">Core notes</h2>
              <p className="mt-1 text-xs text-[#8D989D]">Progression and block reminders</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#B7C0C4] group-open:hidden">View</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.1em] text-[#B7C0C4] group-open:inline">Hide</span>
          </summary>
          <div className="space-y-4 border-t border-[#465056] py-4 text-sm leading-6 text-[#C7D0D3]">
            {coreBlock.details?.progression ? <p>{coreBlock.details.progression}</p> : null}
            {coreBlock.details?.notes?.length ? (
              <ul className="space-y-2 border-l border-[#68757A] pl-3">
                {coreBlock.details.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            ) : null}
            {coreBlock.note ? <p className="text-[#B7C0C4]">{coreBlock.note}</p> : null}
          </div>
        </details>
      ) : null}

      {!isReadOnly ? (
        <div>
          <p className="mb-3 text-xs leading-5 text-[#8D989D]">
            Closing this branch does not change the main exercise completion fraction.
          </p>
          <button
            type="button"
            onClick={onCloseCoreBlock}
            className="cut-corner-sm inline-flex min-h-12 w-full items-center justify-center gap-2 border border-[#D7DFE1] bg-[#B7C0C4] px-4 text-sm font-semibold text-[#171C1B] transition-colors hover:bg-[#D7DFE1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B7C0C4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#171814]"
          >
            {finishButtonLabel} <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
