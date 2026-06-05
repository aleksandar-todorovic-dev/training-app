import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import GuideGroupCard from "../components/guide/GuideGroupCard";

import { getPlanById } from "../data/plans";
import { getGuideByPlanId } from "../data/guides";

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
        <div className="flex flex-col gap-8">
          <Link
            to={plan ? `/plan/${planId}` : "/"}
            className="inline-flex w-fit min-h-10 items-center text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            Back to {plan ? "Plan" : "Home"}
          </Link>

          <header className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              Coach Library
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">
              Guide not found
            </h1>

            <p className="text-base leading-7 text-zinc-400">
              The selected guide could not be loaded.
            </p>
          </header>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        <Link
          to={`/plan/${planId}`}
          className="inline-flex w-fit min-h-10 items-center text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          Back to Plan
        </Link>

        {!activeGroup ? (
          <>
            <header className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                  Coach Library
                </p>

                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-50">
                  {guide.title}
                </h1>

                <p className="max-w-sm text-base leading-7 text-zinc-400">
                  {guide.intro}
                </p>
              </div>

              <div className="border-l border-amber-300/40 pl-4">
                <p className="text-sm font-semibold text-amber-200">
                  Learn the system, then train with less guessing.
                </p>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Use this library to understand the cycle, progression,
                  logging, recovery, and plan decisions.
                </p>
              </div>
            </header>

            <section className="flex flex-col gap-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Sections
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-100">
                    Choose what you need now
                  </h2>
                </div>

                <p className="text-xs font-medium text-zinc-500">
                  {guide.groups.length} areas
                </p>
              </div>

              <div className="flex flex-col divide-y divide-zinc-800/80 border-y border-zinc-800/80">
                {guide.groups.map((group, index) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setActiveGroupId(group.id)}
                    className="group py-5 text-left transition"
                  >
                    <div className="grid grid-cols-[2.5rem_1fr] gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-sm font-semibold text-cyan-200 shadow-[0_0_22px_rgba(103,232,249,0.08)]">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold tracking-tight text-zinc-100 transition group-hover:text-cyan-100">
                              {group.title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-zinc-400">
                              {group.intro}
                            </p>
                          </div>

                          <span className="mt-0.5 shrink-0 text-xl leading-none text-zinc-600 transition group-hover:text-cyan-300">
                            &rsaquo;
                          </span>
                        </div>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                          {group.topics.length} topics
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="flex flex-col gap-6">
            <button
              type="button"
              onClick={() => setActiveGroupId(null)}
              className="inline-flex w-fit min-h-10 items-center text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Back to guide sections
            </button>

            <GuideGroupCard group={activeGroup} />

            <button
              type="button"
              onClick={() => setActiveGroupId(null)}
              className="inline-flex w-fit min-h-10 items-center border-t border-zinc-800 pt-4 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Back to guide sections
            </button>
          </section>
        )}
      </div>
    </AppShell>
  );
}
