import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== RESETTING ADMIN DASHBOARD STATISTICS ===");

  // 1. Delete all mock applications
  console.log("Clearing all job applications...");
  const deletedApps = await prisma.application.deleteMany();
  console.log(`Deleted ${deletedApps.count} applications.`);

  // 2. Delete all company claims
  console.log("Clearing all company claim requests...");
  const deletedClaims = await prisma.companyClaim.deleteMany();
  console.log(`Deleted ${deletedClaims.count} claims.`);

  // 3. Delete all payment / billing records
  console.log("Clearing all payment and billing records...");
  const deletedBilling = await prisma.billingRecord.deleteMany();
  console.log(`Deleted ${deletedBilling.count} billing records.`);

  // 4. Reset job application counts to 0
  console.log("Resetting job application counters on all listings...");
  const updatedJobs = await prisma.job.updateMany({
    data: {
      applicationCount: 0
    }
  });
  console.log(`Reset application counters for ${updatedJobs.count} jobs.`);

  console.log("=== DATABASE CLEANUP COMPLETED SUCCESSFULLY ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
