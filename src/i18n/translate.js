import { srLatn } from "./sr-Latn.js";
import { normalizeLocale } from "./localeStorage.js";

// English source copy is the message key. Plural messages keep their English
// singular here; Serbian uses CLDR one/few/other forms in the same catalog.
export const englishPlurals = {
  "{count} sets": { one: "{count} set", other: "{count} sets" },
  "{count} prescribed sets": { one: "{count} prescribed set", other: "{count} prescribed sets" },
  "{count} exercises": { one: "{count} exercise", other: "{count} exercises" },
  "{count} topics": { one: "{count} topic", other: "{count} topics" },
  "{count} main sets performed": { one: "{count} main set performed", other: "{count} main sets performed" },
  "{count} Core sets performed": { one: "{count} Core set performed", other: "{count} Core sets performed" },
  "{count} core exercises · Movable support block": {
    one: "{count} core exercise · Movable support block",
    other: "{count} core exercises · Movable support block",
  },
};

const pluralRules = {
  en: new Intl.PluralRules("en"),
  "sr-Latn": new Intl.PluralRules("sr-Latn"),
};

export function translate(locale, source, values = {}) {
  if (typeof source !== "string") return source;
  const language = normalizeLocale(locale);
  let message = language === "sr-Latn" && Object.hasOwn(srLatn, source)
    ? srLatn[source]
    : englishPlurals[source] ?? source;
  if (typeof message === "object") {
    message = message[pluralRules[language].select(Number(values.count))] ?? message.other;
  }
  return message.replace(/\{(\w+)\}/g, (token, key) => {
    if (!Object.hasOwn(values, key)) return token;
    const value = values[key];
    // Interpolated labels are display copy too. Values never feed back into
    // routes, source data, reducer actions, or persisted workout records.
    return String(typeof value === "string" ? translate(language, value) : value ?? "");
  });
}

export function createTranslator(locale) {
  return (source, values) => translate(locale, source, values);
}

export function performedSetLabel(t, count, scope = "main") {
  return t(scope === "Core" ? "{count} Core sets performed" : "{count} main sets performed", { count });
}

export function closedDayCopy(t, progress, presentation) {
  return {
    ...presentation,
    statusLabel: t(presentation.statusLabel),
    statusDetail: progress.performedMainSetCount || progress.performedCoreSetCount
      ? performedSetLabel(t, progress.performedMainSetCount)
      : t("No sets performed"),
    coreDetail: progress.performedCoreSetCount
      ? performedSetLabel(t, progress.performedCoreSetCount, "Core")
      : null,
  };
}
