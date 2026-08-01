import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

const MotionSpan = motion.span;

const STATE_LABELS = {
  complete: "Closed",
  partial: "Closed partial",
  empty: "Closed empty",
  current: "Current",
  upcoming: "Upcoming",
  planned: "Planned",
  rest: "Recovery",
};

const NODE_CLASS_NAMES = {
  paper: {
    complete: "border-[#65712F] bg-[#B8CB70] text-[#191A16]",
    partial: "border-[#B36E16] bg-[#E5A13A] text-[#191A16]",
    empty: "border-[#7F7A70] bg-[#D2CCBE] text-[#191A16]",
    current: "border-[#C83C24] bg-[#FF5A3C] text-[#191A16]",
    upcoming: "border-[#8F897C] bg-[#EFEBDF] text-[#4E5048]",
    planned: "border-[#8F897C] bg-[#F8F5EB] text-[#191A16]",
    rest: "border-[#9F9889] bg-transparent text-[#66675E]",
  },
  dark: {
    complete: "border-[#B8CB70] bg-[#B8CB70] text-[#171814]",
    partial: "border-[#E5A13A] bg-[#E5A13A] text-[#171814]",
    empty: "border-[#87877E] bg-[#4A4C42] text-[#F2EEE4]",
    current: "border-[#FF795F] bg-[#FF5A3C] text-[#171814]",
    upcoming: "border-[#55574D] bg-[#1B1C17] text-[#AAA99F]",
    planned: "border-[#66685D] bg-[#21221D] text-[#E0DDD3]",
    rest: "border-[#55574D] bg-transparent text-[#87877E]",
  },
};

const TEXT_CLASS_NAMES = {
  paper: {
    title: "text-[#191A16]",
    detail: "text-[#66675E]",
    label: "text-[#5F6158]",
    line: "bg-[#A9A292]",
    interactive: "hover:bg-[#E4DECF]/55 focus-visible:ring-offset-[#EFEBDF]",
  },
  dark: {
    title: "text-[#F2EEE4]",
    detail: "text-[#AAA99F]",
    label: "text-[#87877E]",
    line: "bg-[#4A4C42]",
    interactive: "hover:bg-[#24251F] focus-visible:ring-offset-[#171814]",
  },
};

function getStateLabel(item) {
  return item.stateLabel ?? STATE_LABELS[item.state] ?? "Planned";
}

function RailNode({ item, tone, compact = false }) {
  const nodeClassName =
    NODE_CLASS_NAMES[tone]?.[item.state] ?? NODE_CLASS_NAMES[tone].planned;
  const isRest = item.kind === "rest" || item.state === "rest";

  if (isRest) {
    return (
      <span
        className={`flex ${compact ? "h-5 w-5" : "h-6 w-6"} rotate-45 items-center justify-center border ${nodeClassName}`}
        aria-hidden="true"
      >
        <span className="h-px w-2 bg-current" />
      </span>
    );
  }

  return (
    <span
      className={`flex ${compact ? "h-6 min-w-6 px-1" : "h-7 min-w-7 px-1.5"} items-center justify-center border font-display text-sm font-bold uppercase leading-none tabular-nums ${nodeClassName}`}
      aria-hidden="true"
    >
      {item.state === "complete" ? "✓" : item.label}
    </span>
  );
}

