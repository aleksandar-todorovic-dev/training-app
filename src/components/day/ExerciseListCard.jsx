import SectionCard from "../layout/SectionCard";
import SecondaryButton from "../common/SecondaryButton";
import { UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

export default function ExerciseListCard({ planId, dayId, exercise, status }) {
  return (
    <SectionCard>
      <div className={UI_STACK_MD}>
        <div className={UI_STACK_MD}>
          <h2 className="text-base font-semibold text-slate-100">
            {exercise.name}
          </h2>

          {exercise.subtitle ? (
            <p className={UI_TEXT_MUTED}>{exercise.subtitle}</p>
          ) : null}

          <p className={UI_TEXT_MUTED}>Prescription: {exercise.prescription}</p>
          <p className={UI_TEXT_MUTED}>Cue: {exercise.cue}</p>
          <p className={UI_TEXT_MUTED}>Status: {status}</p>
        </div>

        <SecondaryButton
          to={`/plan/${planId}/day/${dayId}/exercise/${exercise.id}`}
        >
          Open
        </SecondaryButton>
      </div>
    </SectionCard>
  );
}
