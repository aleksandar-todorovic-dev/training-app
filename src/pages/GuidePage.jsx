import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  ChevronRight,
  GitBranch,
  Moon,
} from "lucide-react";

import AppShell from "../components/layout/AppShell";
import GuideGroupCard from "../components/guide/GuideGroupCard";

import { getPlanById } from "../data/plans";
import { getGuideByPlanId } from "../data/guides";
import { pressableTap, revealPanelVariants } from "../styles/motion";
import {
  UI_TEXT_BODY,
  UI_TEXT_BODY_RELAXED,
  UI_TEXT_CARD_TITLE,
  UI_TEXT_EYEBROW,
  UI_TEXT_EYEBROW_ACCENT,
  UI_TEXT_META,
  UI_TEXT_SECTION_TITLE,
} from "../styles/ui";

const MotionButton = motion.button;
const MotionDiv = motion.div;
const MotionSection = motion.section;

const GUIDE_SECTION_ICONS = [BookOpen, CheckSquare, GitBranch, Moon];

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

  function scrollToPageTop() {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
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
      <AppShell>
        <div className="flex flex-col gap-7">
          <Link
            to={plan ? `/plan/${planId}` : "/"}
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to {plan ? "plan" : "home"}
          </Link>

          <header className="flex flex-col gap-3">
            <p className={UI_TEXT_EYEBROW_ACCENT}>
              Coach Library
            </p>

            <h1 className="text-4xl font-semibold tracking-tight text-zinc-50">
              Guide not found
            </h1>

            <p className={UI_TEXT_BODY_RELAXED}>
              The selected guide could not be loaded.
            </p>
          </header>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <AnimatePresence initial={false} mode="wait">
        {!activeGroup ? (
          <MotionDiv
            key="guide-sections"
            className="flex flex-col gap-5"
            variants={revealPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Link
              to={`/plan/${planId}`}
              className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
              Back to plan
            </Link>

            <header className="flex flex-col gap-4">
              <div className="flex flex-col gap-2.5">
                <p className={UI_TEXT_EYEBROW_ACCENT}>
                  Coach Library
                </p>

                <h1 className="text-3xl font-semibold leading-tight tracking-tight text-zinc-50">
                  {guide.title}
                </h1>

                <p className={`max-w-sm ${UI_TEXT_BODY_RELAXED}`}>
                  {guide.intro}
                </p>
              </div>

              <div className="border-l border-amber-300/32 pl-3">
                <p className="text-sm font-semibold text-amber-200">
                  Learn the system, then train with less guessing.
                </p>

                <p className={`mt-1 ${UI_TEXT_META}`}>
                  Use this library to understand the cycle, progression,
                  logging, recovery, and plan decisions.
                </p>
              </div>
            </header>

            <section className="flex flex-col gap-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className={UI_TEXT_EYEBROW}>
                    Sections
                  </p>

                  <h2 className={`mt-1 ${UI_TEXT_SECTION_TITLE}`}>
                    Choose what you need now
                  </h2>
                </div>

                <p className={UI_TEXT_META}>
                  {guide.groups.length} areas
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {guide.groups.map((group, index) => {
                  const SectionIcon = GUIDE_SECTION_ICONS[index] ?? BookOpen;

                  return (
                    <MotionButton
                      key={group.id}
                      type="button"
                      onClick={() => handleOpenGroup(group.id)}
                      whileTap={pressableTap}
                      className="group rounded-2xl border border-white/8 bg-white/[0.018] px-3 py-3 text-left transition hover:border-[#3FA8B6]/18 hover:bg-white/[0.03]"
                    >
                      <div className="grid grid-cols-[2rem_1fr] gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#3FA8B6]/18 bg-[#10292E]/36 text-sm font-semibold text-[#8FDCE5]">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <SectionIcon
                                  aria-hidden="true"
                                  className="h-4 w-4 shrink-0 text-[#8FDCE5]/64"
                                />

                                <h3
                                  className={`${UI_TEXT_CARD_TITLE} transition group-hover:text-cyan-100`}
                                >
                                  {group.title}
                                </h3>
                              </div>

                              <p className={`mt-1.5 ${UI_TEXT_BODY}`}>
                                {group.intro}
                              </p>
                            </div>

                            <ChevronRight
                              aria-hidden="true"
                              className="mt-1 h-5 w-5 shrink-0 text-zinc-600 transition group-hover:text-cyan-300"
                            />
                          </div>

                          <p className={`mt-2 ${UI_TEXT_EYEBROW}`}>
                            {group.topics.length} topics
                          </p>
                        </div>
                      </div>
                    </MotionButton>
                  );
                })}
              </div>
            </section>
          </MotionDiv>
        ) : (
          <MotionSection
            key={activeGroup.id}
            className="flex flex-col gap-5"
            variants={revealPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              type="button"
              onClick={handleBackToSections}
              className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
              Guide sections
            </button>

            <GuideGroupCard group={activeGroup} />

            <div className="pt-2">
              <button
                type="button"
                onClick={handleBackToSections}
                className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300/75 transition hover:text-cyan-200"
              >
                <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                Guide sections
              </button>
            </div>
          </MotionSection>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
