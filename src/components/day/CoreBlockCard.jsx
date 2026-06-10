import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";

function getStatusLabel(status) {
  if (status === "Logged") {
    return "Logged";
  }

  if (status === "Partial") {
    return "Partial";
  }

  return "Flexible block";
}

/**
 * Displays the Day screen entry point for an optional core block.
 *
 * Runtime note:
 * Core status is shown separately from main exercise progress.
 */
export default function CoreBlockCard({ planId, dayId, coreBlock, status }) {
  return (
    <section className="rounded-2xl border border-violet-800/30 bg-violet-950/14 p-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-700/32 bg-violet-950/32 text-violet-300">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100">
              {coreBlock.name}
            </h2>

            <span className="rounded-full border border-violet-700/28 bg-violet-950/34 px-2 py-0.5 text-xs font-medium text-violet-200">
              {getStatusLabel(status)}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">
            {coreBlock.note || coreBlock.focus}
          </p>
        </div>

        <Link
          to={`/plan/${planId}/day/${dayId}/core/${coreBlock.id}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-violet-600/40 bg-violet-950/28 px-2.5 py-1.5 text-xs font-semibold text-violet-200 transition-colors hover:border-violet-500/60"
        >
          Open core
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
