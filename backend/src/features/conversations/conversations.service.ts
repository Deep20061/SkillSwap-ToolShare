import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import redis from "../../lib/redis";
import { encryptMessage, decryptMessage } from "../../lib/crypto";
import logger from "../../lib/logger";
import { proposeContract } from "../contracts/contracts.service";
import type {
  CreateConversationInput,
  SendMessageInput,
  MessagesQueryInput,
  ScheduleProposalInput,
  ConfirmSlotInput,
} from "./conversations.validation";

// ── Shared include shape ───────────────────────────────────────────────────────

const participantInclude = {
  user: {
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      profile: { select: { avatarUrl: true, rating: true, reviewCount: true, isIdentityVerified: true } },
    },
  },
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

type RawAttachment = {
  id: string;
  path: string;
  mimeType: string;
  fileName: string;
  sizeBytes: number;
};

function serializeMessage(msg: {
  id: string;
  conversationId: string;
  senderId: string;
  encryptedContent: string;
  iv: string;
  type: "USER" | "CONTRACT_PROPOSAL" | "SCHEDULE_PROPOSAL";
  contractId: string | null;
  createdAt: Date;
  attachments?: RawAttachment[];
  scheduleProposal?: {
    id: string;
    slots: unknown;
    confirmedSlot: number | null;
    confirmedAt: Date | null;
    confirmedById: string | null;
  } | null;
}) {
  return {
    id: msg.id,
    conversationId: msg.conversationId,
    senderId: msg.senderId,
    content: decryptMessage(msg.encryptedContent, msg.iv),
    type: msg.type,
    contractId: msg.contractId ?? null,
    createdAt: msg.createdAt.toISOString(),
    attachments: (msg.attachments ?? []).map((a) => ({
      id: a.id,
      path: a.path,
      mimeType: a.mimeType,
      fileName: a.fileName,
      sizeBytes: a.sizeBytes,
    })),
    scheduleProposal: msg.scheduleProposal
      ? {
          id: msg.scheduleProposal.id,
          slots: msg.scheduleProposal.slots,
          confirmedSlot: msg.scheduleProposal.confirmedSlot ?? null,
          confirmedAt: msg.scheduleProposal.confirmedAt?.toISOString() ?? null,
          confirmedById: msg.scheduleProposal.confirmedById ?? null,
        }
      : null,
  };
}

export async function sendContractProposalMessage(
  conversationId: string,
  senderId: string,
  contractId: string,
) {
  const { encryptedContent, iv } = encryptMessage("");
  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      encryptedContent,
      iv,
      type: "CONTRACT_PROPOSAL",
      contractId,
    },
    include: { attachments: true, scheduleProposal: true },
  });

  const serialized = serializeMessage(msg);

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  const payload = JSON.stringify({
    type: "new_message",
    data: { conversationId, message: serialized },
  });

  await Promise.all(
    participants.map((p) =>
      redis.publish(`sse:user:${p.userId}`, payload).catch(() => {}),
    ),
  );

  return serialized;
}

// ── Get or create DM conversation ─────────────────────────────────────────────

