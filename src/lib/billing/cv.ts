import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function ensureCvPdfBilling(userId: string, cvId?: string) {
  const existing = await prisma.billingRecord.findFirst({
    where: { userId, type: "CV_PDF", status: { in: ["UNPAID", "PAID", "WAIVED"] } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;
  return prisma.billingRecord.create({
    data: {
      userId,
      relatedCvId: cvId,
      type: "CV_PDF",
      amountJod: 2,
      status: env.REQUIRE_CV_PAYMENT ? "UNPAID" : "WAIVED",
      adminNote: env.REQUIRE_CV_PAYMENT ? "تم إنشاء سجل دفع لتنزيل السيرة الذاتية." : "إعفاء تلقائي لأن بوابة الدفع معطلة في التطوير.",
    },
  });
}

export async function canDownloadCvPdf(userId: string) {
  if (!env.REQUIRE_CV_PAYMENT || env.ALLOW_FREE_CV_PDF || env.DEV_MODE) return true;
  const paid = await prisma.billingRecord.findFirst({
    where: { userId, type: "CV_PDF", status: { in: ["PAID", "WAIVED"] } },
  });
  return !!paid;
}
