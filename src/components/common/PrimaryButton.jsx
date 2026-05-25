import { Link } from "react-router-dom";
import { UI_BUTTON_PRIMARY } from "../../styles/ui";

/**
 * Shared primary CTA.
 *
 * UI note:
 * Pass `to` for route navigation, or omit it to render a native button for
 * local/runtime actions.
 */
export default function PrimaryButton({
  to,
  children,
  className = "",
  type = "button",
  ...props
}) {
  const combinedClassName = `${UI_BUTTON_PRIMARY} ${className}`.trim();

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
