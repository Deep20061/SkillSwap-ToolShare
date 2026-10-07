"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Icons";

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-4 py-12 md:grid-cols-5 md:px-6 lg:px-8">
        <div className="col-span-2">
          <div className="mb-3 flex items-center gap-2 text-brand-600">
            <Logo size={24} />
            <span className="text-[15px] font-extrabold tracking-tight text-ink">
              Skill<span className="text-brand-600">Swap</span> & ToolShare
            </span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink2">
            Your talent and tools are the currency. A neighbourhood exchange platform — no money
            changes hands.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-emerald-700">
              Lisbon · Porto · Braga
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-brand-700">
              EU · pt
            </span>
          </div>
        </div>

        {[
          {
            h: "Marketplace",
            l: [
              { label: "Browse skills", href: "/listings?type=SKILL_OFFER" },
              { label: "Browse tools", href: "/listings?type=TOOL_LISTING" },
              { label: "Map view", href: "/map" },
              { label: "Categories", href: "/listings" },
            ],
          },
          {
            h: "Trust",
            l: [
              { label: "Verification", href: "#" },
              { label: "Digital contracts", href: "#" },
              { label: "Deposits", href: "#" },
              { label: "Community rules", href: "#" },
            ],
          },
          {
            h: "Help",
            l: [
              { label: "How it works", href: "/how" },
              { label: "FAQ", href: "#" },
              { label: "Safety", href: "#" },
              { label: "Contact", href: "#" },
            ],
          },
        ].map((col) => (
          <div key={col.h}>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink3">
              {col.h}
            </div>
            <ul className="space-y-2">
              {col.l.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink2 no-underline transition-colors hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 text-xs text-ink3 md:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} SkillSwap. No money. Just talent, tools, trust.</span>
          <span className="hidden md:inline">Built in Braga · PT</span>
        </div>
      </div>
    </footer>
  );
}
