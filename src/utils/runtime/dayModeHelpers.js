/**
 * Derives how a training day should behave inside the current cycle.
 *
 * Runtime note:
 * Upcoming days are preview-only and should not create current-cycle day logs.
 */
export function getDayMode({ dayId, currentDayId, dayLog, dayOrder = [] }) {
  if (dayLog?.finishedAt) {
    return "finished";
  }

  if (dayId === currentDayId) {
    return "active";
  }

  const dayIndex = dayOrder.indexOf(dayId);
  const currentIndex = dayOrder.indexOf(currentDayId);

  if (dayIndex === -1 || currentIndex === -1) {
    return "inactive";
  }

  if (dayIndex > currentIndex) {
    return "upcoming";
  }

  return "inactive";
}

/**
 * Converts internal day mode values into user-facing Cycle screen labels.
 */
export function getDayModeLabel(dayMode) {
  if (dayMode === "active") {
    return "Current";
  }

  if (dayMode === "finished") {
    return "Finished";
  }

  if (dayMode === "upcoming") {
    return "Upcoming";
  }

  return "Inactive";
}
