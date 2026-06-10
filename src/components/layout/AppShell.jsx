import {
  UI_CONTAINER,
  UI_PAGE_PRODUCT,
  UI_PAGE_TRAINING,
} from "../../styles/ui";

const PAGE_MODE_CLASS_NAMES = {
  product: UI_PAGE_PRODUCT,
  training: UI_PAGE_TRAINING,
};

/**
 * Provides the shared page frame for all MVP screens.
 *
 * Phase 5 note:
 * AppShell now supports two visual modes:
 *
 * - product: overview, learning, review, and plan-selection screens
 * - training: execution, logging, and workout-flow screens
 *
 * Default remains "training" so existing screens keep their current dark
 * behavior until they are intentionally migrated during Phase 5 polish.
 */
export default function AppShell({ children, mode = "training" }) {
  const pageClassName =
    PAGE_MODE_CLASS_NAMES[mode] ?? PAGE_MODE_CLASS_NAMES.training;

  return (
    <main className={`${pageClassName} relative isolate overflow-x-hidden`}>
      <div className={UI_CONTAINER}>{children}</div>
    </main>
  );
}
