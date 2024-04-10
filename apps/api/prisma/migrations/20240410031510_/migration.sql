/*
  Warnings:

  - You are about to drop the column `lastError` on the `StripeEvent` table. All the data in the column will be lost.
  - You are about to drop the column `processed` on the `StripeEvent` table. All the data in the column will be lost.
  - You are about to drop the column `retryCount` on the `StripeEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StripeEvent" DROP COLUMN "lastError",
DROP COLUMN "processed",
DROP COLUMN "retryCount";
