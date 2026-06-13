import { Link } from "react-router-dom";

import {
  UI_BUTTON_PRIMARY_PRODUCT,
  UI_BUTTON_PRIMARY_TRAINING,
} from "../../styles/ui";

const PRIMARY_BUTTON_VARIANTS = {
  product: UI_BUTTON_PRIMARY_PRODUCT,
  training: UI_BUTTON_PRIMARY_TRAINING,
};

/**
 * Shared primary CTA.
 *
 * Use `variant="product"` for light product screens and `variant="training"`
 * for workout/execution screens.
 *
 * Pass `to` for route navigation, or omit it for local/runtime actions.
 */
export default function PrimaryButton({
  to,
  children,
  className = "",
  type = "button",
  variant = "training",
  ...props
}) {
  const variantClassName =
    PRIMARY_BUTTON_VARIANTS[variant] ?? PRIMARY_BUTTON_VARIANTS.training;

  const combinedClassName = `${variantClassName} ${className}`.trim();

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
