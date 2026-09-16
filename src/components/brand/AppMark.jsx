/**
 * Cycle Coach app mark.
 *
 * Visual meaning:
 * - 6 outer markers = D1-D6 training days
 * - circular rhythm = structured cycle continuity
 * - lime marker = current focused training step
 * - center C shape = Cycle Coach / cycle-based system
 */
export default function AppMark({
  className = "h-10 w-10",
  title,
}) {
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

      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="16"
        fill="#11161A"
        stroke="#2F3740"
      />

      <circle
        cx="32"
        cy="32"
        r="20.5"
        stroke="#3A434C"
        strokeWidth="1.8"
        strokeDasharray="10.5 10.9"
        strokeLinecap="round"
      />

      <path
        d="M40.5 24.6H31.2C26.9 24.6 23.4 27.9 23.4 32C23.4 36.1 26.9 39.4 31.2 39.4H40.5"
        stroke="#F3F5F1"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="32" cy="11.5" r="2.5" fill="#20272E" stroke="#59646E" />
      <circle
        cx="49.8"
        cy="21.8"
        r="3.3"
        fill="#B8F36B"
        stroke="#E2FFB7"
        strokeWidth="1"
      />
      <circle cx="49.8" cy="42.2" r="2.5" fill="#20272E" stroke="#59646E" />
      <circle cx="32" cy="52.5" r="2.5" fill="#20272E" stroke="#59646E" />
      <circle cx="14.2" cy="42.2" r="2.5" fill="#20272E" stroke="#59646E" />
      <circle cx="14.2" cy="21.8" r="2.5" fill="#20272E" stroke="#59646E" />
    </svg>
  );
}
