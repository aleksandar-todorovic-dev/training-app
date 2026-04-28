import { useEffect } from "react";

import SecondaryButton from "./SecondaryButton";
import { UI_TEXT_MUTED, UI_TITLE } from "../../styles/ui";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/80 px-4 pb-4 pt-10">
      <div className="flex max-h-[88vh] w-full max-w-md flex-col rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-zinc-800 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-zinc-500">
                Exercise guidance
              </p>

              <h2 id="help-sheet-title" className={UI_TITLE}>
                {title}
              </h2>

              {intro ? <p className={UI_TEXT_MUTED}>{intro}</p> : null}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-5">
            {sections.map((section, index) => (
              <section
                key={section.id}
                className={
                  index === 0
                    ? "space-y-2"
                    : "space-y-2 border-t border-zinc-800 pt-5"
                }
              >
                <h3 className="text-sm font-semibold text-zinc-100">
                  {section.title}
                </h3>

                {section.paragraphs?.length ? (
                  <div className="space-y-2">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className={`text-sm leading-6 ${UI_TEXT_MUTED}`}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : null}

                {section.bullets?.length ? (
                  <ul className="space-y-1.5 pt-1">
                    {section.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className={`text-sm leading-6 ${UI_TEXT_MUTED}`}
                      >
                        - {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>

        <div className="border-t border-zinc-800 p-4">
          <SecondaryButton onClick={onClose} className="w-full">
            Close help
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
