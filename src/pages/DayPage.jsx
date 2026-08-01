import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Link, useNavigate, useParams } from "react-router-dom";

import ExerciseListCard from "../components/day/ExerciseListCard";
import FinishDaySheet from "../components/day/FinishDaySheet";
import SessionInfoCard from "../components/day/SessionInfoCard";
import AppShell from "../components/layout/AppShell";
import WarmupSheet from "../components/warmup/WarmupSheet";
import { getCoreBlockById, getCoreExercisesByIds } from "../data/core";
import { getDayDetails } from "../data/dayDetails";
import { getExercisesForDay } from "../data/exercises";
import { getPlanById } from "../data/plans";
import { getWarmupById } from "../data/warmups";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import { getCoreBlockStatus } from "../utils/runtime/coreStatusHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";
import { getExerciseStatus } from "../utils/runtime/exerciseStatusHelpers";
import { getMissingValueWarningSummary } from "../utils/runtime/missingValueWarningHelpers";

function getDoneMainExerciseCount(dayLog) {
  if (!dayLog) return 0;
  return Object.values(dayLog.mainExerciseLogs ?? {}).filter(
    (exerciseLog) => getExerciseStatus(exerciseLog) === "complete",
  ).length;
}

function getDoneSetCount(dayLog) {
  if (!dayLog) return 0;
  return Object.values(dayLog.mainExerciseLogs ?? {}).reduce(
    (total, exerciseLog) =>
      total + (exerciseLog.sets?.filter((set) => set.isDone).length ?? 0),
    0,
  );
}

function getNextActionableExercise({ exercises, dayLog }) {
  if (!exercises.length) return null;
  if (!dayLog) return { exercise: exercises[0], exerciseLog: null };

  const exercise = exercises.find((candidate) => {
    const exerciseLog = dayLog.mainExerciseLogs?.[candidate.id];
    if (!exerciseLog) return true;
    if (exerciseLog.closedAt) return false;
    return getExerciseStatus(exerciseLog) !== "complete";
  });

  return exercise
    ? { exercise, exerciseLog: dayLog.mainExerciseLogs?.[exercise.id] ?? null }
    : null;
}

function formatTargetRir(targetRir) {
  return targetRir ? targetRir.replace("≈", "").trim() : null;
}

