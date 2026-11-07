import AppRouter from "./app/router";
import { AppStateProvider } from "./state/AppStateProvider";
import { LocaleProvider } from "./i18n/LocaleProvider";

/**
 * Root app composition.
 *
 * Runtime note:
 * AppStateProvider wraps the router so every route can read runtime state and
 * dispatch workout-flow actions through `useAppState`.
 */
export default function App() {
  return (
    <LocaleProvider>
      <AppStateProvider>
        <AppRouter />
      </AppStateProvider>
    </LocaleProvider>
  );
}
