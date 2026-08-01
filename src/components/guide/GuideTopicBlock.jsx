/** One static educational topic in the paper guide reader. */
export default function GuideTopicBlock({ topic, index }) {
  const [leadParagraph, ...bodyParagraphs] = topic.paragraphs ?? [];

  return (
    <article className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-[#C9C1AF] py-6">
      <span className="font-display text-sm font-bold text-[#66675E]">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-2xl font-bold uppercase leading-none text-[#191A16]">
          {topic.title}
        </h3>

        {leadParagraph ? (
          <p className="mt-4 border-l-2 border-[#E5A13A] pl-3 text-sm font-medium leading-6 text-[#363831]">
            {leadParagraph}
          </p>
        ) : null}

        {bodyParagraphs.length ? (
          <div className="mt-4 space-y-3">
            {bodyParagraphs.map((paragraph, paragraphIndex) => (
              <p
                key={`${topic.id}-paragraph-${paragraphIndex}`}
                className="text-sm leading-6 text-[#5F6158]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {topic.bullets?.length ? (
          <div className="mt-5 border-y border-[#D8D1C2] bg-[#E7E1D2]/45 px-3 py-3">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#5F6158]">
              Practical rules
            </p>
            <ul className="mt-2 space-y-2">
              {topic.bullets.map((bullet, bulletIndex) => (
                <li
                  key={`${topic.id}-bullet-${bulletIndex}`}
                  className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-sm font-medium leading-6 text-[#363831]"
                >
                  <span className="text-[#B33521]" aria-hidden="true">—</span>
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
