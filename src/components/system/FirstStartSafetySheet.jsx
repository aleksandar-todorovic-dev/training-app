import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "motion/react";

import BottomSheet from "../common/BottomSheet";
import {
  UI_BUTTON_PRIMARY_PERFORMANCE,
  UI_BUTTON_SECONDARY_PERFORMANCE,
  UI_SHEET_BODY,
  UI_SHEET_FOOTER,
  UI_SHEET_HEADER,
} from "../../styles/ui";

export default function FirstStartSafetySheet({
  isOpen,
  onClose,
  onConfirm,
}) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <BottomSheet
          key="first-start-safety-sheet"
          onClose={onClose}
          labelledBy="first-start-safety-title"
          describedBy="first-start-safety-description"
          closeLabel="Close safety notice"
        >
          <header className={UI_SHEET_HEADER}>
            <div className="pr-12">
              <div className="flex items-center gap-2 text-[#F4C87F]">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <p className="text-[0.67rem] font-semibold uppercase tracking-[0.13em]">
                  Before you start
                </p>
              </div>

              <h2
                id="first-start-safety-title"
                className="mt-3 text-[1.65rem] font-semibold leading-[1.08] tracking-[-0.025em] text-[#F3F5F1]"
              >
                Train with control.
              </h2>

              <p
                id="first-start-safety-description"
                className="mt-3 text-sm leading-6 text-[#AAB2BA]"
              >
                Cycle Coach provides general fitness guidance for adults 18+.
                Exercise involves risk, and the app cannot determine what is
                medically suitable for you.
              </p>
            </div>
          </header>

          <div className={UI_SHEET_BODY}>
            <ul className="space-y-3 border-y border-[#2A3138] py-4">
              <li className="flex gap-2.5 text-sm leading-6 text-[#D4D9D4]">
                <span className="mt-[0.68rem] h-1 w-1 shrink-0 rounded-full bg-[#F1B864]" />
                <span>
                  Use loads, equipment, ranges of motion, and technique you can
                  control. Use safeties or a spotter where appropriate.
                </span>
              </li>
              <li className="flex gap-2.5 text-sm leading-6 text-[#AAB2BA]">
                <span className="mt-[0.68rem] h-1 w-1 shrink-0 rounded-full bg-[#F1B864]" />
                <span>
                  Stop if you experience sharp, unusual, or concerning pain or
                  symptoms.
                </span>
              </li>
              <li className="flex gap-2.5 text-sm leading-6 text-[#AAB2BA]">
                <span className="mt-[0.68rem] h-1 w-1 shrink-0 rounded-full bg-[#F1B864]" />
                <span>
                  Get appropriate medical or professional advice when an injury,
                  health condition, pregnancy, medication, or prior advice may
                  affect exercise suitability.
                </span>
              </li>
            </ul>

            <p className="mt-4 text-sm leading-6 text-[#8E98A2]">
              By continuing, you confirm that you are 18 or older and that you
              have had the opportunity to review the{" "}
              <Link
                to="/fitness-safety"
                className="font-semibold text-[#DDE1DD] underline decoration-[#56616B] underline-offset-4 hover:text-white"
              >
                Fitness & Safety
              </Link>{" "}
              guidance and{" "}
              <Link
                to="/preview-terms"
                className="font-semibold text-[#DDE1DD] underline decoration-[#56616B] underline-offset-4 hover:text-white"
              >
                Preview Terms
              </Link>
              .
            </p>
          </div>

          <footer className={UI_SHEET_FOOTER}>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onConfirm}
                className={`${UI_BUTTON_PRIMARY_PERFORMANCE} w-full`}
              >
                I understand — start cycle
              </button>

              <button
                type="button"
                onClick={onClose}
                className={`${UI_BUTTON_SECONDARY_PERFORMANCE} w-full`}
              >
                Not now
              </button>
            </div>
          </footer>
        </BottomSheet>
      ) : null}
    </AnimatePresence>
  );
}
