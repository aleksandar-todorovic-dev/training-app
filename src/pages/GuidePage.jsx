import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import GuideGroupCard from "../components/guide/GuideGroupCard";
import { getPlanById } from "../data/plans";
import { getGuideByPlanId } from "../data/guides";

/** Static plan-specific coach library; local navigation never changes progress. */
export default function GuidePage() {
  const { planId } = useParams();
  const plan = getPlanById(planId);
  const guide = getGuideByPlanId(planId);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const activeGroup = useMemo(() => {
    if (!guide?.groups?.length || !activeGroupId) return null;
    return guide.groups.find((group) => group.id === activeGroupId) ?? null;
  }, [guide, activeGroupId]);

  function scrollToPageTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  function handleOpenGroup(groupId) {
    setActiveGroupId(groupId);
    scrollToPageTop();
  }

  function handleBackToSections() {
    setActiveGroupId(null);
    scrollToPageTop();
  }

  if (!plan || !guide) {
    return (
      <AppShell mode="product">
        <div className="space-y-7">
          <Link
            to={plan ? `/plan/${planId}` : "/"}
            className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E]"
          >
            ← {plan ? "Plan" : "Home"}
          </Link>
          <section className="cut-corner border border-[#C9C1AF] bg-[#F8F5EB] p-5">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">Coach library</p>
            <h1 className="mt-3 font-display text-5xl font-bold uppercase leading-none text-[#191A16]">Guide not found</h1>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mode="product" width="wide">
      {activeGroup ? (
        <div className="space-y-6">
          <button
            type="button"
            onClick={handleBackToSections}
            className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E] hover:text-[#191A16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
          >
            ← Guide sections
          </button>
          <GuideGroupCard group={activeGroup} />
          <button
            type="button"
            onClick={handleBackToSections}
            className="inline-flex min-h-11 items-center border-b-2 border-[#FF5A3C] text-xs font-semibold uppercase tracking-[0.12em] text-[#B33521] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
          >
            ← All guide sections
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <Link
            to={`/plan/${planId}`}
            className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E] hover:text-[#191A16]"
          >
            ← Plan overview
          </Link>

          <header className="grid gap-6 border-b border-[#C9C1AF] pb-7 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.6fr)] sm:items-end">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">{plan.name} · Coach library</p>
              <h1 className="mt-3 max-w-3xl font-display text-6xl font-extrabold uppercase leading-[0.84] tracking-[-0.035em] text-[#191A16] min-[390px]:text-7xl">Know the rules.<span className="block text-[#77796D]">Then train.</span></h1>
            </div>
            <p className="border-l-2 border-[#E5A13A] pl-4 text-sm leading-6 text-[#4E5048]">{guide.intro}</p>
          </header>

          <section aria-labelledby="guide-sections-title">
            <div className="flex items-end justify-between gap-4 border-b border-[#AFA796] pb-2">
              <div>
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#5F6158]">Choose only what you need now</p>
                <h2 id="guide-sections-title" className="mt-1 font-display text-4xl font-bold uppercase leading-none text-[#191A16]">Sections</h2>
              </div>
              <span className="font-display text-2xl font-bold text-[#66675E]">{String(guide.groups.length).padStart(2, "0")}</span>
            </div>

            <div>
              {guide.groups.map((group, index) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleOpenGroup(group.id)}
                  className="group grid min-h-24 w-full grid-cols-[2.5rem_minmax(0,1fr)_auto] gap-3 border-b border-[#C9C1AF] py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF5A3C]"
                >
                  <span className="font-display text-sm font-bold text-[#66675E]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-2xl font-bold uppercase leading-none text-[#191A16] transition-colors group-hover:text-[#B33521]">{group.title}</span>
                    <span className="mt-2 block max-w-xl text-sm leading-6 text-[#5F6158]">{group.intro}</span>
                    <span className="mt-2 block text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#5F6158]">{group.topics.length} topics</span>
                  </span>
                  <span className="pt-1 text-xl text-[#B33521]" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
