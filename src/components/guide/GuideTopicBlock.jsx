/**
 * Displays one guide topic in a full-width reading flow.
 *
 * UI note:
 * Topic blocks render static educational content from the guide data layer.
 */
export default function GuideTopicBlock({
  topic,
  index,
  anchorId,
  isFirst = false,
  accentTextClassName,
  accentBorderClassName,
}) {
  const [leadParagraph, ...bodyParagraphs] = topic.paragraphs ?? [];
  const hasBullets = Boolean(topic.bullets?.length);

  return (
    <section
      id={anchorId}
      aria-labelledby={`${anchorId}-title`}
      className={`scroll-mt-5 py-8 ${isFirst ? "border-t-0 pt-0" : "border-t border-[#2A3138]"}`}
    >
      <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
        <p
          className={`pt-1 text-sm font-semibold tabular-nums ${accentTextClassName}`}
        >
          {String(index + 1).padStart(2, "0")}
        </p>

        <div className="min-w-0">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
            Coach topic
          </p>

          <h2
            id={`${anchorId}-title`}
            className="mt-1.5 text-xl font-semibold leading-snug tracking-[-0.025em] text-[#F3F5F1]"
          >
            {topic.title}
          </h2>
        </div>
      </div>

      <div className="mt-5 pl-0 sm:pl-11">
        {leadParagraph ? (
          <p
            className={`border-l-2 ${accentBorderClassName} pl-4 text-[0.95rem] font-medium leading-7 text-[#D8DDD8]`}
          >
            {leadParagraph}
          </p>
        ) : null}

        {bodyParagraphs.length ? (
          <div className="mt-5 flex flex-col gap-4">
            {bodyParagraphs.map((paragraph, paragraphIndex) => (
              <p
                key={`${topic.id}-paragraph-${paragraphIndex}`}
                className="text-sm leading-7 text-[#AAB2BA]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {hasBullets ? (
          <div className="mt-6">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
              Practical rules
            </p>

            <ul className="mt-3 border-y border-[#2A3138]">
              {topic.bullets.map((bullet, bulletIndex) => (
                <li
                  key={`${topic.id}-bullet-${bulletIndex}`}
                  className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-2.5 border-b border-[#2A3138] py-3 last:border-b-0"
                >
                  <span
                    className={`text-xs font-semibold tabular-nums ${accentTextClassName}`}
                  >
                    {String(bulletIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium leading-6 text-[#D1D7D1]">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
