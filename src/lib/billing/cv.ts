import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function ensureCvPdfBilling(userId: string, cvId?: string) {
  const seeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: { plan: true },
  });
  const isPlus = seeker?.plan === "PLUS";

  const existing = await prisma.billingRecord.findFirst({
    where: { userId, type: "CV_PDF", status: { in: ["UNPAID", "PAID", "WAIVED"] } },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    if (isPlus && existing.status === "UNPAID") {
      return prisma.billingRecord.update({
        where: { id: existing.id },
        data: { status: "WAIVED", adminNote: "إعفاء تلقائي لوجود باقة PLUS نشطة." },
      });
    }
    return existing;
  }

  return prisma.billingRecord.create({
    data: {
      userId,
      relatedCvId: cvId,
      type: "CV_PDF",
      amountJod: 2,
      status: (!env.REQUIRE_CV_PAYMENT || isPlus) ? "WAIVED" : "UNPAID",
      adminNote: isPlus
        ? "إعفاء تلقائي لوجود باقة PLUS نشطة."
        : (env.REQUIRE_CV_PAYMENT ? "تم إنشاء سجل دفع لتنزيل السيرة الذاتية." : "إعفاء تلقائي لأن بوابة الدفع معطلة في التطوير."),
    },
  });
}

export async function canDownloadCvPdf(userId: string) {
  if (!env.REQUIRE_CV_PAYMENT || env.ALLOW_FREE_CV_PDF || env.DEV_MODE) return true;

  const seeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId },
    select: { plan: true },
  });
  if (seeker?.plan === "PLUS") return true;

  const paid = await prisma.billingRecord.findFirst({
    where: { userId, type: "CV_PDF", status: { in: ["PAID", "WAIVED"] } },
  });
  return !!paid;
}
