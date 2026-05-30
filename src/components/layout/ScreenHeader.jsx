import {
  UI_TEXT_MUTED_PRODUCT,
  UI_TEXT_MUTED_TRAINING,
  UI_TITLE_PRODUCT,
  UI_TITLE_TRAINING,
} from "../../styles/ui";

const SCREEN_HEADER_VARIANTS = {
  product: {
    title: UI_TITLE_PRODUCT,
    subtitle: UI_TEXT_MUTED_PRODUCT,
  },
  training: {
    title: UI_TITLE_TRAINING,
    subtitle: UI_TEXT_MUTED_TRAINING,
  },
};

/**
 * Shared screen title/subtitle block.
 *
 * Supports product/training variants so product screens can use light-shell
 * typography while workout screens keep the training style.
 */
export default function ScreenHeader({
  title,
  subtitle,
  variant = "training",
}) {
  const variantClassNames =
    SCREEN_HEADER_VARIANTS[variant] ?? SCREEN_HEADER_VARIANTS.training;

  return (
    <header className="flex flex-col gap-2">
      <h1 className={variantClassNames.title}>{title}</h1>
      {subtitle ? (
        <p className={variantClassNames.subtitle}>{subtitle}</p>
      ) : null}
    </header>
  );
}
