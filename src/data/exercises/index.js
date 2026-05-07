import { bulkProExercises } from "./bulkProExercises";
import { cutProExercises } from "./cutProExercises";

const exercisesByPlan = {
  "bulk-pro": bulkProExercises,
  "cut-pro": cutProExercises,
};

export function getExercisesByPlanId(planId) {
  return exercisesByPlan[planId] ?? [];
}

export function getExerciseById(planId, exerciseId) {
  const exercises = getExercisesByPlanId(planId);
  return exercises.find((exercise) => exercise.id === exerciseId) ?? null;
}

export function getExercisesForDay(planId, exerciseIds) {
  const exercises = getExercisesByPlanId(planId);

  return exerciseIds
    .map(
      (exerciseId) =>
        exercises.find((exercise) => exercise.id === exerciseId) ?? null,
    )
    .filter(Boolean);
}
