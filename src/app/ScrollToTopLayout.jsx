import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

/**
 * Resets document scroll on major route changes.
 *
 * This keeps new screen-to-screen navigation predictable on mobile:
 * every new route opens from the top instead of reusing the previous
 * screen's scroll position.
 */
export default function ScrollToTopLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

  return <Outlet />;
}
