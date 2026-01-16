-- Add payment details json column to store bank/mfs info per org
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "paymentDetails" JSONB;
