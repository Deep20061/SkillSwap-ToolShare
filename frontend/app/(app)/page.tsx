"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/AppFooter";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { useSession } from "@/features/auth/hooks/useSession";
import { useCategories } from "@/features/listings/hooks/useCategories";
import { api } from "@/lib/api";
import type { Listing, ListingsResponse } from "@/features/listings/types";
import {
  Shield,
  Doc,
  Star,
  Hand,
  Tools,
  Plus,
  Msg,
  Pin,
  MapIcon,
  StarFill,
  CAT_ICONS,
  Compass,
} from "@/components/ui/Icons";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

// ── Fetch hook for the home page sections ────────────────────────────────────

function useHomeListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("api/listings?limit=20")
      .json<ListingsResponse>()
      .then((d) => setListings(d.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const skills = listings.filter((l) => l.type === "SKILL_OFFER");
  const tools = listings.filter((l) => l.type === "TOOL_LISTING");
  return { listings, skills, tools, loading };
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHead({
  kicker,
  title,
  actionLabel = "See all",
  actionHref,
  icon,
}: {
  kicker?: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        {kicker && (
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-600">
            {kicker}
          </div>
        )}
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink md:text-2xl">
          {icon}
          {title}
        </h2>
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          className="flex items-center gap-1 text-sm text-ink2 no-underline hover:text-ink"
        >
          {actionLabel} <span>›</span>
        </Link>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSession();
  const { categories } = useCategories();
  const { listings, skills, tools, loading } = useHomeListings();

  const loggedIn = !authLoading && !!user;
  const firstName = user?.name?.split(" ")[0] ?? "";

  // TODO: replace with a location-filtered fetch once the backend supports it.
  // Should send the user's coordinates (from useGeolocation or their profile) and
  // return listings sorted by distance. For now just shows the first 4 from the
  // generic feed, so "Near you" is not actually location-aware.
  const nearMe = listings.slice(0, 4);

  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        {/* ── Hero ── */}
        <section className="relative mb-10 overflow-hidden rounded-3xl border border-line bg-surface">
          <div className="relative grid items-stretch gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left — text */}
            <div className="flex flex-col justify-center p-6 md:p-10 lg:p-14">
              <div className="mb-5 inline-flex items-center gap-1.5 self-start whitespace-nowrap rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-brand-700">
                <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brand-500" />
                {loggedIn ? `Welcome back, ${firstName}` : "Community exchange · Portugal"}
              </div>

              <h1 className="mb-4 text-3xl font-extrabold leading-[1.02] tracking-tight text-ink md:text-[44px] lg:text-[52px]">
                {loggedIn ? (
                  <>
                    What will you swap <span className="text-brand-600">today?</span>
                  </>
                ) : (
                  <>
                    Your talent. Their tools. <span className="text-brand-600">Zero euros.</span>
                  </>
                )}
              </h1>

              <p className="mb-6 max-w-md text-[15px] leading-relaxed text-ink2 md:text-base">
                Borrow a drill from your neighbour. Trade an hour of Spanish for an hour of
                shelving. SkillSwap matches you with verified neighbours who have what you need.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => router.push("/listings?type=SKILL_OFFER")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
                >
                  <Hand size={16} /> Find a skill
                </button>
                <button
                  onClick={() => router.push("/listings?type=TOOL_LISTING")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-line2 bg-surface px-6 text-[15px] font-medium text-ink transition-colors hover:bg-sunken"
                >
                  <Tools size={16} /> Borrow a tool
                </button>
                <button
                  onClick={() => router.push("/map")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-6 text-[15px] font-medium text-ink2 transition-colors hover:bg-sunken hover:text-ink"
                >
                  <MapIcon size={16} /> Map view
                </button>
              </div>

              {/* Community proof */}
              <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
                <div className="flex -space-x-2">
                  {["MF", "CM", "BL", "JP"].map((ini) => (
                    <div
                      key={ini}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 ring-2 ring-surface"
                    >
                      {ini}
                    </div>
                  ))}
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-sunken text-[10px] font-bold text-ink2">
                    +2.4k
                  </div>
                </div>
                <div className="text-xs leading-tight text-ink2">
                  <span className="font-semibold text-ink">2,418 neighbours</span> swapping in Braga
                  <div className="mt-0.5 flex items-center gap-1">
                    <StarFill size={10} className="text-amber-500" />
                    <span className="text-ink3">4.87 · 12k+ swaps completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — hero visual */}
            <div className="relative min-h-[320px] overflow-hidden bg-gradient-to-br from-amber-200 to-amber-400 lg:min-h-[520px]">
              <div className="stripe-ph absolute inset-0 opacity-30" />
              <span className="absolute left-3 top-3 rounded bg-white/85 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink2 backdrop-blur">
                hero photo · neighbours swapping
              </span>
              <div className="absolute inset-0 bg-gradient-to-tl from-black/10 via-transparent to-transparent" />

              {/* Floating chips */}
              <div className="absolute right-5 top-5 hidden items-center gap-2.5 rounded-full border border-line bg-surface/95 py-1.5 pl-1.5 pr-4 shadow-card backdrop-blur md:flex">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                  MF
                </div>
                <div className="text-[11px] leading-tight">
                  <div className="font-semibold text-ink">Mariana F.</div>
                  <div className="text-ink3">offered carpentry · 12 min ago</div>
                </div>
                <span className="h-2 w-2 animate-pulseDot rounded-full bg-emerald-500" />
              </div>

              <button
                onClick={() => router.push("/map")}
                className="absolute bottom-5 right-5 hidden items-stretch overflow-hidden rounded-2xl border border-line bg-surface/95 text-left shadow-pop backdrop-blur hover:border-line2 md:flex"
              >
                <div className="map-grid relative h-20 w-24">
                  {[
                    { x: 32, y: 38, kind: "skill" },
                    { x: 58, y: 28, kind: "tool" },
                    { x: 42, y: 55, kind: "skill" },
                    { x: 68, y: 48, kind: "tool" },
                    { x: 26, y: 62, kind: "tool" },
                  ].map((p, i) => (
                    <span
                      key={i}
                      className={`absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ${
                        p.kind === "skill"
                          ? "bg-violet-500 ring-violet-200/60"
                          : "bg-amber-500 ring-amber-200/60"
                      }`}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    />
                  ))}
                </div>
                <div className="px-3.5 py-2.5">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-brand-600">
                    Near you
                  </div>
                  <div className="whitespace-nowrap text-sm font-semibold text-ink">
                    listings · 5 km
                  </div>
                  <div className="mt-0.5 flex items-center gap-0.5 text-[11px] text-brand-600">
                    Open map ›
                  </div>
                </div>
              </button>

              <div className="absolute bottom-5 left-5 hidden max-w-[280px] items-center gap-3 rounded-xl border border-line bg-surface/95 p-3 shadow-card backdrop-blur md:flex">
                <div className="flex flex-shrink-0 -space-x-2">
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700 ring-2 ring-surface">
                    MF
                  </div>
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700 ring-2 ring-surface">
                    BL
                  </div>
                </div>
                <div className="text-[11px] leading-snug text-ink2">
                  <span className="font-semibold text-ink">Mariana</span> ↔{" "}
                  <span className="font-semibold text-ink">Beatriz</span> ·
                  <span className="text-ink3"> 4h tiling for 4h Spanish</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust strip ── */}
        <section className="mb-12 grid grid-cols-3 gap-x-2 border-y border-line px-2 py-4 md:gap-x-6 md:px-0">
          {[
            {
              i: <Shield size={18} />,
              t: "Verified profiles",
              d: "Government ID + selfie liveness",
              c: "text-emerald-600",
            },
            {
              i: <Doc size={18} />,
              t: "Digital contracts",
              d: "Lightweight agreements, both sign",
              c: "text-brand-600",
            },
            {
              i: <Star size={18} />,
              t: "Two-way reviews",
              d: "Reputation built one swap at a time",
              c: "text-amber-600",
            },
          ].map((item) => (
            <div key={item.t} className="flex items-center gap-3">
              <div
                className={`hidden h-10 w-10 items-center justify-center rounded-lg bg-sunken sm:flex ${item.c}`}
              >
                {item.i}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">{item.t}</div>
                <div className="text-[11px] leading-snug text-ink3">{item.d}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ── Categories ── */}
        {categories.length > 0 && (
          <>
            <SectionHead kicker="Browse by category" title="What are you looking for?" />
            <div className="mb-12 grid grid-cols-3 gap-3 md:grid-cols-6">
              {categories.slice(0, 12).map((cat) => {
                const icon = cat.icon?.toLowerCase() ?? "";
                const Ic = CAT_ICONS[icon] ?? Compass;
                return (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/listings?categoryId=${cat.id}`)}
                    className="group rounded-xl border border-line bg-surface p-4 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-100">
                      <Ic size={18} />
                    </div>
                    <div className="text-sm font-semibold leading-tight text-ink">{cat.name}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Near you ── */}
        <SectionHead
          kicker="In your neighbourhood"
          title="Near you"
          icon={<Pin size={20} />}
          actionHref="/listings"
          actionLabel="Open map"
        />
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : nearMe.length > 0 ? (
            nearMe.map((l) => <ListingCard key={l.id} listing={l} />)
          ) : (
            <div className="col-span-4 py-8 text-center text-sm text-ink3">
              No listings yet —{" "}
              <Link href="/listings/new" className="text-brand-600 hover:underline">
                be the first to post
              </Link>
            </div>
          )}
        </div>

        {/* ── Skills row ── */}
        {/* TODO: "Trending" is currently just all SKILL_OFFER listings in default order.
            Replace skills/tools with a dedicated endpoint that ranks by viewCount,
            request count, or recent activity once that data is being tracked. */}
        <SectionHead
          kicker="Time-for-time"
          title="Trending skills"
          icon={<Hand size={20} />}
          actionHref="/listings?type=SKILL_OFFER"
        />
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : skills.slice(0, 4).length > 0 ? (
            skills.slice(0, 4).map((l) => <ListingCard key={l.id} listing={l} />)
          ) : (
            <div className="col-span-4 py-8 text-center text-sm text-ink3">
              No skill listings yet
            </div>
          )}
        </div>

        {/* ── Tools row ── */}
        {/* TODO: same as skills row — not actually ranked by popularity yet. */}
        <SectionHead
          kicker="Borrow, don't buy"
          title="Tools to borrow"
          icon={<Tools size={20} />}
          actionHref="/listings?type=TOOL_LISTING"
        />
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : tools.slice(0, 4).length > 0 ? (
            tools.slice(0, 4).map((l) => <ListingCard key={l.id} listing={l} />)
          ) : (
            <div className="col-span-4 py-8 text-center text-sm text-ink3">
              No tool listings yet
            </div>
          )}
        </div>

        {/* ── How it works ── */}
        <section className="mb-12 rounded-2xl border border-line bg-surface p-6 md:p-10">
          <SectionHead kicker="No money, no friction" title="How an exchange works" />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            {[
              {
                n: "01",
                t: "Post or browse",
                d: "List a skill or tool, or browse what neighbours have.",
                i: <Plus size={18} />,
              },
              {
                n: "02",
                t: "Match & chat",
                d: "Find a fair trade and message them in-app.",
                i: <Msg size={18} />,
              },
              {
                n: "03",
                t: "Sign the contract",
                d: "Lightweight digital agreement — both parties sign.",
                i: <Doc size={18} />,
              },
              {
                n: "04",
                t: "Swap & review",
                d: "Make the exchange and rate the experience.",
                i: <Star size={18} />,
              },
            ].map((s) => (
              <div key={s.n} className="relative rounded-xl border border-line bg-sunken p-5">
                <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-600">
                  Step {s.n}
                </div>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-brand-600">
                  {s.i}
                </div>
                <div className="mb-1 text-base font-bold tracking-tight text-ink">{s.t}</div>
                <div className="text-xs leading-relaxed text-ink2">{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mb-8 grid items-center gap-6 rounded-2xl bg-ink p-8 text-surface md:grid-cols-2 md:p-12">
          <div>
            <span className="mb-3 inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-medium tracking-wide text-brand-700">
              Become a host
            </span>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Got a skill? Got a drill?
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-white/70">
              Posting takes 3 minutes. Set your own terms, accept or decline trades, build a
              reputation in your neighbourhood.
            </p>
          </div>
          <div className="flex gap-2 md:justify-end">
            <button
              onClick={() => router.push("/listings/new")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 text-[15px] font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <Plus size={16} /> Post a listing
            </button>
            <button
              onClick={() => router.push("/how")}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-6 text-[15px] font-medium text-white transition-colors hover:bg-white/15"
            >
              Learn more
            </button>
          </div>
        </section>
      </div>

      <AppFooter />
    </div>
  );
}
