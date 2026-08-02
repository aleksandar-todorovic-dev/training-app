import { MotionConfig, motion } from "motion/react";
import { useLocation } from "react-router-dom";

import {
  UI_CONTAINER,
  UI_PAGE_PERFORMANCE,
  UI_PAGE_PRODUCT,
  UI_PAGE_TRAINING,
} from "../../styles/ui";
import { pageContentVariants } from "../../styles/motion";

const MotionDiv = motion.div;

const PAGE_MODE_CLASS_NAMES = {
  performance: UI_PAGE_PERFORMANCE,
  product: UI_PAGE_PRODUCT,
  training: UI_PAGE_TRAINING,
};

/**
 * Provides the shared page frame for all MVP screens.
 *
 * Modes:
 * - performance: scoped product/overview exploration for Home and Plan Overview
 * - product: lighter overview, learning, and review screens
 * - training: execution, logging, and workout-flow screens
 *
 * Default remains "training" so all existing screens preserve their current
 * behavior unless they explicitly opt into another visual mode.
 */
export default function AppShell({ children, mode = "training" }) {
  const location = useLocation();

  const pageClassName =
    PAGE_MODE_CLASS_NAMES[mode] ?? PAGE_MODE_CLASS_NAMES.training;

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
