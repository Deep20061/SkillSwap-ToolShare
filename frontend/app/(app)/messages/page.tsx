"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api, apiUrl, apiErrorMessage } from "@/lib/api";
import { useSession } from "@/features/auth/hooks/useSession";
import { Avatar } from "@/features/profile/components/Avatar";
import { Shield, Dots, Msg, ArrowL, Calendar, Phone, StarFill } from "@/components/ui/Icons";
import { getSwatch, cx, resolveAvatarSrc } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useConversations } from "@/features/conversations/hooks/useConversations";
import { useConversation } from "@/features/conversations/hooks/useConversation";
import { useConversationActions } from "@/features/conversations/hooks/useConversationActions";
import { useSSE } from "@/features/conversations/hooks/useSSE";
import { DEAL_STEPS, dealStep, listingKind } from "@/features/conversations/lib/dealSteps";
import { ConversationList } from "@/features/conversations/components/ConversationList";
import { MessageThread } from "@/features/conversations/components/MessageThread";
import { MessageInput } from "@/features/conversations/components/MessageInput";
import { ProposeModal, CancelModal } from "@/features/conversations/components/ProposeModal";
import { ReviewModal } from "@/features/reviews/components/ReviewModal";
import type { Conversation, ConversationMessage } from "@/features/conversations/types";

interface TypingUser {
  userId: string;
  name: string;
}

