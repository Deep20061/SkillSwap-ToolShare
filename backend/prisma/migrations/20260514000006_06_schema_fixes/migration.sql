-- ExchangeContract: replace plain text message with encrypted fields
ALTER TABLE "exchange_contract" DROP COLUMN "message",
ADD COLUMN "encryptedMessage" TEXT,
ADD COLUMN "messageIv" TEXT;

-- ExchangeContract: enforce FK on cancelledById
ALTER TABLE "exchange_contract" ADD CONSTRAINT "exchange_contract_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Skill: track usage count for suggestions
ALTER TABLE "skill" ADD COLUMN "usageCount" INTEGER NOT NULL DEFAULT 1;

-- Review: enforce 1-5 rating at the database level
ALTER TABLE "review" ADD CONSTRAINT "review_rating_check" CHECK (rating >= 1 AND rating <= 5);
