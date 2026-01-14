-- Rename User.title to User.designation
ALTER TABLE "User" RENAME COLUMN "title" TO "designation";

-- Store storage keys instead of full URLs for organization logos
UPDATE "Organization"
SET "logo" = regexp_replace(regexp_replace("logo", '^https?://[^/]+/', ''), '^/+', '')
WHERE "logo" IS NOT NULL AND "logo" LIKE 'http%';
