-- Add saved searches, company reviews, and alert delivery tracking.

CREATE TABLE "SavedSearch" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "queryJson" JSONB NOT NULL,
  "lastSentAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyReview" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "userId" TEXT,
  "rating" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "comment" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CompanyReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobAlertDelivery" (
  "id" TEXT NOT NULL,
  "savedSearchId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "JobAlertDelivery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SavedSearch_userId_isActive_idx" ON "SavedSearch"("userId", "isActive");
CREATE INDEX "CompanyReview_companyId_status_idx" ON "CompanyReview"("companyId", "status");
CREATE INDEX "JobAlertDelivery_jobId_idx" ON "JobAlertDelivery"("jobId");
CREATE UNIQUE INDEX "JobAlertDelivery_savedSearchId_jobId_key" ON "JobAlertDelivery"("savedSearchId", "jobId");

ALTER TABLE "SavedSearch"
  ADD CONSTRAINT "SavedSearch_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyReview"
  ADD CONSTRAINT "CompanyReview_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobAlertDelivery"
  ADD CONSTRAINT "JobAlertDelivery_savedSearchId_fkey"
  FOREIGN KEY ("savedSearchId") REFERENCES "SavedSearch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JobAlertDelivery"
  ADD CONSTRAINT "JobAlertDelivery_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
