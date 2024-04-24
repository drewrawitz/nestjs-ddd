-- CreateEnum
CREATE TYPE "MFAType" AS ENUM ('TOTP');

-- CreateTable
CREATE TABLE "user_mfa" (
    "id" SERIAL NOT NULL,
    "userId" UUID NOT NULL,
    "type" "MFAType" NOT NULL,
    "secret" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_mfa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_mfa_userId_type_key" ON "user_mfa"("userId", "type");

-- AddForeignKey
ALTER TABLE "user_mfa" ADD CONSTRAINT "user_mfa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
