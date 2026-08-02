import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getCoreBlockById, getCoreExercisesByIds } from "../data/core";
import CoreWorkflowCard from "../components/core/CoreWorkflowCard";
import { sanitizeCoreSetInputValue } from "../utils/runtime/coreInputHelpers";
import { getDayMode } from "../utils/runtime/dayModeHelpers";
import { getCoreBlockStatus } from "../utils/runtime/coreStatusHelpers";

function GuardSurface({ title, body, to, actionLabel }) {
  return (
    <section className="rounded-[1.25rem] border border-[#2A3138] bg-[#13181D] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.2)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#77818B]">
        Core unavailable
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[#F3F5F1]">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#AAB2BA]">{body}</p>
      <Link
        to={to}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#B8F36B] px-4 text-sm font-semibold text-[#0B0E11] transition-colors hover:bg-[#C8F78F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F78F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#13181D]"
      >
        {actionLabel}
      </Link>
    </section>
  );
}

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
    return (
      <AppShell mode="performance">
        <div className="space-y-5">
          <Link
            to={planId ? `/plan/${planId}/cycle` : "/"}
            className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-[#77818B] transition-colors hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E11]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>

          <GuardSurface
            title="Core block not found"
            body="This core block does not belong to the selected day, or its source data could not be loaded."
            to={planId ? `/plan/${planId}/cycle` : "/"}
            actionLabel="Return to cycle"
          />
        </div>
      </AppShell>
    );
  }

  if (needsDayEntryFirst) {
    return (
      <AppShell mode="performance">
        <div className="space-y-5">
          <Link
            to={`/plan/${planId}/day/${dayId}`}
            className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-[#77818B] transition-colors hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E11]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to day
          </Link>

          <GuardSurface
            title={currentCycle ? "Open the day first" : "Start a cycle first"}
            body={
              currentCycle
                ? "Enter the current day before opening its core log. This keeps runtime creation inside the valid workout flow."
                : "Core logging becomes available after the plan cycle has been started."
            }
            to={`/plan/${planId}/day/${dayId}`}
            actionLabel="Go to day"
          />
        </div>
      </AppShell>
    );
  }

  const corePageState = getCorePageState({
    dayMode,
    coreBlockLog,
  });

  return (
    <AppShell mode="performance">
      <div className="space-y-5">
        <header className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              to={`/plan/${planId}/day/${dayId}`}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-[#77818B] transition-colors hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E11]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to day
            </Link>

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
