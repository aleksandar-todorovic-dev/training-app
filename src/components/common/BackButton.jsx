import { Link } from "react-router-dom";

import {
  UI_BUTTON_GHOST_PRODUCT,
  UI_BUTTON_GHOST_TRAINING,
} from "../../styles/ui";

const BACK_BUTTON_VARIANTS = {
  product: UI_BUTTON_GHOST_PRODUCT,
  training: UI_BUTTON_GHOST_TRAINING,
};

export default function BackButton({
  to,
  children = "Back",
  variant = "training",
  className = "",
}) {
  const variantClassName =
    BACK_BUTTON_VARIANTS[variant] ?? BACK_BUTTON_VARIANTS.training;

  const classes = `${variantClassName} ${className}`.trim();

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}
