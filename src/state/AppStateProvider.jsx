import { useEffect, useReducer } from "react";
import { appReducer } from "./appReducer";
import { AppStateContext } from "./AppStateContext";
import {
  loadStoredAppState,
  saveStoredAppState,
} from "../storage/appStateStorage";

function loadInitialAppState() {
  return loadStoredAppState();
}

/**
 * Provides global runtime state for the local-first MVP.
 *
 * Runtime note:
 * This connects the reducer to React. Screens read runtime state and dispatch
 * workout-flow actions through this provider.
 *
 * Persistence note:
 * Phase 4 hydrates the reducer from localStorage on first load and saves
 * every reducer state update back through the dedicated storage layer.
 */
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(
    appReducer,
    undefined,
    loadInitialAppState,
  );

  useEffect(() => {
    saveStoredAppState(state);
  }, [state]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}
