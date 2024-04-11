/*
  Warnings:

  - Made the column `metadata` on table `StripeSubscription` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StripeEvent" ALTER COLUMN "payload" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "StripeSubscription" ALTER COLUMN "metadata" SET NOT NULL,
ALTER COLUMN "metadata" SET DEFAULT '{}';
