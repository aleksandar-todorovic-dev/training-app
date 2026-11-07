export const LOCALE_STORAGE_KEY = "training-app:v1:locale";
export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["en", "sr-Latn"];

export function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

function browserStorage() {
  return globalThis.localStorage;
}

export function loadLocale(storage) {
  try {
    return normalizeLocale((storage ?? browserStorage())?.getItem(LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function saveLocale(locale, storage) {
  try {
    const target = storage ?? browserStorage();
    if (!target) return false;
    target.setItem(LOCALE_STORAGE_KEY, normalizeLocale(locale));
    return true;
  } catch {
    return false;
  }
}
