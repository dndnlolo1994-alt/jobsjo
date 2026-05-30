/**
 * إنشاء أو تحديث حساب أدمن (إنتاج).
 *
 * الاستخدام:
 *   npx tsx scripts/bootstrap-admin.ts info@jordan-job.shop "YourStrongPassword"
 *
 * أو:
 *   set ADMIN_BOOTSTRAP_PASSWORD=YourStrongPassword
 *   npx tsx scripts/bootstrap-admin.ts info@jordan-job.shop
 */
import { createRequire } from "node:module";
createRequire(import.meta.url)("./load-env.cjs");
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.argv[2] || "info@jordan-job.shop").trim().toLowerCase();
  const password = process.argv[3] || process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!password || password.length < 10) {
    console.error("❌ كلمة المرور مطلوبة (10 أحرف على الأقل).");
    console.error('   npx tsx scripts/bootstrap-admin.ts info@jordan-job.shop "YourStrongPassword"');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
        isActive: true,
        isSuspended: false,
        passwordHash,
        fullName: existing.fullName || "مدير منصة وظائف الأردن",
      },
    });
    console.log(`✅ تم تحديث حساب الأدمن الموجود: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        email,
        fullName: "مدير منصة وظائف الأردن",
        phone: "962790000001",
        role: "ADMIN",
        isActive: true,
        isSuspended: false,
        passwordHash,
      },
    });
    console.log(`✅ تم إنشاء حساب أدمن جديد: ${email}`);
  }

  console.log("   الدور: ADMIN | نشط: نعم | OTP غير مطلوب عند الدخول");
  console.log(`   تأكد أن ADMIN_EMAILS على Vercel يتضمن: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
