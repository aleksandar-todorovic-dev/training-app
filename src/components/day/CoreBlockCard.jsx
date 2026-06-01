import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";

function getStatusLabel(status) {
  if (status === "Complete") {
    return "Complete";
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
    <section className="rounded-3xl border border-violet-800/40 bg-violet-950/20 p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-violet-700/45 bg-violet-950/45 text-violet-300">
          <ShieldCheck className="h-7 w-7" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-slate-100">
              {coreBlock.name}
            </h2>

            <span className="rounded-full border border-violet-700/35 bg-violet-950/45 px-2.5 py-1 text-xs font-medium text-violet-200">
              {getStatusLabel(status)}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">
            {coreBlock.note || coreBlock.focus}
          </p>
        </div>

        <Link
          to={`/plan/${planId}/day/${dayId}/core/${coreBlock.id}`}
          className="inline-flex shrink-0 items-center gap-1 rounded-2xl border border-violet-600/50 bg-violet-950/35 px-3 py-2 text-sm font-semibold text-violet-200 transition-colors hover:border-violet-500/70"
        >
          Open core
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
