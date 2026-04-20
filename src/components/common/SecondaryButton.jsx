import { Link } from "react-router-dom";
import { UI_BUTTON_SECONDARY } from "../../styles/ui";

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
