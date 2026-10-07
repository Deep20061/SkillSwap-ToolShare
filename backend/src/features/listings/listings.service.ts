import crypto from "crypto";
import prisma from "../../lib/prisma";
import logger from "../../lib/logger";
import { slugify } from "../../lib/validation";
import type {
  CreateListingInput,
  UpdateListingInput,
  ListingQueryInput,
} from "./listings.validation";

// ── Helpers ───────────────────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function radiusToBbox(lat: number, lng: number, radiusKm: number) {
  const deltaLat = radiusKm / 111;
  const deltaLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - deltaLat,
    maxLat: lat + deltaLat,
    minLng: lng - deltaLng,
    maxLng: lng + deltaLng,
  };
}

function fuzzCoordinates(lat: number, lng: number, id: string) {
  const secret = process.env.FUZZ_SECRET ?? "changeme-set-FUZZ_SECRET-in-env";
  const hmac = crypto.createHmac("sha256", secret).update(id).digest();
  const angleInt = hmac.readUInt32BE(0);
  const radiusInt = hmac.readUInt32BE(4);
  // Full float-precision angle so the direction is not recoverable by enumeration
  const angle = (angleInt / 0xffffffff) * 2 * Math.PI;
  // Radius 0.005°–0.015° (~500m–1500m at equator), not reversible without secret
  const radius = 0.005 + (radiusInt / 0xffffffff) * 0.010;
  return { latitude: lat + Math.cos(angle) * radius, longitude: lng + Math.sin(angle) * radius };
}

function serializeListing<T extends { id: string; userId: string; latitude: number | null; longitude: number | null }>(
  listing: T,
  requestingUserId?: string,
  isSaved?: boolean,
): T & { isSaved: boolean | undefined } {
  const base = (() => {
    if (listing.latitude === null || listing.longitude === null) return listing;
    if (requestingUserId === listing.userId) return listing;
    const fuzzed = fuzzCoordinates(listing.latitude, listing.longitude, listing.id);
    return { ...listing, latitude: fuzzed.latitude, longitude: fuzzed.longitude };
  })();
  return { ...base, isSaved: requestingUserId !== undefined ? (isSaved ?? false) : undefined };
}

/** Shared include shape used across multiple queries so the response shape is consistent. */
const listingInclude = {
  user: {
    select: {
      id: true,
      name: true,
      image: true,
      profile: { select: { avatarUrl: true, rating: true, reviewCount: true, isIdentityVerified: true } },
    },
  },
  skillDetail: {
    include: { skill: { select: { id: true, name: true, slug: true } } },
  },
  toolDetail: true,
  media: { orderBy: { order: "asc" as const } },
  category: true,
} as const;

// ── Public: list listings ─────────────────────────────────────────────────────

