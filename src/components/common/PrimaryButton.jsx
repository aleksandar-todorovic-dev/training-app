import { Link } from "react-router-dom";
import { UI_BUTTON_PRIMARY } from "../../styles/ui";

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
