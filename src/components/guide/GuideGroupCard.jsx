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
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-4 border-b border-zinc-800 pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Guide section
          </p>

          <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-zinc-50">
            {group.title}
          </h2>

          <p className="mt-3 max-w-sm text-base leading-7 text-zinc-400">
            {group.intro}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-xs font-medium text-zinc-400">
            {group.topics.length} topics
          </span>

          <span className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200">
            Coach notes
          </span>
        </div>
      </header>

      <div className="flex flex-col divide-y divide-zinc-800/80">
        {group.topics.map((topic, index) => (
          <GuideTopicBlock key={topic.id} topic={topic} index={index} />
        ))}
      </div>
    </div>
  );
}