import { MotionConfig } from "motion/react";

import {
  UI_CONTAINER,
  UI_PAGE_PRODUCT,
  UI_PAGE_TRAINING,
} from "../../styles/ui";

const PAGE_MODE_CLASS_NAMES = {
  product: UI_PAGE_PRODUCT,
  training: UI_PAGE_TRAINING,
};

const PAGE_WIDTH_CLASS_NAMES = {
  compact: "max-w-xl",
  wide: "max-w-3xl",
};

/**
 * Provides the shared page frame in two visual modes:
 *
 * - product: overview, learning, review, and plan-selection screens
 * - training: execution, logging, and workout-flow screens
 *
 * The default is the training mode used by direct logging routes.
 */
export default function AppShell({
  children,
  mode = "training",
  width = "compact",
}) {
  const pageClassName =
    PAGE_MODE_CLASS_NAMES[mode] ?? PAGE_MODE_CLASS_NAMES.training;
  const widthClassName =
    PAGE_WIDTH_CLASS_NAMES[width] ?? PAGE_WIDTH_CLASS_NAMES.compact;

  return (
    <MotionConfig reducedMotion="user">
      <main
        data-ui-mode={mode}
        className={`${pageClassName} relative isolate w-full max-w-full overflow-x-hidden overscroll-x-none`}
      >
        <div className={`${UI_CONTAINER} ${widthClassName} max-w-full`}>
          {children}
        </div>
      </main>
    </MotionConfig>
  );
}
