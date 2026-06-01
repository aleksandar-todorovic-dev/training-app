import { ShieldCheck, Target, TrendingUp } from "lucide-react";

function InfoTile({ icon: title, value, tone = "emerald" }) {
  const iconClass =
    tone === "purple" ? "text-violet-300/90" : "text-emerald-300/90";

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/55 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/45">
        <Icon className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-semibold text-slate-100">
          {title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-400">
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Displays compact day-level session guidance.
 *
 * Runtime note:
 * Session info is guidance only and does not affect completion.
 */
export default function SessionInfoCard({ sessionInfo, dayGoal, coreBlock }) {
  return (
    <section className="grid gap-2.5 sm:grid-cols-3">
      <InfoTile
        icon={Target}
        title={sessionInfo.rirRule}
        value="Target effort"
      />

      <InfoTile
        icon={TrendingUp}
        title={
          sessionInfo.advancedTechniques === "None"
            ? "No advanced technique"
            : "Technique focus"
        }
        value={
          sessionInfo.advancedTechniques === "None"
            ? dayGoal
            : sessionInfo.advancedTechniques
        }
      />

      <InfoTile
        icon={ShieldCheck}
        title={coreBlock ? `${coreBlock.name} later` : "Main work"}
        value={coreBlock ? "Flexible block" : "No core block"}
        tone={coreBlock ? "purple" : "emerald"}
      />
    </section>
  );
}
