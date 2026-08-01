import { Link } from "react-router-dom";

import AppShell from "../components/layout/AppShell";

/** Static fallback; it never reads or mutates workout progress. */
export default function NotFoundPage() {
  return (
    <AppShell mode="product">
      <div className="space-y-7">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center text-xs font-semibold uppercase tracking-[0.12em] text-[#66675E]"
        >
          ← Home
        </Link>
        <section className="cut-corner border border-[#C9C1AF] bg-[#F8F5EB] p-5">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[#B33521]">
            Route / 404
          </p>
          <h1 className="mt-3 font-display text-6xl font-extrabold uppercase leading-[0.85] tracking-[-0.03em] text-[#191A16]">
            This marker is off the rail.
          </h1>
          <p className="mt-4 max-w-md border-l-2 border-[#FF5A3C] pl-3 text-sm leading-6 text-[#4E5048]">
            This route does not match a training screen. Return to the product
            entry and continue from a known plan or active cycle.
          </p>
          <Link
            to="/"
            className="cut-corner-sm mt-6 inline-flex min-h-12 w-full items-center justify-between border border-[#191A16] bg-[#191A16] px-4 text-sm font-semibold text-[#F8F5EB]"
          >
            Back to Cycle Coach <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
