"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { cx, resolveAvatarSrc, getSwatch } from "@/lib/utils";
import { Avatar } from "@/features/profile/components/Avatar";
import { apiUrl } from "@/lib/api";
import { Paperclip, Check, Doc, Lock, Shield, Calendar, ArrowSwap, ArrowR, Pin, MapIcon } from "@/components/ui/Icons";
import { DealCard } from "./DealCard";
import type { ConversationMessage, ConversationUser, SerializedContract, ContractStatus, ScheduleProposalData } from "../types";

const SinglePinMap = dynamic(
  () => import("@/features/listings/components/map/SinglePinMap").then((m) => m.SinglePinMap),
  { ssr: false },
);

interface TypingUser {
  userId: string;
  name: string;
}

interface Props {
  messages: ConversationMessage[];
  isLoading: boolean;
  hasMore: boolean;
  currentUserId: string;
  otherUser: ConversationUser | null;
  bottomRef: React.MutableRefObject<HTMLDivElement | null>;
  typingUser?: TypingUser | null;
  contract?: SerializedContract | null;
  contextListing: { id: string; title: string; type: string; coverImage: string | null } | null;
  partnerName: string | null;
  onContractAction?: (action: "accept" | "decline") => void;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onProposeTerms: () => void;
  onLeaveReview: () => void;
  hasReviewed: boolean;
  onCounter?: () => void;
  actionLoading: boolean;
  onLoadMore: () => void;
  onSendMessage?: (content: string) => void;
  conversationId?: string;
  onConfirmScheduleSlot?: (messageId: string, slotIndex: number) => Promise<void>;
  otherUserLastReadAt?: string | null;
}


function ContractRow({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sunken text-ink3">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10px] uppercase leading-tight tracking-wider text-ink3">{k}</div>
        <div className="text-[12.5px] leading-snug text-ink">{v}</div>
      </div>
    </div>
  );
}

