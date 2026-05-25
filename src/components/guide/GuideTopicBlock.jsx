import SectionCard from "../layout/SectionCard";
import { UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

/**
 * Displays one guide topic with optional paragraph and bullet content.
 *
 * UI note:
 * Topic blocks render static educational content from the guide data layer.
 */
export default function GuideTopicBlock({ topic }) {
  return (
    <div className={UI_STACK_MD}>
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-slate-100">
          {topic.title}
        </h3>

        {topic.paragraphs?.map((paragraph) => (
          <p key={paragraph} className={UI_TEXT_MUTED}>
            {paragraph}
          </p>
        ))}
      </div>

      {topic.bullets?.length ? (
        <SectionCard className="bg-zinc-900/40">
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-zinc-300">
            {topic.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  );
}
