import { useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import WarmupStepsCard from "../components/warmup/WarmupStepsCard";

import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getWarmupById } from "../data/warmups";

import { UI_STACK_LG, UI_TEXT_MUTED, UI_TITLE } from "../styles/ui";

export default function WarmupPage() {
  const { planId, dayId } = useParams();

  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);
  const warmupId = dayDetails?.sessionInfo?.warmupId;
  const warmup = warmupId ? getWarmupById(planId, warmupId) : null;

  if (!plan || !dayDetails || !warmup) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton
              to={plan && dayDetails ? `/plan/${planId}/day/${dayId}` : "/"}
            >
              {plan && dayDetails ? "Back to Day" : "Back to Home"}
            </BackButton>
          </div>

          <header className="flex flex-col gap-3">
            <h1 className={UI_TITLE}>Warm-up not found</h1>
            <p className={UI_TEXT_MUTED}>
              The selected warm-up could not be loaded.
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
          <BackButton to={`/plan/${planId}/day/${dayId}`}>
            Back to Day
          </BackButton>
        </div>

        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-zinc-500">
              {dayDetails.label} — {dayDetails.name}
            </p>

            <h1 className={UI_TITLE}>{warmup.title}</h1>
          </div>

          <p className={UI_TEXT_MUTED}>Goal: {warmup.goal}</p>
        </header>

        <WarmupStepsCard steps={warmup.steps} />
      </div>
    </AppShell>
  );
}
