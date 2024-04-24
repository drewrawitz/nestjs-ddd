/*
  Warnings:

  - Added the required column `authTag` to the `user_mfa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_mfa" ADD COLUMN     "authTag" TEXT NOT NULL;
