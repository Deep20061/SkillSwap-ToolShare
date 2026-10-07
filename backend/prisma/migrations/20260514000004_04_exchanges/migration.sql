-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateTable
CREATE TABLE "exchange_contract" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "counterListingId" TEXT,
    "conversationId" TEXT,
    "message" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelledById" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_contract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exchange_contract_conversationId_key" ON "exchange_contract"("conversationId");

-- CreateIndex
CREATE INDEX "exchange_contract_requesterId_idx" ON "exchange_contract"("requesterId");

-- CreateIndex
CREATE INDEX "exchange_contract_providerId_idx" ON "exchange_contract"("providerId");

-- CreateIndex
CREATE INDEX "exchange_contract_listingId_idx" ON "exchange_contract"("listingId");

-- CreateIndex
CREATE INDEX "exchange_contract_status_idx" ON "exchange_contract"("status");

-- AddForeignKey
ALTER TABLE "exchange_contract" ADD CONSTRAINT "exchange_contract_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_contract" ADD CONSTRAINT "exchange_contract_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_contract" ADD CONSTRAINT "exchange_contract_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_contract" ADD CONSTRAINT "exchange_contract_counterListingId_fkey" FOREIGN KEY ("counterListingId") REFERENCES "listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_contract" ADD CONSTRAINT "exchange_contract_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
