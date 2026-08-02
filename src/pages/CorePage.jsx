import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import BackControl from "../components/common/BackControl";
import GuardState from "../components/common/GuardState";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getCoreBlockById, getCoreExercisesByIds } from "../data/core";
import CoreWorkflowCard from "../components/core/CoreWorkflowCard";
import { sanitizeCoreSetInputValue } from "../utils/runtime/coreInputHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";
import { getCoreBlockStatus } from "../utils/runtime/coreStatusHelpers";

function getCorePageState({ dayMode, coreBlockLog }) {
  if (dayMode === "upcoming") {
    return {
      label: "Preview",
      className: "text-[#AAB2BA]",
    };
  }

  if (dayMode === "finished") {
    return {
      label: "Saved log",
      className: "text-[#79C89A]",
    };
  }

  const coreStatus = getCoreBlockStatus(coreBlockLog);

  if (coreBlockLog?.closedAt) {
    if (coreStatus === "complete") {
      return {
        label: "Logged",
        className: "text-[#79C89A]",
      };
    }

    if (coreStatus === "partial") {
      return {
        label: "Closed partial",
        className: "text-[#F1B864]",
      };
    }

    return {
      label: "Closed",
      className: "text-[#AAB2BA]",
    };
  }

  if (coreStatus === "complete") {
    return {
      label: "Logged",
      className: "text-[#79C89A]",
    };
  }

  if (coreStatus === "partial") {
    return {
      label: "In progress",
      className: "text-[#F1B864]",
    };
  }

  return {
    label: "Flexible support",
    className: "text-[#A7A2D8]",
  };
}

/**
 * Page-level orchestrator for one core block workflow.
 *
 * Runtime note:
 * CorePage resolves route/static data, reads the current cycle core log, lazily
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
    const fallbackTo = plan ? `/plan/${planId}/cycle` : "/";
    const fallbackLabel = plan ? "Return to cycle" : "Back to home";
    const context = plan
      ? `${plan.name}${dayDetails ? ` · ${dayDetails.label}` : ""}`
      : null;

    return (
      <GuardState
        eyebrow="Core unavailable"
        context={context}
        title="This Core block could not be loaded."
        description="The support block does not belong to this training day, or its source data is unavailable. Return to a valid workout position."
        primaryTo={fallbackTo}
        primaryLabel={fallbackLabel}
      />
    );
  }

  if (needsDayEntryFirst) {
    return (
      <GuardState
        eyebrow="Core checkpoint"
        context={`${plan.name} · ${dayDetails.label}`}
        title={currentCycle ? "Open the day first." : "Start a cycle first."}
        description={
          currentCycle
            ? "Enter the current day before opening its Core log. This keeps runtime creation inside the valid workout flow."
            : "Core logging becomes available after the plan cycle has been started."
        }
        backTo={`/plan/${planId}/cycle`}
        backLabel="Back to cycle"
        primaryTo={`/plan/${planId}/day/${dayId}`}
        primaryLabel="Go to day"
      />
    );
  }

  const corePageState = getCorePageState({
    dayMode,
    coreBlockLog,
  });

  return (
    <AppShell>
      <div className="space-y-5">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <BackControl to={`/plan/${planId}/day/${dayId}`} className="shrink-0">
              Back to day
            </BackControl>

            <p className="min-w-0 truncate text-right text-xs font-medium text-[#77818B]">
              {plan.name} · Cycle {currentCycleNumber ?? 1} · {dayDetails.label}
            </p>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <span
              className="mt-1 h-10 w-1 rounded-full bg-[#A7A2D8]"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p
                className={`text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${corePageState.className}`}
              >
                {corePageState.label}
              </p>
              <h1 className="mt-2 text-[2rem] font-semibold leading-[1.02] tracking-[-0.045em] text-[#F3F5F1]">
                {coreBlock.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#AAB2BA]">
                {coreBlock.focus}
              </p>
            </div>
          </div>
        </header>

        {isUpcomingPreview ? (
          <section className="border-y border-[#2A3138] py-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#A7A2D8]">
              Read-only preview
            </p>
            <p className="mt-2 text-sm leading-6 text-[#AAB2BA]">
              Review the block structure now. Logging and Done controls unlock
              when this day becomes current.
            </p>
          </section>
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
