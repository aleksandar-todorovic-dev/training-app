import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import GuideGroupCard from "../components/guide/GuideGroupCard";

import { getPlanById } from "../data/plans";
import { getGuideByPlanId } from "../data/guides";

import {
  UI_CARD,
  UI_STACK_LG,
  UI_STACK_MD,
  UI_TEXT_MUTED,
  UI_TITLE,
} from "../styles/ui";

/**
 * Page-level guide reader for one predefined plan.
 *
 * Runtime note:
 * GuidePage reads static educational content and uses local UI state to switch
 * guide sections. It does not read or mutate workout progress.
 */
export default function GuidePage() {
  const { planId } = useParams();

  const plan = getPlanById(planId);
  const guide = getGuideByPlanId(planId);

  // Local guide navigation state only; selecting a group does not affect runtime progress.
  const [activeGroupId, setActiveGroupId] = useState(null);

  // Resolve the currently selected guide group from static guide data.
  const activeGroup = useMemo(() => {
    if (!guide?.groups?.length || !activeGroupId) return null;
    return guide.groups.find((group) => group.id === activeGroupId) ?? null;
  }, [guide, activeGroupId]);

  if (!plan || !guide) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to={plan ? `/plan/${planId}` : "/"}>
              {plan ? "Back to Plan" : "Back to Home"}
            </BackButton>
          </div>

          <header className="flex flex-col gap-3">
            <h1 className={UI_TITLE}>Guide not found</h1>
            <p className={UI_TEXT_MUTED}>
              The selected guide could not be loaded.
            </p>
          </header>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <div className="flex justify-start">
          <BackButton to={`/plan/${planId}`}>Back to Plan</BackButton>
        </div>

        <header className="flex flex-col gap-3">
          <h1 className={UI_TITLE}>{guide.title}</h1>
          <p className={UI_TEXT_MUTED}>{guide.intro}</p>
        </header>

        {/* Show section picker first, then the selected guide group. */}
        {!activeGroup ? (
          <section className={UI_STACK_MD}>
            <p className="text-sm font-medium text-zinc-400">
              Choose a section to open
            </p>

            <div className="grid gap-3">
              {guide.groups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setActiveGroupId(group.id)}
                  className={`${UI_CARD} text-left transition hover:border-zinc-700 hover:bg-zinc-900/70`}
                >
                  <div className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold text-slate-100">
                      {group.title}
                    </h2>

                    <p className="text-sm leading-6 text-zinc-400">
                      {group.intro}
                    </p>

                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      {group.topics.length} topics
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className={UI_STACK_LG}>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setActiveGroupId(null)}
                className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
              >
                ← Back to guide sections
              </button>
            </div>

            <GuideGroupCard group={activeGroup} />

            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setActiveGroupId(null)}
                className="text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
              >
                Back to guide sections
              </button>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
