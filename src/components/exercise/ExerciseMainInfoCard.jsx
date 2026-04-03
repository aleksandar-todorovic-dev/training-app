import SectionCard from "../layout/SectionCard";
import { UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className={UI_TEXT_MUTED}>{label}</span>
      <span className="text-right font-medium text-zinc-100">{value}</span>
    </div>
  );
}

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

export default function ExerciseMainInfoCard({ exercise }) {
  if (!exercise) {
    return null;
  }

  const { sets, reps } = getPrescriptionParts(exercise.prescription);
  const { tempo = "—", targetRir = "—", rest = "—" } = exercise.details ?? {};

  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <h2 className="text-sm font-semibold text-zinc-100">Main info</h2>

        <InfoRow label="Sets" value={sets} />
        <InfoRow label="Reps" value={reps} />
        <InfoRow label="Tempo" value={tempo} />
        <InfoRow label="Target RIR" value={targetRir} />
        <InfoRow label="Rest" value={rest} />
        <InfoRow label="Cue" value={exercise.cue ?? "—"} />
      </div>
    </SectionCard>
  );
}
