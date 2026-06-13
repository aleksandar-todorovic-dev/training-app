import { useId } from "react";

/**
 * Cycle Coach app mark.
 *
 * Visual meaning:
 * - 6 outer markers = D1-D6 training days
 * - circular rhythm = structured cycle continuity
 * - active cyan marker = current focused training step
 * - center C shape = Cycle Coach / cycle-based system
 *
 * This is an MVP app mark, not a full brand identity system.
 */
export default function AppMark({ className = "h-10 w-10", title }) {
  const rawId = useId();
  const id = rawId.replace(/:/g, "");

  const backgroundGradientId = `${id}-background`;
  const markGradientId = `${id}-mark`;
  const mutedGradientId = `${id}-muted`;
  const glowId = `${id}-glow`;

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}

      <defs>
        <linearGradient
          id={backgroundGradientId}
          x1="8"
          y1="6"
          x2="56"
          y2="58"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#10292E" stopOpacity="0.88" />
          <stop offset="0.48" stopColor="#0B1518" stopOpacity="0.96" />
          <stop offset="1" stopColor="#070A0C" />
        </linearGradient>

        <linearGradient
          id={markGradientId}
          x1="18"
          y1="22"
          x2="48"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8FDCE5" />
          <stop offset="0.52" stopColor="#5EC7D5" />
          <stop offset="1" stopColor="#3FA8B6" />
        </linearGradient>

        <linearGradient
          id={mutedGradientId}
          x1="12"
          y1="12"
          x2="52"
          y2="52"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8FDCE5" stopOpacity="0.38" />
          <stop offset="1" stopColor="#3FA8B6" stopOpacity="0.16" />
        </linearGradient>

        <filter
          id={glowId}
          x="-18%"
          y="-18%"
          width="136%"
          height="136%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="1.45" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="17"
        fill={`url(#${backgroundGradientId})`}
        stroke="#3FA8B6"
        strokeOpacity="0.18"
        strokeWidth="1"
      />

      <circle
        cx="32"
        cy="32"
        r="21"
        stroke={`url(#${mutedGradientId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="12 9"
      />

      <path
        d="M32 11A21 21 0 0 1 50.2 21.5"
        stroke={`url(#${markGradientId})`}
        strokeWidth="2.6"
        strokeLinecap="round"
        filter={`url(#${glowId})`}
      />

      <path
        d="M50.2 21.5A21 21 0 0 1 50.2 42.5"
        stroke="#5EC7D5"
        strokeOpacity="0.42"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      <circle
        cx="32"
        cy="11"
        r="3.2"
        fill="#10292E"
        stroke="#8FDCE5"
        strokeOpacity="0.2"
      />

      <circle
        cx="50.2"
        cy="21.5"
        r="3.8"
        fill="#5EC7D5"
        stroke="#B8F4FA"
        strokeOpacity="0.62"
        filter={`url(#${glowId})`}
      />

      <circle
        cx="50.2"
        cy="42.5"
        r="3.2"
        fill="#10292E"
        stroke="#8FDCE5"
        strokeOpacity="0.18"
      />

      <circle
        cx="32"
        cy="53"
        r="3.2"
        fill="#10292E"
        stroke="#8FDCE5"
        strokeOpacity="0.18"
      />

      <circle
        cx="13.8"
        cy="42.5"
        r="3.2"
        fill="#10292E"
        stroke="#8FDCE5"
        strokeOpacity="0.18"
      />

      <circle
        cx="13.8"
        cy="21.5"
        r="3.2"
        fill="#10292E"
        stroke="#8FDCE5"
        strokeOpacity="0.18"
      />

      <path
        d="M40.5 24.5H31.3C26.8 24.5 23.2 27.9 23.2 32C23.2 36.1 26.8 39.5 31.3 39.5H40.5"
        stroke={`url(#${markGradientId})`}
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
      />

      <path
        d="M39.5 24.5H31.3C26.8 24.5 23.2 27.9 23.2 32C23.2 36.1 26.8 39.5 31.3 39.5H39.5"
        stroke="#C8F7FB"
        strokeOpacity="0.14"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
