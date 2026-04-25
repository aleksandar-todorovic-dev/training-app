import SectionCard from "../layout/SectionCard";
import GuideTopicBlock from "./GuideTopicBlock";
import { UI_STACK_LG, UI_STACK_MD, UI_TEXT_MUTED } from "../../styles/ui";

export default function GuideGroupCard({ group }) {
  return (
    <SectionCard>
      <div className={UI_STACK_LG}>
        <div className={UI_STACK_MD}>
          <h2 className="text-lg font-semibold text-slate-100">
            {group.title}
          </h2>
          <p className={UI_TEXT_MUTED}>{group.intro}</p>
        </div>

        <div className={UI_STACK_LG}>
          {group.topics.map((topic) => (
            <GuideTopicBlock key={topic.id} topic={topic} />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
