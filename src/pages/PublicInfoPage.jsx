import { ExternalLink } from "lucide-react";

import AppShell from "../components/layout/AppShell";
import BackControl from "../components/common/BackControl";
import GuardState from "../components/common/GuardState";
import {
  PUBLIC_INFO_EFFECTIVE_DATE,
  publicInfoPages,
} from "../data/publicInfo";

export default function PublicInfoPage({ pageKey }) {
  const page = publicInfoPages[pageKey];

  if (!page) {
    return (
      <GuardState
        eyebrow="Public information"
        title="This page could not be loaded."
        description="Return home and reopen the public-preview information from the app."
        primaryTo="/"
        primaryLabel="Back to home"
      />
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-7 pb-1">
        <header>
          <BackControl to="/">Back to home</BackControl>

          <p className="mt-5 text-[0.68rem] font-bold uppercase tracking-[0.17em] text-[#F4C87F]">
            {page.eyebrow}
          </p>

          <h1 className="mt-2 text-[2.65rem] font-semibold leading-none tracking-[-0.06em] text-[#F3F5F1]">
            {page.title}
          </h1>

          <p className="mt-4 max-w-sm text-[0.96rem] leading-6 text-[#AAB2BA]">
            {page.lead}
          </p>
        </header>

        <div className="border-y border-[#2A3138]">
          {page.sections.map((section, index) => (
            <section
              key={section.id}
              className={`py-5 ${index > 0 ? "border-t border-[#232A31]" : ""}`}
            >
              <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
                <span className="pt-0.5 text-sm font-semibold tabular-nums text-[#F1B864]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <h2 className="text-base font-semibold tracking-[-0.02em] text-[#E5E8E3]">
                    {section.title}
                  </h2>

                  {section.paragraphs?.length ? (
                    <div className="mt-2.5 space-y-2.5">
                      {section.paragraphs.map((paragraph) => (
                        <p
                          key={paragraph}
                          className="text-sm leading-6 text-[#AAB2BA]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ) : null}

                  {section.bullets?.length ? (
                    <ul className="mt-3 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex gap-2.5 text-sm leading-6 text-[#AAB2BA]"
                        >
                          <span
                            className="mt-[0.68rem] h-1 w-1 shrink-0 rounded-full bg-[#F1B864]"
                            aria-hidden="true"
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {section.links?.length ? (
                    <div className="mt-3 flex flex-col items-start gap-2">
                      {section.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#3A434C] bg-[#151A1F] px-3 text-sm font-semibold text-[#DDE1DD] transition-colors hover:border-[#56616B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/60"
                        >
                          {link.label}
                          <ExternalLink
                            className="h-3.5 w-3.5 text-[#7E8994]"
                            aria-hidden="true"
                          />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          ))}
        </div>

        <p className="text-xs leading-5 text-[#66717C]">
          Effective date: {PUBLIC_INFO_EFFECTIVE_DATE}. These pages describe the
          current free public preview and should be updated if the product's
          data flows, business model, or release scope materially change.
        </p>
      </div>
    </AppShell>
  );
}
