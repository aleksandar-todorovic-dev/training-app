import { Link } from "react-router-dom";

const PUBLIC_INFO_LINKS = [
  { to: "/privacy", label: "Privacy" },
  { to: "/preview-terms", label: "Preview Terms" },
  { to: "/fitness-safety", label: "Fitness & Safety" },
  { to: "/contact", label: "Contact" },
];

export default function PublicInfoNav() {
  return (
    <nav className="mt-auto pt-6" aria-label="Public preview information">
      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.13em] text-[#59646E]">
        Cycle Coach · Free preview · 18+
      </p>

      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2">
        {PUBLIC_INFO_LINKS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="inline-flex min-h-9 items-center text-xs font-medium text-[#7E8994] transition-colors hover:text-[#DDE1DD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8F36B]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E11]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
