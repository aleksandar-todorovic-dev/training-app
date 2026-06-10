import GuideTopicBlock from "./GuideTopicBlock";

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
      <header className="flex flex-col gap-3 border-b border-zinc-800/80 pb-5">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-cyan-300/78">
            Guide section
          </p>

          <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-tight text-zinc-50">
            {group.title}
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-400">
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

      <div className="flex flex-col">
        {group.topics.map((topic, index) => (
          <GuideTopicBlock
            key={topic.id}
            topic={topic}
            index={index}
            isFirst={index === 0}
            isLast={index === group.topics.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
