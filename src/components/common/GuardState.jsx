import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

import AppShell from "../layout/AppShell";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

/**
 * Shared guard/fallback presentation for unavailable routes or lifecycle states.
 *
 * Runtime boundary:
 * This component is presentational only. Rendering it must never create or
 * repair plan, cycle, day, exercise, or core runtime state.
 */
export default function GuardState({
  backTo,
  backLabel,
  eyebrow = "Training flow",
  context,
  title,
  description,
  icon: GuardIcon = ShieldAlert,
  children,
  primaryTo,
  primaryLabel,
  secondaryTo,
  secondaryLabel,
}) {
  return (
    <AppShell mode="performance">
      <div className="flex min-h-[calc(100dvh-3rem)] flex-col">
        {backTo && backLabel ? (
          <Link
            to={backTo}
            className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-lg pr-2 text-xs font-medium text-[#8B949D] transition-colors hover:text-[#D7DCD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101419]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {backLabel}
          </Link>
        ) : null}

        <div className="flex flex-1 flex-col justify-center py-10">
          <header>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#3A434C] bg-[#171D22] text-[#AAB2BA]">
                <GuardIcon className="h-4 w-4" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#8B949D]">
                  {eyebrow}
                </p>

                {context ? (
                  <p className="mt-1 truncate text-xs font-medium text-[#AAB2BA]">
                    {context}
                  </p>
                ) : null}
              </div>
            </div>

            <h1 className="mt-6 max-w-sm text-[2.35rem] font-semibold leading-[1.02] tracking-[-0.035em] text-[#F3F5F1]">
              {title}
            </h1>

            <p className="mt-4 max-w-sm text-[0.95rem] leading-7 text-[#AAB2BA]">
              {description}
            </p>
          </header>

          {children ? <div className="mt-7">{children}</div> : null}

          <div className="mt-8 flex flex-col gap-3">
            <PrimaryButton
              to={primaryTo}
              variant="performance"
              className="w-full"
            >
              {primaryLabel}
            </PrimaryButton>

            {secondaryTo && secondaryLabel ? (
              <SecondaryButton
                to={secondaryTo}
                variant="performance"
                className="w-full"
              >
                {secondaryLabel}
              </SecondaryButton>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
