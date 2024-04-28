-- CreateTable
CREATE TABLE "user_backup_codes" (
    "userId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_backup_codes_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "user_backup_codes" ADD CONSTRAINT "user_backup_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
