import { UI_CONTAINER, UI_PAGE } from "../../styles/ui";

/**
 * Provides the shared page frame for all MVP screens.
 *
 * UI note:
 * AppShell owns the global page/container spacing so individual screens can
 * focus on their content instead of repeating layout wrappers.
 */
export default function AppShell({ children }) {
  return (
    <main className={UI_PAGE}>
      <div className={UI_CONTAINER}>{children}</div>
    </main>
  );
}
