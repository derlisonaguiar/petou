CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "businesses"
  ADD COLUMN "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'PENDING';

UPDATE "businesses" SET "registrationStatus" = 'APPROVED';

ALTER TABLE "pet_sitters"
  ADD COLUMN "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'PENDING';

ALTER TABLE "users"
  ADD COLUMN "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "business_reviews" (
  "id" TEXT NOT NULL,
  "businessId" TEXT NOT NULL,
  "tutorId" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "business_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "business_reviews_appointmentId_key" ON "business_reviews"("appointmentId");
CREATE INDEX "business_reviews_businessId_createdAt_idx" ON "business_reviews"("businessId", "createdAt");
CREATE INDEX "business_reviews_tutorId_idx" ON "business_reviews"("tutorId");

ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
