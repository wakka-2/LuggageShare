-- Wallet credits, referrals, admin flag, and top-up requests.
-- Additive only — safe on a populated database.

-- AlterTable: users — admin flag + referral graph + unique invite code
ALTER TABLE "users" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "inviteCode" TEXT;
ALTER TABLE "users" ADD COLUMN "referredById" TEXT;

-- Unique invite code
CREATE UNIQUE INDEX "users_inviteCode_key" ON "users"("inviteCode");

-- Self-referential referrer FK
ALTER TABLE "users" ADD CONSTRAINT "users_referredById_fkey"
  FOREIGN KEY ("referredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: topup_requests
CREATE TABLE "topup_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "topup_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "topup_requests_status_createdAt_idx" ON "topup_requests"("status", "createdAt");
CREATE INDEX "topup_requests_userId_createdAt_idx" ON "topup_requests"("userId", "createdAt");

ALTER TABLE "topup_requests" ADD CONSTRAINT "topup_requests_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
