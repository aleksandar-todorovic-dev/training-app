import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { appReducer } from "./appReducer";
import { appInitialState } from "./appInitialState";
import { APP_ACTIONS } from "./appActions";
import { AppStateContext } from "./AppStateContext";
import { createAppStatePersistence } from "../storage/appStateStorage";

const RESTORE = Symbol("restore-verified-state");
function reducer(state, action) {
  return action.type === RESTORE ? action.state : appReducer(state, action);
}

/** React owns workout state; the web session owns IO, tokens and protection. */
export function AppStateProvider({ children }) {
  const [session] = useState(() => createAppStatePersistence());
  const persistence = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const [state, rawDispatch] = useReducer(reducer, session, (value) =>
    value.getSnapshot().mode === "ready" ? value.getSnapshot().state : appInitialState);
  const previousState = useRef(state);
  const restoringState = useRef(null);
  const runtimeChange = useRef(false);

  function adopt(result, isReset = false) {
    if (result.mode !== "ready") return;
    runtimeChange.current = false;
    restoringState.current = isReset ? appInitialState : result.state;
    rawDispatch(isReset ? { type: APP_ACTIONS.RESET_APP_STATE } : { type: RESTORE, state: result.state });
  }

  useEffect(() => {
    const onStorage = (event) => session.handleStorageEvent(event);
    window.addEventListener("storage", onStorage);
    const result = session.startMigration();
    if (result.mode === "ready" && result.state !== previousState.current) {
      restoringState.current = result.state;
      rawDispatch({ type: RESTORE, state: result.state });
    }
    return () => window.removeEventListener("storage", onStorage);
  }, [session]);

  useEffect(() => {
    if (previousState.current === state) return;
    previousState.current = state;
    if (restoringState.current === state) {
      restoringState.current = null;
      return;
    }
    if (runtimeChange.current) session.save(state);
  }, [state, session]);

  function dispatch(action) {
    // RESET is only available through the verified storage reset procedure.
    if (!Object.values(APP_ACTIONS).includes(action?.type) ||
        action.type === APP_ACTIONS.RESET_APP_STATE || !session.canEdit()) return;
    runtimeChange.current = true;
    rawDispatch(action);
  }

  function retryPersistence() {
    if (session.getSnapshot().mode === "migration-pending") adopt(session.retryMigration());
    else if (session.getSnapshot().mode === "ready") session.save(state);
    else if (["recovery-required", "storage-unavailable"].includes(session.getSnapshot().mode)) {
      const loaded = session.reload();
      adopt(loaded.mode === "migration-pending" ? session.retryMigration() : loaded);
    }
  }

  return (
    <AppStateContext.Provider value={{
      state,
      dispatch,
      persistence,
      isPersistenceAvailable: persistence.mode === "ready" && persistence.saveStatus === "saved",
      isWorkoutBlocked: persistence.mode !== "ready",
      retryPersistence,
      reloadProgress: () => {
        const result = session.reload();
        adopt(result.mode === "migration-pending" ? session.retryMigration() : result);
      },
      restoreLegacyProgress: () => adopt(session.restoreLegacy()),
      resetProgress: () => adopt(session.resetProgress(), true),
      exportOriginal: session.exportOriginal,
      exportMemory: () => session.exportMemory(state),
    }}>
      {children}
    </AppStateContext.Provider>
  );
}
