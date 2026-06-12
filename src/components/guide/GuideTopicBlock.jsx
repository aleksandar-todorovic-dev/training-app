import { motion } from "motion/react";

import { staggerItemVariants } from "../../styles/motion";
import {
  UI_TEXT_BODY_RELAXED,
  UI_TEXT_BODY_STRONG,
  UI_TEXT_CARD_TITLE,
  UI_TEXT_EYEBROW,
} from "../../styles/ui";

const MotionArticle = motion.article;

/**
 * Displays one guide topic with optional paragraph and bullet content.
 *
 * UI note:
 * Topic blocks render static educational content from the guide data layer.
 */
export default function GuideTopicBlock({
  topic,
  index,
  isFirst = false,
  isLast = false,
}) {
  const [leadParagraph, ...bodyParagraphs] = topic.paragraphs ?? [];
  const hasBullets = Boolean(topic.bullets?.length);

  const articleClassName = [
    "rounded-2xl border border-white/8 bg-white/[0.018] px-3 py-3",
    isFirst ? "" : "",
    isLast ? "" : "",
    !isLast && !hasBullets ? "" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <MotionArticle className={articleClassName} variants={staggerItemVariants}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#3FA8B6]/18 bg-[#10292E]/36 text-sm font-semibold text-[#8FDCE5]">
          {index + 1}
        </div>

        <h3 className={`min-w-0 flex-1 leading-snug ${UI_TEXT_CARD_TITLE}`}>
          {topic.title}
        </h3>
      </div>

      <div className="mt-4">
        {leadParagraph ? (
          <p
            className={`rounded-xl border border-amber-300/14 bg-amber-300/[0.035] px-3 py-2 font-medium ${UI_TEXT_BODY_STRONG}`}
          >
            {leadParagraph}
          </p>
        ) : null}

        {bodyParagraphs.length ? (
          <div className="mt-4 flex flex-col gap-3">
            {bodyParagraphs.map((paragraph, paragraphIndex) => (
              <p
                key={`${topic.id}-paragraph-${paragraphIndex}`}
                className={UI_TEXT_BODY_RELAXED}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {hasBullets ? (
          <div className="mt-5">
            <p className={UI_TEXT_EYEBROW}>
              Practical rules
            </p>

            <ul className="mt-2.5 flex flex-col border-y border-white/7">
              {topic.bullets.map((bullet, bulletIndex) => (
                <li
                  key={`${topic.id}-bullet-${bulletIndex}`}
                  className={`flex gap-2.5 border-b border-white/7 py-2 last:border-b-0 ${UI_TEXT_BODY_STRONG}`}
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9B57A]/72" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </MotionArticle>
  );
}
