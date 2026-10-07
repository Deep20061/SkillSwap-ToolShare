import prisma from "../../lib/prisma";
import logger from "../../lib/logger";
import { deleteMediaFile } from "../../lib/media";
import type { UpdateProfileInput } from "./profile.validation";

export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      // email deliberately omitted — public endpoint
    },
  });
  if (!user) return null;

  const profile = await prisma.userProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: {
      id: true,
      userId: true,
      bio: true,
      location: true,
      timezone: true,
      phone: true,
      avatarUrl: true,
      isIdentityVerified: true,
      rating: true,
      reviewCount: true,
      createdAt: true,
      updatedAt: true,
      // latitude and longitude intentionally excluded from public endpoint
    },
  });

  return { user, profile: profile ?? null };
}

export async function getProfile(userId: string) {
  const [user, profile] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    }),
    prisma.userProfile.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }),
  ]);

  return { user, profile };
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const { name, ...profileFields } = data;

  // Build the profile update object, including nulls (to allow clearing fields)
  // but excluding undefined (meaning "not provided / don't touch").
  const profileUpdate: Partial<
    Record<"bio" | "location" | "timezone" | "phone", string | null>
  > = {};
  if (profileFields.bio !== undefined) profileUpdate.bio = profileFields.bio;
  if (profileFields.location !== undefined)
    profileUpdate.location = profileFields.location;
  if (profileFields.timezone !== undefined)
    profileUpdate.timezone = profileFields.timezone;
  if (profileFields.phone !== undefined)
    profileUpdate.phone = profileFields.phone;

  await prisma.$transaction(async (tx) => {
    if (name !== undefined) {
      await tx.user.update({ where: { id: userId }, data: { name } });
    }

    await tx.userProfile.upsert({
      where: { userId },
      create: { userId, ...profileUpdate },
      update: profileUpdate,
    });
  });

  return getProfile(userId);
}

export async function updateAvatar(userId: string, relativePath: string) {
  const existing = await prisma.userProfile.findUnique({
    where: { userId },
    select: { avatarUrl: true },
  });

  await prisma.userProfile.upsert({
    where: { userId },
    create: { userId, avatarUrl: relativePath },
    update: { avatarUrl: relativePath },
  });

  // Delete the old file after the DB write succeeds so we never orphan the
  // new file if the DB write fails. deleteMediaFile is non-fatal and
  // handles path-traversal guards internally.
  if (existing?.avatarUrl && existing.avatarUrl !== relativePath) {
    await deleteMediaFile(existing.avatarUrl);
  }

  logger.info(`Avatar updated for user ${userId}`);
}

