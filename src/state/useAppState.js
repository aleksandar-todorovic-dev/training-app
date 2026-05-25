import { useContext } from "react";
import { AppStateContext } from "./AppStateContext";

/**
 * Accesses the app runtime state context.
 *
 * Runtime note:
 * Components should use this hook instead of importing the context directly.
 */
export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
