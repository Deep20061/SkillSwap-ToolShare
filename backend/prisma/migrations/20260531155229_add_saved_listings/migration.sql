-- CreateTable
CREATE TABLE "saved_listing" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_listing_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateIndex
CREATE INDEX "saved_listing_listingId_idx" ON "saved_listing"("listingId");

-- AddForeignKey
ALTER TABLE "saved_listing" ADD CONSTRAINT "saved_listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listing" ADD CONSTRAINT "saved_listing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