export async function getListings(query: ListingQueryInput, requestingUserId?: string) {
  const { type, status, page, limit, q, tag, categoryId, userId, minLat, maxLat, minLng, maxLng, verifiedOnly, superHostOnly, minDeposit, maxDeposit, userLat, userLng, radiusKm } = query;
  const radiusBbox = userLat !== undefined && userLng !== undefined && radiusKm !== undefined
    ? radiusToBbox(userLat, userLng, radiusKm)
    : null;
  const skip = (page - 1) * limit;

  const where = {
    ...(type ? { type } : {}),
    // Non-ACTIVE status only allowed when the requester is filtering their own listings
    status: requestingUserId && userId === requestingUserId && status ? status : ("ACTIVE" as const),
    ...(userId ? { userId } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q } },
          ],
        }
      : {}),
    ...(minLat !== undefined
      ? {
          latitude: { gte: minLat, lte: maxLat },
          longitude: { gte: minLng, lte: maxLng },
        }
      : radiusBbox
      ? {
          latitude: { gte: radiusBbox.minLat, lte: radiusBbox.maxLat },
          longitude: { gte: radiusBbox.minLng, lte: radiusBbox.maxLng },
        }
      : {}),
    // TODO(identity-verification): verifiedOnly filter is wired but will always return zero results
    // until the EU document + face-scan verification flow is built and isIdentityVerified can be set to true.
    // superHostOnly is active and works today via reviewCount >= 15.
    ...((verifiedOnly || superHostOnly)
      ? {
          user: {
            profile: {
              ...(verifiedOnly ? { isIdentityVerified: true } : {}),
              ...(superHostOnly ? { reviewCount: { gte: 15 } } : {}),
            },
          },
        }
      : {}),
    ...(minDeposit !== undefined
      ? { toolDetail: { depositAmount: { gte: minDeposit, ...(maxDeposit !== undefined ? { lte: maxDeposit } : {}) } } }
      : maxDeposit !== undefined
      ? { toolDetail: { depositAmount: { lte: maxDeposit } } }
      : {}),
  };

  // When a radius filter is active, fetch without pagination first so we can exact-filter,
  // then apply pagination in JS. For normal queries we let the DB handle pagination.
  let items: Awaited<ReturnType<typeof prisma.listing.findMany<{ where: typeof where; include: typeof listingInclude }>>>;
  let total: number;

  if (radiusBbox && userLat !== undefined && userLng !== undefined && radiusKm !== undefined) {
    const all = await prisma.listing.findMany({ where, include: listingInclude, orderBy: { createdAt: "desc" } });
    const filtered = all.filter(
      (l) => l.latitude !== null && l.longitude !== null &&
        haversineKm(userLat, userLng, l.latitude, l.longitude) <= radiusKm
    );
    total = filtered.length;
    items = filtered.slice(skip, skip + limit);
  } else {
    [items, total] = await Promise.all([
      prisma.listing.findMany({ where, include: listingInclude, orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.listing.count({ where }),
    ]);
  }

  let savedIds = new Set<string>();
  if (requestingUserId && items.length > 0) {
    const saved = await prisma.savedListing.findMany({
      where: { userId: requestingUserId, listingId: { in: items.map((i) => i.id) } },
      select: { listingId: true },
    });
    savedIds = new Set(saved.map((s) => s.listingId));
  }

  return {
    items: items.map((item) => ({
      ...serializeListing(item, requestingUserId, requestingUserId ? savedIds.has(item.id) : undefined),
      coverImage: item.media[0]?.path ?? null,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// ── Public: map pins (lightweight — coordinates + minimal metadata only) ──────

export async function getListingsForMap(
  query: ListingQueryInput,
  requestingUserId?: string,
) {
  const { type, q, tag, categoryId, minLat, maxLat, minLng, maxLng, verifiedOnly, superHostOnly, userLat, userLng, radiusKm } = query;
  const radiusBbox = userLat !== undefined && userLng !== undefined && radiusKm !== undefined
    ? radiusToBbox(userLat, userLng, radiusKm)
    : null;

  const where = {
    status: "ACTIVE" as const,
    // Must have coordinates to appear on the map
    latitude: { not: null },
    longitude: { not: null },
    ...(type ? { type } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { has: q } },
          ],
        }
      : {}),
    ...(minLat !== undefined
      ? {
          // Pad by max fuzz radius (0.015°) so pins whose exact coords sit just outside
          // the viewport still return — their fuzzed position may be inside the viewport.
          latitude: { not: null, gte: Math.max(minLat - 0.02, radiusBbox?.minLat ?? -90), lte: Math.min(maxLat! + 0.02, radiusBbox?.maxLat ?? 90) },
          longitude: { not: null, gte: Math.max(minLng! - 0.02, radiusBbox?.minLng ?? -180), lte: Math.min(maxLng! + 0.02, radiusBbox?.maxLng ?? 180) },
        }
      : radiusBbox
      ? {
          latitude: { not: null, gte: radiusBbox.minLat, lte: radiusBbox.maxLat },
          longitude: { not: null, gte: radiusBbox.minLng, lte: radiusBbox.maxLng },
        }
      : {}),
    ...((verifiedOnly || superHostOnly)
      ? {
          user: {
            profile: {
              ...(verifiedOnly ? { isIdentityVerified: true } : {}),
              ...(superHostOnly ? { reviewCount: { gte: 15 } } : {}),
            },
          },
        }
      : {}),
  };

  const pins = await prisma.listing.findMany({
    where,
    select: {
      id: true,
      userId: true,
      title: true,
      type: true,
      latitude: true,
      longitude: true,
      locationName: true,
      media: { take: 1, select: { path: true } },
    },
    orderBy: { createdAt: "desc" },
    // Hard cap — no pagination needed for map pins; the bbox should narrow this naturally
    take: 500,
  });

  return pins
    .filter((p) => p.latitude !== null && p.longitude !== null)
    .filter((p) =>
      userLat === undefined || userLng === undefined || radiusKm === undefined
        ? true
        : haversineKm(userLat, userLng, p.latitude!, p.longitude!) <= radiusKm
    )
    .map((p) => {
      const fuzzed = requestingUserId === p.userId
        ? { latitude: p.latitude!, longitude: p.longitude! }
        : fuzzCoordinates(p.latitude!, p.longitude!, p.id);
      return {
        id: p.id,
        title: p.title,
        type: p.type,
        latitude: fuzzed.latitude,
        longitude: fuzzed.longitude,
        locationName: p.locationName ?? null,
        thumbnailPath: p.media[0]?.path ?? null,
      };
    });
}

// ── Public: single listing ────────────────────────────────────────────────────

export async function getListingById(id: string, requestingUserId?: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  });
  if (!listing) return null;

  // Increment view count fire-and-forget — non-fatal
  prisma.listing
    .update({ where: { id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  let isSaved: boolean | undefined;
  if (requestingUserId) {
    const saved = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId: requestingUserId, listingId: id } },
      select: { userId: true },
    });
    isSaved = saved !== null;
  }

  return serializeListing(listing, requestingUserId, isSaved);
}

