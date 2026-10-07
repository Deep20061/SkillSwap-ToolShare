import prisma from "../../lib/prisma";
import redis from "../../lib/redis";
import { encryptMessage, decryptMessage } from "../../lib/crypto";
import { sendContractProposalMessage } from "../conversations/conversations.service";
import type { ProposeContractInput, PatchContractInput } from "./contracts.validation";
import { ContractStatus, Prisma } from "@prisma/client";

// ── Serializer ─────────────────────────────────────────────────────────────────

const listingSelect = {
  id: true,
  title: true,
  type: true,
  userId: true,
  media: { orderBy: { order: "asc" as const }, take: 1, select: { path: true } },
} as const;

type RawListing = {
  id: string;
  title: string;
  type: string;
  userId: string;
  media: { path: string }[];
};

function serializeListing(l: RawListing) {
  return {
    id: l.id,
    title: l.title,
    type: l.type,
    userId: l.userId,
    coverImage: l.media[0]?.path ?? null,
  };
}

type RawContract = Awaited<ReturnType<typeof findContractById>>;

function serializeContract(
  contract: NonNullable<RawContract>,
  reviewerIds: string[],
) {
  return {
    id: contract.id,
    conversationId: contract.conversationId,
    requesterId: contract.requesterId,
    providerId: contract.providerId,
    listingId: contract.listingId,
    listing: serializeListing(contract.listing),
    counterListingId: contract.counterListingId,
    counterListing: contract.counterListing ? serializeListing(contract.counterListing) : null,
    status: contract.status,
    message:
      contract.encryptedMessage && contract.messageIv
        ? decryptMessage(contract.encryptedMessage, contract.messageIv)
        : null,
    scheduledStart: contract.scheduledStart?.toISOString() ?? null,
    scheduledEnd: contract.scheduledEnd?.toISOString() ?? null,
    completedAt: contract.completedAt?.toISOString() ?? null,
    cancelledAt: contract.cancelledAt?.toISOString() ?? null,
    cancelledById: contract.cancelledById,
    cancelReason: contract.cancelReason,
    requesterConfirmedComplete: contract.requesterConfirmedComplete,
    providerConfirmedComplete: contract.providerConfirmedComplete,
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString(),
    reviewedByIds: reviewerIds,
  };
}

async function findContractById(id: string) {
  return prisma.exchangeContract.findUnique({
    where: { id },
    include: {
      listing: { select: listingSelect },
      counterListing: { select: listingSelect },
    },
  });
}

async function getReviewerIds(contractId: string): Promise<string[]> {
  const reviews = await prisma.review.findMany({
    where: { contractId },
    select: { reviewerId: true },
  });
  return reviews.map((r) => r.reviewerId);
}

async function publishContractUpdate(
  conversationId: string,
  requesterId: string,
  providerId: string,
  serialized: ReturnType<typeof serializeContract>,
) {
  const payload = JSON.stringify({
    type: "contract_update",
    data: { conversationId, contract: serialized },
  });
  await Promise.all([
    redis.publish(`sse:user:${requesterId}`, payload).catch(() => {}),
    redis.publish(`sse:user:${providerId}`, payload).catch(() => {}),
  ]);
}

// ── Propose a contract ─────────────────────────────────────────────────────────