export async function getOrCreateConversation(
  userId: string,
  _input: CreateConversationInput,
) {
  const { recipientId } = _input;

  if (userId === recipientId) return null;

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true },
  });
  if (!recipient) return null;

  const result = await prisma.$transaction(async (tx) => {
    // Verify the listing belongs to one of the two participants.
    // When auto-proposing, listingId becomes the counterListing and must belong to the
    // recipient (provider) specifically — proposeContract enforces this and would return
    // "forbidden" otherwise, so we validate here before any side effects occur.
    if (_input.listingId) {
      const listing = await tx.listing.findUnique({
        where: { id: _input.listingId },
        select: { userId: true },
      });
      const requiredOwner = _input.offerListingId ? recipientId : null;
      if (
        !listing ||
        (requiredOwner
          ? listing.userId !== requiredOwner
          : listing.userId !== userId && listing.userId !== recipientId)
      ) {
        return null;
      }
    }

    // Verify the offer listing belongs to the requester before creating the conversation,
    // so a forbidden auto-propose doesn't silently fail after the conversation is created.
    if (_input.offerListingId) {
      const offerListing = await tx.listing.findUnique({
        where: { id: _input.offerListingId },
        select: { userId: true },
      });
      if (!offerListing || offerListing.userId !== userId) {
        return null;
      }
    }

    const existing = await tx.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: recipientId } } },
          _input.listingId
            ? { listingId: _input.listingId }
            : { listingId: null },
        ],
      },
      include: {
        participants: { include: participantInclude },
        listing: { select: { id: true, title: true, media: { orderBy: { order: "asc" }, take: 1, select: { path: true } } } },
      },
    });

    const conv = existing ?? await tx.conversation.create({
      data: {
        listingId: _input.listingId,
        participants: {
          create: [{ userId }, { userId: recipientId }],
        },
      },
      include: {
        participants: { include: participantInclude },
        listing: { select: { id: true, title: true, media: { orderBy: { order: "asc" }, take: 1, select: { path: true } } } },
      },
    });

    return { conv, isNew: !existing };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  if (!result) return null;
  const { conv, isNew } = result;

  // Auto-propose a contract after the conversation transaction commits so the
  // contract's own transaction runs at the top level (no nested transactions).
  // This is best-effort: if proposeContract fails (e.g. listing deleted between
  // the ownership pre-check and here), we still return the conversation so the
  // caller isn't left with a stranded conversation they can't reach.
  if (_input.offerListingId && isNew) {
    const proposeResult = await proposeContract(conv.id, userId, {
      listingId: _input.offerListingId,
      counterListingId: _input.listingId,
      scheduledStart: _input.scheduledStart,
      scheduledEnd: _input.scheduledEnd,
    });
    if (proposeResult === "forbidden" || proposeResult === null) {
      logger.error("Auto-propose failed after conversation creation", {
        conversationId: conv.id, userId, result: proposeResult,
      });
    }
  }

  return conv;
}

// ── List conversations for a user ─────────────────────────────────────────────

export async function getConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      participants: { include: participantInclude },
      listing: { select: { id: true, title: true, type: true, media: { orderBy: { order: "asc" }, take: 1, select: { path: true } } } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { attachments: true },
      },
      contract: { select: { id: true, status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Fetch all unread counts in a single query instead of N individual count queries.
  // Joins conversation_participant to get the per-conversation lastReadAt in one shot.
  type UnreadRow = { conversationId: string; count: bigint };
  const unreadRows = await prisma.$queryRaw<UnreadRow[]>`
    SELECT m."conversationId", COUNT(*) as count
    FROM message m
    JOIN conversation_participant cp
      ON cp."conversationId" = m."conversationId"
      AND cp."userId" = ${userId}
      AND (cp."lastReadAt" IS NULL OR m."createdAt" > cp."lastReadAt")
    WHERE m."senderId" != ${userId}
    GROUP BY m."conversationId"
  `;
  const unreadMap = new Map<string, number>(
    unreadRows.map((r) => [r.conversationId, Number(r.count)]),
  );

  return conversations.map((conv) => {
    const other = conv.participants.find((p) => p.userId !== userId);
    const lastMsg = conv.messages[0];

    return {
      id: conv.id,
      updatedAt: conv.updatedAt.toISOString(),
      listing: conv.listing
        ? { id: conv.listing.id, title: conv.listing.title, type: conv.listing.type, coverImage: conv.listing.media[0]?.path ?? null }
        : null,
      otherUser: other?.user ?? null,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            content: lastMsg.type === "USER"
              ? decryptMessage(lastMsg.encryptedContent, lastMsg.iv)
              : lastMsg.type === "CONTRACT_PROPOSAL"
                ? "Proposed an exchange"
                : "Shared availability",
            senderId: lastMsg.senderId,
            createdAt: lastMsg.createdAt.toISOString(),
            hasAttachment: lastMsg.attachments.length > 0,
          }
        : null,
      unreadCount: unreadMap.get(conv.id) ?? 0,
      contractStatus: conv.contract?.status ?? null,
      otherUserLastReadAt: other?.lastReadAt?.toISOString() ?? null,
    };
  });
}

// ── Get total unread count across all conversations ────────────────────────────

export async function getUnreadTotal(userId: string): Promise<number> {
  type CountRow = { count: bigint };
  const result = await prisma.$queryRaw<CountRow[]>`
    SELECT COUNT(*) as count
    FROM message m
    JOIN conversation_participant cp
      ON cp."conversationId" = m."conversationId"
      AND cp."userId" = ${userId}
      AND (cp."lastReadAt" IS NULL OR m."createdAt" > cp."lastReadAt")
    WHERE m."senderId" != ${userId}
  `;
  return Number(result[0]?.count ?? 0);
}

// ── Get single conversation (checks membership) ───────────────────────────────

