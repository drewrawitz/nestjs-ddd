-- AlterTable
ALTER TABLE "StripeSubscription" ADD COLUMN     "isPausedIndefinitely" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pauseResumesAt" TIMESTAMP(3);
