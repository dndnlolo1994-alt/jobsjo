import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

/** عناوين الأدمن المحفوظة دائماً عند إعادة الضبط الكاملة */
export function getPreservedAdminEmails(): string[] {
  const emails = new Set<string>();
  for (const e of env.ADMIN_EMAILS) {
    emails.add(e.toLowerCase());
  }
  emails.add("info@jordan-job.shop");
  return [...emails];
}

export type PurgeStats = {
  jobAlertDeliveries: number;
  savedSearches: number;
  applications: number;
  savedJobs: number;
  reportedJobs: number;
  companyClaims: number;
  billingRecords: number;
  companyReviews: number;
  jobs: number;
  jobSources: number;
  companies: number;
  cvProfiles: number;
  jobSeekerProfiles: number;
  employerProfiles: number;
  otpVerifications: number;
  pageViews: number;
  deletedUsers: number;
};

async function deleteAllPlatformContent(): Promise<Omit<PurgeStats, "deletedUsers">> {
  const [
    jobAlertDeliveries,
    savedSearches,
    applications,
    savedJobs,
    reportedJobs,
    companyClaims,
    billingRecords,
    companyReviews,
    jobs,
    jobSources,
    companies,
    cvProfiles,
    jobSeekerProfiles,
    employerProfiles,
    otpVerifications,
    pageViews,
  ] = await prisma.$transaction([
    prisma.jobAlertDelivery.deleteMany(),
    prisma.savedSearch.deleteMany(),
    prisma.application.deleteMany(),
    prisma.savedJob.deleteMany(),
    prisma.reportedJob.deleteMany(),
    prisma.companyClaim.deleteMany(),
    prisma.billingRecord.deleteMany(),
    prisma.companyReview.deleteMany(),
    prisma.job.deleteMany(),
    prisma.jobSource.deleteMany(),
    prisma.company.deleteMany(),
    prisma.cVProfile.deleteMany(),
    prisma.jobSeekerProfile.deleteMany(),
    prisma.employerProfile.deleteMany(),
    prisma.otpVerification.deleteMany(),
    prisma.pageView.deleteMany(),
  ]);

  return {
    jobAlertDeliveries: jobAlertDeliveries.count,
    savedSearches: savedSearches.count,
    applications: applications.count,
    savedJobs: savedJobs.count,
    reportedJobs: reportedJobs.count,
    companyClaims: companyClaims.count,
    billingRecords: billingRecords.count,
    companyReviews: companyReviews.count,
    jobs: jobs.count,
    jobSources: jobSources.count,
    companies: companies.count,
    cvProfiles: cvProfiles.count,
    jobSeekerProfiles: jobSeekerProfiles.count,
    employerProfiles: employerProfiles.count,
    otpVerifications: otpVerifications.count,
    pageViews: pageViews.count,
  };
}

/** يحذف كل الوظائف/الشركات/التقديمات + حسابات @jojobs.local فقط */
export async function purgeDemoSeedData(): Promise<PurgeStats> {
  const content = await deleteAllPlatformContent();
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { endsWith: "@jojobs.local" } },
  });
  return { ...content, deletedUsers: deletedUsers.count };
}

/** يحذف كل محتوى المنصة ويبقي حسابات الأدمن المعرّفة في ADMIN_EMAILS */
export async function resetPlatformKeepAdmins(): Promise<PurgeStats> {
  const preserve = getPreservedAdminEmails();
  const content = await deleteAllPlatformContent();
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: { notIn: preserve } },
  });
  return { ...content, deletedUsers: deletedUsers.count };
}

export async function getPlatformDataCounts() {
  const [seekers, employers, jobs, companies, applications, demoUsers] = await Promise.all([
    prisma.user.count({ where: { role: "JOB_SEEKER" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.job.count(),
    prisma.company.count(),
    prisma.application.count(),
    prisma.user.count({ where: { email: { endsWith: "@jojobs.local" } } }),
  ]);
  return { seekers, employers, jobs, companies, applications, demoUsers };
}
