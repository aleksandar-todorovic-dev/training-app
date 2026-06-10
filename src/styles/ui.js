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
  "min-h-screen bg-[#071012] bg-[radial-gradient(circle_at_top,rgba(63,168,182,0.11),transparent_34%),linear-gradient(180deg,#0B1518_0%,#081013_46%,#070A0C_100%)] text-zinc-100 font-sans antialiased";

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
  "text-xl font-semibold tracking-tight text-[#F4F7F8]";

export const UI_TITLE_PRODUCT =
  "text-xl font-semibold tracking-tight text-zinc-950";

export const UI_TEXT_MUTED_TRAINING = "text-sm leading-5 text-zinc-400";
export const UI_TEXT_BODY_TRAINING = "text-sm leading-5 text-[#A9B0B5]";
export const UI_TEXT_META_TRAINING = "text-xs font-medium text-[#747D84]";
export const UI_TEXT_LABEL_TRAINING =
  "text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#747D84]";

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
  "rounded-2xl border border-white/8 bg-[#12181B]/78 p-3.5 shadow-[0_10px_28px_rgba(0,0,0,0.18)]";

export const UI_CARD_PRODUCT =
  "rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm";

export const UI_CARD_PRODUCT_SOFT =
  "rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5 shadow-sm";

export const UI_CARD_TRAINING_SOFT =
  "rounded-2xl border border-[#3FA8B6]/12 bg-[#10292E]/22 p-3.5 shadow-sm";

export const UI_SURFACE_BASE =
  "rounded-2xl border border-white/8 bg-[#12181B]/76 shadow-[0_10px_28px_rgba(0,0,0,0.16)]";

export const UI_SURFACE_SOFT =
  "rounded-2xl border border-white/7 bg-white/[0.026]";

export const UI_SURFACE_FLAT =
  "rounded-xl border border-white/7 bg-white/[0.018]";

export const UI_SURFACE_ACTIVE =
  "rounded-2xl border border-[#3FA8B6]/16 bg-[#10292E]/58 shadow-[0_12px_30px_rgba(0,0,0,0.2)]";

export const UI_ACCENT_CYAN_TEXT = "text-[#8FDCE5]";
export const UI_ACCENT_AMBER_TEXT = "text-[#D8C891]";
export const UI_ACCENT_PURPLE_TEXT = "text-[#C4B5FD]";

export const UI_SHEET_OVERLAY =
  "fixed inset-0 z-50 flex items-end justify-center bg-[#020607]/82 px-4 pb-4 pt-10 backdrop-blur-sm";

export const UI_SHEET_PANEL =
  "flex max-h-[84vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#10171A] shadow-2xl shadow-black/45";

export const UI_SHEET_HEADER =
  "shrink-0 border-b border-white/8 bg-white/[0.018] px-4 py-3.5";

export const UI_SHEET_BODY =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 [scrollbar-width:thin] [scrollbar-color:rgba(63,63,70,0.8)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700/80";

export const UI_SHEET_FOOTER =
  "shrink-0 border-t border-white/8 bg-[#10171A]/96 px-4 py-3";

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
  "inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors";

export const UI_BUTTON_PRIMARY_TRAINING =
  `${UI_BUTTON_BASE} bg-[#5EC7D5] text-[#031014] shadow-[0_8px_18px_rgba(63,168,182,0.12)] hover:bg-[#6DD6E2]`.trim();

export const UI_BUTTON_SECONDARY_TRAINING =
  `${UI_BUTTON_BASE} border border-white/10 bg-white/[0.026] text-[#D3D8DB] hover:border-white/16 hover:bg-white/[0.045] hover:text-[#F4F7F8]`.trim();

export const UI_BUTTON_GHOST_TRAINING =
  "inline-flex min-h-9 items-center justify-center rounded-lg px-1.5 text-xs font-medium text-[#8B949B] transition-colors hover:text-[#D3D8DB]";

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
