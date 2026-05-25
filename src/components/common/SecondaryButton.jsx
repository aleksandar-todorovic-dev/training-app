import { Link } from "react-router-dom";
import { UI_BUTTON_SECONDARY } from "../../styles/ui";

/**
 * Shared secondary CTA.
 *
 * UI note:
 * Pass `to` for route navigation, or omit it to render a native button for
 * local sheet/actions.
 */
export default function SecondaryButton({
  to,
  children,
  type = "button",
  className = "",
  ...props
}) {
  const classes = `${UI_BUTTON_SECONDARY} ${className}`.trim();

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
