import { useParams } from "react-router-dom";
import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import { UI_STACK_LG, UI_STACK_MD, UI_TEXT_MUTED } from "../styles/ui";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getExerciseById } from "../data/exercises";
import ExerciseWorkflowCard from "../components/exercise/ExerciseWorkflowCard";

export default function ExercisePage() {
  const { planId, dayId, exerciseId } = useParams();
  const { state } = useAppState();

  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);
  const exercise = getExerciseById(planId, exerciseId);

  // Read the current runtime exercise log from the active cycle/day.
  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber;
  const currentCycle = currentCycleNumber
    ? planProgress?.cycles?.[currentCycleNumber]
    : null;
  const dayLog = dayDetails ? currentCycle?.dayLogs?.[dayDetails.id] : null;
  const exerciseLog = exerciseId
    ? dayLog?.mainExerciseLogs?.[exerciseId]
    : null;

  // Adapt runtime set rows to the display shape expected by ExerciseWorkflowCard.
  const runtimeSets = exerciseLog?.sets.map((set) => ({
    setNumber: set.setIndex,
    weight: set.weight || "—",
    reps: set.reps || "—",
    rir: set.rir || "—",
    isDone: set.isDone,
  })) ?? [{ setNumber: 1, weight: "—", reps: "—", rir: "—", isDone: false }];

  if (!plan || !dayDetails || !exercise) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to={planId ? `/plan/${planId}/cycle` : "/"}>
              Back
            </BackButton>
          </div>

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
        <div className="flex justify-start">
          <BackButton to={`/plan/${planId}/day/${dayId}`}>
            Back to Day
          </BackButton>
        </div>

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

        <ExerciseWorkflowCard exercise={exercise} sets={runtimeSets} />
      </div>
    </AppShell>
  );
}
