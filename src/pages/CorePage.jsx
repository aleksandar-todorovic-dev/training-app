import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import CoreWorkflowCard from "../components/core/CoreWorkflowCard";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getCoreBlockById, getCoreExercisesByIds } from "../data/core";
import { sanitizeCoreSetInputValue } from "../utils/runtime/coreInputHelpers";
import { getLatestCoreCarryOverFieldValue } from "../utils/runtime/coreCarryOverHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";

/** Page-level runtime boundary for one Core support branch. */
export default function CorePage() {
  const { planId, dayId, coreId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();
  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);
  const coreBlock = getCoreBlockById(coreId);
  const isCoreBlockForDay = Boolean(dayDetails?.coreBlockId === coreId);
  const coreExercises = useMemo(
    () => getCoreExercisesByIds(coreBlock?.exerciseIds ?? []),
    [coreBlock],
  );
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
  const isUpcomingPreview = dayMode === "upcoming";
  const isActiveCoreRoute = dayMode === "active" && isCoreBlockForDay;
  const needsDayEntryFirst = isActiveCoreRoute && !dayLog;

  const previousValuesByExercise = useMemo(
    () =>
      Object.fromEntries(
        coreExercises.map((exercise) => [
          exercise.id,
          Array.from({ length: exercise.setCount }, (_, index) => {
            const setIndex = index + 1;
            const lookup = (field) =>
              getLatestCoreCarryOverFieldValue({
                cycles: planProgress?.cycles,
                currentCycleNumber,
                dayId,
                coreExerciseId: exercise.id,
                setIndex,
                field,
              });
            return {
              setNumber: setIndex,
              load: lookup("load"),
              reps: lookup("reps"),
              time: lookup("time"),
              rir: lookup("rir"),
            };
          }),
        ]),
      ),
    [coreExercises, currentCycleNumber, dayId, planProgress?.cycles],
  );

  useEffect(() => {
    if (
      !plan ||
      !dayDetails ||
      !coreBlock ||
      !isCoreBlockForDay ||
      isUpcomingPreview ||
      !dayLog ||
      coreBlockLog
    ) {
      return;
    }

    dispatch({
      type: APP_ACTIONS.ENSURE_CORE_BLOCK_LOG,
      payload: { planId, dayId, coreBlock, coreExercises },
    });
  }, [
    dispatch,
    plan,
    planId,
    dayId,
    dayDetails,
    coreBlock,
    coreExercises,
    isCoreBlockForDay,
    isUpcomingPreview,
    dayLog,
    coreBlockLog,
  ]);

  function handleToggleCoreSetDone(coreExerciseId, setNumber) {
    if (isUpcomingPreview) return;
    dispatch({
      type: APP_ACTIONS.TOGGLE_CORE_SET_DONE,
      payload: { planId, dayId, coreExerciseId, setIndex: setNumber },
    });
  }

  function handleUpdateCoreSetField(coreExerciseId, setNumber, field, value) {
    if (isUpcomingPreview) return;
    const sanitizedValue = sanitizeCoreSetInputValue(field, value);
    if (sanitizedValue === null) return;
    dispatch({
      type: APP_ACTIONS.UPDATE_CORE_SET_FIELD,
      payload: {
        planId,
        dayId,
        coreExerciseId,
        setIndex: setNumber,
        field,
        value: sanitizedValue,
      },
    });
  }

  function handleCloseCoreBlock() {
    if (isUpcomingPreview) return;
    dispatch({
      type: APP_ACTIONS.MARK_CORE_BLOCK_CLOSED,
      payload: { planId, dayId, closedAt: new Date().toISOString() },
    });
    navigate(`/plan/${planId}/day/${dayId}`);
  }

  if (!plan || !dayDetails || !coreBlock || !isCoreBlockForDay) {
    return (
      <AppShell mode="training">
        <div className="space-y-6">
          <Link to={planId ? `/plan/${planId}/cycle` : "/"} className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#AAA99F]">← Back</Link>
          <section className="cut-corner border border-[#465056] bg-[#202522] p-5">
            <h1 className="font-display text-3xl font-bold uppercase text-[#F2EEE4]">Core block not found</h1>
            <p className="mt-2 text-sm leading-6 text-[#9FA8AB]">Core block data could not be found for this route.</p>
          </section>
        </div>
      </AppShell>
    );
  }

  if (needsDayEntryFirst) {
    return (
      <AppShell mode="training">
        <div className="space-y-5">
          <Link to={`/plan/${planId}/day/${dayId}`} className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#AAA99F]">← Back to day</Link>
          <section className="cut-corner border border-[#465056] bg-[#202522] p-5">
            <h1 className="font-display text-3xl font-bold uppercase text-[#F2EEE4]">Enter the day first</h1>
            <p className="mt-2 text-sm leading-6 text-[#9FA8AB]">{currentCycle ? "Open the day first to prepare today’s Core log." : "Start a cycle before logging this Core block."}</p>
          </section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell mode="training" width="compact">
      <div className="space-y-5">
        <header>
          <div className="flex items-center justify-between gap-3 border-b border-[#465056] pb-3">
            <Link to={`/plan/${planId}/day/${dayId}`} className="inline-flex min-h-11 shrink-0 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#AAA99F] hover:text-[#F2EEE4]">← Day</Link>
            <p className="min-w-0 truncate text-right text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-[#8D989D]">{plan.name} · C{currentCycleNumber ?? 1} · {dayDetails.label}</p>
          </div>
          <div className="pt-5">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.15em] text-[#B7C0C4]">Core / separate support branch</p>
            <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-[0.92] text-[#F2EEE4] sm:text-5xl">{coreBlock.name}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#9FA8AB]">{coreBlock.focus}</p>
          </div>
        </header>

        <CoreWorkflowCard
          coreBlock={coreBlock}
          exercises={coreExercises}
          coreBlockLog={coreBlockLog}
          previousValuesByExercise={previousValuesByExercise}
          dayMode={dayMode}
          isReadOnly={isUpcomingPreview}
          onToggleCoreSetDone={handleToggleCoreSetDone}
          onUpdateCoreSetField={handleUpdateCoreSetField}
          onCloseCoreBlock={handleCloseCoreBlock}
        />
      </div>
    </AppShell>
  );
}
