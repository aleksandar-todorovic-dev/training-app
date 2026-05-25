import { UI_TEXT_MUTED, UI_TITLE } from "../../styles/ui";

/**
 * Displays a repeated screen title/subtitle block.
 *
 * UI note:
 * Screens can use this when they need the standard header hierarchy without
 * custom runtime or route-specific content.
 */
export default function ScreenHeader({ title, subtitle }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className={UI_TITLE}>{title}</h1>
      {subtitle ? <p className={UI_TEXT_MUTED}>{subtitle}</p> : null}
    </header>
  );
}