import { Link } from "react-router-dom";

import { UI_BUTTON_PRIMARY_PERFORMANCE } from "../../styles/ui";

/**
 * Shared primary CTA for the active graphite/lime UI system.
 *
 * Pass `to` for route navigation, or omit it for local/runtime actions.
 */
export default function PrimaryButton({
  to,
  children,
  className = "",
  type = "button",
  ...props
}) {
  const combinedClassName =
    `${UI_BUTTON_PRIMARY_PERFORMANCE} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={combinedClassName} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
