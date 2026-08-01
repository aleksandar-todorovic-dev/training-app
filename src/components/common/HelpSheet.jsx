import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import SecondaryButton from "./SecondaryButton";
import useDialogFocus from "./useDialogFocus";
import {
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
  UI_SHEET_OVERLAY,
  UI_SHEET_PANEL,
} from "../../styles/ui";
import { sheetOverlayVariants, sheetPanelVariants } from "../../styles/motion";

const MotionDiv = motion.div;

/** Shared, read-only coaching sheet with keyboard focus containment. */
export default function HelpSheet({
  isOpen,
  title,
  intro,
  sections = [],
  onClose,
}) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useDialogFocus({
    isOpen,
    dialogRef,
    initialFocusRef: closeButtonRef,
    onClose,
  });

  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <MotionDiv
          className={UI_SHEET_OVERLAY}
          variants={sheetOverlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <MotionDiv
            ref={dialogRef}
            tabIndex={-1}
            className={UI_SHEET_PANEL}
            variants={sheetPanelVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-sheet-title"
            aria-describedby={intro ? "help-sheet-intro" : undefined}
          >
            <header className={UI_SHEET_HEADER}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
                    Local coaching note
                  </p>
                  <h2
                    id="help-sheet-title"
                    className="mt-2 font-display text-3xl font-bold uppercase leading-none text-[#191A16]"
                  >
                    {title}
                  </h2>
                  {intro ? (
                    <p
                      id="help-sheet-intro"
                      className="mt-3 max-w-md text-sm leading-6 text-[#4E5048]"
                    >
                      {intro}
                    </p>
                  ) : null}
                </div>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Close coaching help"
                  className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#9F9889] text-xl text-[#4E5048] transition-colors hover:bg-[#E4DECF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </header>

            <div className={UI_SHEET_BODY}>
              <div className="border-t border-[#AFA796]">
                {sections.map((section, index) => (
                  <section
                    key={section.id}
                    className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 border-b border-[#C9C1AF] py-4"
                  >
                    <p className="font-display text-sm font-bold text-[#66675E]">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-bold uppercase leading-none text-[#191A16]">
                        {section.title}
                      </h3>

                      {section.paragraphs?.length ? (
                        <div className="mt-2 space-y-2">
                          {section.paragraphs.map((paragraph, paragraphIndex) => (
                            <p
                              key={`${section.id}-paragraph-${paragraphIndex}`}
                              className={
                                paragraphIndex === 0
                                  ? "text-sm font-medium leading-6 text-[#363831]"
                                  : "text-sm leading-6 text-[#5F6158]"
                              }
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      ) : null}

                      {section.bullets?.length ? (
                        <ul className="mt-3 space-y-2 border-l-2 border-[#E5A13A] pl-3">
                          {section.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="text-sm leading-5 text-[#4E5048]"
                            >
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <footer className={UI_SHEET_FOOTER}>
              <SecondaryButton
                variant="product"
                onClick={onClose}
                className="w-full"
              >
                Close note
              </SecondaryButton>
            </footer>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}
