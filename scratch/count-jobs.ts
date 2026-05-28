import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const totalJobs = await prisma.job.count();
  const publishedJobs = await prisma.job.count({ where: { status: "PUBLISHED" } });
  
  const sources = await prisma.job.groupBy({
    by: ["sourceType"],
    _count: {
      _all: true
    }
  });

  console.log("================ DATABASE JOB SUMMARY ================");
  console.log(`Total Jobs: ${totalJobs}`);
  console.log(`Published Jobs: ${publishedJobs}`);
  console.log("Jobs by Source Type:");
  sources.forEach((s) => {
    console.log(` - ${s.sourceType}: ${s._count._all}`);
  });
  console.log("======================================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
