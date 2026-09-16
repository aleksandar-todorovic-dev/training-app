import { MotionConfig, motion } from "motion/react";
import { useLocation } from "react-router-dom";

import { UI_CONTAINER, UI_PAGE_PERFORMANCE } from "../../styles/ui";
import { pageContentVariants } from "../../styles/motion";

const MotionDiv = motion.div;

/**
 * Provides the shared mobile-first graphite page frame.
 */
export default function AppShell({ children }) {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <main className={`${UI_PAGE_PERFORMANCE} relative isolate w-full max-w-full`}>
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
