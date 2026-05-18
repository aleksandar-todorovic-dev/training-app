/**
 * Sanitizes editable main set input values before they enter runtime state.
 *
 * Runtime note:
 * This is lightweight input filtering, not a full validation system.
 * Invalid input returns null, which means the UI should ignore the attempted
 * change and keep the previous runtime value.
 */
export function sanitizeSetInputValue(field, rawValue) {
  const value = String(rawValue ?? "");

  switch (field) {
    case "weight": {
      const normalizedValue = value.replace(",", ".");

      const isValidWeight =
        normalizedValue === "" || /^\d{1,3}(\.\d?)?$/.test(normalizedValue);

      return isValidWeight ? normalizedValue : null;
    }

    case "reps": {
      const isValidReps = value === "" || /^([1-9]|[12]\d|30)$/.test(value);

      return isValidReps ? value : null;
    }
    
    case "rir": {
      const isValidRir = value === "" || /^[0-5]$/.test(value);

      return isValidRir ? value : null;
    }

    default:
      return null;
  }
}
