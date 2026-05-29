import { prisma } from "../src/lib/prisma";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Checking Production Database Status...");
  try {
    const totalJobs = await prisma.job.count();
    const totalCompanies = await prisma.company.count();

    const jobsByStatus = await prisma.job.groupBy({
      by: ["status"],
      _count: {
        _all: true
      }
    });

    const publishedJobsCount = await prisma.job.count({
      where: { status: "PUBLISHED" }
    });

    console.log("\n================ PRODUCTION DATABASE REPORT ================");
    console.log(`- Total Jobs in Database: ${totalJobs}`);
    console.log(`- Total Companies in Database: ${totalCompanies}`);
    console.log("\nJob status breakdown:");
    for (const group of jobsByStatus) {
      console.log(`  * Status [${group.status}]: ${group._count._all} jobs`);
    }
    console.log(`\n- Verified PUBLISHED Jobs Count: ${publishedJobsCount}`);
    console.log("============================================================\n");
  } catch (error) {
    console.error("Database connection or query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
