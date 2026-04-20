import SecondaryButton from "../common/SecondaryButton";
import WarmupStepsCard from "./WarmupStepsCard";
import { UI_TEXT_MUTED, UI_TITLE } from "../../styles/ui";

export default function WarmupSheet({ dayDetails, warmup, onClose }) {
  if (!warmup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 px-4 pb-4 pt-10">
      <div className="flex max-h-[88vh] w-full max-w-md flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-zinc-500">
                {dayDetails.label} — {dayDetails.name}
              </p>

              <h2 className={UI_TITLE}>{warmup.title}</h2>

              <p className={UI_TEXT_MUTED}>Goal: {warmup.goal}</p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <WarmupStepsCard steps={warmup.steps} />
        </div>

        <div className="border-t border-zinc-800 p-4">
          <SecondaryButton onClick={onClose} className="w-full">
            Close warm-up
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
