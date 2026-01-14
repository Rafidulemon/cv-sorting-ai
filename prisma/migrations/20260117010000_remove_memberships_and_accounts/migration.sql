-- Add role and convert profileStatus on User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'VIEWER';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileStatus_tmp" "MembershipStatus";
UPDATE "User"
SET "profileStatus_tmp" = CASE
  WHEN LOWER(COALESCE("profileStatus"::text, '')) = 'active' THEN 'ACTIVE'
  WHEN LOWER(COALESCE("profileStatus"::text, '')) = 'pending' THEN 'PENDING'
  WHEN LOWER(COALESCE("profileStatus"::text, '')) = 'disabled' THEN 'DISABLED'
  ELSE NULL
END::"MembershipStatus";
ALTER TABLE "User" DROP COLUMN IF EXISTS "profileStatus";
ALTER TABLE "User" RENAME COLUMN "profileStatus_tmp" TO "profileStatus";

-- Merge subscription data into Organization
ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
  ADD COLUMN IF NOT EXISTS "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
  ADD COLUMN IF NOT EXISTS "renewsOn" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "startsOn" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "endsOn" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "provider" TEXT,
  ADD COLUMN IF NOT EXISTS "externalCustomerId" TEXT,
  ADD COLUMN IF NOT EXISTS "externalSubscriptionId" TEXT;

UPDATE "Organization"
SET "startsOn" = COALESCE("startsOn", "createdAt")
WHERE "startsOn" IS NULL;

-- Drop unused tables
DROP TABLE IF EXISTS "Membership";
DROP TABLE IF EXISTS "Account";
DROP TABLE IF EXISTS "OrganizationSubscription";
