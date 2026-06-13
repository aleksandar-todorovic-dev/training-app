import { UI_CARD_PRODUCT, UI_CARD_TRAINING } from "../../styles/ui";

const SECTION_CARD_VARIANTS = {
  product: UI_CARD_PRODUCT,
  training: UI_CARD_TRAINING,
};

/**
 * Shared card surface for grouped screen content.
 *
 * Supports product/training variants so Phase 5 screens can switch visual
 * modes without duplicating card classes.
 */
export default function SectionCard({
  children,
  className = "",
  variant = "training",
}) {
  const variantClassName =
    SECTION_CARD_VARIANTS[variant] ?? SECTION_CARD_VARIANTS.training;

  return (
    <section className={`${variantClassName} ${className}`.trim()}>
      {children}
    </section>
  );
}
