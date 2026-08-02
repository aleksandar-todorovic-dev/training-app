import { AnimatePresence } from "motion/react";
import { BookOpenText } from "lucide-react";

import BottomSheet from "./BottomSheet";
import SecondaryButton from "./SecondaryButton";
import {
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
} from "../../styles/ui";

/**
 * Shared local coaching/help sheet.
 *
 * Runtime note:
 * Help content is presentation-only and never writes workout progress.
 */
export default function HelpSheet({
  isOpen,
  title,
  intro,
  sections = [],
  onClose,
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <BottomSheet
          key="help-sheet"
          onClose={onClose}
          labelledBy="help-sheet-title"
          describedBy={intro ? "help-sheet-description" : undefined}
          closeLabel="Close help"
        >
          <header className={UI_SHEET_HEADER}>
            <div className="pr-12">
              <div className="flex items-center gap-2 text-[#F1B864]">
                <BookOpenText className="h-4 w-4" aria-hidden="true" />
                <p className="text-[0.67rem] font-semibold uppercase tracking-[0.13em]">
                  Quick coaching
                </p>
              </div>

              <h2
                id="help-sheet-title"
                className="mt-3 text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[#F3F5F1]"
              >
                {title}
              </h2>

              {intro ? (
                <p
                  id="help-sheet-description"
                  className="mt-3 max-w-[34rem] text-sm leading-6 text-[#AAB2BA]"
                >
                  {intro}
                </p>
              ) : null}
            </div>
          </header>

          <div className={UI_SHEET_BODY}>
            <div className="border-y border-[#2A3138]">
              {sections.map((section, index) => (
                <section
                  key={section.id}
                  className={`grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 py-4 ${
                    index > 0 ? "border-t border-[#2A3138]" : ""
                  }`}
                >
                  <span className="text-sm font-semibold tabular-nums text-[#F1B864]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#E4E8E3]">
                      {section.title}
                    </h3>

                    {section.paragraphs?.length ? (
                      <div className="mt-2 space-y-2.5">
                        {section.paragraphs.map((paragraph, paragraphIndex) => (
                          <p
                            key={paragraph}
                            className={`text-sm leading-6 ${
                              paragraphIndex === 0
                                ? "font-medium text-[#D4D9D4]"
                                : "text-[#AAB2BA]"
                            }`}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {section.bullets?.length ? (
                      <ul className="mt-3 space-y-2">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex gap-2.5 text-sm leading-6 text-[#AAB2BA]"
                          >
                            <span className="mt-[0.68rem] h-1 w-1 shrink-0 rounded-full bg-[#F1B864]" />
                            <span>{bullet}</span>
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
              variant="performance"
              onClick={onClose}
              className="w-full"
            >
              Close help
            </SecondaryButton>
          </footer>
        </BottomSheet>
      ) : null}
    </AnimatePresence>
  );
}
