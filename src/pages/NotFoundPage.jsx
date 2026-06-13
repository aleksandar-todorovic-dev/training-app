import { Link } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import ScreenHeader from "../components/layout/ScreenHeader";
import SectionCard from "../components/layout/SectionCard";
import { UI_STACK_LG, UI_TEXT_MUTED } from "../styles/ui";

/**
 * Fallback page for unmatched routes.
 *
 * UI note:
 * This page is static and does not read or mutate runtime state.
 */
export default function NotFoundPage() {
  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <ScreenHeader
          title="Screen not found"
          subtitle="This route does not match a training screen in the current app."
        />

        <SectionCard>
          <div className="flex flex-col gap-4">
            <p className={UI_TEXT_MUTED}>
              Go back home and choose a plan to continue your training flow.
            </p>

            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-cyan-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200"
            >
              Back to home
            </Link>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
