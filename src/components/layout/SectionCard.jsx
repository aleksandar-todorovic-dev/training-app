import { UI_CARD } from "../../styles/ui";

/**
 * Shared card surface for grouped screen content.
 *
 * UI note:
 * Optional `className` supports small one-off surface adjustments while keeping
 * the base card styling centralized.
 */
export default function SectionCard({ children, className = "" }) {
  return (
    <section className={`${UI_CARD} ${className}`.trim()}>{children}</section>
  );
}