// ── Authenticated: create listing ─────────────────────────────────────────────

export async function createListing(
  userId: string,
  data: CreateListingInput,
) {
  const { type, title, description, tags, skillDetail, toolDetail, latitude, longitude, locationName, categoryId } = data;

  return prisma.$transaction(async (tx) => {
    let resolvedLat = latitude
    let resolvedLng = longitude
    if (resolvedLat === undefined || resolvedLng === undefined) {
      const profile = await tx.userProfile.findUnique({
        where: { userId },
        select: { latitude: true, longitude: true },
      })
      if (profile?.latitude !== null && profile?.latitude !== undefined) {
        resolvedLat = profile.latitude
        resolvedLng = profile.longitude ?? undefined
      }
    }

    const listing = await tx.listing.create({
      data: {
        userId,
        type,
        title,
        description,
        tags,
        ...(resolvedLat !== undefined && resolvedLng !== undefined
          ? { latitude: resolvedLat, longitude: resolvedLng }
          : {}),
        ...(locationName !== undefined ? { locationName } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
      },
    });

    if (type === "SKILL_OFFER" && skillDetail) {
      // Upsert skill so we always have a Skill row
      const skill = await tx.skill.upsert({
        where: { name: skillDetail.skillName },
        create: {
          name: skillDetail.skillName,
          slug: slugify(skillDetail.skillName),
          usageCount: 1,
        },
        update: { usageCount: { increment: 1 } },
      });

      await tx.skillListingDetail.create({
        data: {
          listingId: listing.id,
          skillId: skill.id,
          estimatedHours: skillDetail.estimatedHours ?? null,
          deliveryMethod: skillDetail.deliveryMethod,
          exchangeFor: skillDetail.exchangeFor ?? null,
        },
      });
    }

    if (type === "TOOL_LISTING" && toolDetail) {
      await tx.toolListingDetail.create({
        data: {
          listingId: listing.id,
          category: toolDetail.category,
          condition: toolDetail.condition,
          depositAmount: toolDetail.depositAmount ?? null,
          maxBorrowDays: toolDetail.maxBorrowDays ?? null,
          pickupLocation: toolDetail.pickupLocation ?? null,
        },
      });
    }

    logger.info(`Listing created: ${listing.id} by user ${userId}`);
    return listing.id;
  });
}

// ── Authenticated: update listing ─────────────────────────────────────────────

export async function updateListing(
  listingId: string,
  userId: string,
  data: UpdateListingInput,
) {
  const { title, description, tags, status, skillDetail, toolDetail, latitude, longitude, locationName, categoryId } = data;

  return prisma.$transaction(async (tx) => {
    // Ownership check inside transaction to prevent TOCTOU race
    const existing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { userId: true, type: true },
    });
    if (!existing) return null;
    if (existing.userId !== userId) return "forbidden" as const;

    await tx.listing.update({
      where: { id: listingId },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
        ...(locationName !== undefined ? { locationName } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
      },
    });

    if (existing.type === "SKILL_OFFER" && skillDetail) {
      await tx.skillListingDetail.update({
        where: { listingId },
        data: {
          ...(skillDetail.estimatedHours !== undefined
            ? { estimatedHours: skillDetail.estimatedHours }
            : {}),
          ...(skillDetail.deliveryMethod !== undefined
            ? { deliveryMethod: skillDetail.deliveryMethod }
            : {}),
          ...(skillDetail.exchangeFor !== undefined
            ? { exchangeFor: skillDetail.exchangeFor }
            : {}),
        },
      });
    }

    if (existing.type === "TOOL_LISTING" && toolDetail) {
      await tx.toolListingDetail.update({
        where: { listingId },
        data: {
          ...(toolDetail.category !== undefined
            ? { category: toolDetail.category }
            : {}),
          ...(toolDetail.condition !== undefined
            ? { condition: toolDetail.condition }
            : {}),
          ...(toolDetail.depositAmount !== undefined
            ? { depositAmount: toolDetail.depositAmount }
            : {}),
          ...(toolDetail.maxBorrowDays !== undefined
            ? { maxBorrowDays: toolDetail.maxBorrowDays }
            : {}),
          ...(toolDetail.pickupLocation !== undefined
            ? { pickupLocation: toolDetail.pickupLocation }
            : {}),
        },
      });
    }

    return tx.listing.findUnique({
      where: { id: listingId },
      include: listingInclude,
    });
  });
}

