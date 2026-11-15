import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "../../i18n/useTranslation";
import { useAppState } from "../../state/useAppState";
import { requestWorkoutDownload } from "../../storage/workoutExport";
import SecondaryButton from "../common/SecondaryButton";

const recoveryCopy = {
  "migration-pending": ["Preparing saved progress", "Your saved progress is protected while we prepare it for this version. Training will be available after saving is verified."],
  "recovery-required": ["Saved progress needs your attention", "We could not safely load your saved progress. Training changes are paused and the original record has been kept."],
  "storage-unavailable": ["Saved progress is unavailable", "This browser could not read saved progress. Training is paused. Check your browser settings and try again."],
  "reset-incomplete": ["Progress reset is incomplete", "A reset was interrupted. Training is paused until it is completed. Some progress may already have been removed."],
  "storage-conflict": ["Progress changed in another tab", "Saving and training changes are paused to protect your work. Export this tab's progress before loading the latest saved record."],
};

/** Shared protection gate and non-blocking warning, using verified provider actions. */
export default function PersistenceNotice() {
  const { t } = useTranslation();
  const context = useAppState();
  const { persistence, isPersistenceAvailable, isWorkoutBlocked, retryPersistence,
    reloadProgress, restoreLegacyProgress, resetProgress, exportOriginal, exportMemory } = context;
  const mode = persistence?.mode ?? "ready";
  const heading = useRef(null);
  const [downloadMessage, setDownloadMessage] = useState("");

  useEffect(() => {
    if (isWorkoutBlocked) heading.current?.focus();
  }, [isWorkoutBlocked, mode]);

  if (isPersistenceAvailable) return null;
  const failedReset = persistence?.operationError === "reset-failed" && mode === "storage-conflict";
  const [title, detail] = failedReset ? [
    "Saved progress needs your attention",
    "The operation could not be verified. No successful recovery or reset has been confirmed.",
  ] : recoveryCopy[mode] ?? [
    "Progress isn't being saved",
    "Avoid refreshing or closing this tab until saving succeeds again.",
  ];

  function download(memory) {
    const requested = requestWorkoutDownload(memory ? exportMemory() : exportOriginal(),
      memory ? "cycle-coach-unsaved.json" : "cycle-coach-original.json");
    setDownloadMessage(requested
      ? "Download requested. Check your downloads; the app cannot confirm that the file was saved."
      : "The download could not be requested. Your progress has not been changed.");
  }

  return (
    <section className="mb-5 border-l-2 border-[#F1B864] bg-[#F1B864]/[0.055] px-4 py-4"
      role={isWorkoutBlocked ? "alert" : "status"} aria-live="polite">
      <div className="flex gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#F4C87F]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 ref={heading} tabIndex={-1} className="text-base font-semibold text-[#F4C87F] focus-visible:outline focus-visible:outline-2">
            {t(title)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#C1C7C2]">{t(detail)}</p>
          {persistence?.operationError && mode !== "ready" && !failedReset ? (
            <p className="mt-2 text-sm leading-6 text-[#F4C87F]">{t("The operation could not be verified. No successful recovery or reset has been confirmed.")}</p>
          ) : null}
          <div className="mt-4 flex flex-col gap-2">
            {retryPersistence && !["storage-conflict", "reset-incomplete"].includes(mode) ? (
              <SecondaryButton onClick={retryPersistence}>{t("Try again")}</SecondaryButton>
            ) : null}
            {exportOriginal && exportOriginal() !== null ? (
              <SecondaryButton onClick={() => download(false)}>{t("Export original record")}</SecondaryButton>
            ) : null}
            {exportMemory && persistence?.hasLoadedState &&
              (mode === "storage-conflict" || persistence?.saveStatus === "failed" || mode === "reset-incomplete") ? (
              <SecondaryButton onClick={() => download(true)}>{t("Export this tab's progress")}</SecondaryButton>
            ) : null}
            {mode === "storage-conflict" ? (
              <SecondaryButton onClick={() => {
                if (window.confirm(t("Load the latest saved progress? Unsaved changes in this tab will be replaced. Export them first if you want to keep them."))) reloadProgress();
              }}>{t("Load latest saved progress")}</SecondaryButton>
            ) : null}
            {mode === "recovery-required" && persistence?.canRestoreLegacy ? (
              <SecondaryButton onClick={() => {
                if (window.confirm(t("Restore the older progress snapshot? Newer workouts may be missing. The current record must be backed up and verified before it can be replaced."))) restoreLegacyProgress();
              }}>{t("Restore older progress")}</SecondaryButton>
            ) : null}
            {["recovery-required", "reset-incomplete"].includes(mode) ||
              (mode === "migration-pending" && persistence?.operationError) ? (
              <SecondaryButton onClick={() => {
                if (window.confirm(t("Permanently delete all local workout progress, the original record and recovery copies? Export the original first if you want to keep it. This cannot be undone. Your language and safety preferences will be kept."))) resetProgress();
              }}>{t(mode === "reset-incomplete" ? "Complete progress reset" : "Start with empty progress")}</SecondaryButton>
            ) : null}
          </div>
          {downloadMessage ? <p className="mt-3 text-sm leading-6 text-[#C1C7C2]" role="status">{t(downloadMessage)}</p> : null}
        </div>
      </div>
    </section>
  );
}
