/** Shared structural tokens for the authored Cycle Instrument UI. */

export const UI_PAGE_TRAINING =
  "training-field min-h-screen bg-[#171814] text-[#F2EEE4] font-sans antialiased";

export const UI_PAGE_PRODUCT =
  "paper-rules min-h-screen bg-[#EFEBDF] text-[#191A16] font-sans antialiased";

export const UI_CONTAINER =
  "mx-auto flex min-h-screen w-full flex-col px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6";

export const UI_SHEET_OVERLAY =
  "fixed inset-0 z-50 flex h-dvh items-end justify-center overflow-hidden bg-[#0B0C09]/78 px-0 pt-8 backdrop-blur-[2px] sm:px-4 sm:pb-4";
export const UI_SHEET_PANEL =
  "cut-corner flex max-h-[min(88dvh,calc(100dvh-2rem))] w-full max-w-xl flex-col overflow-hidden border-t border-[#C9C1AF] bg-[#EFEBDF] text-[#191A16] shadow-[0_-24px_60px_rgba(0,0,0,0.34)] sm:border";
export const UI_SHEET_HEADER =
  "shrink-0 border-b border-[#C9C1AF] bg-[#F8F5EB] px-4 py-4 sm:px-5";
export const UI_SHEET_BODY =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 [scrollbar-width:thin] [scrollbar-color:#8E897D_transparent]";
export const UI_SHEET_FOOTER =
  "shrink-0 border-t border-[#C9C1AF] bg-[#F8F5EB]/96 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3 sm:px-5";

const UI_PRESSABLE =
  "transition-[transform,background-color,border-color,color] duration-150 ease-out active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0";
const UI_BUTTON_BASE =
  `inline-flex min-h-11 items-center justify-center gap-2 border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C] focus-visible:ring-offset-2 ${UI_PRESSABLE}`;

export const UI_BUTTON_PRIMARY_TRAINING =
  `${UI_BUTTON_BASE} cut-corner-sm border-[#FF795F] bg-[#FF5A3C] text-[#171814] hover:bg-[#FF765C] focus-visible:ring-offset-[#171814]`;
export const UI_BUTTON_SECONDARY_TRAINING =
  `${UI_BUTTON_BASE} border-[#4A4C42] bg-transparent text-[#E0DDD3] hover:border-[#77796D] hover:bg-[#24251F] focus-visible:ring-offset-[#171814]`;
export const UI_BUTTON_PRIMARY_PRODUCT =
  `${UI_BUTTON_BASE} cut-corner-sm border-[#D7462B] bg-[#FF5A3C] text-[#191A16] hover:bg-[#FF765C] focus-visible:ring-offset-[#EFEBDF]`;
export const UI_BUTTON_SECONDARY_PRODUCT =
  `${UI_BUTTON_BASE} border-[#9F9889] bg-transparent text-[#191A16] hover:bg-[#E4DECF] focus-visible:ring-offset-[#EFEBDF]`;
