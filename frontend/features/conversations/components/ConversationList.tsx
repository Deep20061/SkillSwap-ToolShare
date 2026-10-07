"use client";

import { useState } from "react";
import Image from "next/image";
import { cx, timeAgo, getSwatch, resolveAvatarSrc } from "@/lib/utils";
import { Search, Edit, Check } from "@/components/ui/Icons";
import { Avatar } from "@/features/profile/components/Avatar";
import { apiUrl } from "@/lib/api";
import { DEAL_STEPS, dealStepIdx, listingKind } from "../lib/dealSteps";
import type { Conversation, ContractStatus } from "../types";

interface Props {
  conversations: Conversation[];
  isLoading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
}

function DealMiniStep({ contractStatus }: { contractStatus: ContractStatus | null }) {
  if (contractStatus === "CANCELLED" || contractStatus === "DECLINED") {
    return <span className="text-[10px] font-mono text-rose-600">Cancelled</span>;
  }
  if (contractStatus === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700">
        <Check size={10} /> Completed
      </span>
    );
  }
  const idx = dealStepIdx(contractStatus);
  return (
    <div className="flex items-center gap-[3px]">
      {DEAL_STEPS.map((label, i) => (
        <span
          key={label}
          className={cx("h-[3px] w-4 rounded-full transition-colors", i <= idx ? "bg-brand-600" : "bg-line")}
        />
      ))}
      <span className="ml-1.5 text-[10px] font-mono text-ink3">{DEAL_STEPS[idx]}</span>
    </div>
  );
}

