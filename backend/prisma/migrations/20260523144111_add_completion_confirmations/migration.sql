-- AlterTable
ALTER TABLE "exchange_contract" ADD COLUMN     "providerConfirmedComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requesterConfirmedComplete" BOOLEAN NOT NULL DEFAULT false;
