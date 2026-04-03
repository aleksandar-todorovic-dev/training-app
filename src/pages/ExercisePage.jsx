import { useParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import { UI_STACK_LG, UI_STACK_MD, UI_TEXT_MUTED } from "../styles/ui";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getExerciseById } from "../data/exercises";
import ExerciseMainInfoCard from "../components/exercise/ExerciseMainInfoCard";
import ExerciseDetailsToggle from "../components/exercise/ExerciseDetailsToggle";
import SetCard from "../components/exercise/SetCard";

const STATIC_SET_DISPLAY = {
  "bulk-pro": {
    "smith-bench-press": [
      { setNumber: 1, weight: "80 kg", reps: "7", rir: "2" },
      { setNumber: 2, weight: "80 kg", reps: "6", rir: "1" },
      { setNumber: 3, weight: "80 kg", reps: "6", rir: "1" },
      { setNumber: 4, weight: "80 kg", reps: "5", rir: "1" },
    ],
    "leg-extension": [
      { setNumber: 1, weight: "25 kg", reps: "12", rir: "2" },
      { setNumber: 2, weight: "25 kg", reps: "12", rir: "1" },
      { setNumber: 3, weight: "25 kg", reps: "11", rir: "1" },
    ],
    "romanian-deadlift": [
      { setNumber: 1, weight: "100 kg", reps: "8", rir: "2" },
      { setNumber: 2, weight: "100 kg", reps: "7", rir: "1" },
      { setNumber: 3, weight: "100 kg", reps: "7", rir: "1" },
      { setNumber: 4, weight: "100 kg", reps: "6", rir: "1" },
    ],
  },
  "cut-pro": {
    "smith-bench-press": [
      { setNumber: 1, weight: "75 kg", reps: "7", rir: "2" },
      { setNumber: 2, weight: "75 kg", reps: "6", rir: "1" },
      { setNumber: 3, weight: "75 kg", reps: "6", rir: "1" },
    ],
    "leg-extension": [
      { setNumber: 1, weight: "20 kg", reps: "13", rir: "2" },
      { setNumber: 2, weight: "20 kg", reps: "12", rir: "1" },
    ],
    "romanian-deadlift": [
      { setNumber: 1, weight: "90 kg", reps: "8", rir: "2" },
      { setNumber: 2, weight: "90 kg", reps: "7", rir: "1" },
      { setNumber: 3, weight: "90 kg", reps: "6", rir: "1" },
    ],
  },
};

export default function ExercisePage() {
  const { planId, dayId, exerciseId } = useParams();

  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);
  const exercise = getExerciseById(planId, exerciseId);

  const staticSets = STATIC_SET_DISPLAY[planId]?.[exerciseId] ?? [
    { setNumber: 1, weight: "—", reps: "—", rir: "—" },
  ];

  if (!plan || !dayDetails || !exercise) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <BackButton to={planId ? `/plan/${planId}/cycle` : "/"} />
          <SectionCard>
            <p className={UI_TEXT_MUTED}>
              Exercise data could not be found for this route.
            </p>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <BackButton to={`/plan/${planId}/day/${dayId}`} />

        <div className={UI_STACK_MD}>
          <p className={UI_TEXT_MUTED}>
            {dayDetails.label} — {dayDetails.name}
          </p>

          <div className={UI_STACK_MD}>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              {exercise.name}
            </h1>

            <p className={UI_TEXT_MUTED}>{exercise.subtitle}</p>
          </div>
        </div>

        <ExerciseMainInfoCard exercise={exercise} />

        <ExerciseDetailsToggle details={exercise.details} />

        <SectionCard>
          <div className={UI_STACK_MD}>
            <h2 className="text-sm font-semibold text-zinc-100">Today</h2>
            <p className={UI_TEXT_MUTED}>Pre-filled from previous workout</p>
          </div>
        </SectionCard>

        <div className={UI_STACK_MD}>
          {staticSets.map((set) => (
            <SetCard
              key={`${exerciseId}-set-${set.setNumber}`}
              setNumber={set.setNumber}
              weight={set.weight}
              reps={set.reps}
              rir={set.rir}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <PrimaryButton type="button">+ Add set</PrimaryButton>
          <PrimaryButton type="button">Mark exercise done</PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}
