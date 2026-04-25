import { useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import GuideGroupCard from "../components/guide/GuideGroupCard";

import { getPlanById } from "../data/plans";
import { getGuideByPlanId } from "../data/guides";

import { UI_STACK_LG, UI_TEXT_MUTED, UI_TITLE } from "../styles/ui";

export default function GuidePage() {
  const { planId } = useParams();

  const plan = getPlanById(planId);
  const guide = getGuideByPlanId(planId);

  if (!plan || !guide) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to={plan ? `/plan/${planId}` : "/"}>
              {plan ? "Back to Plan" : "Back to Home"}
            </BackButton>
          </div>

          <header className="flex flex-col gap-3">
            <h1 className={UI_TITLE}>Guide not found</h1>
            <p className={UI_TEXT_MUTED}>
              The selected guide could not be loaded.
            </p>
          </header>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <div className="flex justify-start">
          <BackButton to={`/plan/${planId}`}>Back to Plan</BackButton>
        </div>

        <header className="flex flex-col gap-3">
          <h1 className={UI_TITLE}>{guide.title}</h1>
          <p className={UI_TEXT_MUTED}>{guide.intro}</p>
        </header>

        {guide.groups.map((group) => (
          <GuideGroupCard key={group.id} group={group} />
        ))}
      </div>
    </AppShell>
  );
}