function InteractiveWrapper({ item, className, children }) {
  if (!item.to) {
    return (
      <div
        className={className}
        aria-current={item.state === "current" ? "step" : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <Link
      to={item.to}
      className={`${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A3C] focus-visible:ring-offset-2`}
      aria-label={item.ariaLabel}
      aria-current={item.state === "current" ? "step" : undefined}
    >
      {children}
    </Link>
  );
}

function HorizontalRail({ items, tone, animate }) {
  const shouldReduceMotion = useReducedMotion();
  const textClasses = TEXT_CLASS_NAMES[tone];

  return (
    <div className="max-w-full pb-1">
      <ol className="grid grid-cols-9 items-start">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isRest = item.kind === "rest" || item.state === "rest";

          return (
            <li key={item.id} className="relative min-w-0">
              {!isLast ? (
                <span
                  className="absolute left-[calc(50%+0.75rem)] right-[calc(-50%+0.75rem)] top-3 block h-px overflow-hidden"
                  aria-hidden="true"
                >
                  <MotionSpan
                    className={`block h-full w-full origin-left ${textClasses.line}`}
                    initial={
                      animate && !shouldReduceMotion ? { scaleX: 0 } : false
                    }
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.28,
                      delay: animate ? index * 0.035 : 0,
                      ease: [0.2, 0, 0, 1],
                    }}
                  />
                </span>
              ) : null}

              <InteractiveWrapper
                item={item}
                className="group relative z-10 flex min-h-12 w-full flex-col items-center gap-1.5 px-0.5 text-center"
              >
                <RailNode item={item} tone={tone} compact />
                <span className="flex min-w-0 flex-col items-center">
                  <span
                    className={`font-display text-xs font-bold uppercase leading-none min-[390px]:text-sm ${textClasses.title}`}
                  >
                    {isRest ? "R" : item.label}
                  </span>
                  <span
                    className={`mt-0.5 hidden max-w-full truncate text-[0.58rem] font-semibold uppercase tracking-[0.08em] min-[430px]:block ${textClasses.label}`}
                  >
                    {item.shortTitle ?? getStateLabel(item)}
                  </span>
                </span>
              </InteractiveWrapper>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function VerticalRail({ items, tone, animate }) {
  const shouldReduceMotion = useReducedMotion();
  const textClasses = TEXT_CLASS_NAMES[tone];

  return (
    <ol className="flex flex-col">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = item.state === "current";

        return (
          <li key={item.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
            <div className="relative flex justify-center pt-3">
              <RailNode item={item} tone={tone} />
              {!isLast ? (
                <span
                  className="absolute bottom-[-0.75rem] top-10 w-px overflow-hidden"
                  aria-hidden="true"
                >
                  <MotionSpan
                    className={`block h-full w-full origin-top ${
                      isCurrent ? "bg-[#FF5A3C]" : textClasses.line
                    }`}
                    initial={
                      animate && !shouldReduceMotion ? { scaleY: 0 } : false
                    }
                    animate={{ scaleY: 1 }}
                    transition={{
                      duration: 0.32,
                      delay: animate ? index * 0.045 : 0,
                      ease: [0.2, 0, 0, 1],
                    }}
                  />
                </span>
              ) : null}
            </div>

            <InteractiveWrapper
              item={item}
              className={`mb-3 min-w-0 border-t py-3 transition-colors ${
                tone === "paper" ? "border-[#C9C1AF]" : "border-[#3B3D34]"
              } ${item.to ? `px-2 ${textClasses.interactive}` : ""}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span
                      className={`font-display text-lg font-bold uppercase leading-none ${textClasses.title}`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-[0.62rem] font-semibold uppercase tracking-[0.13em] ${
                        isCurrent
                          ? tone === "paper"
                            ? "text-[#A72F1D]"
                            : "text-[#FF8B73]"
                          : textClasses.label
                      }`}
                    >
                      {getStateLabel(item)}
                    </span>
                  </div>
                  {item.title ? (
                    <p
                      className={`mt-1 font-display text-xl font-semibold leading-none ${textClasses.title}`}
                    >
                      {item.title}
                    </p>
                  ) : null}
                  {item.detail ? (
                    <p className={`mt-1 text-xs leading-5 ${textClasses.detail}`}>
                      {item.detail}
                    </p>
                  ) : null}
                </div>
                {item.meta ? (
                  <span
                    className={`shrink-0 text-right text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${textClasses.label}`}
                  >
                    {item.meta}
                  </span>
                ) : null}
              </div>

              {item.content ? <div className="mt-3">{item.content}</div> : null}
            </InteractiveWrapper>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Reusable nine-slot continuity language for plan rhythm, cycle orientation,
 * finish-day handoff, and cycle recap. Items are display models only; this
 * component never creates or mutates runtime progress.
 */
export default function ContinuityRail({
  items = [],
  orientation = "horizontal",
  tone = "dark",
  animate = false,
  ariaLabel = "Training cycle continuity",
  className = "",
}) {
  if (!items.length) {
    return null;
  }

  const safeTone = tone === "paper" ? "paper" : "dark";

  return (
    <section className={className} aria-label={ariaLabel}>
      {orientation === "vertical" ? (
        <VerticalRail items={items} tone={safeTone} animate={animate} />
      ) : (
        <HorizontalRail items={items} tone={safeTone} animate={animate} />
      )}
    </section>
  );
}
