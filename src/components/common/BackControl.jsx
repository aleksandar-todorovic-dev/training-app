import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { UI_BACK_CONTROL } from "../../styles/ui";

/**
 * Shared quiet back/navigation control for the graphite UI system.
 *
 * Pass `to` for route navigation, or omit it and provide `onClick` for a local
 * view transition such as returning from one Guide section to the section list.
 */
export default function BackControl({
  to,
  children,
  type = "button",
  className = "",
  ...props
}) {
  const classes = `${UI_BACK_CONTROL} ${className}`.trim();
  const content = (
    <>
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {content}
    </button>
  );
}
