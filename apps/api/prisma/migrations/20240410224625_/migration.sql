/*
  Warnings:

  - Added the required column `interval` to the `StripeSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intervalCount` to the `StripeSubscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `StripeSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StripeSubscription" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'usd',
ADD COLUMN     "interval" TEXT NOT NULL,
ADD COLUMN     "intervalCount" INTEGER NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL;
