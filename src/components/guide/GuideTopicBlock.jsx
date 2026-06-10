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
    isFirst ? "pt-4" : "pt-5",
    isLast ? "pb-1" : "pb-4",
    !isLast && !hasBullets ? "border-b border-zinc-800/80" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={articleClassName}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/8 text-sm font-semibold text-cyan-200">
          {index + 1}
        </div>

        <h3 className="min-w-0 flex-1 text-lg font-semibold leading-snug tracking-tight text-zinc-50">
          {topic.title}
        </h3>
      </div>

      <div className="mt-4">
        {leadParagraph ? (
          <p className="border-l border-amber-300/32 pl-3 text-sm font-medium leading-6 text-zinc-200">
            {leadParagraph}
          </p>
        ) : null}

        {bodyParagraphs.length ? (
          <div className="mt-4 flex flex-col gap-3">
            {bodyParagraphs.map((paragraph, paragraphIndex) => (
              <p
                key={`${topic.id}-paragraph-${paragraphIndex}`}
                className="text-sm leading-6 text-zinc-400"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {hasBullets ? (
          <div className="mt-5">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Practical rules
            </p>

            <ul className="mt-2.5 flex flex-col border-t border-zinc-800/60">
              {topic.bullets.map((bullet, bulletIndex) => (
                <li
                  key={`${topic.id}-bullet-${bulletIndex}`}
                  className="flex gap-2.5 border-b border-zinc-800/60 py-2 text-sm leading-5 text-zinc-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/72" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