export async function getConversation(conversationId: string, userId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: { include: participantInclude },
      listing: { select: { id: true, title: true, media: { orderBy: { order: "asc" }, take: 1, select: { path: true } } } },
    },
  });

  if (!conv) return null;
  const isMember = conv.participants.some((p) => p.userId === userId);
  if (!isMember) return "forbidden" as const;

  return conv;
}

// ── Get paginated messages ─────────────────────────────────────────────────────

export async function getMessages(
  conversationId: string,
  userId: string,
  query: MessagesQueryInput,
) {
  const isMember = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!isMember) return "forbidden" as const;

  const { lastMessageId, limit } = query;

  let lastMessageDate: Date | undefined;
  if (lastMessageId) {
    const lastMessage = await prisma.message.findUnique({
      where: { id: lastMessageId },
      select: { createdAt: true, conversationId: true },
    });
    if (!lastMessage || lastMessage.conversationId !== conversationId) return "invalid_last_message_id" as const;
    lastMessageDate = lastMessage.createdAt;
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      // Use a composite (createdAt, id) boundary so messages sharing the same
      // millisecond timestamp are never silently dropped at page boundaries.
      ...(lastMessageDate
        ? { OR: [{ createdAt: { lt: lastMessageDate } }, { createdAt: lastMessageDate, id: { lt: lastMessageId } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    include: { attachments: true, scheduleProposal: true },
  });

  const hasMore = messages.length > limit;
  const items = messages.slice(0, limit).reverse();
  const lastMessageIdForNextPage = hasMore ? items[0]?.id : null;

  return {
    messages: items.map(serializeMessage),
    lastMessageId: lastMessageIdForNextPage,
  };
}

// ── Send a message (with optional file attachment) ────────────────────────────

export async function sendMessage(
  conversationId: string,
  senderId: string,
  input: SendMessageInput,
  file?: { path: string; mimeType: string; fileName: string; sizeBytes: number },
) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });
  if (!participant) return "forbidden" as const;

  const content = input.content ?? "";
  const { encryptedContent, iv } = encryptMessage(content);

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        encryptedContent,
        iv,
        ...(file
          ? {
              attachments: {
                create: {
                  path: file.path,
                  mimeType: file.mimeType,
                  fileName: file.fileName,
                  sizeBytes: file.sizeBytes,
                },
              },
            }
          : {}),
      },
      include: { attachments: true },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  const serialized = serializeMessage(message);

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  const payload = JSON.stringify({
    type: "new_message",
    data: { conversationId, message: serialized },
  });

  await Promise.all(
    participants.map((p) =>
      redis.publish(`sse:user:${p.userId}`, payload).catch(() => {}),
    ),
  );

  return serialized;
}

// ── Publish typing indicator ───────────────────────────────────────────────────

export async function publishTyping(
  conversationId: string,
  userId: string,
  userName: string,
) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) return "forbidden" as const;

  const others = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: userId } },
    select: { userId: true },
  });

  const payload = JSON.stringify({
    type: "typing",
    data: { conversationId, userId, name: userName },
  });

  await Promise.all(
    others.map((p) =>
      redis.publish(`sse:user:${p.userId}`, payload).catch(() => {}),
    ),
  );

  return true;
}

// ── Get shared media for a conversation ───────────────────────────────────────

export async function isConversationMember(conversationId: string, userId: string): Promise<boolean> {
  const row = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
    select: { userId: true },
  });
  return row !== null;
}

const MEDIA_PAGE_SIZE = 18;

export async function getConversationMedia(
  conversationId: string,
  userId: string,
  cursor?: string,
) {
  const isMember = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!isMember) return "forbidden" as const;

  const media = await prisma.messageAttachment.findMany({
    where: {
      message: { conversationId },
      mimeType: { startsWith: "image/" },
    },
    orderBy: { createdAt: "desc" },
    take: MEDIA_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, path: true, mimeType: true, fileName: true, createdAt: true },
  });

  const hasMore = media.length > MEDIA_PAGE_SIZE;
  const page = media.slice(0, MEDIA_PAGE_SIZE);

  return { media: page, nextCursor: hasMore ? page[page.length - 1]!.id : null };
}

// ── Send a schedule proposal ───────────────────────────────────────────────────

