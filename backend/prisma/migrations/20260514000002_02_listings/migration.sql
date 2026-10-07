-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SKILL_OFFER', 'TOOL_LISTING');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('IN_PERSON', 'REMOTE', 'BOTH');

-- CreateEnum
CREATE TYPE "ToolCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "listing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_listing_detail" (
    "listingId" TEXT NOT NULL,
    "skillId" INTEGER NOT NULL,
    "estimatedHours" DOUBLE PRECISION,
    "deliveryMethod" "DeliveryMethod" NOT NULL,
    "exchangeFor" TEXT,

    CONSTRAINT "skill_listing_detail_pkey" PRIMARY KEY ("listingId")
);

-- CreateTable
CREATE TABLE "tool_listing_detail" (
    "listingId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" "ToolCondition" NOT NULL,
    "depositAmount" INTEGER,
    "maxBorrowDays" INTEGER,
    "pickupLocation" TEXT,

    CONSTRAINT "tool_listing_detail_pkey" PRIMARY KEY ("listingId")
);

-- CreateTable
CREATE TABLE "listing_media" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_userId_idx" ON "listing"("userId");

-- CreateIndex
CREATE INDEX "listing_type_status_idx" ON "listing"("type", "status");

-- CreateIndex
CREATE INDEX "listing_media_listingId_idx" ON "listing_media"("listingId");

-- AddForeignKey
ALTER TABLE "listing" ADD CONSTRAINT "listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_listing_detail" ADD CONSTRAINT "skill_listing_detail_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_listing_detail" ADD CONSTRAINT "skill_listing_detail_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tool_listing_detail" ADD CONSTRAINT "tool_listing_detail_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_media" ADD CONSTRAINT "listing_media_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
