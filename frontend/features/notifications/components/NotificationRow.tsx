"use client";

import { Avatar } from "@/features/profile/components/Avatar";
import { Chev } from "@/components/ui/Icons";
import { cx, resolveAvatarSrc, timeAgo } from "@/lib/utils";
import type { AppNotification, NotificationType } from "../types";

// Visuals follow the Ui-Concept NotificationsScreen: contract events get the
// warn (amber) badge, reviews the verified (emerald) badge, the rest neutral.
const BADGE_TONES = {
  neutral: "bg-sunken text-ink3",
  warn: "bg-amber-100 text-amber-800",
  verified: "bg-emerald-100 text-emerald-800",
} as const;

const COPY: Record<
  NotificationType,
  { verb: string; withTitle: boolean; kind: string; tone: keyof typeof BADGE_TONES }
> = {
  NEW_MESSAGE: { verb: "sent you a message", withTitle: false, kind: "message", tone: "neutral" },
  SWAP_REQUEST: { verb: "sent you a swap request for", withTitle: true, kind: "contract", tone: "warn" },
  CONTRACT_ACCEPTED: { verb: "accepted your swap request for", withTitle: true, kind: "contract", tone: "warn" },
  CONTRACT_DECLINED: { verb: "declined your swap request for", withTitle: true, kind: "contract", tone: "warn" },
  CONTRACT_CANCELLED: { verb: "cancelled the exchange for", withTitle: true, kind: "contract", tone: "warn" },
  CONTRACT_COMPLETED: { verb: "marked the exchange complete for", withTitle: true, kind: "contract", tone: "warn" },
  SCHEDULE_CONFIRMED: { verb: "confirmed a time slot", withTitle: false, kind: "schedule", tone: "neutral" },
  REVIEW_RECEIVED: { verb: "left you a review — review back to reveal it", withTitle: false, kind: "review", tone: "verified" },
  LISTING_SAVED: { verb: "saved", withTitle: true, kind: "save", tone: "neutral" },
};

/** Maps a notification type to its filter-tab kind (message/contract/review). */
export function notificationKind(type: NotificationType): string {
  return COPY[type].kind;
}

export function NotificationRow({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: (notification: AppNotification) => void;
}) {
  const copy = COPY[notification.type];
  const actorName = notification.actor?.name ?? "Someone";
  const listingTitle = copy.withTitle ? notification.data?.listingTitle : undefined;
  const isUnread = !notification.readAt;

  // LISTING_SAVED stacks multiple savers into one row: "Ana and 2 others saved <listing>".
  const saveCount = notification.data?.count ?? 1;
  const verb =
    notification.type === "LISTING_SAVED" && saveCount > 1
      ? `and ${saveCount - 1} other${saveCount - 1 === 1 ? "" : "s"} saved`
      : copy.verb;

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      className="group flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-sunken"
    >
      <div className="relative flex-shrink-0">
        <Avatar
          src={resolveAvatarSrc({ avatarUrl: notification.actor?.avatarUrl ?? null }, null)}
          name={actorName}
          size="sm"
        />
        {isUnread && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-brand-600 ring-2 ring-surface" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm leading-snug text-ink2">
          <span className="font-semibold text-ink">{actorName}</span> {verb}
          {listingTitle && (
            <>
              {" "}
              <span className="font-medium text-ink">{listingTitle}</span>
            </>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="font-mono text-[11px] text-ink3">{timeAgo(notification.createdAt)}</span>
          <span
            className={cx(
              "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              BADGE_TONES[copy.tone],
            )}
          >
            {copy.kind}
          </span>
        </div>
      </div>

      <Chev size={14} className="mt-2 flex-shrink-0 text-ink3 group-hover:text-ink" />
    </button>
  );
}
