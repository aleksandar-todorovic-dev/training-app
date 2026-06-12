const EASE_OUT = [0.2, 0, 0, 1];
const EASE_IN = [0.4, 0, 1, 1];

export const pageContentVariants = {
  hidden: {
    opacity: 0.94,
    willChange: "opacity",
  },
  visible: {
    opacity: 1,
    willChange: "auto",
    transition: {
      duration: 0.18,
      ease: EASE_OUT,
    },
  },
};

export const sheetOverlayVariants = {
  hidden: {
    opacity: 0,
    willChange: "opacity",
  },
  visible: {
    opacity: 1,
    willChange: "auto",
    transition: {
      duration: 0.24,
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    willChange: "opacity",
    transition: {
      duration: 0.22,
      ease: EASE_IN,
    },
  },
};

export const sheetPanelVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    willChange: "transform, opacity",
  },
  visible: {
    opacity: 1,
    y: 0,
    willChange: "auto",
    transition: {
      duration: 0.34,
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    y: 14,
    willChange: "transform, opacity",
    transition: {
      duration: 0.24,
      ease: EASE_IN,
    },
  },
};

export const revealPanelVariants = {
  hidden: {
    opacity: 0,
    y: 6,
    willChange: "transform, opacity",
  },
  visible: {
    opacity: 1,
    y: 0,
    willChange: "auto",
    transition: {
      duration: 0.2,
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    y: -3,
    willChange: "transform, opacity",
    transition: {
      duration: 0.16,
      ease: EASE_IN,
    },
  },
};

export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
};

export const staggerItemVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: EASE_OUT,
    },
  },
};

export const pressableTap = {
  scale: 0.985,
};

export const softPressTap = {
  scale: 0.992,
};