function ContractCard({
  contractId,
  currentUserId,
  contract,
  partnerName,
  onAction,
  onCounter,
}: {
  contractId: string;
  currentUserId: string;
  contract: SerializedContract | null | undefined;
  partnerName: string | null;
  onAction?: (action: "accept" | "decline") => void;
  onCounter?: () => void;
}) {
  const isMatch = contract !== undefined && contract?.id === contractId;
  const isPast = contract !== undefined && !isMatch;
  const c = isMatch ? contract : null;

  const isProvider = c?.providerId === currentUserId;
  const canAct = isProvider && c?.status === "PENDING";
  const partnerFirst = partnerName?.split(" ")[0] ?? "them";

  const STATUS_BADGE: Partial<Record<ContractStatus, string>> = {
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    IN_PROGRESS: "bg-brand-50 text-brand-700 border-brand-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-300",
    DECLINED: "bg-rose-50 text-rose-600 border-rose-200",
    CANCELLED: "bg-sunken text-ink3 border-line",
    DISPUTED: "bg-orange-50 text-orange-600 border-orange-200",
  };
  const STATUS_LABEL: Partial<Record<ContractStatus, string>> = {
    PENDING: "Proposed",
    ACCEPTED: "Accepted",
    IN_PROGRESS: "In progress",
    COMPLETED: "Completed",
    DECLINED: "Declined",
    CANCELLED: "Cancelled",
    DISPUTED: "Disputed",
  };

  if (isPast) {
    return (
      <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-line bg-surface opacity-60 shadow-sm">
        <div className="flex items-center justify-between border-b border-brand-200 bg-gradient-to-b from-brand-50 to-brand-50/30 px-4 py-2.5">
          <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand-700">
            <Doc size={12} /> Exchange contract
          </span>
          <span className="inline-flex items-center rounded-md border border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium text-ink3">
            Earlier proposal
          </span>
        </div>
        <div className="px-4 py-3 text-[11px] text-ink3">This proposal was superseded by a newer one.</div>
      </div>
    );
  }

  const whenLine = c?.scheduledStart
    ? new Date(c.scheduledStart).toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long",
      }) + (c.scheduledEnd
        ? ` · ${new Date(c.scheduledStart).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} – ${new Date(c.scheduledEnd).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
        : "")
    : null;

  return (
    <div className="w-full max-w-[380px] overflow-hidden rounded-2xl border border-brand-300 bg-surface shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-200 bg-gradient-to-b from-brand-50 to-brand-50/30 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-brand-700">
          <Doc size={12} /> Exchange contract
        </span>
        {c ? (
          <span className={cx(
            "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
            STATUS_BADGE[c.status] ?? "bg-sunken text-ink3 border-line",
          )}>
            {STATUS_LABEL[c.status] ?? c.status}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md border border-line bg-sunken px-1.5 py-0.5 text-[10px] font-medium text-ink3">
            Loading…
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {c ? (
          <>
            {/* Listing links — clickable shortcuts to listing pages */}
            <div className="mb-3 grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
              <Link
                href={`/listings/${c.listing.id}`}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-sunken px-2.5 py-1.5 transition-colors hover:border-brand-200 hover:bg-brand-50"
              >
                {c.listing.coverImage ? (
                  <Image src={`${apiUrl}${c.listing.coverImage}`} alt={c.listing.title} width={20} height={20} className="h-5 w-5 shrink-0 rounded object-cover" unoptimized />
                ) : (() => { const sw = getSwatch(c.listing.id); return sw ? <div className={`h-5 w-5 shrink-0 rounded ${sw.block}`} /> : null; })()}
                <span className="truncate text-[11.5px] font-medium text-ink">{c.listing.title}</span>
                <ArrowR size={9} className="ml-auto shrink-0 text-ink3" />
              </Link>
              <div className="flex shrink-0 items-center justify-center text-ink3">
                <ArrowSwap size={12} />
              </div>
              {c.counterListing ? (
                <Link
                  href={`/listings/${c.counterListing.id}`}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-sunken px-2.5 py-1.5 transition-colors hover:border-brand-200 hover:bg-brand-50"
                >
                  {c.counterListing.coverImage ? (
                    <Image src={`${apiUrl}${c.counterListing.coverImage}`} alt={c.counterListing.title} width={20} height={20} className="h-5 w-5 shrink-0 rounded object-cover" unoptimized />
                  ) : (() => { const sw = getSwatch(c.counterListing.id); return sw ? <div className={`h-5 w-5 shrink-0 rounded ${sw.block}`} /> : null; })()}
                  <span className="truncate text-[11.5px] font-medium text-ink">{c.counterListing.title}</span>
                  <ArrowR size={9} className="ml-auto shrink-0 text-ink3" />
                </Link>
              ) : (
                <div className="flex min-w-0 flex-1 items-center rounded-lg border border-dashed border-line px-2.5 py-1.5">
                  <span className="text-[11px] italic text-ink3">No counter listing</span>
                </div>
              )}
            </div>

            <dl className="space-y-2 border-t border-line pt-3 text-[12.5px]">
              {whenLine && <ContractRow icon={<Calendar size={12} />} k="When" v={whenLine} />}
              <ContractRow icon={<Lock size={12} />} k="Deposit" v="None — both verified" />
            </dl>

            {canAct && onAction && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAction("accept")}
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-brand-600 text-[12px] font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  <Check size={13} /> Accept &amp; sign
                </button>
                <button
                  onClick={onCounter}
                  className="inline-flex h-8 items-center justify-center rounded-lg border border-line bg-surface text-[12px] font-medium text-ink transition-colors hover:bg-sunken"
                >
                  Counter
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] text-ink3">
              <Shield size={10} className="text-emerald-600" />
              {c.status === "PENDING" && !canAct && `Signed by you · awaiting ${partnerFirst}`}
              {c.status === "PENDING" && canAct && `Signed by ${partnerFirst} · awaiting you`}
              {c.status === "ACCEPTED" && "Accepted & signed by both parties"}
              {c.status === "IN_PROGRESS" && "In progress"}
              {c.status === "COMPLETED" && "Swap completed"}
              {(c.status === "DECLINED" || c.status === "CANCELLED") && "Proposal closed"}
            </div>
          </>
        ) : (
          <div className="h-20 animate-pulse rounded-lg bg-line2" />
        )}
      </div>
    </div>
  );
}

function LocationCard({ content }: { content: string }) {
  let loc: { name?: string; addr?: string; lat?: number; lng?: number; distance?: string } = {};
  try {
    loc = JSON.parse(content.slice("__LOCATION__:".length));
  } catch {
    return null;
  }

  const mapsUrl = loc.lat != null && loc.lng != null
    ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}`
    : null;
  const directionsUrl = loc.lat != null && loc.lng != null
    ? `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`
    : null;

  return (
    <div className="w-[300px] max-w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      {/* Map */}
      <div className="relative h-36 border-b border-line overflow-hidden">
        {loc.lat != null && loc.lng != null ? (
          <SinglePinMap lat={loc.lat} lng={loc.lng} showRadius={false} />
        ) : (
          <div className="flex h-full items-center justify-center bg-sunken text-ink3 text-xs">
            No coordinates
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-3.5">
        <div className="mb-1.5 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink3">
          <Pin size={11} /> Meeting point
        </div>
        {loc.name && <div className="text-[13.5px] font-semibold text-ink">{loc.name}</div>}
        {loc.addr && <div className="mt-0.5 text-[12px] text-ink2">{loc.addr}</div>}
        {loc.distance && <div className="mt-1 font-mono text-[11px] text-ink3">{loc.distance}</div>}
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface text-[12px] font-medium text-ink transition-colors hover:bg-sunken"
            >
              <MapIcon size={12} /> Open in map
            </a>
          ) : (
            <button disabled className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface text-[12px] font-medium text-ink3">
              <MapIcon size={12} /> Open in map
            </button>
          )}
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center justify-center rounded-lg text-[12px] font-medium text-ink2 transition-colors hover:bg-sunken hover:text-ink"
            >
              Get directions
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function TimeProposalCard({
  messageId,
  mine,
  proposal,
  onConfirm,
}: {
  messageId: string;
  mine: boolean;
  proposal: ScheduleProposalData;
  onConfirm: (messageId: string, slotIndex: number) => Promise<void>;
}) {
  const [chosen, setChosen] = useState<number | null>(
    proposal.confirmedSlot ?? null,
  );
  const [confirming, setConfirming] = useState(false);
  const isConfirmed = proposal.confirmedSlot !== null;

  async function handleConfirm() {
    if (chosen === null) return;
    setConfirming(true);
    try {
      await onConfirm(messageId, chosen);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="w-[340px] max-w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-line bg-sunken px-3.5 py-2">
        <div className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink3">
          <Calendar size={11} /> Proposed times
        </div>
        {isConfirmed && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700">
            <Check size={10} /> Confirmed
          </span>
        )}
      </div>
      <div className="space-y-1.5 p-2">
        {proposal.slots.map((slot, i) => {
          const isChosen = chosen === i;
          const isConfirmedSlot = proposal.confirmedSlot === i;
          return (
            <button
              key={i}
              onClick={() => !isConfirmed && setChosen(i)}
              disabled={isConfirmed}
              className={cx(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all",
                isConfirmedSlot
                  ? "border-emerald-400 bg-emerald-50/70 ring-1 ring-emerald-300"
                  : isChosen
                  ? "border-brand-400 bg-brand-50/70 ring-1 ring-brand-300"
                  : "border-line hover:border-line2 hover:bg-sunken disabled:cursor-default",
              )}
            >
              <div className={cx(
                "flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg",
                isConfirmedSlot ? "bg-emerald-600 text-white"
                  : isChosen ? "bg-brand-600 text-white"
                  : "border border-line bg-sunken text-ink2",
              )}>
                <span className="font-mono text-[9px] uppercase">{slot.day}</span>
                <span className="text-[13px] font-bold leading-none">{slot.date.split(" ")[0]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-ink">{slot.day} {slot.date}</div>
                <div className="text-[11px] text-ink3">{slot.time} · {slot.dur}</div>
              </div>
              {isConfirmedSlot && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700">
                  <Check size={11} /> CONFIRMED
                </span>
              )}
              {!isConfirmedSlot && isChosen && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-brand-700">
                  <Check size={11} /> PICKED
                </span>
              )}
            </button>
          );
        })}
      </div>
      {!mine && !isConfirmed && (
        <div className="grid grid-cols-2 gap-1.5 px-3 pb-3 pt-1">
          <button
            disabled={chosen === null || confirming}
            onClick={handleConfirm}
            className={cx(
              "inline-flex h-8 items-center justify-center gap-1 rounded-lg text-[12px] font-semibold transition-colors",
              chosen !== null && !confirming
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : "cursor-not-allowed bg-line text-ink3",
            )}
          >
            {confirming ? "Confirming…" : <><Check size={12} /> Confirm time</>}
          </button>
          <button className="inline-flex h-8 items-center justify-center rounded-lg border border-line bg-surface text-[12px] font-medium text-ink transition-colors hover:bg-sunken">
            Suggest another
          </button>
        </div>
      )}
    </div>
  );
}

function groupByDate(
  messages: ConversationMessage[],
): Array<{ label: string; messages: ConversationMessage[] }> {
  const groups: Array<{ label: string; messages: ConversationMessage[] }> = [];
  let currentLabel = "";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  for (const msg of messages) {
    const d = new Date(msg.createdAt);
    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }

    if (label !== currentLabel) {
      groups.push({ label, messages: [msg] });
      currentLabel = label;
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MessageThread({
  messages,
  isLoading,
  hasMore,
  currentUserId,
  otherUser,
  bottomRef,
  typingUser,
  contract,
  contextListing,
  partnerName,
  onContractAction,
  onAccept,
  onDecline,
  onCancel,
  onComplete,
  onProposeTerms,
  onLeaveReview,
  hasReviewed,
  actionLoading,
  onLoadMore,
  onSendMessage,
  onCounter,
  onConfirmScheduleSlot,
  otherUserLastReadAt,
}: Props) {
  const avatarSrc = resolveAvatarSrc(otherUser?.profile, otherUser?.image);

  const initialScrollDone = useRef(false);
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !initialScrollDone.current) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
      initialScrollDone.current = true;
    }
  }, [isLoading, messages.length, bottomRef]);

  useEffect(() => {
    initialScrollDone.current = false;
  }, [otherUser?.id]);

  // ID of the last outgoing message the other user has read.
  // Must be declared before any early return to satisfy the Rules of Hooks.
  const seenMessageId = useMemo(() => {
    if (!otherUserLastReadAt) return null;
    const seenDate = new Date(otherUserLastReadAt);
    let last: string | null = null;
    for (const msg of messages) {
      if (msg.senderId === currentUserId && new Date(msg.createdAt) <= seenDate) {
        last = msg.id;
      }
    }
    return last;
  }, [messages, currentUserId, otherUserLastReadAt]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <DealCard
          contract={undefined}
          currentUserId={currentUserId}
          contextListing={contextListing}
          partnerName={partnerName}
          onAccept={onAccept}
          onDecline={onDecline}
          onCancel={onCancel}
          onComplete={onComplete}
          onProposeTerms={onProposeTerms}
          onLeaveReview={onLeaveReview}
          hasReviewed={hasReviewed}
          actionLoading={actionLoading}
        />
        <div className="flex flex-1 items-center justify-center bg-sunken/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  const groups = groupByDate(messages);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
    <DealCard
      contract={contract}
      currentUserId={currentUserId}
      contextListing={contextListing}
      partnerName={partnerName}
      onAccept={onAccept}
      onDecline={onDecline}
      onCancel={onCancel}
      onComplete={onComplete}
      onProposeTerms={onProposeTerms}
      onLeaveReview={onLeaveReview}
      hasReviewed={hasReviewed}
      actionLoading={actionLoading}
    />
    <div className="flex-1 overflow-y-auto bg-sunken/40 px-4 py-4 space-y-2.5">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-line bg-sunken">
            <Avatar src={avatarSrc} name={otherUser?.name ?? "?"} size="md" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              {otherUser?.name ?? "Unknown"}
            </p>
            <p className="mt-1 text-sm text-ink2">
              Start the conversation — say hello!
            </p>
          </div>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onLoadMore}
            className="rounded-full border border-line bg-surface px-4 py-1.5 text-[12px] font-medium text-ink2 transition-colors hover:bg-sunken hover:text-ink"
          >
            Load earlier messages
          </button>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.label} className="space-y-2.5">
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 border-t border-line" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink3">
              {group.label}
            </span>
            <div className="flex-1 border-t border-line" />
          </div>

          {group.messages.map((msg, i) => {
            const mine = msg.senderId === currentUserId;
            const prev = group.messages[i - 1];
            const isFirstInRun = !prev || prev.senderId !== msg.senderId;

            // Contract proposal card — centered
            if (msg.type === "CONTRACT_PROPOSAL" && msg.contractId) {
              return (
                <div key={msg.id} className="flex flex-col items-center gap-1 py-1">
                  <ContractCard
                    contractId={msg.contractId}
                    currentUserId={currentUserId}
                    contract={contract}
                    partnerName={partnerName}
                    onAction={onContractAction}
                    onCounter={onCounter}
                  />
                  <span className="font-mono text-[9.5px] text-ink3">{formatTime(msg.createdAt)}</span>
                </div>
              );
            }

            // Location card
            if (msg.content?.startsWith("__LOCATION__:")) {
              return (
                <div
                  key={msg.id}
                  className={cx(
                    "flex items-end gap-1.5",
                    mine && "flex-row-reverse",
                    isFirstInRun && i > 0 ? "mt-3" : "",
                  )}
                >
                  {!mine && (
                    <div className="w-[22px] shrink-0">
                      {isFirstInRun && <Avatar src={avatarSrc} name={otherUser?.name ?? "?"} size="xs" />}
                    </div>
                  )}
                  <div className={cx("flex max-w-[78%] flex-col", mine && "items-end")}>
                    <LocationCard content={msg.content} />
                    <div className="mt-0.5 px-1 font-mono text-[9.5px] text-ink3">{formatTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            }

            // Schedule proposal card
            if (msg.type === "SCHEDULE_PROPOSAL" && msg.scheduleProposal) {
              return (
                <div
                  key={msg.id}
                  className={cx(
                    "flex items-end gap-1.5",
                    mine && "flex-row-reverse",
                    isFirstInRun && i > 0 ? "mt-3" : "",
                  )}
                >
                  {!mine && (
                    <div className="w-[22px] shrink-0">
                      {isFirstInRun && <Avatar src={avatarSrc} name={otherUser?.name ?? "?"} size="xs" />}
                    </div>
                  )}
                  <div className={cx("flex max-w-[78%] flex-col", mine && "items-end")}>
                    <TimeProposalCard
                      messageId={msg.id}
                      mine={mine}
                      proposal={msg.scheduleProposal}
                      onConfirm={onConfirmScheduleSlot ?? (async () => {})}
                    />
                    <div className="mt-0.5 px-1 font-mono text-[9.5px] text-ink3">{formatTime(msg.createdAt)}</div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={cx(
                  "flex items-end gap-1.5",
                  mine && "flex-row-reverse",
                  isFirstInRun && i > 0 ? "mt-3" : "",
                )}
              >
                {!mine && (
                  <div className="w-[22px] shrink-0">
                    {isFirstInRun && (
                      <Avatar src={avatarSrc} name={otherUser?.name ?? "?"} size="xs" />
                    )}
                  </div>
                )}

                <div className={cx("flex max-w-[78%] flex-col", mine && "items-end")}>
                  {msg.content && (
                    <div
                      className={cx(
                        "px-3 py-1.5 text-sm leading-snug",
                        mine
                          ? "rounded-2xl rounded-br-md bg-brand-600 text-white"
                          : "rounded-2xl rounded-bl-md border border-line bg-surface text-ink",
                      )}
                    >
                      {msg.content}
                    </div>
                  )}

                  {msg.attachments?.length > 0 && (
                    <div className={cx("mt-1 flex flex-col gap-1", mine && "items-end")}>
                      {msg.attachments.map((att) => {
                        if (att.mimeType.startsWith("image/")) {
                          return (
                            <a key={att.id} href={`${apiUrl}${att.path}`} target="_blank" rel="noopener noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`${apiUrl}${att.path}`}
                                alt={att.fileName}
                                className="max-w-[220px] rounded-xl border border-line object-cover"
                              />
                            </a>
                          );
                        }
                        return (
                          <a
                            key={att.id}
                            href={`${apiUrl}${att.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cx(
                              "flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors",
                              mine
                                ? "border-brand-500 bg-brand-700 hover:bg-brand-800"
                                : "border-line bg-surface hover:bg-sunken",
                            )}
                          >
                            <Paperclip size={12} className={cx("shrink-0", mine ? "text-white/70" : "text-ink3")} />
                            <div>
                              <div className={cx("text-[11.5px] font-medium", mine ? "text-white" : "text-ink")}>{att.fileName}</div>
                              <div className={cx("text-[10px]", mine ? "text-white/60" : "text-ink3")}>{formatBytes(att.sizeBytes)}</div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-0.5 px-1 font-mono text-[9.5px] text-ink3">
                    {formatTime(msg.createdAt)}
                    {mine && msg.id === seenMessageId && (
                      <span className="ml-1.5 text-brand-500">Seen</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {typingUser && (
        <div className="flex items-end gap-1.5">
          <div className="w-[22px] shrink-0">
            <Avatar src={avatarSrc} name={typingUser.name} size="xs" />
          </div>
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-line bg-surface px-3 py-2">
            <span className="flex items-center gap-0.5">
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-ink3" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-ink3" style={{ animationDelay: "500ms" }} />
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-ink3" style={{ animationDelay: "1000ms" }} />
            </span>
            <span className="text-[11px] text-ink3">{typingUser.name} is typing</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
    </div>
  );
}
