import SecondaryButton from "../common/SecondaryButton";
import WarmupStepsCard from "./WarmupStepsCard";

/**
 * Displays the warm-up guidance sheet for the selected day.
 *
 * Runtime note:
 * Warm-up is local guidance only. Opening or closing this sheet does not affect
 * day progress, exercise completion, or cycle state.
 */
export default function WarmupSheet({ dayDetails, warmup, onClose }) {
  if (!warmup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/85 px-4 pb-4 pt-10 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50">
        <div className="border-b border-zinc-800/80 px-5 py-3.5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/80">
                Warm-up prep
              </p>

              <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-zinc-50">
                {dayDetails.label} warm-up
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-500">
                {dayDetails.name}
              </p>
            </div>

            <p className="shrink-0 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-xs font-medium text-zinc-400">
              Guidance
            </p>
          </div>

          <p className="mt-2.5 border-l border-amber-300/35 pl-3 text-sm leading-relaxed text-zinc-400">
            {warmup.goal}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-12 pt-4 [scrollbar-width:thin] [scrollbar-color:rgba(63,63,70,0.8)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700/80">
          <WarmupStepsCard steps={warmup.steps} />

          <p className="mt-4 border-t border-zinc-800/80 pt-4 text-sm leading-relaxed text-zinc-500">
            <span className="font-semibold text-zinc-300">Coach reminder:</span>{" "}
            Warm up to feel ready, not tired. Keep ramp sets clean and save the
            real effort for working sets.
          </p>
        </div>

        <div className="border-t border-zinc-800/80 bg-zinc-950/95 px-5 py-4">
          <SecondaryButton onClick={onClose} className="w-full">
            Done warming up
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
