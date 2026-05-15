import AppRouter from "./app/router";
import { AppStateProvider } from "./state/AppStateProvider";

export default function App() {
  return (
    <AppStateProvider>
      <AppRouter />
    </AppStateProvider>
  );
}
