-- CreateEnum
CREATE TYPE "message_type" AS ENUM ('USER', 'CONTRACT_PROPOSAL');

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "contractId" TEXT,
ADD COLUMN     "type" "message_type" NOT NULL DEFAULT 'USER';
