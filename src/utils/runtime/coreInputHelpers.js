/**
 * Sanitizes editable core set input values before they enter runtime state.
 *
 * Runtime note:
 * This is lightweight input filtering, not a full validation system.
 * Invalid input returns null, which means the UI should ignore the attempted
 * change and keep the previous runtime value.
 */
export function sanitizeCoreSetInputValue(field, rawValue) {
  const value = String(rawValue ?? "");

  switch (field) {
    case "load": {
      const normalizedValue = value.replace(",", ".");

      const isValidLoad =
        normalizedValue === "" || /^\d{1,3}(\.\d?)?$/.test(normalizedValue);

      return isValidLoad ? normalizedValue : null;
    }

    case "reps": {
      const isValidReps = value === "" || /^([1-9]|[12]\d|30)$/.test(value);

      return isValidReps ? value : null;
    }

    case "time": {
      const isValidTime = value === "" || /^([1-9]\d{0,2})$/.test(value);

      return isValidTime ? value : null;
    }

    case "rir": {
      const isValidRir = value === "" || /^[0-5]$/.test(value);

      return isValidRir ? value : null;
    }

    default:
      return null;
  }
}
