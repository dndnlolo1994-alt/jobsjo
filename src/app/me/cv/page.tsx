import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { ensureCvPdfBilling, canDownloadCvPdf } from "@/lib/billing/cv";
import { BILLING_STATUS_LABEL, formatDateArabic } from "@/lib/utils";
import { CvEditorForm } from "@/components/cv/CvEditorForm";
import { RequestPlusButton } from "@/components/RequestPlusButton";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "سيرتي الذاتية", robots: { index: false, follow: false } };

export default async function MyCvPage() {
  const user = await requireJobSeeker();

  const cv = await prisma.cVProfile.findUnique({
    where: { userId: user.id },
    include: {
      experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
    },
  });

  const seeker = await prisma.jobSeekerProfile.findUnique({ where: { userId: user.id }, select: { plan: true, planExpiresAt: true } });
  const isPlus = seeker?.plan === "PLUS";
  const billing = await ensureCvPdfBilling(user.id, cv?.id);
  const isPaid = await canDownloadCvPdf(user.id);
  const publicCvHref = cv ? `/cv/${cv.userId}` : "/me/cv";
  const plusUntil = seeker?.planExpiresAt ? formatDateArabic(seeker.planExpiresAt) : null;
  
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">باني السيرة الذاتية الاحترافي</h1>
      <p className="section-sub">اكتب بياناتك، خبراتك، تعليمك، مهاراتك، ارفع صورتك، واختر القالب المناسب لتنزيلها PDF.</p>

      {isPlus && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-extrabold text-emerald-800">
                Plus مفعل{plusUntil ? ` حتى ${plusUntil}` : ""}
              </div>
              <h2 className="mt-2 text-lg font-extrabold text-navy-950">صفحتك التعريفية والـ CV جاهزين للتعديل بأي لحظة</h2>
              <p className="mt-1 text-sm leading-7 text-navy-600">
                أي تعديل تحفظه هنا ينعكس على السيرة العربية، النسخة الإنجليزية، ورابط QR العام مباشرة.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="btn-outline text-xs" href="/me/cv/preview?lang=ar">معاينة عربي</Link>
              <Link className="btn-outline text-xs" href="/me/cv/preview?lang=en">English preview</Link>
              <Link className="btn-primary text-xs" href={publicCvHref}>صفحة QR العامة</Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Quick mobile download/preview banner at top */}
        <div className="lg:hidden card-pad bg-white border border-navy-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-navy-900 text-sm">تنزيل السيرة الذاتية PDF</h2>
            <p className="text-xs text-navy-500 mt-1">
              حالة الرسوم: <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{BILLING_STATUS_LABEL[billing.status]}</strong>
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link className="btn-outline text-xs py-2 px-3 flex-1 text-center" href="/me/cv/preview">👁 معاينة</Link>
            <Link className="btn-primary text-xs py-2 px-3 flex-1 text-center" href="/me/cv/download">📥 تنزيل / طباعة</Link>
          </div>
        </div>

        <CvEditorForm cv={cv} defaultEmail={user.email} defaultFullName={user.fullName} isPaid={isPaid} billingStatus={billing.status} isPlus={isPlus} siteUrl={env.SITE_URL} />

        <aside className="space-y-4">
          <div className="card-pad sticky top-20">
            <h2 className="font-bold text-navy-900 text-lg">تنزيل PDF</h2>
            <p className="mt-2 text-sm text-navy-600 leading-6">
              رسوم تنزيل السيرة الذاتية الاحترافية بصيغة PDF هي 2 دينار أردني.
              الحالة الحالية: <strong className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{BILLING_STATUS_LABEL[billing.status]}</strong>
            </p>
            <div className="grid gap-2 mt-5">
              <Link className="btn-outline text-sm" href="/me/cv/preview?lang=ar">👁 معاينة عربي</Link>
              <Link className="btn-outline text-sm" href="/me/cv/preview?lang=en">🌐 معاينة English</Link>
              <Link className="btn-primary text-sm" href="/me/cv/download?lang=ar">📥 تنزيل عربي</Link>
              <Link className="btn-primary text-sm" href="/me/cv/download?lang=en">📥 Download English</Link>
              {cv && <Link className="btn-ghost text-sm" href={publicCvHref}>🔗 صفحة QR العامة</Link>}
              <Link className="btn-ghost text-sm" href="/me/billing">💳 تعليمات الدفع</Link>
            </div>

            {!isPlus && (
              <div className="mt-5 pt-5 border-t border-navy-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">👑</span>
                  <h3 className="font-bold text-navy-900 text-sm">ترقية إلى باقة Plus</h3>
                </div>
                <p className="text-xs text-navy-500 leading-6 mb-3">
                  أضف صورتك الشخصية للسيرة، نزّلها بدون رسوم، وتقدّم على الوظائف بلا حدود — عرض عيد الاستقلال 2 دينار/شهرياً بدل 4.
                </p>
                <RequestPlusButton />
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