export default function MessagesPage() {
  const { user, isLoading: sessionLoading } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [isStarting, setIsStarting] = useState(false);
  const [typingUser, setTypingUser] = useState<TypingUser | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [otherUserLastReadAt, setOtherUserLastReadAt] = useState<string | null>(null);

  // URL context — present only on first entry from a listing page
  const newRecipientId = searchParams.get("new");
  const urlListingId = searchParams.get("listing");
  const openConvId = searchParams.get("open");

  const {
    conversations,
    isLoading: convLoading,
    refresh: refreshConversations,
    updateLastMessage,
    updateContractStatus,
    incrementUnread,
    clearUnread,
  } = useConversations();

  const {
    messages,
    isLoading: msgLoading,
    isSending,
    hasMore,
    bottomRef,
    send,
    sendTyping,
    appendMessage,
    updateMessage,
    loadMore,
  } = useConversation(activeConvId);

  const {
    activeContract,
    setActiveContract,
    actionLoading,
    showProposeModal,
    setShowProposeModal,
    showCancelModal,
    setShowCancelModal,
    reviewModal,
    setReviewModal,
    handleContractAction,
    handleCancel,
  } = useConversationActions(activeConvId);

  // Auto-start conversation from ?new= param.
  // Uses a ref to track which recipientId was handled so the effect is idempotent
  // across re-renders without needing `newHandled` in the dependency array.
  const newHandledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!newRecipientId || sessionLoading || !user || convLoading) return;
    if (newHandledRef.current === newRecipientId) return;
    newHandledRef.current = newRecipientId;
    setIsStarting(true);
    api
      .post("api/conversations", { json: { recipientId: newRecipientId, listingId: urlListingId ?? undefined } })
      .json<Conversation>()
      .then((conv) => {
        refreshConversations();
        // Navigate via ?open= so the effect waits for the conversation (with
        // its listing photo) to appear in the refreshed list before activating.
        router.replace(`/messages?open=${conv.id}`);
      })
      .catch(() => {})
      .finally(() => setIsStarting(false));
  }, [newRecipientId, urlListingId, sessionLoading, user, convLoading, refreshConversations, router]);

  // Auto-open a specific conversation (e.g. after creating one from a listing page).
  // Waits for the conversation to appear in the list so listing photo data is available.
  // Ref-based tracking: stores the last-handled conv ID so a new ?open= is always processed.
  const openHandledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!openConvId || convLoading) return;
    if (openHandledRef.current === openConvId) return;
    const found = conversations.find((c) => c.id === openConvId);
    if (!found) return;
    openHandledRef.current = openConvId;
    setActiveConvId(openConvId);
    setMobileView("thread");
    router.replace("/messages");
  }, [openConvId, convLoading, conversations, router]);

  // Global SSE
  useSSE(!!user, {
    onNewMessage: useCallback(
      ({ conversationId, message }: { conversationId: string; message: ConversationMessage }) => {
        if (conversationId === activeConvId) {
          appendMessage(message);
          if (message.senderId !== user?.id) {
            setTypingUser(null);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            api.patch(`api/conversations/${conversationId}/read`).catch(() => {});
          }
        } else {
          incrementUnread(conversationId);
        }
        updateLastMessage(conversationId, {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
          hasAttachment: message.attachments?.length > 0,
        });
      },
      [activeConvId, appendMessage, incrementUnread, updateLastMessage, user?.id],
    ),
    onTyping: useCallback(
      ({ conversationId, userId, name }: { conversationId: string; userId: string; name: string }) => {
        if (conversationId !== activeConvId) return;
        setTypingUser({ userId, name });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      },
      [activeConvId],
    ),
    onContractUpdate: useCallback(
      ({ conversationId, contract }: Parameters<NonNullable<Parameters<typeof useSSE>[1]["onContractUpdate"]>>[0]) => {
        if (conversationId !== activeConvId) return;
        // Partial updates (e.g. only reviewedByIds from a review submission) are
        // merged into the existing contract so other fields aren't wiped.
        setActiveContract((prev) =>
          prev && contract.id === prev.id ? { ...prev, ...contract } : contract,
        );
        if (contract.status) updateContractStatus(conversationId, contract.status);
        // The user is watching this conversation, so its bell notifications
        // (swap request, accepted, …) shouldn't sit unread.
        api.patch(`api/conversations/${conversationId}/read`).catch(() => {});
      },
      [activeConvId, setActiveContract, updateContractStatus],
    ),
    onScheduleUpdate: useCallback(
      ({ conversationId, messageId, scheduleProposal }: { conversationId: string; messageId: string; scheduleProposal: import("@/features/conversations/types").ScheduleProposalData }) => {
        if (conversationId !== activeConvId) return;
        updateMessage(messageId, { scheduleProposal });
        api.patch(`api/conversations/${conversationId}/read`).catch(() => {});
      },
      [activeConvId, updateMessage],
    ),
    onReadUpdate: useCallback(
      ({ conversationId, userId, lastReadAt }: { conversationId: string; userId: string; lastReadAt: string }) => {
        if (conversationId !== activeConvId) return;
        if (userId === user?.id) return;
        setOtherUserLastReadAt(lastReadAt);
      },
      [activeConvId, user?.id],
    ),
  });

  async function handleSend(content: string, file?: File) {
    try {
      const result = await send(content, file);
      if (result && activeConvId) {
        updateLastMessage(activeConvId, {
          id: result.id,
          content: result.content,
          senderId: result.senderId,
          createdAt: result.createdAt,
          hasAttachment: (result.attachments?.length ?? 0) > 0,
        });
      }
    } catch (err) {
      const description = await apiErrorMessage(
        err,
        file ? "Could not upload the file. Please try again." : "Message could not be sent. Please try again.",
      );
      toast({ variant: "destructive", title: "Failed to send", description });
    }
  }

  async function handleConfirmScheduleSlot(messageId: string, slotIndex: number) {
    if (!activeConvId) return;
    try {
      const updated = await api
        .patch(`api/conversations/${activeConvId}/schedule/${messageId}/confirm`, { json: { slotIndex } })
        .json<import("@/features/conversations/types").ScheduleProposalData>();
      updateMessage(messageId, { scheduleProposal: updated });
    } catch (err) {
      const description = await apiErrorMessage(err, "Please try again.");
      toast({ variant: "destructive", title: "Could not confirm time", description });
    }
  }

  function handleSelectConversation(id: string) {
    setActiveConvId(id);
    setMobileView("thread");
    setTypingUser(null);
    clearUnread(id);
    api.patch(`api/conversations/${id}/read`).catch(() => {});
  }

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const otherUser = activeConv?.otherUser ?? null;

  // Sync otherUserLastReadAt from conversation list data whenever we switch conversations.
  useEffect(() => {
    setOtherUserLastReadAt(activeConv?.otherUserLastReadAt ?? null);
  }, [activeConvId, activeConv?.otherUserLastReadAt]);

  // Poll online presence for the other user every 30 s.
  useEffect(() => {
    if (!otherUser) { setIsOtherUserOnline(false); return; }
    setIsOtherUserOnline(false);
    const check = () => {
      api.get(`api/sse/presence?ids=${otherUser.id}`).json<{ online: string[] }>()
        .then((d) => setIsOtherUserOnline(d.online.includes(otherUser.id)))
        .catch(() => setIsOtherUserOnline(false));
    };
    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [otherUser?.id]);
  const avatarSrc = resolveAvatarSrc(otherUser?.profile, otherUser?.image);
  const contextListing = activeConv?.listing ?? null;
  const swatch = contextListing ? getSwatch(contextListing.id) : null;

  const hasReviewed = user && activeContract
    ? activeContract.reviewedByIds.includes(user.id)
    : false;
  const revieweeId = activeContract
    ? (activeContract.requesterId === user?.id ? activeContract.providerId : activeContract.requesterId)
    : undefined;
  const partnerFirstName = otherUser?.name?.split(" ")[0] ?? null;

  const { suggestedStart, suggestedEnd } = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    // Format a Date back to the naive local "YYYY-MM-DDTHH:mm" a datetime-local input expects.
    // (Going through toISOString would convert to UTC and shift the end off the start's clock.)
    const toLocalInput = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    const build = (slot: { rawDate: string; time: string; dur?: string }) => {
      const start = `${slot.rawDate}T${slot.time}`;
      const hours = parseInt(slot.dur?.match(/^(\d+)h$/i)?.[1] ?? "", 10);
      let end = "";
      if (!Number.isNaN(hours)) {
        const dt = new Date(start);
        dt.setHours(dt.getHours() + hours);
        end = toLocalInput(dt);
      }
      return { suggestedStart: start, suggestedEnd: end };
    };

    // Prefer the agreed (confirmed) slot from the most recent proposal that has one.
    for (let i = messages.length - 1; i >= 0; i--) {
      const p = messages[i].scheduleProposal;
      if (messages[i].type === "SCHEDULE_PROPOSAL" && p && p.confirmedSlot != null) {
        const slot = p.slots[p.confirmedSlot];
        if (slot?.rawDate && slot.time) return build(slot);
      }
    }
    // Otherwise fall back to the most recent proposal's first valid slot.
    for (let i = messages.length - 1; i >= 0; i--) {
      const p = messages[i].scheduleProposal;
      if (messages[i].type === "SCHEDULE_PROPOSAL" && p) {
        const slot = p.slots.find((s) => s.rawDate && s.time);
        if (slot) return build(slot);
      }
    }
    return { suggestedStart: undefined, suggestedEnd: undefined };
  }, [messages]);

  if (sessionLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm font-semibold text-ink">Sign in to view messages</p>
      </div>
    );
  }

  return (
    <>
      {reviewModal && (
        <ReviewModal
          isOpen
          contractId={reviewModal.contractId}
          revieweeName={reviewModal.revieweeName}
          onClose={() => setReviewModal(null)}
          onSuccess={() => setReviewModal(null)}
        />
      )}
      {showProposeModal && activeConvId && otherUser && (
        <ProposeModal
          conversationId={activeConvId}
          otherUserId={otherUser.id}
          contextListingId={contextListing?.id ?? null}
          onClose={() => setShowProposeModal(false)}
          onSuccess={(c) => {
            setActiveContract(c);
            setShowProposeModal(false);
          }}
          suggestedStart={suggestedStart}
          suggestedEnd={suggestedEnd}
        />
      )}
      {showCancelModal && (
        <CancelModal
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
        />
      )}

      <div className="w-full">
        <div className="overflow-hidden bg-surface">
          <div className="grid h-[calc(100dvh-64px)] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">

            {/* Left — conversation list (hidden on mobile when thread is open) */}
            <div className={cx(mobileView === "thread" ? "hidden md:block" : "block")}>
              <ConversationList
                conversations={conversations}
                isLoading={convLoading || isStarting}
                activeId={activeConvId}
                onSelect={handleSelectConversation}
              />
            </div>

            {/* Center — thread (hidden on mobile when list is shown) */}
            <main className={cx(
              "flex flex-col overflow-hidden",
              mobileView === "list" ? "hidden md:flex" : "flex",
            )}>
              {activeConvId && otherUser ? (
                <>
                  {/* Compact deal bar header */}
                  <header className="z-10 border-b border-line bg-surface px-4 lg:px-6 py-2.5 flex items-center gap-3">
                    {/* Mobile back */}
                    <button
                      onClick={() => setMobileView("list")}
                      className="md:hidden -ml-1 mr-0.5 inline-flex h-7 w-7 items-center justify-center rounded text-ink3 hover:bg-sunken hover:text-ink"
                    >
                      <ArrowL size={15} />
                    </button>

                    {/* Left clickable section */}
                    <Link
                      href={contextListing ? `/listings/${contextListing.id}` : "#"}
                      className="flex items-center gap-3 min-w-0 flex-1 group"
                    >
                      {/* Listing thumbnail 40×40 */}
                      {contextListing ? (
                        contextListing.coverImage ? (
                          <Image
                            src={`${apiUrl}${contextListing.coverImage}`}
                            alt={contextListing.title}
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0 rounded-lg object-cover border border-line"
                            unoptimized
                          />
                        ) : swatch ? (
                          <div className={`h-10 w-10 shrink-0 rounded-lg ${swatch.block}`} />
                        ) : null
                      ) : (
                        <Avatar src={avatarSrc} name={otherUser.name} size="sm" />
                      )}

                      <div className="min-w-0">
                        {/* Title row */}
                        <div className="flex items-center gap-1.5">
                          {contextListing && (
                            <span className={cx(
                              "text-[9px] font-mono uppercase tracking-wider px-1 py-px rounded flex-shrink-0",
                              contextListing.type === "SKILL_OFFER"
                                ? "text-violet-700 bg-violet-50"
                                : "text-amber-800 bg-amber-50",
                            )}>
                              {listingKind(contextListing.type)}
                            </span>
                          )}
                          <h2 className="text-[14px] font-bold text-ink truncate group-hover:text-brand-700 leading-tight">
                            {contextListing?.title ?? otherUser.name}
                          </h2>
                        </div>

                        {/* Subtitle row: partner + rating + verified + deal progress */}
                        <div className="text-[11px] text-ink3 truncate mt-0.5 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1">
                            <span className="relative inline-flex shrink-0">
                              <Avatar src={avatarSrc} name={otherUser.name} size="xs" />
                              {isOtherUserOnline && (
                                <span className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-surface" />
                              )}
                            </span>
                            <span className="text-ink2 font-medium">{otherUser.name}</span>
                          </span>
                          {otherUser.profile?.rating != null && (
                            <>
                              <span className="text-line2">·</span>
                              <span className="inline-flex items-center gap-0.5">
                                <StarFill size={9} className="text-amber-500" />
                                {otherUser.profile.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                          {otherUser.profile?.isIdentityVerified && (
                            <Shield size={9} className="text-emerald-600" />
                          )}
                          {activeContract !== undefined && (
                            <>
                              <span className="text-line2 hidden lg:inline">·</span>
                              <span className="hidden lg:inline-flex items-center gap-1">
                                {(() => {
                                  const step = dealStep(activeContract === null ? null : activeContract?.status);
                                  return (
                                    <>
                                      <span className="inline-flex items-center gap-[2px]">
                                        {DEAL_STEPS.map((_, i) => (
                                          <span
                                            key={i}
                                            className={cx(
                                              "h-[3px] w-2.5 rounded-full",
                                              i <= step.idx ? "bg-brand-600" : "bg-line2",
                                            )}
                                          />
                                        ))}
                                      </span>
                                      <span className="text-ink2 font-medium">{step.label}</span>
                                    </>
                                  );
                                })()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Right action cluster */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        title="Schedule"
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] text-ink2 hover:bg-sunken hover:text-ink font-medium transition-colors"
                      >
                        <Calendar size={14} /><span className="hidden md:inline">Schedule</span>
                      </button>
                      <button
                        title="Call"
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] text-ink2 hover:bg-sunken hover:text-ink font-medium transition-colors"
                      >
                        <Phone size={14} /><span className="hidden md:inline">Call</span>
                      </button>
                      <button
                        title="More"
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] text-ink2 hover:bg-sunken hover:text-ink font-medium transition-colors"
                      >
                        <Dots size={14} /><span className="hidden md:inline">More</span>
                      </button>
                    </div>
                  </header>

                  {/* Messages + DealCard */}
                  <MessageThread
                    messages={messages}
                    isLoading={msgLoading}
                    hasMore={hasMore}
                    currentUserId={user.id}
                    otherUser={otherUser}
                    bottomRef={bottomRef}
                    typingUser={typingUser}
                    contract={activeContract}
                    contextListing={contextListing}
                    partnerName={otherUser.name}
                    onContractAction={(action) => handleContractAction(action)}
                    onAccept={() => handleContractAction("accept")}
                    onDecline={() => handleContractAction("decline")}
                    onCancel={() => setShowCancelModal(true)}
                    onComplete={() => handleContractAction("complete")}
                    onProposeTerms={() => setShowProposeModal(true)}
                    onLeaveReview={() => {
                      if (!activeContract || !revieweeId) return;
                      setReviewModal({
                        contractId: activeContract.id,
                        revieweeName: otherUser.name,
                      });
                    }}
                    hasReviewed={hasReviewed}
                    actionLoading={actionLoading}
                    onLoadMore={loadMore}
                    onSendMessage={(content) => handleSend(content)}
                    onCounter={() => setShowProposeModal(true)}
                    conversationId={activeConvId ?? undefined}
                    onConfirmScheduleSlot={handleConfirmScheduleSlot}
                    otherUserLastReadAt={otherUserLastReadAt}
                  />

                  {/* Composer */}
                  <MessageInput
                    conversationId={activeConvId ?? ""}
                    isSending={isSending}
                    onSend={handleSend}
                    onTyping={sendTyping}
                    partnerFirstName={partnerFirstName ?? undefined}
                    onProposeTerms={() => setShowProposeModal(true)}
                    agreedStart={activeContract?.scheduledStart ?? null}
                    agreedEnd={activeContract?.scheduledEnd ?? null}
                  />
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-sunken text-ink3">
                    <Msg size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">Your messages</p>
                    <p className="mt-1 max-w-xs text-sm text-ink2">
                      Select a conversation on the left, or start one from any listing page.
                    </p>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