function CoreFlowRow({
  planId,
  dayId,
  coreBlock,
  status,
  coreExerciseCount,
  isLast,
}) {
  const statusLabel =
    status === "Logged" ? "Complete" : status === "Partial" ? "Partial" : "Support branch";

  return (
    <Link
      to={`/plan/${planId}/day/${dayId}/core/${coreBlock.id}`}
      className="group grid min-h-16 grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
    >
      <div className="relative flex justify-center pt-4">
        <span className="z-10 flex h-7 w-7 items-center justify-center border border-[#9BA7AD] bg-[#232722] font-display text-[0.64rem] font-bold uppercase text-[#C7D0D3]">
          C
        </span>
        {!isLast ? (
          <span className="absolute bottom-0 top-11 w-px border-l border-dashed border-[#59625A]" />
        ) : null}
      </div>
      <div className="border-t border-[#3B3D34] py-3.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="font-display text-xl font-semibold leading-none text-[#F2EEE4]">
            {coreBlock.name}
          </h3>
          <span className="text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#B7C0C4]">
            {statusLabel}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-[#87877E]">
          {coreExerciseCount} core exercises · Movable guidance block
        </p>
      </div>
      <ArrowUpRight
        className="mt-4 h-4 w-4 text-[#87877E] transition-colors group-hover:text-[#FF8B73]"
        aria-hidden="true"
      />
    </Link>
  );
}

/** Runtime orchestrator and command surface for one training day. */
export default function DayPage() {
  const { planId, dayId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();
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
  const exercises = useMemo(
    () =>
      dayDetails ? getExercisesForDay(planId, dayDetails.exerciseIds) : [],
    [planId, dayDetails],
  );
  const coreBlock = dayDetails?.coreBlockId
    ? getCoreBlockById(dayDetails.coreBlockId)
    : null;
  const coreExercises = useMemo(
    () => (coreBlock ? getCoreExercisesByIds(coreBlock.exerciseIds) : []),
    [coreBlock],
  );
  const warmup = dayDetails?.sessionInfo?.warmupId
    ? getWarmupById(planId, dayDetails.sessionInfo.warmupId)
    : null;

  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber;
  const currentCycle = currentCycleNumber
    ? planProgress?.cycles?.[currentCycleNumber]
    : null;
  const dayLog = dayDetails ? currentCycle?.dayLogs?.[dayDetails.id] : null;
  const coreBlockLog = dayLog?.coreBlockLog ?? null;
  const currentDayId = currentCycle?.currentDayId ?? "d1";
  const dayOrder = plan?.dayOrder ?? [];
  const dayMode = dayDetails
    ? getDayMode({ dayId: dayDetails.id, currentDayId, dayLog, dayOrder })
    : "inactive";

  useEffect(() => {
    if (!plan || !dayDetails || !currentCycle || dayMode !== "active") return;

    dispatch({
      type: APP_ACTIONS.ENSURE_DAY_LOG,
      payload: { planId, dayDetails, exercises },
    });
  }, [
    dispatch,
    plan,
    planId,
    dayDetails,
    exercises,
    currentCycle,
    dayMode,
  ]);

  if (!plan || !dayDetails) {
    return (
      <AppShell mode="training">
        <div className="flex flex-col gap-7">
          <Link
            to={plan ? `/plan/${planId}/cycle` : "/"}
            className="inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#AAA99F]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {plan ? "Cycle" : "Home"}
          </Link>
          <section className="cut-corner border border-[#3B3D34] bg-[#21221D] p-5">
            <h1 className="font-display text-4xl font-bold uppercase leading-none text-[#F2EEE4]">
              Day not found
            </h1>
          </section>
        </div>
      </AppShell>
    );
  }

  if (!currentCycle) {
    return (
      <AppShell mode="training">
        <div className="flex flex-col gap-7">
          <Link
            to={`/plan/${planId}`}
            className="inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#AAA99F]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Plan overview
          </Link>
          <section className="cut-corner border border-[#3B3D34] bg-[#21221D] p-5">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#FF8B73]">
              Day instrument offline
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-none text-[#F2EEE4]">
              Start the cycle first
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#AAA99F]">
              A direct day route cannot create a cycle. Start explicitly from
              Plan Overview, then open the current day.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  const totalExerciseCount = dayLog
    ? Object.keys(dayLog.mainExerciseLogs ?? {}).length
    : dayDetails.exerciseIds.length;
  const completedExerciseCount = getDoneMainExerciseCount(dayLog);
  const doneSetCount = getDoneSetCount(dayLog);
  const progressPercent =
    totalExerciseCount > 0
      ? (completedExerciseCount / totalExerciseCount) * 100
      : 0;
  const nextAction = getNextActionableExercise({ exercises, dayLog });
  const nextExercise = nextAction?.exercise ?? null;
  const nextExerciseLog = nextAction?.exerciseLog ?? null;
  const nextExerciseCtaLabel =
    getExerciseStatus(nextExerciseLog) === "partial"
      ? "Continue exercise"
      : "Start exercise";
  const nextExerciseTargetRir = formatTargetRir(
    nextExercise?.details?.targetRir,
  );
  const missingValueWarningSummary = getMissingValueWarningSummary({
    dayLog,
    coreExercises,
    currentCycleNumber,
  });
  const coreRuntimeStatus = getCoreBlockStatus(coreBlockLog);
  const coreStatusLabel =
    coreRuntimeStatus === "complete"
      ? "Logged"
      : coreRuntimeStatus === "partial"
        ? "Partial"
        : "Not started";
  const currentDayIndex = dayOrder.indexOf(dayId);
  const nextDayId =
    currentDayIndex >= 0 ? dayOrder[currentDayIndex + 1] ?? null : null;
  const nextDayDetails = nextDayId ? getDayDetails(planId, nextDayId) : null;

  function getExerciseStatusLabel(exercise) {
    const status = getExerciseStatus(dayLog?.mainExerciseLogs?.[exercise.id]);
    if (status === "complete") return "Logged";
    if (status === "partial") return "Partial";
    return "Not started";
  }

  function handleConfirmFinishDay() {
    dispatch({
      type: APP_ACTIONS.FINISH_DAY,
      payload: { planId, dayId, finishedAt: new Date().toISOString() },
    });
    setIsFinishDayOpen(false);
    navigate(`/plan/${planId}/cycle`);
  }

  const modeLabel =
    dayMode === "active"
      ? "Current day"
      : dayMode === "finished"
        ? "Saved day log"
        : dayMode === "upcoming"
          ? "Read-only preview"
          : "Inactive";

  return (
    <AppShell mode="training">
      <div className="flex flex-col gap-6 pb-3">
        <Link
          to={`/plan/${planId}/cycle`}
          className="inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#AAA99F] transition-colors hover:text-[#F2EEE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Cycle map
        </Link>

        <header className="border-b border-[#3B3D34] pb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#FF8B73]">
                {plan.name} · Cycle {currentCycleNumber ?? 1}
              </p>
              <div className="mt-3 flex items-start gap-3">
                <span className="flex h-11 min-w-11 items-center justify-center border border-[#FF795F] bg-[#FF5A3C] px-2 font-display text-xl font-bold text-[#171814]">
                  {dayDetails.label}
                </span>
                <div>
                  <h1 className="font-display text-[2.65rem] font-bold uppercase leading-[0.84] tracking-[-0.02em] text-[#F2EEE4]">
                    {dayDetails.name}
                  </h1>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#AAA99F]">
                    {dayDetails.goal}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-1 text-right text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[#87877E]">
              {modeLabel}
            </p>
          </div>
        </header>

        <section aria-label="Main exercise progress" className="border-y border-[#3B3D34] py-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-4xl font-bold leading-none tabular-nums text-[#F2EEE4]">
                {String(completedExerciseCount).padStart(2, "0")}
                <span className="text-[#606258]">/{String(totalExerciseCount).padStart(2, "0")}</span>
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#87877E]">
                Main exercises fully checked
              </p>
            </div>
            <p className="text-right text-xs leading-5 text-[#AAA99F]">
              {doneSetCount} performed {doneSetCount === 1 ? "set" : "sets"}
            </p>
          </div>
          <div
            className="mt-3 h-1 bg-[#303229]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalExerciseCount}
            aria-valuenow={completedExerciseCount}
            aria-label="Main exercise progress"
          >
            <div
              className={`h-full ${dayMode === "active" ? "bg-[#FF5A3C]" : "bg-[#B8CB70]"}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </section>

        {dayMode === "active" ? (
          <section className="cut-corner border border-[#514536] bg-[#24221C] p-4 shadow-[inset_4px_0_0_#FF5A3C]">
            {nextExercise ? (
              <div>
                <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#FF8B73]">
                  Next on the rail
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-none text-[#F2EEE4]">
                  {nextExercise.name}
                </h2>
                <p className="mt-1 text-sm leading-5 text-[#AAA99F]">
                  {nextExercise.subtitle}
                </p>
                <p className="mt-3 border-t border-[#4A4438] pt-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#C8C5BB]">
                  {nextExercise.prescription}
                  {nextExerciseTargetRir ? ` · RIR ${nextExerciseTargetRir}` : ""}
                </p>
                <div className="mt-4 grid gap-2 min-[380px]:grid-cols-[1fr_auto]">
                  <Link
                    to={`/plan/${planId}/day/${dayId}/exercise/${nextExercise.id}`}
                    className="cut-corner-sm inline-flex min-h-12 items-center justify-between border border-[#FF795F] bg-[#FF5A3C] px-4 text-sm font-semibold text-[#171814] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
                  >
                    {nextExerciseCtaLabel}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsWarmupOpen(true)}
                    className="inline-flex min-h-12 items-center justify-center border border-[#656054] px-4 text-sm font-semibold text-[#E0DDD3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5A13A]"
                  >
                    Warm-up notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 min-[390px]:grid-cols-[1fr_auto] min-[390px]:items-end">
                <div>
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B8CB70]">
                    Main sequence reviewed
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-semibold leading-none text-[#F2EEE4]">
                    Ready for day handoff
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#AAA99F]">
                    Close the node when the record matches what actually happened.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFinishDayOpen(true)}
                  className="cut-corner-sm inline-flex min-h-12 items-center justify-between gap-4 border border-[#B8CB70] bg-[#B8CB70] px-4 text-sm font-semibold text-[#171814]"
                >
                  Finish day <Check className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className="border-l-2 border-[#59625A] pl-4">
            <p className="font-display text-2xl font-semibold leading-none text-[#F2EEE4]">
              {dayMode === "finished" ? "Saved evidence remains editable" : "Plan structure only"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#AAA99F]">
              {dayMode === "finished"
                ? "Open any exercise to review or correct the stored set values."
                : "Logging controls stay absent until this node becomes current."}
            </p>
          </section>
        )}

        <SessionInfoCard
          sessionInfo={dayDetails.sessionInfo}
          dayGoal={dayDetails.goal}
          coreBlock={coreBlock}
        />

        <section aria-labelledby="workout-sequence-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#87877E]">
                Stable order
              </p>
              <h2
                id="workout-sequence-heading"
                className="mt-1 font-display text-3xl font-bold uppercase leading-none text-[#F2EEE4]"
              >
                Session sequence
              </h2>
            </div>
            <p className="text-right text-xs leading-5 text-[#87877E]">
              {exercises.length} main{coreBlock ? " + Core" : ""}
            </p>
          </div>

          <div className="border-y border-[#3B3D34]">
            {exercises.map((exercise, index) => (
              <ExerciseListCard
                key={exercise.id}
                planId={planId}
                dayId={dayId}
                exercise={exercise}
                status={getExerciseStatusLabel(exercise)}
                orderNumber={index + 1}
                isNext={nextExercise?.id === exercise.id && dayMode === "active"}
                isLast={!coreBlock && index === exercises.length - 1}
              />
            ))}

            {coreBlock ? (
              <CoreFlowRow
                planId={planId}
                dayId={dayId}
                coreBlock={coreBlock}
                status={coreStatusLabel}
                coreExerciseCount={coreExercises.length}
                isLast
              />
            ) : null}
          </div>
        </section>

        {dayMode === "active" && nextExercise ? (
          <button
            type="button"
            onClick={() => setIsFinishDayOpen(true)}
            className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#55574D] text-sm font-semibold text-[#C8C5BB] transition-colors hover:border-[#E5A13A] hover:text-[#F2EEE4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C]"
          >
            Finish day with current record
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {isWarmupOpen ? (
          <WarmupSheet
            key="warmup-sheet"
            dayDetails={dayDetails}
            warmup={warmup}
            onClose={() => setIsWarmupOpen(false)}
          />
        ) : null}

        {isFinishDayOpen ? (
          <FinishDaySheet
            key="finish-day-sheet"
            dayDetails={dayDetails}
            nextDayDetails={nextDayDetails}
            progressText={`${completedExerciseCount}/${totalExerciseCount} main exercises fully checked`}
            completedExerciseCount={completedExerciseCount}
            totalExerciseCount={totalExerciseCount}
            doneSetCount={doneSetCount}
            hasCoreBlock={Boolean(coreBlock)}
            missingValueWarningSummary={missingValueWarningSummary}
            onClose={() => setIsFinishDayOpen(false)}
            onConfirmFinish={handleConfirmFinishDay}
          />
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}