// ── Authenticated: delete listing ─────────────────────────────────────────────

export async function deleteListing(listingId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { userId: true },
    });
    if (!existing) return null;
    if (existing.userId !== userId) return "forbidden" as const;

    await tx.listing.delete({ where: { id: listingId } });
    logger.info(`Listing deleted: ${listingId} by user ${userId}`);
    return true;
  });
}

// ── Authenticated: my listings ────────────────────────────────────────────────

export async function getMyListings(userId: string) {
  const listings = await prisma.listing.findMany({
    where: { userId },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  });

  const savedRows = await prisma.savedListing.findMany({
    where: { userId, listingId: { in: listings.map((l) => l.id) } },
    select: { listingId: true },
  });
  const savedIds = new Set(savedRows.map((s) => s.listingId));

  return listings.map((l) => ({
    ...serializeListing(l, userId, savedIds.has(l.id)),
    coverImage: l.media[0]?.path ?? null,
  }));
}

// ── Authenticated: toggle save ────────────────────────────────────────────────

export async function toggleSave(listingId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({ where: { id: listingId }, select: { id: true } });
    if (!listing) return null;

    const existing = await tx.savedListing.findUnique({
      where: { userId_listingId: { userId, listingId } },
      select: { userId: true },
    });

    const nowSaved = !existing;
    if (existing) {
      await tx.savedListing.delete({ where: { userId_listingId: { userId, listingId } } });
    } else {
      await tx.savedListing.create({ data: { userId, listingId } });
    }

    const updated = await tx.listing.update({
      where: { id: listingId },
      data: { saveCount: nowSaved ? { increment: 1 } : { decrement: 1 } },
      select: { saveCount: true },
    });

    return { isSaved: nowSaved, saveCount: Math.max(0, updated.saveCount) };
  });
}

// ── Authenticated: get saved listings ────────────────────────────────────────

export async function getSavedListings(userId: string) {
  const saved = await prisma.savedListing.findMany({
    where: { userId },
    include: { listing: { include: listingInclude } },
    orderBy: { savedAt: "desc" },
  });

  return saved.map((s) => ({
    ...serializeListing(s.listing, userId, true),
    coverImage: s.listing.media[0]?.path ?? null,
  }));
}

// ── Authenticated: listing media ──────────────────────────────────────────────

export async function addListingMedia(
  listingId: string,
  userId: string,
  file: { path: string; mimetype: string; size: number },
) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });
  if (!listing) return null;
  if (listing.userId !== userId) return "forbidden" as const;

  return prisma.$transaction(async (tx) => {
    const count = await tx.listingMedia.count({ where: { listingId } });
    if (count >= 10) throw Object.assign(new Error("Media limit reached"), { status: 400 });
    return tx.listingMedia.create({
      data: {
        listingId,
        type: "IMAGE",
        path: file.path,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        order: count + 1,
      },
    });
  });
}

export async function removeListingMedia(
  listingId: string,
  mediaId: string,
  userId: string,
) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });
  if (!listing) return null;
  if (listing.userId !== userId) return "forbidden" as const;

  const media = await prisma.listingMedia.findUnique({ where: { id: mediaId } });
  if (!media || media.listingId !== listingId) return null;

  await prisma.listingMedia.delete({ where: { id: mediaId } });
  return media.path;
}
