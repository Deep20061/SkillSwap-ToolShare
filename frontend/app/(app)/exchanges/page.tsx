"use client";

import { AppFooter } from "@/components/AppFooter";
import { ArrowSwap } from "@/components/ui/Icons";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ExchangesPage() {
  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          kicker="Account"
          title="Exchanges"
          desc="Your active and past swap agreements."
        />

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(
            [
              { v: "0", l: "Active" },
              { v: "0", l: "Completed" },
              { v: "0", l: "Pending review" },
              { v: "—", l: "Avg. rating given" },
            ] as const
          ).map((s) => (
            <div key={s.l} className="rounded-xl border border-line bg-surface px-4 py-3">
              <div className="text-2xl font-bold text-ink">{s.v}</div>
              <div className="text-[11px] text-ink3">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-sunken text-ink3">
            <ArrowSwap size={24} />
          </div>
          <div>
            <div className="mb-1 font-semibold text-ink">No exchanges yet</div>
            <p className="max-w-sm text-sm text-ink2">
              Once you agree to swap with someone, your exchanges will appear here with a digital
              contract and timeline.
            </p>
          </div>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink3">
            Coming soon
          </span>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
