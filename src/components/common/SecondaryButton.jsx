import { Link } from "react-router-dom";

import {
  UI_BUTTON_SECONDARY_PRODUCT,
  UI_BUTTON_SECONDARY_TRAINING,
} from "../../styles/ui";

const SECONDARY_BUTTON_VARIANTS = {
  product: UI_BUTTON_SECONDARY_PRODUCT,
  training: UI_BUTTON_SECONDARY_TRAINING,
};

/**
 * Shared secondary CTA.
 *
 * Use `variant="product"` for light product screens and `variant="training"`
 * for workout/execution screens.
 *
 * Pass `to` for route navigation, or omit it for local sheet/actions.
 */
export default function SecondaryButton({
  to,
  children,
  type = "button",
  className = "",
  variant = "training",
  ...props
}) {
  const variantClassName =
    SECONDARY_BUTTON_VARIANTS[variant] ?? SECONDARY_BUTTON_VARIANTS.training;

  const classes = `${variantClassName} ${className}`.trim();

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
