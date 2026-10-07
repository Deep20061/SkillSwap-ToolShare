"use client";

import Link from "next/link";
import { AppFooter } from "@/components/AppFooter";
import { ArrowSwap, Shield, Hand, Tools, Check } from "@/components/ui/Icons";

const HOW_STEPS = [
  {
    n: "1",
    title: "Post what you have",
    desc: "List a skill you can teach or a tool you're happy to lend. Takes less than five minutes. No pricing required.",
    icon: <Hand size={22} />,
    tone: "bg-violet-100 text-violet-700",
  },
  {
    n: "2",
    title: "Find what you need",
    desc: "Browse your neighbourhood for skills and tools. Filter by distance, category, or availability.",
    icon: <Tools size={22} />,
    tone: "bg-amber-100 text-amber-800",
  },
  {
    n: "3",
    title: "Agree on a swap",
    desc: "Reach out, agree on the exchange, and sign a lightweight digital contract — both parties are protected.",
    icon: <ArrowSwap size={22} />,
    tone: "bg-brand-100 text-brand-700",
  },
  {
    n: "4",
    title: "Exchange, review, repeat",
    desc: "Complete the swap, leave an honest review, and build your reputation in the community.",
    icon: <Check size={22} />,
    tone: "bg-emerald-100 text-emerald-700",
  },
];

export default function HowPage() {
  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-[900px] px-4 py-10 md:px-6 md:py-16 lg:px-8">
        <div className="mb-10 md:mb-14">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-600">
            For the curious
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-ink md:text-4xl">
            How SkillSwap works
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink2">
            A community marketplace where talent and resources are the currency. No money changes
            hands — your skills and tools are enough.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-14 grid gap-5 md:grid-cols-2">
          {HOW_STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-line bg-surface p-6">
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${s.tone}`}
              >
                {s.icon}
              </div>
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink3">
                Step {s.n}
              </div>
              <h3 className="mb-2 text-lg font-bold text-ink">{s.title}</h3>
              <p className="text-sm leading-relaxed text-ink2">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust section */}
        <div className="mb-10 rounded-2xl border border-line bg-sunken p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-bold text-ink">Built on trust</h2>
              <p className="max-w-xl text-sm leading-relaxed text-ink2">
                Every swap is backed by identity verification, a digital contract, and a two-way
                review system. We hold tool deposits in escrow and offer a 24h dispute line — so
                both sides are protected.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/listings"
            className="inline-flex h-12 items-center rounded-xl bg-ink px-8 text-sm font-semibold text-surface no-underline transition-opacity hover:opacity-90"
          >
            Browse the marketplace
          </Link>
          <p className="mt-3 text-xs text-ink3">No account required to browse</p>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
