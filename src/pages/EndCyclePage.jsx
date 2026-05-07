import { useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import SectionCard from "../components/layout/SectionCard";
import { getPlanById } from "../data/plans";
import { UI_STACK_LG, UI_TEXT_MUTED, UI_TITLE } from "../styles/ui";

const STATIC_CYCLE_RECAP = {
  "bulk-pro": {
    trainingDays: "6/6",
    exerciseCompletion: "Preview",
  },
  "cut-pro": {
    trainingDays: "6/6",
    exerciseCompletion: "Preview",
  },
};

export default function EndCyclePage() {
  const { planId } = useParams();
  const plan = getPlanById(planId);

  const recap = STATIC_CYCLE_RECAP[planId] ?? {
    trainingDays: "6/6",
    exerciseCompletion: "Preview",
  };

  if (!plan) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to="/">Back to Home</BackButton>
          </div>

          <header className="flex flex-col gap-3">
            <h1 className={UI_TITLE}>Cycle not found</h1>
            <p className={UI_TEXT_MUTED}>
              The selected plan could not be loaded.
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
          <BackButton to={`/plan/${planId}/cycle`}>Back to Cycle</BackButton>
        </div>

        <header className="flex flex-col gap-3">
          <p className="text-sm font-medium text-zinc-500">
            {plan.name} — Cycle 1
          </p>

          <h1 className={UI_TITLE}>Cycle complete</h1>

          <p className={UI_TEXT_MUTED}>
            Review the cycle summary and prepare the next run of the plan.
          </p>
        </header>

        <SectionCard>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold text-zinc-100">
                Cycle recap
              </h2>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                This summary will later reflect your real completed training
                days, exercise completion, and logged work.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                  Training days
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
                  {recap.trainingDays}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                  Exercises
                </p>
                <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-100">
                  {recap.exerciseCompletion}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t border-zinc-800 pt-5">
              <h2 className="text-sm font-semibold text-zinc-100">
                Next cycle
              </h2>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                Your previous logged values will later become the base for the
                next cycle.
              </p>

              <p className={`text-sm leading-6 ${UI_TEXT_MUTED}`}>
                Once workout logic is active, starting a new cycle will keep
                those values available as your next baseline.
              </p>
            </div>
          </div>
        </SectionCard>

        <PrimaryButton to={`/plan/${planId}/cycle`}>
          Start new cycle
        </PrimaryButton>
      </div>
    </AppShell>
  );
}