export async function sendScheduleProposal(
  conversationId: string,
  senderId: string,
  input: ScheduleProposalInput,
) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });
  if (!participant) return "forbidden" as const;

  const { encryptedContent, iv } = encryptMessage("");
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        encryptedContent,
        iv,
        type: "SCHEDULE_PROPOSAL",
        scheduleProposal: { create: { slots: input.slots } },
      },
      include: { attachments: true, scheduleProposal: true },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  const serialized = serializeMessage(message);

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  const payload = JSON.stringify({ type: "new_message", data: { conversationId, message: serialized } });
  await Promise.all(participants.map((p) => redis.publish(`sse:user:${p.userId}`, payload).catch(() => {})));

  return serialized;
}

// ── Confirm a schedule slot ────────────────────────────────────────────────────

export async function confirmScheduleSlot(
  conversationId: string,
  userId: string,
  messageId: string,
  input: ConfirmSlotInput,
) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) return "forbidden" as const;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { scheduleProposal: true },
  });
  if (!message || message.conversationId !== conversationId) return "not_found" as const;
  if (message.type !== "SCHEDULE_PROPOSAL" || !message.scheduleProposal) return "not_found" as const;
  // The proposer cannot confirm their own proposal
  if (message.senderId === userId) return "forbidden" as const;

  const slots = message.scheduleProposal.slots as Array<{ rawDate?: string; time?: string }>;
  if (input.slotIndex < 0 || input.slotIndex >= slots.length) return "invalid_slot" as const;

  const slot = slots[input.slotIndex];

  // Atomic read-check-write: only update when confirmedSlot is still null so two
  // concurrent confirms can't both succeed and overwrite each other.
  const count = await prisma.scheduleProposal.updateMany({
    where: { id: message.scheduleProposal.id, confirmedSlot: null },
    data: {
      confirmedSlot: input.slotIndex,
      confirmedAt: new Date(),
      confirmedById: userId,
    },
  });
  if (count.count === 0) return "already_confirmed" as const;

  const updatedProposal = await prisma.scheduleProposal.findUniqueOrThrow({
    where: { id: message.scheduleProposal.id },
  });

  // If the conversation has a contract in PENDING/ACCEPTED/IN_PROGRESS, update its scheduled times
  let updatedScheduledStart: string | null = null;
  let updatedContractId: string | null = null;
  if (slot.rawDate && slot.time) {
    // Parse as UTC — omitting the Z suffix causes JS to interpret as local time
    const scheduledStart = new Date(`${slot.rawDate}T${slot.time}:00Z`);
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contract: { select: { id: true, status: true } } },
    });
    const contract = conv?.contract;
    if (contract && ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(contract.status)) {
      await prisma.exchangeContract.update({
        where: { id: contract.id },
        data: { scheduledStart },
      });
      updatedScheduledStart = scheduledStart.toISOString();
      updatedContractId = contract.id;
    }
  }

  const scheduleProposalData = {
    id: updatedProposal.id,
    slots: updatedProposal.slots,
    confirmedSlot: updatedProposal.confirmedSlot ?? null,
    confirmedAt: updatedProposal.confirmedAt?.toISOString() ?? null,
    confirmedById: updatedProposal.confirmedById ?? null,
  };

  // Broadcast schedule_update SSE event
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });
  const payload = JSON.stringify({
    type: "schedule_update",
    data: { conversationId, messageId, scheduleProposal: scheduleProposalData },
  });
  await Promise.all(participants.map((p) => redis.publish(`sse:user:${p.userId}`, payload).catch(() => {})));

  // Broadcast the updated scheduledStart so DealCard stays in sync without a refresh
  if (updatedContractId && updatedScheduledStart) {
    const contractPayload = JSON.stringify({
      type: "contract_update",
      data: {
        conversationId,
        contract: { id: updatedContractId, scheduledStart: updatedScheduledStart },
      },
    });
    await Promise.all(participants.map((p) => redis.publish(`sse:user:${p.userId}`, contractPayload).catch(() => {})));
  }

  return scheduleProposalData;
}

// ── Mark conversation as read ──────────────────────────────────────────────────

export async function markAsRead(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!participant) return "forbidden" as const;

  const now = new Date();
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: now },
  });

  // Notify other participants so their "Seen" indicator updates in real-time.
  const others = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: userId } },
    select: { userId: true },
  });
  const payload = JSON.stringify({
    type: "read_update",
    data: { conversationId, userId, lastReadAt: now.toISOString() },
  });
  await Promise.all(others.map((p) => redis.publish(`sse:user:${p.userId}`, payload).catch(() => {})));

  return true;
}
