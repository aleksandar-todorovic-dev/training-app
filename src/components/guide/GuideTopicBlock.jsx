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
    isFirst ? "pt-5" : "pt-6",
    isLast ? "pb-1" : "pb-5",
    !isLast && !hasBullets ? "border-b border-zinc-800/80" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={articleClassName}>
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-sm font-semibold text-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.06)]">
          {index + 1}
        </div>

        <h3 className="min-w-0 flex-1 text-xl font-semibold leading-snug tracking-tight text-zinc-50">
          {topic.title}
        </h3>
      </div>

      <div className="mt-5">
        {leadParagraph ? (
          <p className="border-l border-amber-300/40 pl-4 text-base font-medium leading-7 text-zinc-200">
            {leadParagraph}
          </p>
        ) : null}

        {bodyParagraphs.length ? (
          <div className="mt-5 flex flex-col gap-4">
            {bodyParagraphs.map((paragraph, paragraphIndex) => (
              <p
                key={`${topic.id}-paragraph-${paragraphIndex}`}
                className="text-sm leading-7 text-zinc-400"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {hasBullets ? (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Practical rules
            </p>

            <ul className="mt-3 flex flex-col border-t border-zinc-800/70">
              {topic.bullets.map((bullet, bulletIndex) => (
                <li
                  key={`${topic.id}-bullet-${bulletIndex}`}
                  className="flex gap-3 border-b border-zinc-800/70 py-2.5 text-sm leading-6 text-zinc-300"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
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
