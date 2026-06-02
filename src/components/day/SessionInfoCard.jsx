import { createElement } from "react";
import { ShieldCheck, Target, TrendingUp } from "lucide-react";

function SessionNoteRow({ icon, label, value, accent = "cyan" }) {
  const iconClassName =
    accent === "purple" ? "text-violet-300/80" : "text-[#8FDCE5]/85";

  const iconBackgroundClassName =
    accent === "purple"
      ? "border-violet-300/14 bg-violet-300/7"
      : "border-[#3FA8B6]/14 bg-[#10292E]/45";

  return (
    <div className="flex min-w-0 gap-3 py-2.5">
      <div
        className={[
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
          iconBackgroundClassName,
        ].join(" ")}
      >
        {createElement(icon, {
          className: `h-4 w-4 ${iconClassName}`,
          "aria-hidden": "true",
        })}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#747D84]">
          {label}
        </p>

        <p className="mt-0.5 line-clamp-2 text-sm leading-6 text-[#A9B0B5]">
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
  const hasAdvancedTechnique = sessionInfo.advancedTechniques !== "None";

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#11171A]/62 px-4 shadow-[0_12px_28px_rgba(0,0,0,0.14)]">
      <div className="border-b border-white/8 py-2.5">
        <p className="text-xs font-semibold tracking-[0.08em] text-[#D3D8DB]">
          Session notes
        </p>
      </div>

      <div className="divide-y divide-white/8">
        <SessionNoteRow
          icon={Target}
          label="Target effort"
          value={sessionInfo.rirRule}
        />

        <SessionNoteRow
          icon={TrendingUp}
          label={hasAdvancedTechnique ? "Technique focus" : "Day focus"}
          value={
            hasAdvancedTechnique ? sessionInfo.advancedTechniques : dayGoal
          }
        />

        <SessionNoteRow
          icon={ShieldCheck}
          label={coreBlock ? "Core block" : "Main work"}
          value={
            coreBlock
              ? `${coreBlock.name} later · Flexible block`
              : "No core block"
          }
          accent={coreBlock ? "purple" : "cyan"}
        />
      </div>
    </section>
  );
}
