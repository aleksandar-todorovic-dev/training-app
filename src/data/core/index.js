import { coreBlocks } from "./coreBlocks";
import { coreExercises } from "./coreExercises";

/**
 * Core data access helpers.
 *
 * Data note:
 * These helpers resolve static core block/exercise definitions only. Runtime
 * core logs live separately in app state.
 */
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