export async function proposeContract(
  conversationId: string,
  requesterId: string,
  input: ProposeContractInput,
) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { listingId: true, participants: { select: { userId: true } } },
  });
  if (!conv) return null;

  const isMember = conv.participants.some((p) => p.userId === requesterId);
  if (!isMember) return "forbidden" as const;

  const other = conv.participants.find((p) => p.userId !== requesterId);
  if (!other) return null;
  const providerId = other.userId;

  // The counterListingId must match the conversation's context listing when one is set.
  if (conv.listingId && input.counterListingId && input.counterListingId !== conv.listingId) {
    return "forbidden" as const;
  }

  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: { id: true, userId: true },
  });
  if (!listing) return null;
  if (listing.userId !== requesterId) return "forbidden" as const;

  if (input.counterListingId) {
    const counter = await prisma.listing.findUnique({
      where: { id: input.counterListingId },
      select: { id: true, userId: true },
    });
    if (!counter) return null;
    if (counter.userId !== providerId) return "forbidden" as const;
  }

  const encrypted = input.message ? encryptMessage(input.message) : null;

  const contract = await prisma.$transaction(async (tx) => {
    // Upsert inside a serializable transaction — prevents TOCTOU duplicate proposals
    const existing = await tx.exchangeContract.findUnique({
      where: { conversationId },
    });
    if (existing && !["DECLINED", "CANCELLED"].includes(existing.status)) {
      return "conflict" as const;
    }
    // Allow any conversation participant to re-propose after a DECLINED or CANCELLED
    // contract — isMember was already verified above. Blocking by requesterId here
    // would prevent the provider from ever initiating a proposal on a cleared contract.

    return tx.exchangeContract.upsert({
      where: { conversationId },
      create: {
        requesterId,
        providerId,
        listingId: input.listingId,
        counterListingId: input.counterListingId,
        conversationId,
        encryptedMessage: encrypted?.encryptedContent,
        messageIv: encrypted?.iv,
        scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : undefined,
        scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : undefined,
        status: ContractStatus.PENDING,
      },
      update: {
        requesterId,
        providerId,
        listingId: input.listingId,
        counterListingId: input.counterListingId ?? null,
        encryptedMessage: encrypted?.encryptedContent ?? null,
        messageIv: encrypted?.iv ?? null,
        scheduledStart: input.scheduledStart ? new Date(input.scheduledStart) : null,
        scheduledEnd: input.scheduledEnd ? new Date(input.scheduledEnd) : null,
        status: ContractStatus.PENDING,
        completedAt: null,
        cancelledAt: null,
        cancelledById: null,
        cancelReason: null,
        requesterConfirmedComplete: false,
        providerConfirmedComplete: false,
      },
      include: {
        listing: { select: listingSelect },
        counterListing: { select: listingSelect },
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  if (contract === "conflict") return "conflict" as const;

  const serialized = serializeContract(contract, []);
  await Promise.all([
    publishContractUpdate(conversationId, requesterId, providerId, serialized),
    sendContractProposalMessage(conversationId, requesterId, contract.id),
  ]);
  return serialized;
}

// ── Get contract for a conversation ───────────────────────────────────────────

export async function getContractForConversation(
  conversationId: string,
  userId: string,
) {
  const isMember = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!isMember) return "forbidden" as const;

  const contract = await prisma.exchangeContract.findUnique({
    where: { conversationId },
    include: {
      listing: { select: listingSelect },
      counterListing: { select: listingSelect },
    },
  });
  if (!contract) return null;

  const reviewerIds = await getReviewerIds(contract.id);
  return serializeContract(contract, reviewerIds);
}

// ── Patch contract status ──────────────────────────────────────────────────────

export async function patchContract(
  contractId: string,
  userId: string,
  input: PatchContractInput,
) {
  const contract = await findContractById(contractId);
  if (!contract) return null;

  const isRequester = contract.requesterId === userId;
  const isProvider = contract.providerId === userId;
  if (!isRequester && !isProvider) return "forbidden" as const;

  const { action, cancelReason } = input;
  const { status } = contract;

  let nextStatus: ContractStatus;
  let extra: Record<string, unknown> = {};

  if (action === "accept") {
    if (!isProvider) return "forbidden" as const;
    if (status !== ContractStatus.PENDING) return "invalid_transition" as const;
    nextStatus = ContractStatus.ACCEPTED;
  } else if (action === "decline") {
    if (!isProvider) return "forbidden" as const;
    if (status !== ContractStatus.PENDING) return "invalid_transition" as const;
    nextStatus = ContractStatus.DECLINED;
  } else if (action === "complete") {
    if (!isRequester && !isProvider) return "forbidden" as const;
    if (
      status !== ContractStatus.ACCEPTED &&
      status !== ContractStatus.IN_PROGRESS
    ) {
      return "invalid_transition" as const;
    }
    // Wrap in a serializable transaction to atomically read + update both confirmation
    // flags, preventing a race where two simultaneous requests both see bothConfirmed=false
    // and neither triggers the COMPLETED transition.
    const txResult = await prisma.$transaction(async (tx) => {
      const fresh = await tx.exchangeContract.findUnique({
        where: { id: contractId },
        select: { requesterConfirmedComplete: true, providerConfirmedComplete: true, status: true },
      });
      if (!fresh) return null;
      // Re-validate the transition guard against the freshly-read status so a concurrent
      // cancel between the outer fetch and this transaction doesn't corrupt the flags.
      if (
        fresh.status !== ContractStatus.ACCEPTED &&
        fresh.status !== ContractStatus.IN_PROGRESS
      ) return "invalid_transition" as const;
      const newRequesterConfirmed = isRequester ? true : fresh.requesterConfirmedComplete;
      const newProviderConfirmed  = isProvider  ? true : fresh.providerConfirmedComplete;
      const bothConfirmed = newRequesterConfirmed && newProviderConfirmed;
      const txNextStatus = bothConfirmed ? ContractStatus.COMPLETED : fresh.status;
      return tx.exchangeContract.update({
        where: { id: contractId },
        data: {
          status: txNextStatus,
          requesterConfirmedComplete: newRequesterConfirmed,
          providerConfirmedComplete:  newProviderConfirmed,
          ...(bothConfirmed ? { completedAt: new Date() } : {}),
        },
        include: {
          listing: { select: listingSelect },
          counterListing: { select: listingSelect },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (!txResult || txResult === "invalid_transition") return txResult ?? null;
    const reviewerIds = await getReviewerIds(contractId);
    const serialized = serializeContract(txResult, reviewerIds);
    if (txResult.conversationId) {
      await publishContractUpdate(txResult.conversationId, txResult.requesterId, txResult.providerId, serialized);
    }
    return serialized;
  } else {
    // cancel
    if (
      status === ContractStatus.COMPLETED ||
      status === ContractStatus.DECLINED ||
      status === ContractStatus.CANCELLED
    ) return "invalid_transition" as const;
    nextStatus = ContractStatus.CANCELLED;
    extra = {
      cancelledAt: new Date(),
      cancelledById: userId,
      cancelReason: cancelReason ?? null,
    };
  }

  // Re-validate the status guard inside a serializable transaction to prevent a TOCTOU
  // race where two concurrent requests (e.g. provider accepts while requester cancels)
  // both read the same status outside the transaction and then overwrite each other.
  const txUpdated = await prisma.$transaction(async (tx) => {
    const fresh = await tx.exchangeContract.findUnique({
      where: { id: contractId },
      select: { status: true },
    });
    if (!fresh) return null;
    if (action === "accept" || action === "decline") {
      if (fresh.status !== ContractStatus.PENDING) return "invalid_transition" as const;
    } else {
      // cancel — re-check that the status is still cancellable
      if (
        fresh.status === ContractStatus.COMPLETED ||
        fresh.status === ContractStatus.DECLINED ||
        fresh.status === ContractStatus.CANCELLED
      ) return "invalid_transition" as const;
    }
    return tx.exchangeContract.update({
      where: { id: contractId },
      data: { status: nextStatus, ...extra },
      include: {
        listing: { select: listingSelect },
        counterListing: { select: listingSelect },
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  if (!txUpdated) return null;
  if (txUpdated === "invalid_transition") return "invalid_transition" as const;

  const updated = txUpdated;
  // A contract can only have reviews once COMPLETED — accept/decline/cancel always have none.
  const serialized = serializeContract(updated, []);

  if (updated.conversationId) {
    await publishContractUpdate(
      updated.conversationId,
      updated.requesterId,
      updated.providerId,
      serialized,
    );
  }

  return serialized;
}
