/**
 * Active shared Tailwind UI presets.
 *
 * The application is in the final stage of the Cold Performance / Structured
 * Coaching migration. Keep only reusable presets that are still used by the
 * current interface. Screen-specific composition remains with the owning
 * screen or component.
 */

/* -------------------------------------------------------------------------- */
/* Page shell and navigation                                                   */
/* -------------------------------------------------------------------------- */

export const UI_PAGE_PERFORMANCE =
  "min-h-screen bg-[#0B0E11] bg-[linear-gradient(180deg,#101419_0%,#0B0E11_44%,#090B0D_100%)] text-[#F3F5F1] font-sans antialiased [color-scheme:dark]";

export const UI_CONTAINER =
  "mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-7 pt-5";

export const UI_BACK_CONTROL =
  "inline-flex min-h-11 w-fit items-center gap-1.5 rounded-lg pr-2 text-xs font-medium text-[#8B949D] transition-colors hover:text-[#D7DCD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101419]";

/* -------------------------------------------------------------------------- */
/* Sheets                                                                      */
/* -------------------------------------------------------------------------- */

export const UI_SHEET_OVERLAY =
  "fixed inset-0 z-50 flex h-dvh items-end justify-center overflow-hidden bg-[#020405]/84 px-0 pt-8 sm:px-4 sm:pb-4 supports-[backdrop-filter]:backdrop-blur-[2px]";

export const UI_SHEET_PANEL =
  "flex max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden rounded-t-[1.75rem] border border-b-0 border-[#2A3138] bg-[#101419] shadow-[0_-18px_60px_rgba(0,0,0,0.48)] sm:rounded-[1.75rem] sm:border-b";

export const UI_SHEET_HEADER =
  "shrink-0 border-b border-[#2A3138] px-5 pb-4 pt-3";

export const UI_SHEET_BODY =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(58,67,76,0.9)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#3A434C]";

export const UI_SHEET_FOOTER =
  "shrink-0 border-t border-[#2A3138] bg-[#101419]/98 px-5 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]";

/* -------------------------------------------------------------------------- */
/* Buttons                                                                     */
/* -------------------------------------------------------------------------- */

const PRESSABLE =
  "transition duration-150 ease-out active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100";

const BUTTON_BASE =
  `inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold ${PRESSABLE}`.trim();

export const UI_BUTTON_PRIMARY_PERFORMANCE =
  `${BUTTON_BASE} min-h-12 bg-[#B8F36B] text-[#0B0E11] hover:bg-[#C8F78F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F78F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101419]`.trim();

export const UI_BUTTON_SECONDARY_PERFORMANCE =
  `${BUTTON_BASE} min-h-12 border border-[#3A434C] bg-[#171D22] text-[#D6DBD6] hover:border-[#56616B] hover:bg-[#1C2329] hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101419]`.trim();
