import GuideTopicBlock from "./GuideTopicBlock";

function getTopicAnchorId(groupId, topicId) {
  return `guide-${groupId}-${topicId}`;
}

function scrollToTopic(topicId) {
  const target = document.getElementById(topicId);

  if (!target) return;

  const shouldReduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  target.scrollIntoView({
    behavior: shouldReduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

/**
 * Displays one guide section as an indexed, full-width reading flow.
 *
 * UI note:
 * Guide content is read-only education. Topic navigation only moves the
 * viewport and does not affect workout progress or runtime state.
 */
export default function GuideGroupCard({
  group,
  groupIndex,
  groupCount,
  accentTextClassName,
  accentBorderClassName,
}) {
  return (
    <article>
      <header>
        <div className="flex items-center justify-between gap-4">
          <p
            className={`text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${accentTextClassName}`}
          >
            Guide section {String(groupIndex + 1).padStart(2, "0")}
          </p>

          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#77818B]">
            {groupIndex + 1} / {groupCount}
          </p>
        </div>

        <h1 className="mt-4 max-w-[24rem] text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[#F3F5F1]">
          {group.title}
        </h1>

        <p className="mt-4 max-w-[25rem] text-[0.95rem] leading-7 text-[#AAB2BA]">
          {group.intro}
        </p>
      </header>

      <nav
        aria-label={`${group.title} topic index`}
        className="mt-7 overflow-hidden rounded-[1.15rem] border border-[#2A3138] bg-[#13181D]"
      >
        <div className="border-b border-[#2A3138] px-4 py-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
            In this section · {group.topics.length} topics
          </p>
        </div>

        {group.topics.map((topic, index) => {
          const topicAnchorId = getTopicAnchorId(group.id, topic.id);

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => scrollToTopic(topicAnchorId)}
              className="group grid min-h-14 w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#2A3138] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[#171D22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8F36B]/55"
            >
              <span
                className={`text-xs font-semibold tabular-nums ${accentTextClassName}`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="text-sm font-semibold leading-5 text-[#D8DDD8] transition-colors group-hover:text-[#F3F5F1]">
                {topic.title}
              </span>

              <span aria-hidden="true" className="text-[#5F6973]">
                ↓
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-8">
        {group.topics.map((topic, index) => (
          <GuideTopicBlock
            key={topic.id}
            topic={topic}
            index={index}
            anchorId={getTopicAnchorId(group.id, topic.id)}
            isFirst={index === 0}
            accentTextClassName={accentTextClassName}
            accentBorderClassName={accentBorderClassName}
          />
        ))}
      </div>

      <footer className="border-t border-[#2A3138] pt-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
          End of section
        </p>
        <p className="mt-1.5 text-sm leading-6 text-[#8E98A2]">
          Use the rules that help the next training decision. The guide does not
          create or change workout progress.
        </p>
      </footer>
    </article>
  );
}
