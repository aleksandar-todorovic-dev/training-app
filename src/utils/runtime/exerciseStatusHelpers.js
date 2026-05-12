/**
 * Derives the exercise status from its prescribed set rows.
 *
 * Runtime note:
 * Set rows are the source of truth for exercise progress. Input values alone
 * do not count as completed work; only `isDone` changes the status.
 */
export function getExerciseStatus(exerciseLog) {
  const sets = exerciseLog?.sets ?? [];

  if (sets.length === 0) {
    return "not-started";
  }

  const completedSetCount = sets.filter((set) => set.isDone).length;

  if (completedSetCount === 0) {
    return "not-started";
  }

  if (completedSetCount === sets.length) {
    return "complete";
  }

  return "partial";
}