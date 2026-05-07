import { UI_TEXT_MUTED, UI_TITLE } from "../../styles/ui";

export default function CycleHeader({ planName, cycleLabel, statusSummary }) {
  return (
    <header className="flex flex-col gap-3">
      <h1 className={UI_TITLE}>{planName}</h1>

      <div className="flex flex-col gap-1">
        <p className={UI_TEXT_MUTED}>{cycleLabel}</p>
        <p className={UI_TEXT_MUTED}>{statusSummary}</p>
      </div>
    </header>
  );
}
