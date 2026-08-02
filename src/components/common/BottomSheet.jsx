import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import {
  UI_SHEET_OVERLAY,
  UI_SHEET_PANEL,
} from "../../styles/ui";
import {
  sheetOverlayVariants,
  sheetPanelVariants,
} from "../../styles/motion";

const MotionDiv = motion.div;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container) {
  if (!container) return [];

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element instanceof HTMLElement &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.offsetParent !== null,
  );
}

/**
 * Shared accessible bottom-sheet shell.
 *
 * Interaction responsibilities:
 * - locks background scrolling
 * - moves focus into the sheet
 * - traps Tab focus while open
 * - closes on Escape or backdrop click
 * - returns focus to the opening control after exit
 *
 * Product/runtime note:
 * This component owns presentation and modal behavior only. It never mutates
 * workout, cycle, or persistence state.
 */
export default function BottomSheet({
  children,
  onClose,
  labelledBy,
  describedBy,
  closeLabel = "Close sheet",
  panelClassName = "",
}) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const activeElement = document.activeElement;

    restoreFocusRef.current =
      activeElement instanceof HTMLElement ? activeElement : null;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable =
        closeButtonRef.current ?? getFocusableElements(panelRef.current)[0];

      firstFocusable?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(panelRef.current);

      if (!focusableElements.length) {
        event.preventDefault();
        panelRef.current?.focus({ preventScroll: true });
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      const restoreTarget = restoreFocusRef.current;

      window.requestAnimationFrame(() => {
        if (restoreTarget?.isConnected) {
          restoreTarget.focus({ preventScroll: true });
        }
      });
    };
  }, []);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onCloseRef.current?.();
    }
  };

  return (
    <MotionDiv
      className={UI_SHEET_OVERLAY}
      variants={sheetOverlayVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="visible"
      exit="exit"
      onClick={handleBackdropClick}
    >
      <MotionDiv
        ref={panelRef}
        tabIndex={-1}
        className={`${UI_SHEET_PANEL} ${panelClassName}`.trim()}
        variants={sheetPanelVariants}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative shrink-0 pt-2.5">
          <div
            className="mx-auto h-1 w-10 rounded-full bg-[#3A434C]"
            aria-hidden="true"
          />

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => onCloseRef.current?.()}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-[#77818B] transition-colors hover:bg-[#1C2329] hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/65 motion-reduce:transition-none"
            aria-label={closeLabel}
          >
            <X className="h-4.5 w-4.5" aria-hidden="true" />
          </button>
        </div>

        {children}
      </MotionDiv>
    </MotionDiv>
  );
}
