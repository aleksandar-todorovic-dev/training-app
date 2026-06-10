/**
 * Shared Tailwind UI presets for the MVP.
 *
 * Phase 5 note:
 * The app now supports two visual modes:
 *
 * - product mode: lighter overview/learning/review screens
 * - training mode: darker execution/logging screens
 *
 * Keep these presets generic. Screen-specific visual decisions should stay in
 * the screen/component that owns that UI.
 */

/* -------------------------------------------------------------------------- */
/* Page shells                                                                 */
/* -------------------------------------------------------------------------- */

export const UI_PAGE_TRAINING =
  "min-h-screen bg-zinc-950 text-zinc-100 font-sans";

export const UI_PAGE_PRODUCT =
  "min-h-screen bg-zinc-50 text-zinc-950 font-sans";

export const UI_CONTAINER =
  "mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-7 pt-5";

/**
 * Backward-compatible defaults.
 *
 * These keep existing screens working while Phase 5 moves screens gradually to
 * explicit product/training modes.
 */
export const UI_PAGE = UI_PAGE_TRAINING;

/* -------------------------------------------------------------------------- */
/* Layout stacks                                                               */
/* -------------------------------------------------------------------------- */

export const UI_STACK_LG = "flex flex-col gap-5";
export const UI_STACK_MD = "flex flex-col gap-3.5";
export const UI_STACK_SM = "flex flex-col gap-3";

/* -------------------------------------------------------------------------- */
/* Text                                                                        */
/* -------------------------------------------------------------------------- */

export const UI_TITLE_TRAINING =
  "text-xl font-semibold tracking-tight text-zinc-100";

export const UI_TITLE_PRODUCT =
  "text-xl font-semibold tracking-tight text-zinc-950";

export const UI_TEXT_MUTED_TRAINING = "text-sm leading-5 text-zinc-400";

export const UI_TEXT_MUTED_PRODUCT = "text-sm leading-5 text-zinc-600";

/**
 * Backward-compatible text defaults.
 */
export const UI_TITLE = UI_TITLE_TRAINING;
export const UI_TEXT_MUTED = UI_TEXT_MUTED_TRAINING;

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                    */
/* -------------------------------------------------------------------------- */

export const UI_CARD_TRAINING =
  "rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-3.5 shadow-sm";

export const UI_CARD_PRODUCT =
  "rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm";

export const UI_CARD_PRODUCT_SOFT =
  "rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5 shadow-sm";

export const UI_CARD_TRAINING_SOFT =
  "rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-3.5 shadow-sm";

/**
 * Backward-compatible card default.
 */
export const UI_CARD = UI_CARD_TRAINING;

/* -------------------------------------------------------------------------- */
/* Pills / chips                                                               */
/* -------------------------------------------------------------------------- */

export const UI_PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium";

export const UI_PILL_PRODUCT =
  `${UI_PILL_BASE} border border-zinc-200 bg-white text-zinc-700`.trim();

export const UI_PILL_PRODUCT_ACCENT =
  `${UI_PILL_BASE} border border-emerald-200 bg-emerald-50 text-emerald-800`.trim();

export const UI_PILL_TRAINING =
  `${UI_PILL_BASE} border border-zinc-800 bg-zinc-900 text-zinc-300`.trim();

export const UI_PILL_TRAINING_ACCENT =
  `${UI_PILL_BASE} border border-emerald-800/70 bg-emerald-950/40 text-emerald-300`.trim();

/* -------------------------------------------------------------------------- */
/* Buttons                                                                     */
/* -------------------------------------------------------------------------- */

export const UI_ACTION_ROW = "flex flex-col gap-3";

export const UI_BUTTON_BASE =
  "inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-medium transition-colors";

export const UI_BUTTON_PRIMARY_TRAINING =
  `${UI_BUTTON_BASE} bg-emerald-400 text-zinc-950 hover:bg-emerald-300`.trim();

export const UI_BUTTON_SECONDARY_TRAINING =
  `${UI_BUTTON_BASE} border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-600 hover:bg-zinc-800`.trim();

export const UI_BUTTON_GHOST_TRAINING =
  "inline-flex min-h-9 items-center justify-center rounded-lg px-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-200";

export const UI_BUTTON_PRIMARY_PRODUCT =
  `${UI_BUTTON_BASE} bg-zinc-950 text-white hover:bg-zinc-800`.trim();

export const UI_BUTTON_SECONDARY_PRODUCT =
  `${UI_BUTTON_BASE} border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50`.trim();

export const UI_BUTTON_GHOST_PRODUCT =
  "inline-flex min-h-9 items-center justify-center rounded-lg px-1.5 text-xs font-medium text-zinc-600 transition-colors hover:text-zinc-950";

/**
 * Backward-compatible button defaults.
 *
 * Existing screens currently assume a dark/training UI. Keeping these mapped to
 * training variants prevents accidental visual changes before each screen is
 * intentionally polished.
 */
export const UI_BUTTON_PRIMARY = UI_BUTTON_PRIMARY_TRAINING;
export const UI_BUTTON_SECONDARY = UI_BUTTON_SECONDARY_TRAINING;
export const UI_BUTTON_GHOST = UI_BUTTON_GHOST_TRAINING;
