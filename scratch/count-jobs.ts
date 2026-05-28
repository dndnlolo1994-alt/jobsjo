import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.job.count();
  console.log("Total jobs in database:", count);
  
  const statusCounts = await prisma.job.groupBy({
    by: ['status'],
    _count: true
  });
  console.log("Status breakdowns:", statusCounts);
}

main().finally(() => prisma.$disconnect());
