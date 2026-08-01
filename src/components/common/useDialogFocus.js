import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/**
 * Keeps keyboard focus inside a mounted dialog and restores it on close.
 * Body scroll locking stays with the owning page or sheet.
 */
export default function useDialogFocus({
  isOpen = true,
  dialogRef,
  initialFocusRef,
  onClose,
}) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocusedElement = document.activeElement;
    const dialog = dialogRef.current;

    if (!dialog) return undefined;

    const focusDialog = window.requestAnimationFrame(() => {
      const firstFocusableElement = dialog.querySelector(FOCUSABLE_SELECTOR);
      (initialFocusRef?.current ?? firstFocusableElement ?? dialog).focus();
    });

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        dialog.querySelectorAll(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.hasAttribute("hidden"));

      if (!focusableElements.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusDialog);
      document.removeEventListener("keydown", handleKeyDown);

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [dialogRef, initialFocusRef, isOpen]);
}
