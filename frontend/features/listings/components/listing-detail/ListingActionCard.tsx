"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowSwap, Shield, Doc, Star, Phone } from "@/components/ui/Icons";
import { useSession } from "@/features/auth/hooks/useSession";
import { api } from "@/lib/api";
import type { Listing } from "@/features/listings/types";
import type { Conversation } from "@/features/conversations/types";

interface MyListing {
  id: string;
  title: string;
  type: string;
}

export interface ListingActionCardProps {
  listing: Listing;
  isSkill: boolean;
}

export function ListingActionCard({ listing, isSkill }: ListingActionCardProps) {
  const router = useRouter();
  const { user } = useSession();

  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [offerListingId, setOfferListingId] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = user?.id === listing.userId;

  useEffect(() => {
    if (!user || isOwner) return;
    api
      .get("api/listings/me/listings")
      .json<{ listings: MyListing[] }>()
      .then((d) => setMyListings(d.listings))
      .catch(() => {});
  }, [user, isOwner]);

  const now = new Date();
  const minDatetime = now.toISOString().slice(0, 16);

  async function handleRequest() {
    if (!user || isOwner || isSubmitting) return;
    setError(null);

    if (offerListingId) {
      const now = new Date();
      if (scheduledStart && new Date(scheduledStart) <= now) {
        setError("Start date must be in the future");
        return;
      }
      if (scheduledEnd && new Date(scheduledEnd) <= now) {
        setError("End date must be in the future");
        return;
      }
      if (scheduledStart && scheduledEnd && new Date(scheduledEnd) <= new Date(scheduledStart)) {
        setError("End date must be after start date");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        recipientId: listing.userId,
        listingId: listing.id,
      };
      if (offerListingId) {
        body.offerListingId = offerListingId;
        if (scheduledStart) body.scheduledStart = new Date(scheduledStart).toISOString();
        if (scheduledEnd) body.scheduledEnd = new Date(scheduledEnd).toISOString();
      }

      const conv = await api
        .post("api/conversations", { json: body })
        .json<Conversation>();

      router.push(`/messages?open=${conv.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <aside className="self-start lg:sticky lg:top-32">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {/* Price / terms header */}
        <div className="border-b border-line p-5">
          <div className="mb-1 flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-extrabold leading-none text-ink">
                {isSkill
                  ? listing.skillDetail?.estimatedHours
                    ? `${listing.skillDetail.estimatedHours}h`
                    : "Swap"
                  : listing.toolDetail?.depositAmount != null
                    ? `€${listing.toolDetail.depositAmount}`
                    : "Free"}
              </div>
              <div className="mt-1 text-xs text-ink3">
                {isSkill ? "per session · time for time" : "refundable deposit · borrow free"}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
              <Shield size={10} /> Protected
            </span>
          </div>
          {isSkill && (
            <div className="mt-3 text-xs text-ink2">
              You give back:{" "}
              <span className="font-semibold text-ink">
                {listing.skillDetail?.estimatedHours ?? "?"}h
              </span>{" "}
              of your own skill, or an agreed equivalent.
            </div>
          )}
          {!isSkill && (
            <div className="mt-3 text-xs text-ink2">
              Deposit held in escrow. Released automatically on return in good condition.
            </div>
          )}
        </div>

        {/* Form fields — only shown to logged-in non-owners */}
        {user && !isOwner && (
          <div className="space-y-3 border-b border-line p-5">
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                What you&apos;ll offer in return
              </label>
              {myListings.length === 0 ? (
                <p className="text-[11.5px] text-ink3">
                  You have no listings yet.{" "}
                  <a href="/listings/new" className="text-brand-600 hover:underline">
                    Create one
                  </a>{" "}
                  to propose a swap.
                </p>
              ) : (
                <select
                  value={offerListingId}
                  onChange={(e) => setOfferListingId(e.target.value)}
                  className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  <option value="">— No counter-offer, just message</option>
                  {myListings.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              )}
            </div>

            {offerListingId && (
            <div>
              <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
                When
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="datetime-local"
                    value={scheduledStart}
                    min={minDatetime}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                  <span className="mt-0.5 block text-[10px] text-ink3">From</span>
                </div>
                <div>
                  <input
                    type="datetime-local"
                    value={scheduledEnd}
                    min={scheduledStart || minDatetime}
                    onChange={(e) => setScheduledEnd(e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                  <span className="mt-0.5 block text-[10px] text-ink3">To</span>
                </div>
              </div>
            </div>
            )}

            {error && <p className="text-[11px] text-rose-500">{error}</p>}
          </div>
        )}

        {/* CTA */}
        <div className="p-5">
          {isOwner ? (
            <button
              disabled
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-surface opacity-50 cursor-not-allowed"
            >
              Your listing
            </button>
          ) : !user ? (
            <a
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-surface hover:bg-ink/90 transition-colors"
            >
              <ArrowSwap size={16} /> Sign in to request
            </a>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleRequest}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-surface transition-colors hover:bg-ink/90 disabled:opacity-60"
            >
              <ArrowSwap size={16} />
              {isSubmitting
                ? "Sending…"
                : offerListingId
                  ? "Request to swap"
                  : "Message host"}
            </button>
          )}
          <p className="mt-3 text-center text-[11px] leading-relaxed text-ink3">
            You won&apos;t be charged. Both parties sign a digital agreement before the exchange begins.
          </p>
        </div>

        {/* Protection */}
        <div className="border-t border-line bg-sunken p-5">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
            Protection
          </div>
          <ul className="space-y-2 text-xs text-ink2">
            <li className="flex items-start gap-2">
              <Shield size={13} className="mt-0.5 flex-shrink-0 text-emerald-500" />
              Verified host identity
            </li>
            <li className="flex items-start gap-2">
              <Doc size={13} className="mt-0.5 flex-shrink-0 text-brand-500" />
              Digital contract with arbitration
            </li>
            <li className="flex items-start gap-2">
              <Star size={13} className="mt-0.5 flex-shrink-0 text-amber-500" />
              Two-way review after the swap
            </li>
            <li className="flex items-start gap-2">
              <Phone size={13} className="mt-0.5 flex-shrink-0 text-rose-500" />
              24h dispute line
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
