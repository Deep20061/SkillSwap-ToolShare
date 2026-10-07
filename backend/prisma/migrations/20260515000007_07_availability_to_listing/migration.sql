-- AlterTable: add optional listingId FK to availability so a slot can be
-- pinned to a specific listing (e.g. "I'm only available for my guitar
-- lesson listing on Monday mornings"). Nullable — existing rows keep NULL.

ALTER TABLE "availability" ADD COLUMN "listingId" TEXT;

-- CreateIndex
CREATE INDEX "availability_listingId_idx" ON "availability"("listingId");

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "listing"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
