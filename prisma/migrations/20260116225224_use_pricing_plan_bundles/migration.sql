-- Move credit bundles into PricingPlan
ALTER TABLE "PricingPlan" ADD COLUMN IF NOT EXISTS "creditBundles" JSONB;

-- Drop standalone credit bundle table now that bundles live on PricingPlan
DROP TABLE IF EXISTS "CreditBundle";
