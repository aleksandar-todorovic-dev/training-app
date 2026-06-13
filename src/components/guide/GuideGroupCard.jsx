import { motion } from "motion/react";

import GuideTopicBlock from "./GuideTopicBlock";
import { staggerContainerVariants } from "../../styles/motion";
import {
  UI_TEXT_BODY_RELAXED,
  UI_TEXT_EYEBROW_ACCENT,
} from "../../styles/ui";

const MotionDiv = motion.div;

/**
 * Displays one guide section group with its related guide topics.
 *
 * UI note:
 * Guide content is educational/support content only. It does not affect
 * workout progress, completion, or runtime state.
 */
export default function GuideGroupCard({ group }) {
  return (
    <div className="flex flex-col">
      <header className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.018] px-3 py-3">
        <div>
          <p className={UI_TEXT_EYEBROW_ACCENT}>
            Guide section
          </p>

          <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-zinc-50">
            {group.title}
          </h2>

          <p className={`mt-2 max-w-sm ${UI_TEXT_BODY_RELAXED}`}>
            {group.intro}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-zinc-800 bg-zinc-900/64 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
            {group.topics.length} topics
          </span>

          <span className="rounded-full border border-amber-300/22 bg-amber-300/8 px-2.5 py-0.5 text-xs font-medium text-amber-200">
            Coach notes
          </span>
        </div>
      </header>

      <MotionDiv
        className="mt-3 flex flex-col gap-3"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {group.topics.map((topic, index) => (
          <GuideTopicBlock
            key={topic.id}
            topic={topic}
            index={index}
            isFirst={index === 0}
            isLast={index === group.topics.length - 1}
          />
        ))}
      </MotionDiv>
    </div>
  );
}
