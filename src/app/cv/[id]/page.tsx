import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "التحقق من السيرة الذاتية",
  robots: { index: false, follow: false },
};

export default async function CvVerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const cv = await prisma.cVProfile.findFirst({
    where: { OR: [{ userId: id }, { id }] },
    select: { fullName: true, jobTitle: true, city: true, updatedAt: true, userId: true },
  });

  const seeker = cv
    ? await prisma.jobSeekerProfile.findUnique({ where: { userId: cv.userId }, select: { plan: true } })
    : null;
  const isPlus = seeker?.plan === "PLUS";

  if (!cv) {
    return (
      <section className="container-jo py-16 max-w-lg">
        <div className="card-pad text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mx-auto border border-rose-100">
            ✕
          </div>
          <h1 className="text-xl font-extrabold text-navy-900">رابط التحقق غير صالح</h1>
          <p className="text-sm text-navy-600 leading-7">
            لم نتمكن من العثور على سيرة ذاتية مرتبطة بهذا الرمز. قد يكون الرابط منتهي الصلاحية أو غير صحيح.
          </p>
          <Link href="/" className="btn-primary inline-block">العودة للصفحة الرئيسية</Link>
        </div>
      </section>
    );
  }

  const updated = new Intl.DateTimeFormat("ar-JO", { dateStyle: "long" }).format(cv.updatedAt);

  return (
    <section className="container-jo py-16 max-w-lg">
      <div className="card-pad text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto border border-emerald-100">
          ✓
        </div>
        <div>
          <span className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
            سيرة ذاتية موثّقة عبر {env.SITE_NAME}
          </span>
        </div>
        <div className="border-t border-b border-navy-50 py-5">
          <h1 className="text-2xl font-extrabold text-navy-900">{cv.fullName}</h1>
          {cv.jobTitle && <p className="text-emerald-700 font-semibold mt-1">{cv.jobTitle}</p>}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-navy-500 mt-2">
            {cv.city && <span>📍 {cv.city}</span>}
            <span>🗓 آخر تحديث: {updated}</span>
          </div>
          {isPlus && (
            <span className="inline-block mt-3 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
              👑 عضوية Plus موثّقة
            </span>
          )}
        </div>
        <p className="text-xs text-navy-500 leading-6">
          تم إنشاء هذه السيرة الذاتية عبر منصة {env.SITE_NAME}. هذا الرمز يؤكد أن بيانات صاحب السيرة مسجّلة لدينا.
        </p>
        <Link href="/" className="btn-outline inline-block text-sm">زيارة {env.SITE_NAME}</Link>
      </div>
    </section>
  );
}
