-- Migrate PricingPlan.team from text to integer without dropping data
ALTER TABLE "PricingPlan" ADD COLUMN "team_int" INTEGER;

UPDATE "PricingPlan"
SET "team_int" = COALESCE(
  CASE
    WHEN "slug" = 'free' THEN 1
    WHEN "slug" = 'standard' THEN 5
    WHEN "slug" = 'premium' THEN 10
    ELSE NULL
  END,
  NULLIF(regexp_replace(COALESCE("team", ''), '\\D', '', 'g'), '')::integer,
  1
);

ALTER TABLE "PricingPlan" ALTER COLUMN "team_int" SET NOT NULL;
ALTER TABLE "PricingPlan" DROP COLUMN "team";
ALTER TABLE "PricingPlan" RENAME COLUMN "team_int" TO "team";
