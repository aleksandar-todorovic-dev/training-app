import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { APP_ACTIONS } from "../state/appActions";
import { useAppState } from "../state/useAppState";
import AppShell from "../components/layout/AppShell";
import SectionCard from "../components/layout/SectionCard";
import BackButton from "../components/common/BackButton";
import { UI_STACK_LG, UI_STACK_MD, UI_TEXT_MUTED } from "../styles/ui";
import { getPlanById } from "../data/plans";
import { getDayDetails } from "../data/dayDetails";
import { getCoreBlockById, getCoreExercisesByIds } from "../data/core";
import CoreWorkflowCard from "../components/core/CoreWorkflowCard";
import { sanitizeCoreSetInputValue } from "../utils/runtime/coreInputHelpers";

export default function CorePage() {
  const { planId, dayId, coreId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();

  const plan = getPlanById(planId);
  const dayDetails = getDayDetails(planId, dayId);
  const coreBlock = getCoreBlockById(coreId);
  const coreExercises = getCoreExercisesByIds(coreBlock?.exerciseIds ?? []);

  // Ensure the opened core block has a runtime log once valid core data is loaded.
  useEffect(() => {
    if (!plan || !dayDetails || !coreBlock) {
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
  }, [dispatch, plan, planId, dayId, dayDetails, coreBlock, coreExercises]);

  const planProgress = state.progressByPlan[planId];
  const currentCycleNumber = planProgress?.currentCycleNumber;
  const currentCycle = currentCycleNumber
    ? planProgress?.cycles?.[currentCycleNumber]
    : null;
  const dayLog = dayDetails ? currentCycle?.dayLogs?.[dayDetails.id] : null;
  const coreBlockLog = dayLog?.coreBlockLog ?? null;

  function handleToggleCoreSetDone(coreExerciseId, setNumber) {
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

  // Close the whole core block without changing core set completion.
  function handleCloseCoreBlock() {
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

        <CoreWorkflowCard
          coreBlock={coreBlock}
          exercises={coreExercises}
          coreBlockLog={coreBlockLog}
          onToggleCoreSetDone={handleToggleCoreSetDone}
          onUpdateCoreSetField={handleUpdateCoreSetField}
          onCloseCoreBlock={handleCloseCoreBlock}
        />
      </div>
    </AppShell>
  );
}
