import { createRequire } from "node:module";
createRequire(import.meta.url)("./load-env.cjs");
import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "info@jordan-job.shop";
const KEEP_NAME_TERMS = ["mohamad", "mohammad", "shanaileh", "alshanaileh", "محمد", "الشمايلة", "الشمايله"];

function matchesKeeperName(value: string | null | undefined) {
  const normalized = (value || "").toLowerCase();
  return KEEP_NAME_TERMS.some((term) => normalized.includes(term));
}

async function getCounts() {
  const [users, seekers, employers, cvs, jobs, companies, applications, billing, demoUsers] = await Promise.all([
    prisma.user.count(),
    prisma.jobSeekerProfile.count(),
    prisma.employerProfile.count(),
    prisma.cVProfile.count(),
    prisma.job.count(),
    prisma.company.count(),
    prisma.application.count(),
    prisma.billingRecord.count(),
    prisma.user.count({ where: { email: { endsWith: "@jojobs.local" } } }),
  ]);
  return { users, seekers, employers, cvs, jobs, companies, applications, billing, demoUsers };
}

async function findKeepers() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: ADMIN_EMAIL },
        { fullName: { contains: "Mohamad" } },
        { fullName: { contains: "Mohammad" } },
        { fullName: { contains: "محمد" } },
        { fullName: { contains: "shanaileh" } },
        { fullName: { contains: "الشمايلة" } },
      ],
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      jobSeekerProfile: { select: { plan: true, planExpiresAt: true } },
      cvProfile: { select: { id: true, fullName: true, jobTitle: true, email: true, qrEnabled: true, paymentStatus: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const cvUsers = await prisma.cVProfile.findMany({
    where: {
      OR: [
        { fullName: { contains: "Mohamad" } },
        { fullName: { contains: "Mohammad" } },
        { fullName: { contains: "محمد" } },
        { fullName: { contains: "shanaileh" } },
        { fullName: { contains: "الشمايلة" } },
      ],
    },
    select: {
      id: true,
      userId: true,
      fullName: true,
      jobTitle: true,
      email: true,
      qrEnabled: true,
      paymentStatus: true,
      user: {
        select: {
          email: true,
          fullName: true,
          jobSeekerProfile: { select: { plan: true, planExpiresAt: true } },
        },
      },
    },
  });

  return { users, cvUsers };
}

async function ensureMohamadPlus() {
  const candidates = await prisma.user.findMany({
    where: {
      role: "JOB_SEEKER",
      OR: [
        { fullName: { contains: "Mohamad" } },
        { fullName: { contains: "Mohammad" } },
        { fullName: { contains: "محمد" } },
        { fullName: { contains: "shanaileh" } },
        { fullName: { contains: "الشمايلة" } },
      ],
    },
    select: { id: true, email: true, fullName: true, jobSeekerProfile: { select: { id: true, plan: true } } },
  });

  const keeper = candidates.find((user) => matchesKeeperName(user.fullName) || matchesKeeperName(user.email));
  if (!keeper?.jobSeekerProfile) {
    throw new Error("Could not safely identify Mohamad Alshanaileh job seeker profile. Cleanup stopped.");
  }

  const planExpiresAt = new Date();
  planExpiresAt.setFullYear(planExpiresAt.getFullYear() + 1);

  await prisma.jobSeekerProfile.update({
    where: { id: keeper.jobSeekerProfile.id },
    data: { plan: "PLUS", planExpiresAt, publicProfile: true },
  });

  await prisma.cVProfile.updateMany({
    where: { userId: keeper.id },
    data: { qrEnabled: true, paymentStatus: "WAIVED" },
  });

  return keeper;
}

async function cleanupDemoUsers() {
  const keepers = await findKeepers();
  const keeperUserIds = new Set<string>([
    ...keepers.users.map((user) => user.id),
    ...keepers.cvUsers.map((cv) => cv.userId),
  ]);

  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@jojobs.local" } },
    select: { id: true, email: true, fullName: true },
  });
  const deletable = demoUsers.filter((user) => !keeperUserIds.has(user.id));

  const result = await prisma.user.deleteMany({
    where: { id: { in: deletable.map((user) => user.id) } },
  });

  return {
    deletedDemoUsers: result.count,
    preservedKeepers: [...keeperUserIds].length,
    skippedDemoUsers: demoUsers.length - deletable.length,
  };
}

async function main() {
  const mode = process.argv[2] || "inspect";

  if (mode === "inspect") {
    console.log(JSON.stringify({ counts: await getCounts(), keepers: await findKeepers() }, null, 2));
    return;
  }

  if (mode === "cleanup-demo") {
    const before = await getCounts();
    const plusKeeper = await ensureMohamadPlus();
    const cleanup = await cleanupDemoUsers();
    const after = await getCounts();
    console.log(JSON.stringify({ before, plusKeeper, cleanup, after }, null, 2));
    return;
  }

  throw new Error(`Unknown mode: ${mode}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
