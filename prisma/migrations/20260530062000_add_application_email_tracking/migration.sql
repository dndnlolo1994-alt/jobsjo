-- Track provider-accepted email notifications for job applications.
ALTER TABLE "Application"
  ADD COLUMN "applicantConfirmationSentAt" TIMESTAMP(3),
  ADD COLUMN "employerNotificationSentAt" TIMESTAMP(3),
  ADD COLUMN "statusNotificationSentAt" TIMESTAMP(3),
  ADD COLUMN "employerNotificationTo" TEXT,
  ADD COLUMN "notificationError" TEXT;

