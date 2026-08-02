import { MotionConfig, motion } from "motion/react";
import { useLocation } from "react-router-dom";

import {
  UI_CONTAINER,
  UI_PAGE_PERFORMANCE,
  UI_PAGE_TRAINING,
} from "../../styles/ui";
import { pageContentVariants } from "../../styles/motion";

const MotionDiv = motion.div;

const PAGE_MODE_CLASS_NAMES = {
  performance: UI_PAGE_PERFORMANCE,
  training: UI_PAGE_TRAINING,
};

/**
 * Provides the shared mobile-first page frame.
 *
 * `performance` is the active graphite system. `training` is retained only for
 * the remaining DayPage shell until the whole-app consistency pass.
 */
export default function AppShell({ children, mode = "performance" }) {
  const location = useLocation();

  const pageClassName =
    PAGE_MODE_CLASS_NAMES[mode] ?? PAGE_MODE_CLASS_NAMES.performance;

  return (
    <MotionConfig reducedMotion="user">
      <main
        className={`${pageClassName} relative isolate w-full max-w-full overflow-x-hidden overscroll-x-none`}
      >
        <MotionDiv
          key={location.pathname}
          className={`${UI_CONTAINER} w-full max-w-full`}
          variants={pageContentVariants}
          initial="hidden"
          animate="visible"
        >
          {children}
        </MotionDiv>
      </main>
    </MotionConfig>
  );
}
