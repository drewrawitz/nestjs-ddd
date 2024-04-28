/*
  Warnings:

  - Added the required column `updatedAt` to the `user_backup_codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_backup_codes" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
