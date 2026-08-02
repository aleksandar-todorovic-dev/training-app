import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";

import AppShell from "../components/layout/AppShell";
import GuideGroupCard from "../components/guide/GuideGroupCard";

import { getPlanById } from "../data/plans";
import { getGuideByPlanId } from "../data/guides";
import { pressableTap, revealPanelVariants } from "../styles/motion";

const MotionButton = motion.button;
const MotionDiv = motion.div;
const MotionSection = motion.section;

function getPlanGuideTone(planId) {
  if (planId === "cut-pro") {
    return {
      phaseCode: "PRESERVE / 02",
      accentText: "text-[#F4C87F]",
      accentBorder: "border-[#F1B864]/38",
      accentBackground: "bg-[#F1B864]/8",
      hoverBorder: "hover:border-[#F1B864]/34",
      hoverText: "group-hover:text-[#F4C87F]",
    };
  }

  return {
    phaseCode: "BUILD / 01",
    accentText: "text-[#C8F78F]",
    accentBorder: "border-[#B8F36B]/34",
    accentBackground: "bg-[#B8F36B]/7",
    hoverBorder: "hover:border-[#B8F36B]/30",
    hoverText: "group-hover:text-[#C8F78F]",
  };
}

function scrollToPageTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });
}

/**
 * Page-level coach library for one predefined plan.
 *
 * Runtime boundary:
 * GuidePage reads static educational content and uses local UI state for
 * section navigation. It does not read or mutate workout progress.
 */
export default function GuidePage() {
  const { planId } = useParams();

  const plan = getPlanById(planId);
  const guide = getGuideByPlanId(planId);
  const tone = getPlanGuideTone(planId);

  const [activeGroupId, setActiveGroupId] = useState(null);

  const activeGroup = useMemo(() => {
    if (!guide?.groups?.length || !activeGroupId) return null;
    return guide.groups.find((group) => group.id === activeGroupId) ?? null;
  }, [guide, activeGroupId]);

  const activeGroupIndex = activeGroup
    ? guide.groups.findIndex((group) => group.id === activeGroup.id)
    : -1;

  const totalTopicCount =
    guide?.groups?.reduce(
      (topicCount, group) => topicCount + group.topics.length,
      0,
    ) ?? 0;

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
      <AppShell mode="performance">
        <div className="flex flex-col gap-7">
          <Link
            to={plan ? `/plan/${planId}` : "/"}
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg pr-2 text-sm font-medium text-[#8E98A2] transition-colors hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to {plan ? "plan" : "home"}
          </Link>

          <header>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#F1B864]">
              Coach library
            </p>

            <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-[#F3F5F1]">
              Guide not found
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-[#AAB2BA]">
              The selected guide could not be loaded.
            </p>
          </header>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mode="performance">
      <AnimatePresence initial={false} mode="wait">
        {!activeGroup ? (
          <MotionDiv
            key="guide-sections"
            className="flex flex-col gap-7"
            variants={revealPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Link
              to={`/plan/${planId}`}
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg pr-2 text-sm font-medium text-[#8E98A2] transition-colors hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to plan
            </Link>

            <header>
              <div className="flex items-center justify-between gap-4">
                <p
                  className={`text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${tone.accentText}`}
                >
                  Coach library
                </p>

                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#77818B]">
                  {tone.phaseCode}
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone.accentBorder} ${tone.accentBackground} ${tone.accentText}`}
                >
                  <BookOpen aria-hidden="true" className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#AAB2BA]">
                    {plan.name}
                  </p>

                  <h1 className="mt-1 text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.045em] text-[#F3F5F1]">
                    {guide.title.replace(`${plan.name} `, "")}
                  </h1>
                </div>
              </div>

              <p className="mt-5 max-w-[25rem] text-[0.95rem] leading-7 text-[#AAB2BA]">
                {guide.intro}
              </p>

              <div className="mt-5 grid grid-cols-2 border-y border-[#2A3138] py-3">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
                    Sections
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-[#F3F5F1]">
                    {guide.groups.length}
                  </p>
                </div>

                <div className="border-l border-[#2A3138] pl-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
                    Topics
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-[#F3F5F1]">
                    {totalTopicCount}
                  </p>
                </div>
              </div>
            </header>

            <aside className="border-l-2 border-[#F1B864]/58 pl-4">
              <p className="text-sm font-semibold text-[#F4C87F]">
                Read only what helps the next decision.
              </p>
              <p className="mt-1 text-sm leading-6 text-[#8E98A2]">
                Training screens stay action-first. Deeper cycle, progression,
                logging, and recovery guidance lives here when you need it.
              </p>
            </aside>

            <section aria-labelledby="guide-section-index-title">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#77818B]">
                    Section index
                  </p>
                  <h2
                    id="guide-section-index-title"
                    className="mt-1.5 text-xl font-semibold tracking-[-0.025em] text-[#F3F5F1]"
                  >
                    Choose the question you are solving
                  </h2>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-[#2A3138] bg-[#13181D]">
                {guide.groups.map((group, index) => (
                  <MotionButton
                    key={group.id}
                    type="button"
                    onClick={() => handleOpenGroup(group.id)}
                    whileTap={pressableTap}
                    className={`group grid min-h-[6.25rem] w-full grid-cols-[2rem_minmax(0,1fr)_auto] gap-3 border-b border-[#2A3138] px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-[#171D22] ${tone.hoverBorder} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8F36B]/55`}
                  >
                    <span
                      className={`pt-0.5 text-sm font-semibold tabular-nums ${tone.accentText}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0">
                      <span
                        className={`block text-base font-semibold leading-snug tracking-[-0.015em] text-[#E8ECE8] transition-colors ${tone.hoverText}`}
                      >
                        {group.title}
                      </span>

                      <span className="mt-1.5 block text-sm leading-5 text-[#8E98A2]">
                        {group.intro}
                      </span>

                      <span className="mt-2 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
                        {group.topics.length} topics
                      </span>
                    </span>

                    <ChevronRight
                      aria-hidden="true"
                      className="mt-0.5 h-5 w-5 shrink-0 text-[#5F6973] transition group-hover:translate-x-0.5 group-hover:text-[#AAB2BA] motion-reduce:transform-none"
                    />
                  </MotionButton>
                ))}
              </div>
            </section>
          </MotionDiv>
        ) : (
          <MotionSection
            key={activeGroup.id}
            className="flex flex-col gap-6"
            variants={revealPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <button
              type="button"
              onClick={handleBackToSections}
              className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg pr-2 text-sm font-medium text-[#8E98A2] transition-colors hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Guide sections
            </button>

            <GuideGroupCard
              group={activeGroup}
              groupIndex={activeGroupIndex}
              groupCount={guide.groups.length}
              accentTextClassName={tone.accentText}
              accentBorderClassName={tone.accentBorder}
            />

            <div className="border-t border-[#2A3138] pt-5">
              <button
                type="button"
                onClick={handleBackToSections}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-2 text-sm font-semibold text-[#AAB2BA] transition-colors hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Back to all guide sections
              </button>
            </div>
          </MotionSection>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
