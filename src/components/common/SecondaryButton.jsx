import { Link } from "react-router-dom";

import { UI_BUTTON_SECONDARY_PERFORMANCE } from "../../styles/ui";

/**
 * Shared secondary CTA for the active graphite UI system.
 *
 * Pass `to` for route navigation, or omit it for local sheet/runtime actions.
 */
export default function SecondaryButton({
  to,
  children,
  type = "button",
  className = "",
  ...props
}) {
  const classes = `${UI_BUTTON_SECONDARY_PERFORMANCE} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
