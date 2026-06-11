import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import SectionCard from "../components/layout/SectionCard";
import { UI_TEXT_MUTED } from "../styles/ui";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getCoreBlockById, getCoreExercisesByIds } from "../data/core";
import CoreWorkflowCard from "../components/core/CoreWorkflowCard";
import { sanitizeCoreSetInputValue } from "../utils/runtime/coreInputHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";

/**
 * Page-level orchestrator for one core block workflow.
 *
 * Runtime note:
 * CorePage resolves route/static data, reads the active cycle core log, lazily
 * ensures the core block log for active days, and delegates row updates to the
 * reducer through intent handlers.
 */
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

  // Read the current runtime cycle/day/core state used for page mode and rows.
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
    ? getDayMode({
        dayId: dayDetails.id,
        currentDayId,
        dayLog,
        dayOrder,
      })
    : "inactive";

  const isUpcomingPreview = dayMode === "upcoming";
  const isActiveCoreRoute = dayMode === "active" && isCoreBlockForDay;
  const needsDayEntryFirst = isActiveCoreRoute && !dayLog;

  // Lazily create the core block log only when the core workflow is available
  // for logging/review. Upcoming preview routes stay static/read-only and must
  // not create progress. Active deep links without a day log are guarded below.
  useEffect(() => {
    if (
      !plan ||
      !dayDetails ||
      !coreBlock ||
      isUpcomingPreview ||
      !dayLog ||
      coreBlockLog
    ) {
      return;
    }

    dispatch({
      type: APP_ACTIONS.ENSURE_CORE_BLOCK_LOG,
      payload: {
        planId,
        dayId,
        coreBlock,
        coreExercises,
      },
    });
  }, [
    dispatch,
    plan,
    planId,
    dayId,
    dayDetails,
    coreBlock,
    coreExercises,
    isUpcomingPreview,
    dayLog,
    coreBlockLog,
  ]);

  // Handler guards are a safety boundary: upcoming previews may render the
  // structure, but they must not dispatch runtime updates.
  function handleToggleCoreSetDone(coreExerciseId, setNumber) {
    if (isUpcomingPreview) {
      return;
    }

    dispatch({
      type: APP_ACTIONS.TOGGLE_CORE_SET_DONE,
      payload: {
        planId,
        dayId,
        coreExerciseId,
        setIndex: setNumber,
      },
    });
  }

  // Update one editable value on one prescribed core set row.
  function handleUpdateCoreSetField(coreExerciseId, setNumber, field, value) {
    if (isUpcomingPreview) {
      return;
    }

    const sanitizedValue = sanitizeCoreSetInputValue(field, value);

    if (sanitizedValue === null) {
      return;
    }

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

  // Close intent is stored at core-block level; set completion remains derived
  // from core set rows.
  function handleCloseCoreBlock() {
    if (isUpcomingPreview) {
      return;
    }

    dispatch({
      type: APP_ACTIONS.MARK_CORE_BLOCK_CLOSED,
      payload: {
        planId,
        dayId,
        closedAt: new Date().toISOString(),
      },
    });

    navigate(`/plan/${planId}/day/${dayId}`);
  }

  if (!plan || !dayDetails || !coreBlock || !isCoreBlockForDay) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Link
            to={planId ? `/plan/${planId}/cycle` : "/"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#C4B5FD] transition hover:text-[#DDD6FE]"
          >
            <span aria-hidden="true">←</span>
            Back
          </Link>

          <SectionCard>
            <p className={UI_TEXT_MUTED}>
              Core block data could not be found for this route.
            </p>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  if (needsDayEntryFirst) {
    return (
      <AppShell>
        <div className="space-y-5">
          <Link
            to={`/plan/${planId}/day/${dayId}`}
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
          >
            <span aria-hidden="true">←</span>
            Back to Day
          </Link>

          <SectionCard>
            <p className={UI_TEXT_MUTED}>
              {currentCycle
                ? "Open the day first to prepare today's core log."
                : "Start a cycle before logging this core block."}
            </p>
          </SectionCard>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              to={`/plan/${planId}/day/${dayId}`}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-zinc-500 transition hover:text-zinc-200"
            >
              <span aria-hidden="true">←</span>
              Back to Day
            </Link>

            <p className="flex min-w-0 items-center justify-end gap-2 truncate text-right text-xs font-medium text-zinc-500">
              <span className="min-w-0 truncate">
                {plan.name} · Cycle {currentCycleNumber ?? 1} ·{" "}
                {dayDetails.label}
              </span>

              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8B5CF6]/80"
                aria-hidden="true"
              />
            </p>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              {coreBlock.name}
            </h1>

            <p className="text-sm leading-5 text-zinc-400">{coreBlock.focus}</p>
          </div>
        </header>

        {isUpcomingPreview ? (
          <div className="rounded-2xl border border-[#8B5CF6]/22 bg-[#4C1D95]/10 px-4 py-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#C4B5FD]">
              Preview mode
            </p>

            <p className="mt-1.5 text-sm leading-5 text-zinc-400">
              Review the core structure now. Logging unlocks when this day
              becomes current.
            </p>
          </div>
        ) : null}

        <CoreWorkflowCard
          coreBlock={coreBlock}
          exercises={coreExercises}
          coreBlockLog={coreBlockLog}
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
