"use client";

import Image from "next/image";
import { Check, ArrowSwap, Calendar, Star, Plus } from "@/components/ui/Icons";
import { getSwatch, cx } from "@/lib/utils";
import { apiUrl } from "@/lib/api";
import { DEAL_STEPS, dealStep, listingKind } from "../lib/dealSteps";
import type { SerializedContract, ContractStatus } from "../types";

function SwapSide({
  who,
  listing,
}: {
  who: string;
  listing: { id: string; title: string; type: string; coverImage?: string | null } | null | undefined;
}) {
  const swatch = listing?.id ? getSwatch(listing.id) : null;
  const kind = listing?.type ? listingKind(listing.type) : null;

  if (!listing) {
    return (
      <div className="flex-1 min-w-0 flex items-center gap-2.5 bg-sunken border border-dashed border-line rounded-xl px-3 py-2">
        <div className="w-8 h-8 rounded-md bg-line flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-[9.5px] font-mono uppercase tracking-wider text-ink3">{who === "You" ? "Your offer" : `${who} offers`}</div>
          <div className="text-[11px] text-ink3 italic">None yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 flex items-center gap-2.5 bg-surface border border-line rounded-xl px-3 py-2">
      {listing.coverImage ? (
        <Image
          src={`${apiUrl}${listing.coverImage}`}
          alt={listing.title}
          width={32}
          height={32}
          className="w-8 h-8 rounded-md object-cover border border-line flex-shrink-0"
          unoptimized
        />
      ) : swatch ? (
        <div className={`w-8 h-8 rounded-md flex-shrink-0 ${swatch.block}`} />
      ) : (
        <div className="w-8 h-8 rounded-md bg-line flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[9.5px] font-mono uppercase tracking-wider text-ink3">{who === "You" ? "Your offer" : `${who} offers`}</div>
        <div className="text-[12px] font-semibold text-ink truncate">{listing.title}</div>
      </div>
      {kind && (
        <span className={cx(
          "text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0",
          kind === "SKILL" ? "text-violet-700 bg-violet-50" : "text-amber-800 bg-amber-50",
        )}>
          {kind}
        </span>
      )}
    </div>
  );
}

interface DealCardProps {
  contract: SerializedContract | null | undefined;
  currentUserId: string;
  contextListing: { id: string; title: string; type: string; coverImage: string | null } | null;
  partnerName: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onProposeTerms: () => void;
  onLeaveReview: () => void;
  hasReviewed: boolean;
  actionLoading: boolean;
}

export function DealCard({
  contract,
  currentUserId,
  contextListing,
  partnerName,
  onAccept,
  onDecline,
  onCancel,
  onComplete,
  onProposeTerms,
  onLeaveReview,
  hasReviewed,
  actionLoading,
}: DealCardProps) {
  const status = contract === undefined ? undefined : contract?.status ?? null;
  const step = dealStep(status);
  const partnerFirst = partnerName?.split(" ")[0] ?? "Them";

  const isRequester = contract ? contract.requesterId === currentUserId : false;
  const isProvider = contract ? contract.providerId === currentUserId : false;

  const myConfirmed = contract
    ? (isRequester ? contract.requesterConfirmedComplete : contract.providerConfirmedComplete)
    : false;
  const theirConfirmed = contract
    ? (isRequester ? contract.providerConfirmedComplete : contract.requesterConfirmedComplete)
    : false;

  // Reviews are double-blind: each stays hidden until both sides have
  // submitted, so the footer spells out whose turn it is.
  const partnerId = contract ? (isRequester ? contract.providerId : contract.requesterId) : null;
  const peerReviewed = !!(partnerId && contract?.reviewedByIds?.includes(partnerId));

  const myOffer = contract
    ? (isRequester ? contract.listing : contract.counterListing ?? null)
    : null;
  const theirOffer = contract
    ? (isRequester ? contract.counterListing ?? null : contract.listing)
    : contextListing ?? null;

  if (contract === undefined) {
    return (
      <div className="rounded-2xl bg-surface border border-line shadow-sm mx-4 lg:mx-8 mt-4 h-[68px] animate-pulse" />
    );
  }

  if (status === "CANCELLED" || status === "DECLINED") {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 mx-4 lg:mx-8 mt-4 text-[12.5px] text-rose-700 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-rose-400 flex-shrink-0" />
        This swap was {status === "CANCELLED" ? "cancelled" : "declined"}.
        <button
          onClick={onProposeTerms}
          className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 hover:underline"
        >
          <Plus size={11} /> Propose new terms
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface border border-line shadow-sm overflow-hidden mx-4 lg:mx-8 mt-4">
      {/* Header: stage label + progress dots */}
      <div className="px-4 pt-3 pb-2.5 flex items-center justify-between gap-3 border-b border-line/70">
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-brand-700">
            {step.label}
          </div>
          <div className="text-[13px] font-semibold text-ink truncate">{step.headline}</div>
        </div>
        <div className="flex items-center gap-[3px] flex-shrink-0">
          {DEAL_STEPS.map((label, i) => {
            const done = i < step.idx;
            const current = i === step.idx;
            return (
              <span
                key={label}
                title={label}
                className={cx(
                  "h-1.5 rounded-full transition-all",
                  current ? "w-6 bg-brand-600" : done ? "w-3 bg-brand-600" : "w-3 bg-line",
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Swap sides */}
      <div className="px-4 py-3 grid grid-cols-[1fr_auto_1fr] gap-2.5 items-stretch">
        <SwapSide who="You" listing={myOffer} />
        <div className="flex items-center justify-center text-ink3 px-1">
          <div className="w-7 h-7 rounded-full bg-sunken border border-line inline-flex items-center justify-center">
            <ArrowSwap size={13} />
          </div>
        </div>
        <SwapSide who={partnerFirst} listing={theirOffer} />
      </div>

      {/* CTA footer */}
      <div className="border-t border-line/70 px-4 py-2.5 flex items-center justify-between gap-2 bg-sunken/50">
        {!contract && (
          <>
            <div className="text-[11px] text-ink2">No terms yet — propose what you&apos;d like to trade.</div>
            <button
              onClick={onProposeTerms}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[12px] font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <Plus size={12} /> Propose terms
            </button>
          </>
        )}

        {contract?.status === "PENDING" && isProvider && (
          <>
            {contract.scheduledStart && (
              <div className="text-[11px] text-ink2 flex items-center gap-1.5">
                <Calendar size={11} className="text-ink3" />
                {new Date(contract.scheduledStart).toLocaleDateString("en-GB", {
                  weekday: "short", day: "numeric", month: "short",
                })}
              </div>
            )}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={onProposeTerms}
                disabled={actionLoading}
                className="inline-flex h-8 items-center rounded-lg border border-line bg-surface px-3 text-[12px] font-medium text-ink hover:bg-sunken disabled:opacity-60 transition-colors"
              >
                Counter
              </button>
              <button
                onClick={onAccept}
                disabled={actionLoading}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[12px] font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
              >
                <Check size={12} /> Accept &amp; sign
              </button>
            </div>
          </>
        )}

        {contract?.status === "PENDING" && isRequester && (
          <>
            <div className="text-[11px] text-ink2">Awaiting {partnerFirst}&apos;s response.</div>
            <button
              onClick={onCancel}
              disabled={actionLoading}
              className="inline-flex h-8 items-center rounded-lg border border-line bg-surface px-3 text-[12px] font-medium text-ink2 hover:bg-sunken disabled:opacity-60 transition-colors"
            >
              Withdraw
            </button>
          </>
        )}

        {(contract?.status === "ACCEPTED" || contract?.status === "IN_PROGRESS") && (
          <>
            <div className="text-[11px] text-ink2 flex items-center gap-1.5">
              <Calendar size={11} className="text-emerald-600" />
              {contract.scheduledStart
                ? new Date(contract.scheduledStart).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                : "Swap underway"}
            </div>
            <div className="flex items-center gap-1.5">
              {myConfirmed ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-ink2">
                  <Check size={11} className="text-amber-500" />
                  Waiting for {partnerFirst}
                </span>
              ) : (
                <button
                  onClick={onComplete}
                  disabled={actionLoading}
                  className={cx(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold transition-colors disabled:opacity-60",
                    theirConfirmed
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                  )}
                >
                  <Check size={12} />
                  {theirConfirmed ? `${partnerFirst} confirmed — mark complete` : "Mark complete"}
                </button>
              )}
            </div>
          </>
        )}

        {contract?.status === "COMPLETED" && (
          <>
            <div className="min-w-0 text-[11px] text-ink2 inline-flex items-center gap-1.5">
              {hasReviewed && peerReviewed ? (
                <>
                  <Check size={11} className="flex-shrink-0 text-emerald-600" /> Completed — reviews published
                </>
              ) : hasReviewed ? (
                <>
                  <Check size={11} className="flex-shrink-0 text-amber-500" /> Review sent — hidden until {partnerFirst} reviews you
                </>
              ) : peerReviewed ? (
                <>
                  <Star size={11} className="flex-shrink-0 text-amber-500" /> {partnerFirst} reviewed you — review back to reveal it
                </>
              ) : (
                <>
                  <Check size={11} className="flex-shrink-0 text-emerald-600" /> Completed — reviews publish once both submit
                </>
              )}
            </div>
            <button
              onClick={onLeaveReview}
              disabled={hasReviewed || actionLoading}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[12px] font-semibold text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              <Star size={12} /> {hasReviewed ? "Review submitted" : "Leave a review"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
