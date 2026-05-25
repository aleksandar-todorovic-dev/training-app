import { useReducer } from "react";
import { appInitialState } from "./appInitialState";
import { appReducer } from "./appReducer";
import { AppStateContext } from "./AppStateContext";

/**
 * Provides global runtime state for the local-first MVP.
 *
 * Runtime note:
 * This connects the reducer to React. Screens read runtime state and dispatch
 * workout-flow actions through this provider.
 */
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, appInitialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}
