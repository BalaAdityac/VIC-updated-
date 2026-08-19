-- Recruiter workflow stabilization
-- Prerequisite: 20260814120000_recruiter_workflow has been applied.

CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

ALTER TABLE "Interview"
ADD COLUMN "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED';

CREATE UNIQUE INDEX "Interview_applicationId_key" ON "Interview"("applicationId");
