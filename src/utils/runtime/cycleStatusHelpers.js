/**
 * Checks whether every required training day has been intentionally finished.
 *
 * Runtime note:
 * Cycle completion is based on finished training days, not perfect exercise
 * completion. Partial days are valid if they have finishedAt.
 */
export function areAllTrainingDaysFinished(dayLogs = {}, dayOrder = []) {
  return dayOrder.every((dayId) => Boolean(dayLogs?.[dayId]?.finishedAt));
}
