import SectionCard from "../layout/SectionCard";
import PrimaryButton from "../common/PrimaryButton";
import CoreSetRow from "./CoreSetRow";
import { UI_TEXT_MUTED } from "../../styles/ui";

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

function buildStaticRows(exercise) {
  const prescription = exercise?.prescription ?? "3 x 8-12";
  const match = prescription.match(/^(\d+)\s*x\s*(.+)$/i);

  const setCount = Number(match?.[1] ?? 3);
  const targetValue = match?.[2] ?? "—";

  return Array.from({ length: setCount }, (_, index) => ({
    setNumber: index + 1,
    target: targetValue,
    logged: "—",
    effort: "1-2",
  }));
}

export default function CoreWorkflowCard({ coreBlock, exercises = [] }) {
  if (!coreBlock) {
    return null;
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Core block
            </h2>
            <p className="text-sm leading-6 text-zinc-100">
              {coreBlock.details?.purpose ?? "—"}
            </p>
          </div>

          <div className="grid grid-cols-[1.3fr_1fr_0.9fr_1.1fr] gap-3 text-center">
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              Exercises
            </p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              Sets
            </p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              RIR
            </p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
              Rest
            </p>
          </div>

          <div className="grid grid-cols-[1.3fr_1fr_0.9fr_1.1fr] gap-3 text-center">
            <p className="text-base font-semibold leading-5 tracking-tight tabular-nums text-zinc-100">
              {coreBlock.mainInfo?.exercises ?? "—"}
            </p>
            <p className="text-base font-semibold leading-5 tracking-tight tabular-nums text-zinc-100">
              {coreBlock.mainInfo?.sets ?? "—"}
            </p>
            <p className="text-base font-semibold leading-5 tracking-tight tabular-nums text-zinc-100">
              {coreBlock.mainInfo?.targetRir ?? "—"}
            </p>
            <p className="text-base font-semibold leading-5 tracking-tight tabular-nums text-zinc-100">
              {coreBlock.mainInfo?.rest ?? "—"}
            </p>
          </div>

          {coreBlock.details?.notes?.length > 0 && (
            <div className="space-y-1.5 border-t border-zinc-800/80 pt-3">
              <h3 className="text-sm font-semibold text-zinc-100">Notes</h3>
              <ul className="space-y-1">
                {coreBlock.details.notes.map((note) => (
                  <li
                    key={note}
                    className={`text-sm leading-6 ${UI_TEXT_MUTED}`}
                  >
                    - {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {coreBlock.note && (
            <p
              className={`border-t border-zinc-800/80 pt-3 text-sm leading-6 ${UI_TEXT_MUTED}`}
            >
              {coreBlock.note}
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
              Pre-filled from previous core session
            </p>
            <p className={`mt-1 text-sm leading-6 ${UI_TEXT_MUTED}`}>
              Log today’s reps or hold time below.
            </p>
          </div>

          {exercises.map((exercise, exerciseIndex) => {
            const rows = buildStaticRows(exercise);
            const isLastExercise = exerciseIndex === exercises.length - 1;

            return (
              <div
                key={exercise.id}
                className={
                  !isLastExercise ? "border-b border-zinc-800/80 pb-4" : ""
                }
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-zinc-100">
                      {exercise.name}
                    </h2>
                    <p className={UI_TEXT_MUTED}>{exercise.prescription}</p>
                  </div>

                  <div className="space-y-4">
                    <DetailBlock title="Cue">
                      <p>{exercise.cue ?? "—"}</p>
                    </DetailBlock>

                    <div className="grid grid-cols-[1fr_1fr] gap-3 border-t border-zinc-800/80 pt-3">
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                          Tempo
                        </p>
                        <p className="text-sm text-zinc-100">
                          {exercise.details?.tempo ?? "—"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                          Rest
                        </p>
                        <p className="text-sm text-zinc-100">
                          {exercise.details?.rest ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-0 border-t border-zinc-800/80 pt-2">
                    {rows.map((row, index) => (
                      <CoreSetRow
                        key={`${exercise.id}-set-${row.setNumber}`}
                        setNumber={row.setNumber}
                        target={row.target}
                        logged={row.logged}
                        effort={row.effort}
                        isLast={index === rows.length - 1}
                      />
                    ))}
                  </div>

                  <div className="pt-1">
                    <PrimaryButton type="button">
                      Mark exercise done
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            );
          })}

          <PrimaryButton type="button">Mark core block done</PrimaryButton>
        </div>
      </SectionCard>
    </div>
  );
}
