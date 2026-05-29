import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { canDownloadCvPdf, ensureCvPdfBilling } from "@/lib/billing/cv";
import { CvPreview } from "@/components/cv/CvPreview";
import { PrintButton } from "@/components/cv/PrintButton";
import { fromCsv, formatDateArabic } from "@/lib/utils";
import { env } from "@/lib/env";
import { tplCvPaymentInfo } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "تنزيل السيرة PDF", robots: { index: false, follow: false } };

export default async function CvDownloadPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const user = await requireJobSeeker();
  const sp = await searchParams;
  const lang = sp.lang || "ar";

  const [cv, seeker] = await Promise.all([
    prisma.cVProfile.findUnique({ where: { userId: user.id }, include: { experiences: true, educations: true, skills: true, certifications: true } }),
    prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } }),
  ]);
  if (!cv) return <section className="container-jo py-10"><div className="card-pad">لا توجد سيرة محفوظة بعد. <Link className="link" href="/me/cv">أنشئ سيرتك الآن</Link></div></section>;
  const billing = await ensureCvPdfBilling(user.id, cv.id);
  const allowed = await canDownloadCvPdf(user.id);
  const fileName = `CV-${cv.fullName}-${new Date().toISOString().slice(0, 10)}.pdf`;

  if (!allowed) {
    return (
      <section className="container-jo py-10 max-w-2xl">
        <div className="card-pad">
          <h1 className="section-title">تنزيل PDF يحتاج تفعيل الدفع</h1>
          <p className="text-navy-700 leading-7">رسوم تنزيل السيرة الذاتية هي 2 دينار. حالة السجل: {billing.status}. بعد الدفع اليدوي يقوم الأدمن بتعليمها مدفوعة أو معفاة.</p>
          <a className="btn-primary mt-4" href={tplCvPaymentInfo({ phone: env.PLATFORM_WHATSAPP, amount: 2 })} target="_blank">طلب تعليمات الدفع عبر واتساب</a>
        </div>
      </section>
    );
  }

  return (
    <section className="container-jo py-8">
      <div className="no-print card-pad mb-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">جاهز للطباعة كـ PDF</h1>
          <p className="text-sm text-navy-600">من نافذة الطباعة اختر: حفظ كملف PDF. اسم الملف المقترح: {fileName}. تاريخ اليوم: {formatDateArabic(new Date())}</p>
        </div>
        <PrintButton />
      </div>
      <CvPreview cv={cv} userSkills={fromCsv(seeker?.skills)} lang={lang} isPlus={seeker?.plan === "PLUS"} />
    </section>
  );
}
