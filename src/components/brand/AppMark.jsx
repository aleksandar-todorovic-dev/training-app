import { useId } from "react";

/**
 * A compact continuity mark: six training nodes connected through three
 * deliberate recovery gaps. The highlighted handoff is the current-to-next
 * relationship, not a generic completion ring.
 */
export default function AppMark({
  className = "h-10 w-10",
  title,
  tone = "dark",
}) {
  const rawId = useId();
  const id = rawId.replace(/:/g, "");
  const markerId = `${id}-arrow`;
  const isPaper = tone === "paper";
  const base = isPaper ? "#191A16" : "#F2EEE4";
  const muted = isPaper ? "#77786E" : "#8E8D84";

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
        <marker
          id={markerId}
          viewBox="0 0 8 8"
          refX="6.4"
          refY="4"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0 0L8 4L0 8Z" fill="#FF5A3C" />
        </marker>
      </defs>

      <path
        d="M9 15H38C47.4 15 53 20.8 53 30V34C53 43.2 47.4 49 38 49H16"
        stroke={muted}
        strokeWidth="3"
        strokeLinecap="square"
        strokeDasharray="12 5"
      />
      <path
        d="M9 15H38C45.5 15 49 19.5 49 26"
        stroke="#FF5A3C"
        strokeWidth="4"
        strokeLinecap="square"
        markerEnd={`url(#${markerId})`}
      />

      {[
        [9, 15],
        [23, 15],
        [38, 15],
        [53, 31],
        [38, 49],
        [22, 49],
      ].map(([cx, cy], index) => (
        <rect
          key={`${cx}-${cy}`}
          x={cx - (index === 3 ? 3.5 : 2.5)}
          y={cy - (index === 3 ? 3.5 : 2.5)}
          width={index === 3 ? 7 : 5}
          height={index === 3 ? 7 : 5}
          fill={index === 3 ? "#FF5A3C" : base}
        />
      ))}
    </svg>
  );
}
