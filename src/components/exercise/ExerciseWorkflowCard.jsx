import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ChevronDown,
  Crosshair,
  History,
  ListChecks,
  Zap,
} from "lucide-react";

import HelpSheet from "../common/HelpSheet";
import SetRow from "./SetRow";
import {
  exerciseHelp,
  advancedTechniqueHelpByType,
} from "../../data/contextualHelp";
import { revealPanelVariants } from "../../styles/motion";

const MotionDiv = motion.div;

const METHOD_SUMMARY_BY_TYPE = {
  mechanicalDropset: "Mechanical dropset · exact sequence available",
  mechanicalSet: "Mechanical set · exact sequence available",
  restPause: "Rest-pause · exact method available",
  dropset: "Dropset · exact method available",
  cluster: "Cluster set · exact structure available",
  isoHold: "Iso hold · exact timing available",
  isoStretch: "Iso stretch · exact timing available",
};

function cleanSummaryValue(value) {
  if (!value || typeof value !== "string") {
    return "—";
  }

  return value.replace(/^≈\s*/, "").trim();
}

// Normalizes compact target values for metric cells without changing source data.
function compactSummaryValue(value) {
  return cleanSummaryValue(value)
    .replace(/\s*x\s*/i, " x ")
    .replace(/\s*-\s*/g, "-")
    .replace(/(\d)\s*s\b/gi, "$1 s");
}

function getMethodSummary(advancedTechniqueType) {
  return (
    METHOD_SUMMARY_BY_TYPE[advancedTechniqueType] ??
    "Advanced method · exact sequence available"
  );
}

function TargetItem({ label, value }) {
  return (
    <div className="min-w-0 px-1.5 text-center">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#77818B]">
        {label}
      </p>
      <p className="mt-1 whitespace-nowrap text-xs font-semibold tabular-nums text-[#F3F5F1] min-[360px]:text-sm">
        {value}
      </p>
    </div>
  );
}

