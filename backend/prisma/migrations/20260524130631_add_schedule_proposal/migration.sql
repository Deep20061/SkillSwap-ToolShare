-- AlterEnum
ALTER TYPE "message_type" ADD VALUE 'SCHEDULE_PROPOSAL';

-- CreateTable
CREATE TABLE "schedule_proposal" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "slots" JSONB NOT NULL,
    "confirmedSlot" INTEGER,
    "confirmedAt" TIMESTAMP(3),
    "confirmedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_proposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_proposal_messageId_key" ON "schedule_proposal"("messageId");

-- AddForeignKey
ALTER TABLE "schedule_proposal" ADD CONSTRAINT "schedule_proposal_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_proposal" ADD CONSTRAINT "schedule_proposal_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
