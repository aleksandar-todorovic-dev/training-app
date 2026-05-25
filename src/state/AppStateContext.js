import { createContext } from "react";

/**
 * React context for the app runtime state provider.
 *
 * Runtime note:
 * Components should read this through `useAppState` instead of importing the
 * context directly.
 */
export const AppStateContext = createContext(null);
