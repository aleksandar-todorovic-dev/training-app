import SectionCard from "../layout/SectionCard";
import PrimaryButton from "../common/PrimaryButton";
import SetRow from "./SetRow";
import { UI_TEXT_MUTED } from "../../styles/ui";

function getPrescriptionParts(prescription) {
  if (!prescription || typeof prescription !== "string") {
    return {
      sets: "—",
      reps: "—",
    };
  }

  const [setsPart, repsPart] = prescription.split(" x ");

  return {
    sets: setsPart?.trim() ?? "—",
    reps: repsPart?.trim() ?? "—",
  };
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

export default function ExerciseWorkflowCard({ exercise, sets = [] }) {
  if (!exercise) {
    return null;
  }

  const { sets: setsPart, reps } = getPrescriptionParts(exercise.prescription);
  const prescriptionDisplay =
    setsPart !== "—" || reps !== "—" ? `${setsPart} x ${reps}` : "—";

  const {
    tempo = "—",
    targetRir = "—",
    rest = "—",
    progression,
    advancedTechnique,
    extraCues = [],
  } = exercise.details ?? {};

  return (
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
            <DetailBlock title="Advanced technique">
              <p>{advancedTechnique}</p>
            </DetailBlock>
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

        <div className="border-t border-zinc-800/80 pt-3 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
              Pre-filled from previous workout
            </p>
            <p className={`mt-1 text-sm leading-6 ${UI_TEXT_MUTED}`}>
              Update the numbers below based on today’s performance.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="grid grid-cols-4 gap-3">
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

            <div className="grid grid-cols-4 gap-3">
              <p className="text-lg font-semibold tracking-tight text-zinc-100">
                {prescriptionDisplay}
              </p>
              <p className="text-lg font-semibold tracking-tight text-zinc-100">
                {tempo}
              </p>
              <p className="text-lg font-semibold tracking-tight text-zinc-100">
                {targetRir}
              </p>
              <p className="text-lg font-semibold tracking-tight text-zinc-100">
                {rest}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-0 border-t border-zinc-800/80 pt-2">
          {sets.map((set, index) => (
            <SetRow
              key={`${exercise.id}-set-${set.setNumber}`}
              setNumber={set.setNumber}
              weight={set.weight}
              reps={set.reps}
              rir={set.rir}
              isLast={index === sets.length - 1}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <PrimaryButton type="button">+ Add set</PrimaryButton>
          <PrimaryButton type="button">Mark exercise done</PrimaryButton>
        </div>
      </div>
    </SectionCard>
  );
}
