import { useEffect } from "react";

import SecondaryButton from "./SecondaryButton";
import {
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
  UI_SHEET_OVERLAY,
  UI_SHEET_PANEL,
  UI_TEXT_MUTED,
  UI_TITLE,
} from "../../styles/ui";

/**
 * Shared bottom-sheet help pattern used for local guidance content.
 *
 * UI note:
 * This sheet owns only presentation behavior such as body scroll lock and
 * Escape-to-close. It does not write runtime workout progress.
 */
export default function HelpSheet({
  isOpen,
  title,
  intro,
  sections = [],
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={UI_SHEET_OVERLAY}>
      <div className={UI_SHEET_PANEL}>
        <div className={UI_SHEET_HEADER}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[#8FDCE5]">
                Quick coaching
              </p>

              <h2 id="help-sheet-title" className={UI_TITLE}>
                {title}
              </h2>

              {intro ? <p className={UI_TEXT_MUTED}>{intro}</p> : null}
            </div>
          </div>
        </div>

        <div className={UI_SHEET_BODY}>
          <div className="space-y-2.5">
            {sections.map((section, index) => (
              <section
                key={section.id}
                className="rounded-2xl border border-white/8 bg-white/[0.018] px-3 py-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#3FA8B6]/20 bg-[#10292E]/42 text-xs font-semibold text-[#8FDCE5]">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-[#F4F7F8]">
                      {section.title}
                    </h3>

                    {section.paragraphs?.length ? (
                      <div className="mt-2 space-y-2">
                        {section.paragraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className={`text-sm leading-5 ${UI_TEXT_MUTED}`}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {section.bullets?.length ? (
                      <ul className="mt-2 space-y-1.5">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className={`flex gap-2 text-sm leading-5 ${UI_TEXT_MUTED}`}
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8FDCE5]/65" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className={UI_SHEET_FOOTER}>
          <SecondaryButton onClick={onClose} className="w-full">
            Close help
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
