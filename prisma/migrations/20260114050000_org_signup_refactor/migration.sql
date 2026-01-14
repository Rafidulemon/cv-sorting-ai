-- CreateEnum
CREATE TYPE "OrganizationStatus" AS ENUM ('PENDING', 'EMAIL_VERIFIED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "companyEmail" TEXT,
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "SignupRequest";

-- DropEnum
DROP TYPE "SignupStatus";
