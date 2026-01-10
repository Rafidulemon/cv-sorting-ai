/*
  Warnings:

  - Added the required column `planSlug` to the `OrganizationSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "planSlug" TEXT NOT NULL DEFAULT 'free';
UPDATE "Organization"
SET "planSlug" = CASE "planTier"
  WHEN 'FREEMIUM' THEN 'free'
  WHEN 'STANDARD' THEN 'standard'
  ELSE 'premium'
END;

-- Add column nullable, backfill, then make NOT NULL
ALTER TABLE "OrganizationSubscription" ADD COLUMN "planSlug" TEXT;
UPDATE "OrganizationSubscription"
SET "planSlug" = CASE "plan"
  WHEN 'FREEMIUM' THEN 'free'
  WHEN 'STANDARD' THEN 'standard'
  ELSE 'premium'
END;
ALTER TABLE "OrganizationSubscription" ALTER COLUMN "planSlug" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Organization_planSlug_idx" ON "Organization"("planSlug");

-- CreateIndex
CREATE INDEX "OrganizationSubscription_planSlug_idx" ON "OrganizationSubscription"("planSlug");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_planSlug_fkey" FOREIGN KEY ("planSlug") REFERENCES "PricingPlan"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationSubscription" ADD CONSTRAINT "OrganizationSubscription_planSlug_fkey" FOREIGN KEY ("planSlug") REFERENCES "PricingPlan"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
