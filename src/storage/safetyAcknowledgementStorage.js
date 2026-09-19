const SAFETY_ACKNOWLEDGEMENT_KEY =
  "training-app:v1:safety-acknowledged";

export function hasStoredSafetyAcknowledgement() {
  try {
    return window.localStorage.getItem(SAFETY_ACKNOWLEDGEMENT_KEY) === "true";
  } catch (error) {
    console.warn("Failed to read safety acknowledgement:", error);
    return false;
  }
}

export function saveSafetyAcknowledgement() {
  try {
    window.localStorage.setItem(SAFETY_ACKNOWLEDGEMENT_KEY, "true");
    return true;
  } catch (error) {
    console.warn("Failed to save safety acknowledgement:", error);
    return false;
  }
}
