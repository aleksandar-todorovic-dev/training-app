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

export default function ExerciseMainInfoCard({ exercise }) {
  if (!exercise) {
    return null;
  }

  const { prescription, mainCue } = exercise;

  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <h2 className="text-sm font-semibold text-zinc-100">Main info</h2>

        <InfoRow label="Sets" value={prescription.sets} />
        <InfoRow label="Reps" value={prescription.reps} />
        <InfoRow label="Tempo" value={prescription.tempo} />
        <InfoRow label="Target RIR" value={prescription.targetRir} />
        <InfoRow label="Rest" value={prescription.rest} />
        <InfoRow label="Cue" value={mainCue} />
      </div>
    </SectionCard>
  );
}
