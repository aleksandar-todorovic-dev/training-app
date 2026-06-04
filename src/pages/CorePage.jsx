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

  // Lazily create the core block log only when the core workflow is active.
  // Upcoming preview routes stay static/read-only and must not create progress.
  useEffect(() => {
    if (!plan || !dayDetails || !coreBlock || isUpcomingPreview) {
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

  if (!plan || !dayDetails || !coreBlock) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Link
            to={planId ? `/plan/${planId}/cycle` : "/"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
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

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              to={`/plan/${planId}/day/${dayId}`}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-cyan-100"
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
                className="h-2 w-2 shrink-0 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.45)]"
                aria-hidden="true"
              />
            </p>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
              {coreBlock.name}
            </h1>

            <p className="text-sm leading-6 text-zinc-400">{coreBlock.focus}</p>
          </div>
        </header>

        {isUpcomingPreview ? (
          <div className="rounded-[1.75rem] border border-violet-300/12 bg-violet-300/[0.035] px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">
              Preview mode
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
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
