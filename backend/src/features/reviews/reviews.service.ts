import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import redis from "../../lib/redis";
import type { CreateReviewInput } from "./reviews.validation";

export async function createReview(userId: string, input: CreateReviewInput) {
  const contract = await prisma.exchangeContract.findUnique({
    where: { id: input.contractId },
    select: {
      id: true,
      status: true,
      requesterId: true,
      providerId: true,
      reviews: { where: { reviewerId: userId }, select: { id: true } },
    },
  });

  if (!contract) return "not_found" as const;

  const isParticipant =
    contract.requesterId === userId || contract.providerId === userId;
  if (!isParticipant) return "forbidden" as const;

  if (contract.status !== "COMPLETED") return "not_completed" as const;

  const revieweeId =
    contract.requesterId === userId ? contract.providerId : contract.requesterId;

  // Wrap review creation and aggregate update in a single transaction to
  // prevent a race where concurrent reviews for the same reviewee each read
  // a stale aggregate and overwrite each other's rating count. The duplicate
  // check is inside the transaction so concurrent requests don't both pass it
  // before either insert, which would cause an unhandled unique-constraint error.
  const review = await prisma.$transaction(async (tx) => {
    const existing = await tx.review.findUnique({
      where: { contractId_reviewerId: { contractId: input.contractId, reviewerId: userId } },
      select: { id: true },
    });
    if (existing) return "already_reviewed" as const;

    const created = await tx.review.create({
      data: {
        contractId: input.contractId,
        reviewerId: userId,
        revieweeId,
        rating: input.rating,
        comment: input.comment,
      },
      select: {
        id: true,
        contractId: true,
        reviewerId: true,
        revieweeId: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    // Update reviewee's aggregate rating
    const agg = await tx.review.aggregate({
      where: { revieweeId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.userProfile.upsert({
      where: { userId: revieweeId },
      update: {
        rating: agg._avg.rating,
        reviewCount: agg._count.rating,
      },
      create: {
        userId: revieweeId,
        rating: agg._avg.rating,
        reviewCount: agg._count.rating,
      },
    });

    return created;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  if (review === "already_reviewed") return "already_reviewed" as const;

  // Broadcast contract_update so both parties see hasReviewed flip in real time
  const [updatedContract, reviewerRows] = await Promise.all([
    prisma.exchangeContract.findUnique({
      where: { id: input.contractId },
      select: { conversationId: true, requesterId: true, providerId: true },
    }),
    prisma.review.findMany({ where: { contractId: input.contractId }, select: { reviewerId: true } }),
  ]);
  if (updatedContract) {
    const reviewerIds = reviewerRows.map((r) => r.reviewerId);
    const payload = JSON.stringify({
      type: "contract_update",
      data: {
        conversationId: updatedContract.conversationId,
        contract: { id: input.contractId, reviewedByIds: reviewerIds },
      },
    });
    await Promise.all([
      redis.publish(`sse:user:${updatedContract.requesterId}`, payload).catch(() => {}),
      redis.publish(`sse:user:${updatedContract.providerId}`, payload).catch(() => {}),
    ]);
  }

  return { ...review, createdAt: review.createdAt.toISOString() };
}

const REVIEWS_PAGE_SIZE = 10;

export async function getUserReviews(
  userId: string,
  cursor?: string,
) {
  // Only surface reviews once both parties have reviewed the same contract —
  // prevents the second reviewer from anchoring on the first reviewer's rating.
  const reviews = await prisma.review.findMany({
    where: {
      revieweeId: userId,
      contract: { reviews: { some: { reviewerId: { not: userId } } } },
    },
    orderBy: { createdAt: "desc" },
    // Fetch one extra to determine whether a next page exists.
    take: REVIEWS_PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      reviewer: {
        select: {
          id: true,
          name: true,
          image: true,
          profile: { select: { avatarUrl: true } },
        },
      },
    },
  });

  const hasMore = reviews.length > REVIEWS_PAGE_SIZE;
  const page = reviews.slice(0, REVIEWS_PAGE_SIZE);

  return {
    reviews: page.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    nextCursor: hasMore ? page[page.length - 1]!.id : null,
  };
}

export async function getReviewStatus(
  userId: string,
  contractId: string,
) {
  const contract = await prisma.exchangeContract.findUnique({
    where: { id: contractId },
    select: {
      status: true,
      requesterId: true,
      providerId: true,
      reviews: {
        select: { reviewerId: true, revieweeId: true, rating: true },
      },
    },
  });

  if (!contract) return "not_found" as const;

  const isParticipant =
    contract.requesterId === userId || contract.providerId === userId;
  if (!isParticipant) return "forbidden" as const;

  const hasReviewed = contract.reviews.some((r) => r.reviewerId === userId);
  const peerHasReviewed = contract.reviews.some((r) => r.reviewerId !== userId);
  const revieweeId =
    contract.requesterId === userId
      ? contract.providerId
      : contract.requesterId;

  // Only expose peer ratings once both parties have reviewed, to prevent
  // the second reviewer from gaming their score based on the first.
  const bothReviewed = hasReviewed && peerHasReviewed;
  const visibleReviews = bothReviewed
    ? contract.reviews
    : contract.reviews.filter((r) => r.reviewerId === userId);

  return {
    contractStatus: contract.status,
    hasReviewed,
    peerHasReviewed,
    revieweeId,
    reviews: visibleReviews,
  };
}
