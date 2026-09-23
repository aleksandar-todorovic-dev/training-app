import { AlertTriangle } from "lucide-react";

import { useAppState } from "../../state/useAppState";

export default function PersistenceNotice() {
  const { isPersistenceAvailable } = useAppState();

  if (isPersistenceAvailable) {
    return null;
  }

  return (
    <div
      className="mb-4 flex gap-3 border-l-2 border-[#F1B864] bg-[#F1B864]/[0.055] px-4 py-3.5"
      role="status"
      aria-live="polite"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1B864]/12 text-[#F4C87F]">
        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#F4C87F]">
          Progress isn't being saved
        </p>
        <p className="mt-1 text-sm leading-6 text-[#AAB2BA]">
          Avoid refreshing or closing this tab until saving succeeds again.
        </p>
      </div>
    </div>
  );
}