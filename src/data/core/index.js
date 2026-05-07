import { coreBlocks } from "./coreBlocks";
import { coreExercises } from "./coreExercises";

export function getCoreBlocks() {
  return coreBlocks;
}

export function getCoreBlockById(coreId) {
  return coreBlocks.find((coreBlock) => coreBlock.id === coreId) ?? null;
}

export function getCoreExerciseById(exerciseId) {
  return coreExercises.find((exercise) => exercise.id === exerciseId) ?? null;
}

export function getCoreExercisesByIds(exerciseIds = []) {
  return exerciseIds
    .map((exerciseId) => getCoreExerciseById(exerciseId))
    .filter(Boolean);
}