function DisclosureChevron({ isOpen, className = "text-[#AAB2BA]" }) {
  return (
    <ChevronDown
      className={`h-4 w-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none ${className} ${
        isOpen ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    />
  );
}

/**
 * Displays one full exercise workflow.
 *
 * Runtime note:
 * The component receives runtime or preview set rows from the page layer and
 * delegates all row updates upward. It does not create or mutate runtime logs.
 */
export default function ExerciseWorkflowCard({
  exercise,
  sets = [],
  isReadOnly = false,
  hasPreviousValues = false,
  dayMode = "inactive",
  onToggleSetDone,
  onUpdateSetField,
  onCloseExercise,
}) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isAdvancedHelpOpen, setIsAdvancedHelpOpen] = useState(false);
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [isCoachNotesOpen, setIsCoachNotesOpen] = useState(false);
  const methodPanelId = useId();
  const coachNotesPanelId = useId();

  if (!exercise) {
    return null;
  }

  const prescriptionDisplay = exercise.prescription ?? "—";

  const {
    tempo = "—",
    targetRir = "—",
    rest = "—",
    progression,
    advancedTechnique,
    advancedTechniqueType,
    extraCues = [],
  } = exercise.details ?? {};

  const cleanedPrescriptionDisplay = compactSummaryValue(prescriptionDisplay);
  const cleanedTempo = compactSummaryValue(tempo);
  const cleanedTargetRir = compactSummaryValue(targetRir);
  const cleanedRest = compactSummaryValue(rest);

  const advancedTechniqueHelp = advancedTechniqueType
    ? advancedTechniqueHelpByType[advancedTechniqueType]
    : null;

  const methodSummary = getMethodSummary(advancedTechniqueType);
  const hasCoachNotes = Boolean(progression) || extraCues.length > 0;

  const isClosedLog = dayMode === "finished";
  const finishButtonLabel = isClosedLog ? "Save changes" : "Finish exercise";
  const completedSetCount = sets.filter((set) => set.isDone).length;
  const setProgressLabel = `${completedSetCount} of ${sets.length} performed`;

  return (
    <>
      <div className="space-y-5">
        {isReadOnly ? (
          <section
            role="note"
            className="border-l-2 border-[#77818B] bg-[#13181D]/55 px-4 py-3"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#AAB2BA]">
              Read-only preview
            </p>
            <p className="mt-1 text-sm leading-6 text-[#AAB2BA]">
              Review the prescription now. Logging opens when this day becomes
              current.
            </p>
          </section>
        ) : null}

        {isClosedLog ? (
          <section
            role="note"
            className="border-l-2 border-[#79C89A] bg-[#79C89A]/[0.05] px-4 py-3"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#A7DDB9]">
              Saved log
            </p>
            <p className="mt-1 text-sm leading-6 text-[#AAB2BA]">
              Review or adjust the values already stored for this closed day.
            </p>
          </section>
        ) : null}

        <section className="border-b border-[#2A3138] pb-5">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-[#B8F36B]" aria-hidden="true" />
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
              {isReadOnly ? "Exercise focus" : "Today's focus"}
            </p>
          </div>

          <p className="mt-2 text-base font-medium leading-6 text-[#E4E8E3]">
            {exercise.cue ??
              "Keep the movement controlled and log the work you actually perform."}
          </p>
        </section>

        {advancedTechnique ? (
          <section className="border-y border-[#F1B864]/25 bg-[#F1B864]/[0.035] px-4 py-1">
            <button
              type="button"
              aria-expanded={isMethodOpen}
              aria-controls={methodPanelId}
              onClick={() => setIsMethodOpen((current) => !current)}
              className="flex min-h-14 w-full items-center justify-between gap-4 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F1B864]/70"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#F1B864]" aria-hidden="true" />
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#F4C87F]">
                    Prescribed method
                  </p>
                </div>
                <p className="mt-1 text-sm leading-5 text-[#AAB2BA]">
                  {isMethodOpen
                    ? "Use the sequence below before logging the working set."
                    : methodSummary}
                </p>
              </div>

              <DisclosureChevron
                isOpen={isMethodOpen}
                className="text-[#F4C87F]"
              />
            </button>

            <AnimatePresence initial={false}>
              {isMethodOpen ? (
                <MotionDiv
                  id={methodPanelId}
                  className="border-t border-[#F1B864]/18 pb-4 pt-3"
                  variants={revealPanelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <p className="text-sm leading-6 text-[#D8D0C1]">
                    {advancedTechnique}
                  </p>

                  {advancedTechniqueHelp ? (
                    <button
                      type="button"
                      onClick={() => setIsAdvancedHelpOpen(true)}
                      className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-[#F1B864]/28 px-3 text-sm font-semibold text-[#F4C87F] transition-colors hover:bg-[#F1B864]/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F1B864]"
                    >
                      Open method help
                    </button>
                  ) : null}
                </MotionDiv>
              ) : null}
            </AnimatePresence>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-[1.25rem] border border-[#2A3138] bg-[#13181D] shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
          <div className="px-3.5 pb-4 pt-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-[#AAB2BA]" aria-hidden="true" />
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
                  Working targets
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-[#AAB2BA] transition-colors hover:text-[#F3F5F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]"
              >
                Help
              </button>
            </div>

            <div className="mt-3 grid grid-cols-4 divide-x divide-[#2A3138] py-1">
              <TargetItem label="Sets" value={cleanedPrescriptionDisplay} />
              <TargetItem label="Tempo" value={cleanedTempo} />
              <TargetItem label="Rest" value={cleanedRest} />
              <TargetItem label="RIR" value={cleanedTargetRir} />
            </div>
          </div>

          <div className="border-t border-[#2A3138] bg-[#101419]/62">
            <div className="flex items-end justify-between gap-4 px-3.5 pb-3 pt-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#77818B]">
                  Workbench
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#F3F5F1]">
                  {isReadOnly ? "Set preview" : "Today's work"}
                </h2>
              </div>

              <p className="shrink-0 text-xs font-semibold tabular-nums text-[#AAB2BA]">
                {isReadOnly ? `${sets.length} sets` : setProgressLabel}
              </p>
            </div>

            {!isReadOnly ? (
              <div className="mx-3.5 mb-3 flex items-start gap-3 border-l-2 border-[#3A434C] px-3 py-1.5">
                <History className="mt-0.5 h-4 w-4 shrink-0 text-[#77818B]" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#D7DDD7]">
                    {hasPreviousValues
                      ? "Previous values loaded"
                      : "No previous values yet"}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#77818B]">
                    {hasPreviousValues
                      ? "Use them as a reference. Performed sets still begin unchecked."
                      : "Today's performed work will become a next-cycle reference."}
                  </p>
                </div>
              </div>
            ) : null}

            <div
              className={`grid min-h-9 items-center gap-1 border-t border-[#2A3138] bg-[#171D22]/70 px-2 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-[#77818B] ${
                isReadOnly
                  ? "grid-cols-[1.9rem_minmax(0,1fr)]"
                  : "grid-cols-[1.9rem_minmax(0,1fr)_2.75rem]"
              }`}
              aria-hidden="true"
            >
              <span className="text-center">Set</span>
              <span className="grid grid-cols-3 text-center">
                <span>Kg</span>
                <span>Reps</span>
                <span>RIR</span>
              </span>
              {!isReadOnly ? <span className="text-center">Done</span> : null}
            </div>

            <div>
              {sets.map((set) => (
                <SetRow
                  key={`${exercise.id}-set-${set.setNumber}`}
                  isReadOnly={isReadOnly}
                  showDoneControl={!isReadOnly}
                  setNumber={set.setNumber}
                  weight={set.weight}
                  reps={set.reps}
                  rir={set.rir}
                  isDone={set.isDone}
                  onToggleDone={() => onToggleSetDone?.(set.setNumber)}
                  onSetFieldChange={(field, value) =>
                    onUpdateSetField?.(set.setNumber, field, value)
                  }
                />
              ))}
            </div>

            {!isReadOnly ? (
              <div className="border-t border-[#2A3138] px-3.5 pb-4 pt-3">
                <div className="mb-3 flex items-center justify-between gap-3 text-xs">
                  <span className="text-[#77818B]">
                    Done marks what was actually performed.
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-[#AAB2BA]">
                    {setProgressLabel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onCloseExercise}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B8F36B] px-5 text-sm font-semibold text-[#0B0E11] transition-colors hover:bg-[#C8F78F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F78F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101419]"
                >
                  {finishButtonLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {hasCoachNotes ? (
          <section className="border-y border-[#2A3138]">
            <button
              type="button"
              aria-expanded={isCoachNotesOpen}
              aria-controls={coachNotesPanelId}
              onClick={() => setIsCoachNotesOpen((current) => !current)}
              className="flex min-h-16 w-full items-center justify-between gap-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B8F36B]/65"
            >
              <div>
                <h2 className="text-base font-semibold text-[#E4E8E3]">
                  Coach notes
                </h2>
                <p className="mt-1 text-sm leading-5 text-[#77818B]">
                  Progression and extra execution cues.
                </p>
              </div>

              <DisclosureChevron isOpen={isCoachNotesOpen} />
            </button>

            <AnimatePresence initial={false}>
              {isCoachNotesOpen ? (
                <MotionDiv
                  id={coachNotesPanelId}
                  className="space-y-4 border-t border-[#2A3138] pb-5 pt-4"
                  variants={revealPanelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {progression ? (
                    <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
                      <span className="text-sm font-semibold tabular-nums text-[#77818B]">
                        01
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-[#E4E8E3]">
                          Progression
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#AAB2BA]">
                          {progression}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {extraCues.length > 0 ? (
                    <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 border-t border-[#2A3138] pt-4">
                      <span className="text-sm font-semibold tabular-nums text-[#77818B]">
                        {progression ? "02" : "01"}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-[#E4E8E3]">
                          Extra cues
                        </h3>
                        <ul className="mt-2 space-y-2">
                          {extraCues.map((cue) => (
                            <li
                              key={cue}
                              className="flex gap-2 text-sm leading-6 text-[#AAB2BA]"
                            >
                              <span className="mt-[0.65rem] h-1 w-1 shrink-0 rounded-full bg-[#77818B]" />
                              <span>{cue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </MotionDiv>
              ) : null}
            </AnimatePresence>
          </section>
        ) : null}
      </div>

      <HelpSheet
        isOpen={isHelpOpen}
        title={exerciseHelp.title}
        intro={exerciseHelp.intro}
        sections={exerciseHelp.sections}
        onClose={() => setIsHelpOpen(false)}
      />

      {advancedTechniqueHelp ? (
        <HelpSheet
          isOpen={isAdvancedHelpOpen}
          title={advancedTechniqueHelp.title}
          intro={advancedTechniqueHelp.intro}
          sections={advancedTechniqueHelp.sections}
          onClose={() => setIsAdvancedHelpOpen(false)}
        />
      ) : null}
    </>
  );
}
