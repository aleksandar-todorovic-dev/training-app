import { normalizeLocale } from "./localeStorage.js";
import { createTranslator } from "./translate.js";

const publicTitles = {
  "/privacy": "Privacy",
  "/preview-terms": "Preview Terms",
  "/fitness-safety": "Fitness & Safety",
  "/contact": "Contact",
};

export function getPageTitle(pathname, t) {
  const parts = pathname.split("/").filter(Boolean);
  const page = publicTitles[pathname] ?? (parts[0] === "plan"
    ? parts.includes("exercise") ? "Exercise"
      : parts.includes("core") ? "Core"
        : parts.includes("day") ? "Day"
          : parts[2] === "cycle" ? "Cycle"
            : parts[2] === "guide" ? "Training guide"
              : parts[2] === "end-cycle" ? "Cycle review" : "Plan Overview"
    : pathname === "/" ? "Home" : "Page not found");
  return `Cycle Coach · ${t(page)}`;
}

export function updateDocumentMetadata(locale, pathname, document) {
  const language = normalizeLocale(locale);
  const t = createTranslator(language);
  document.documentElement.lang = language;
  document.title = getPageTitle(pathname, t);
  document.querySelector('meta[name="description"]')?.setAttribute(
    "content",
    t("Cycle Coach is a structured training companion for guided workout cycles, honest logging, and previous-value continuity."),
  );
}
