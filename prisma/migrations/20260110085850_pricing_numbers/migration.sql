-- Cast existing text values to integers by stripping non-digits.
ALTER TABLE "PricingPlan"
ALTER COLUMN "price" TYPE INTEGER USING (regexp_replace("price", '[^0-9]', '', 'g')::integer),
ALTER COLUMN "topUp" TYPE INTEGER USING (regexp_replace("topUp", '[^0-9]', '', 'g')::integer);
