import GuideTopicBlock from "./GuideTopicBlock";

/** Static reader for one selected guide section. */
export default function GuideGroupCard({ group }) {
  return (
    <div>
      <header className="border-b border-[#AFA796] pb-6">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
          Coach library / section
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-6xl font-extrabold uppercase leading-[0.84] tracking-[-0.03em] text-[#191A16]">
          {group.title}
        </h1>
        <p className="mt-5 max-w-xl border-l-2 border-[#FF5A3C] pl-4 text-sm leading-6 text-[#4E5048]">
          {group.intro}
        </p>
        <p className="mt-4 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#5F6158]">
          {group.topics.length} focused notes
        </p>
      </header>

      <div>
        {group.topics.map((topic, index) => (
          <GuideTopicBlock key={topic.id} topic={topic} index={index} />
        ))}
      </div>
    </div>
  );
}
