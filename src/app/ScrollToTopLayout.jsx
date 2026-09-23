import { useEffect, useRef } from "react";
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
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    const isRouteChange = previousPathnameRef.current !== pathname;
    previousPathnameRef.current = pathname;

    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      const hasOpenModal = document.querySelector(
        '[role="dialog"][aria-modal="true"]',
      );

      if (isRouteChange && !hasOpenModal) {
        document
          .querySelector("[data-route-focus-target]")
          ?.focus({ preventScroll: true });
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

  return <Outlet />;
}