function ConvoListItem({
  conv,
  isActive,
  onSelect,
}: {
  conv: Conversation;
  isActive: boolean;
  onSelect: () => void;
}) {
  const u = conv.otherUser;
  const listing = conv.listing;
  const last = conv.lastMessage;
  const avatarSrc = resolveAvatarSrc(u?.profile, u?.image);
  const swatch = listing ? getSwatch(listing.id) : null;
  const firstName = u?.name?.split(" ")[0] ?? "Unknown";
  const isSkill = listing?.type === "SKILL_OFFER";

  const lastText = last
    ? (last.hasAttachment ? "Sent an attachment" : last.content || "…")
    : "Start the conversation";

  return (
    <li>
      <button
        onClick={onSelect}
        className={cx(
          "w-full text-left px-4 py-3 flex gap-3 border-l-2 transition-colors",
          isActive
            ? "bg-brand-50/70 border-l-brand-600"
            : "border-l-transparent hover:bg-sunken",
        )}
      >
        {/* Listing thumbnail + user avatar overlay */}
        <div className="relative flex-shrink-0 mt-0.5">
          {listing ? (
            listing.coverImage ? (
              <Image
                src={`${apiUrl}${listing.coverImage}`}
                alt={listing.title}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover border border-line"
                unoptimized
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg ${swatch?.block ?? "bg-line2"}`} />
            )
          ) : (
            <div className="w-12 h-12 rounded-lg bg-line2 flex items-center justify-center">
              <Avatar src={avatarSrc} name={u?.name ?? "?"} size="sm" />
            </div>
          )}

          {/* User avatar: bottom-right overlay */}
          {u && (
            <div className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-surface">
              <Avatar src={avatarSrc} name={u.name} size="xs" />
            </div>
          )}

          {/* Unread badge: top-left */}
          {conv.unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 min-w-[16px] h-[16px] px-1 rounded-full bg-brand-600 text-white text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-surface leading-none">
              {conv.unreadCount}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={cx(
              "truncate text-[12.5px] flex items-center gap-1",
              conv.unreadCount > 0 ? "font-bold text-ink" : "font-semibold text-ink",
            )}>
              {listing && (
                <span className={cx(
                  "text-[9.5px] font-mono uppercase tracking-wider px-1 py-px rounded flex-shrink-0",
                  isSkill ? "text-violet-700 bg-violet-50" : "text-amber-800 bg-amber-50",
                )}>
                  {listingKind(listing.type)}
                </span>
              )}
              <span className="truncate">{listing?.title ?? u?.name ?? "Unknown"}</span>
            </span>
            <span className="text-[10.5px] text-ink3 flex-shrink-0 font-mono">
              {timeAgo(last?.createdAt ?? conv.updatedAt)}
            </span>
          </div>

          {/* Subtitle */}
          <div className="text-[10.5px] text-ink3 truncate mb-0.5">
            with <span className="text-ink2 font-medium">{firstName}</span>
          </div>

          {/* Last message */}
          <div className={cx("text-[11.5px] truncate", conv.unreadCount > 0 ? "text-ink2" : "text-ink3")}>
            {last && u && last.senderId !== u.id && (
              <span className="text-ink3">You: </span>
            )}
            {lastText}
          </div>

          {/* Deal progress */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <DealMiniStep contractStatus={conv.contractStatus} />
          </div>
        </div>
      </button>
    </li>
  );
}

function ConvoGroup({
  label,
  conversations,
  activeId,
  onSelect,
  accent,
  dim,
}: {
  label: string;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  accent?: boolean;
  dim?: boolean;
}) {
  if (conversations.length === 0) return null;
  return (
    <div className="border-b border-line/70">
      <div className={cx("px-4 pt-3 pb-1.5 flex items-center justify-between", dim && "opacity-80")}>
        <div className="flex items-center gap-1.5">
          <span className={cx(
            "text-[10px] font-mono uppercase tracking-[0.18em]",
            accent ? "text-brand-700" : "text-ink3",
          )}>
            {label}
          </span>
          <span className={cx("text-[10px] font-mono", accent ? "text-brand-700" : "text-ink3")}>
            · {conversations.length}
          </span>
        </div>
      </div>
      <ul>
        {conversations.map((conv) => (
          <ConvoListItem
            key={conv.id}
            conv={conv}
            isActive={conv.id === activeId}
            onSelect={() => onSelect(conv.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function groupConversations(conversations: Conversation[]) {
  const needs: Conversation[] = [];
  const active: Conversation[] = [];
  const wrap: Conversation[] = [];
  const past: Conversation[] = [];

  for (const c of conversations) {
    const s = c.contractStatus;
    if (s === "CANCELLED" || s === "DECLINED") {
      past.push(c);
    } else if (s === "COMPLETED") {
      wrap.push(c);
    } else if (s === "ACCEPTED" || s === "IN_PROGRESS") {
      active.push(c);
    } else if (c.unreadCount > 0 || s === "PENDING") {
      needs.push(c);
    } else {
      active.push(c);
    }
  }

  return { needs, active, wrap, past };
}

export function ConversationList({ conversations, isLoading, activeId, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? conversations.filter((c) => {
        const q = search.toLowerCase();
        return (
          c.listing?.title.toLowerCase().includes(q) ||
          c.otherUser?.name.toLowerCase().includes(q)
        );
      })
    : conversations;

  const groups = groupConversations(filtered);

  return (
    <aside className="flex h-full flex-col border-r border-line overflow-y-auto bg-surface">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur px-4 pt-4 pb-3 border-b border-line">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[18px] font-bold tracking-tight text-ink leading-none">Swaps</h1>
            <div className="text-[11px] text-ink3 mt-1">
              {conversations.length} listing{conversations.length !== 1 ? "s" : ""} under discussion
            </div>
          </div>
          <button className="h-8 w-8 rounded-lg border border-line text-ink2 hover:bg-sunken hover:text-ink inline-flex items-center justify-center">
            <Edit size={14} />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink3"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings, people…"
            className="h-9 w-full rounded-lg border border-line2 bg-surface pl-8 pr-3 text-[12.5px] text-ink placeholder-ink3 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {/* Grouped list */}
      <div className="flex-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-start gap-3 border-b border-line/60 px-4 py-3">
              <div className="h-12 w-12 shrink-0 rounded-lg bg-line2" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3 w-36 rounded bg-line2" />
                <div className="h-2.5 w-20 rounded bg-line2" />
                <div className="h-2.5 w-44 rounded bg-line2" />
              </div>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-ink3">
            {search ? "No results" : "No conversations yet"}
          </div>
        ) : (
          <>
            <ConvoGroup
              label="Needs your reply"
              conversations={groups.needs}
              activeId={activeId}
              onSelect={onSelect}
              accent
            />
            <ConvoGroup
              label="Active swaps"
              conversations={groups.active}
              activeId={activeId}
              onSelect={onSelect}
            />
            <ConvoGroup
              label="Wrapping up"
              conversations={groups.wrap}
              activeId={activeId}
              onSelect={onSelect}
            />
            <ConvoGroup
              label="Past"
              conversations={groups.past}
              activeId={activeId}
              onSelect={onSelect}
              dim
            />
          </>
        )}
      </div>
    </aside>
  );
}
