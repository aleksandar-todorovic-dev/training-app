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
    <article className={articleClassName}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#3FA8B6]/18 bg-[#10292E]/36 text-sm font-semibold text-[#8FDCE5]">
          {index + 1}
        </div>

        <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-zinc-50">
          {topic.title}
        </h3>
      </div>

      <div className="mt-4">
        {leadParagraph ? (
          <p className="rounded-xl border border-amber-300/14 bg-amber-300/[0.035] px-3 py-2 text-sm font-medium leading-5 text-zinc-200">
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
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-zinc-600">
              Practical rules
            </p>

            <ul className="mt-2.5 flex flex-col gap-1.5">
              {topic.bullets.map((bullet, bulletIndex) => (
                <li
                  key={`${topic.id}-bullet-${bulletIndex}`}
                  className="flex gap-2.5 rounded-xl border border-white/7 bg-[#071012]/24 px-2.5 py-2 text-sm leading-5 text-zinc-300"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9B57A]/72" />
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
