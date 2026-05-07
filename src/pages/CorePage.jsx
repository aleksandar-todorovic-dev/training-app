import { useParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import { UI_STACK_LG, UI_STACK_MD, UI_TEXT_MUTED } from "../styles/ui";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getCoreBlockById, getCoreExercisesByIds } from "../data/core";
import CoreWorkflowCard from "../components/core/CoreWorkflowCard";

export default function CorePage() {
  const { planId, dayId, coreId } = useParams();

  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);
  const coreBlock = getCoreBlockById(coreId);
  const coreExercises = getCoreExercisesByIds(coreBlock?.exerciseIds ?? []);

  if (!plan || !dayDetails || !coreBlock) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <BackButton to={planId ? `/plan/${planId}/cycle` : "/"} />

          <SectionCard>
            <p className={UI_TEXT_MUTED}>
              Core block data could not be found for this route.
            </p>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className={UI_STACK_LG}>
        <BackButton to={`/plan/${planId}/day/${dayId}`} />

        <div className={UI_STACK_MD}>
          <p className={UI_TEXT_MUTED}>
            {dayDetails.label} — {dayDetails.name}
          </p>

          <div className={UI_STACK_MD}>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              {coreBlock.name}
            </h1>

            <p className={UI_TEXT_MUTED}>{coreBlock.focus}</p>
          </div>
        </div>

        <CoreWorkflowCard coreBlock={coreBlock} exercises={coreExercises} />
      </div>
    </AppShell>
  );
}
