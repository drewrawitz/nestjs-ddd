/*
  Warnings:

  - You are about to drop the column `authTag` on the `user_backup_codes` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `user_backup_codes` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `user_backup_codes` table. All the data in the column will be lost.
  - Added the required column `hashedCode` to the `user_backup_codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_backup_codes" DROP COLUMN "authTag",
DROP COLUMN "code",
DROP COLUMN "iv",
ADD COLUMN     "hashedCode" TEXT NOT NULL;
