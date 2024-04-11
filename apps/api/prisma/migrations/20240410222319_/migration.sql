/*
  Warnings:

  - Added the required column `planId` to the `StripeSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StripeSubscription" ADD COLUMN     "planId" TEXT NOT NULL;
