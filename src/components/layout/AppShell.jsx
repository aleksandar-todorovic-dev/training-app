import { MotionConfig, motion } from "motion/react";
import { useLocation } from "react-router-dom";

import { UI_CONTAINER, UI_PAGE_PERFORMANCE } from "../../styles/ui";
import { pageContentVariants } from "../../styles/motion";
import PersistenceNotice from "../system/PersistenceNotice";
import PublicInfoNav from "../system/PublicInfoNav";
import LanguageSelector from "../system/LanguageSelector";
import { useAppState } from "../../state/useAppState";

const MotionDiv = motion.div;

/**
 * Provides the shared mobile-first graphite page frame.
 */
export default function AppShell({ children }) {
  const location = useLocation();
  const { isWorkoutBlocked } = useAppState();
  const isPublicPage = ["/privacy", "/preview-terms", "/fitness-safety", "/contact"].includes(location.pathname);

  return (
    <MotionConfig reducedMotion="user">
      <main
        className={`${UI_PAGE_PERFORMANCE} relative isolate w-full max-w-full focus:outline-none`}
        tabIndex={-1}
        data-route-focus-target
      >
        <MotionDiv
          key={location.pathname}
          className={`${UI_CONTAINER} w-full max-w-full`}
          variants={pageContentVariants}
          initial="hidden"
          animate="visible"
        >
          <PersistenceNotice />
          <LanguageSelector />
          {!isWorkoutBlocked || isPublicPage ? children : null}
          <PublicInfoNav />
        </MotionDiv>
      </main>
    </MotionConfig>
  );
}
