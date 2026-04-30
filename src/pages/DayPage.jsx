import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import BackButton from "../components/common/BackButton";
import PrimaryButton from "../components/common/PrimaryButton";
import SessionInfoCard from "../components/day/SessionInfoCard";
import ExerciseListCard from "../components/day/ExerciseListCard";
import CoreBlockCard from "../components/day/CoreBlockCard";
import FinishDaySheet from "../components/day/FinishDaySheet";
import WarmupSheet from "../components/warmup/WarmupSheet";

import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getExercisesForDay } from "../data/exercises";
import { getCoreBlockById } from "../data/core";
import { getWarmupById } from "../data/warmups";
import { UI_STACK_LG, UI_TEXT_MUTED, UI_TITLE } from "../styles/ui";

const STATIC_DAY_PROGRESS_MAP = {
  "bulk-pro": {
    d1: "0/8 exercises completed",
    d2: "0/9 exercises completed",
    d3: "0/8 exercises completed",
    d4: "0/9 exercises completed",
    d5: "0/9 exercises completed",
    d6: "0/12 exercises completed",
  },
  "cut-pro": {
    d1: "0/8 exercises completed",
    d2: "0/9 exercises completed",
    d3: "0/8 exercises completed",
    d4: "0/8 exercises completed",
    d5: "0/9 exercises completed",
    d6: "0/10 exercises completed",
  },
};

export default function DayPage() {
  const { planId, dayId } = useParams();
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [isFinishDayOpen, setIsFinishDayOpen] = useState(false);

  useEffect(() => {
    if (!isWarmupOpen && !isFinishDayOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isWarmupOpen, isFinishDayOpen]);

  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);
  const exercises = dayDetails
    ? getExercisesForDay(planId, dayDetails.exerciseIds)
    : [];
  const coreBlock = dayDetails?.coreBlockId
    ? getCoreBlockById(dayDetails.coreBlockId)
    : null;
  const warmupId = dayDetails?.sessionInfo?.warmupId;
  const warmup = warmupId ? getWarmupById(planId, warmupId) : null;

  const progressText = dayDetails
    ? (STATIC_DAY_PROGRESS_MAP[planId]?.[dayDetails.id] ??
      "0/0 exercises completed")
    : "0/0 exercises completed";

  if (!plan || !dayDetails) {
    return (
      <AppShell>
        <div className={UI_STACK_LG}>
          <div className="flex justify-start">
            <BackButton to={plan ? `/plan/${planId}/cycle` : "/"}>
              {plan ? "Back to Cycle" : "Back to Home"}
            </BackButton>
          </div>

          <header className="flex flex-col gap-3">
            <h1 className={UI_TITLE}>Day not found</h1>
            <p className={UI_TEXT_MUTED}>
              The selected day could not be loaded.
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
          <h1 className={UI_TITLE}>
            {dayDetails.label} — {dayDetails.name}
          </h1>

          <div className="flex flex-col gap-1">
            <p className={UI_TEXT_MUTED}>Goal: {dayDetails.goal}</p>
            <p className={UI_TEXT_MUTED}>{progressText}</p>
          </div>
        </header>

        <SessionInfoCard
          sessionInfo={dayDetails.sessionInfo}
          onWarmupClick={() => setIsWarmupOpen(true)}
        />

        {exercises.map((exercise) => (
          <ExerciseListCard
            key={exercise.id}
            planId={planId}
            dayId={dayId}
            exercise={exercise}
            status="Not started"
          />
        ))}

        {coreBlock ? (
          <CoreBlockCard
            planId={planId}
            dayId={dayId}
            coreBlock={coreBlock}
            status="Not started"
          />
        ) : null}

        <PrimaryButton type="button" onClick={() => setIsFinishDayOpen(true)}>
          Finish day
        </PrimaryButton>
      </div>

      {isWarmupOpen ? (
        <WarmupSheet
          dayDetails={dayDetails}
          warmup={warmup}
          onClose={() => setIsWarmupOpen(false)}
        />
      ) : null}

      {isFinishDayOpen ? (
        <FinishDaySheet
          dayDetails={dayDetails}
          progressText={progressText}
          hasCoreBlock={Boolean(coreBlock)}
          onClose={() => setIsFinishDayOpen(false)}
        />
      ) : null}
    </AppShell>
  );
}
