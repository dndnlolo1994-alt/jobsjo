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

  const [cv, seeker] = await Promise.all([
    prisma.cVProfile.findUnique({
      where: { userId: user.id },
      include: {
        experiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
      },
    }),
    prisma.jobSeekerProfile.findUnique({ where: { userId: user.id }, select: { plan: true, planExpiresAt: true } }),
  ]);
  const isPlus = seeker?.plan === "PLUS";
  const [billing, isPaid] = await Promise.all([
    ensureCvPdfBilling(user.id, cv?.id),
    canDownloadCvPdf(user.id),
  ]);
  const publicCvHref = cv ? `/cv/${cv.userId}` : "/me/cv";
  const plusUntil = seeker?.planExpiresAt ? formatDateArabic(seeker.planExpiresAt) : null;
  
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">باني السيرة الذاتية الاحترافي</h1>
      <p className="section-sub">اكتب بياناتك، خبراتك، تعليمك، مهاراتك، ارفع صورتك، واختر القالب المناسب لتنزيلها PDF.</p>

      {isPlus && (
        <div className="mb-6 rounded-2xl border border-[#e0d9c5] bg-[#f8f5ec]/70 p-4 shadow-sm dark:border-[#c0a368]/30 dark:bg-[#1f1a10]/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-[#e0d9c5] bg-white px-3 py-1 text-xs font-extrabold text-[#8b7340] dark:border-[#c0a368]/40 dark:bg-[#111524] dark:text-[#e8d39c]">
                Plus مفعل{plusUntil ? ` حتى ${plusUntil}` : ""}
              </div>
              <h2 className="mt-2 text-lg font-extrabold text-[color:var(--text)]">صفحتك التعريفية والـ CV جاهزين للتعديل بأي لحظة</h2>
              <p className="mt-1 text-sm leading-7 text-[color:var(--muted)]">
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
        <div className="lg:hidden card-pad shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-[color:var(--text)] text-sm">تنزيل السيرة الذاتية PDF</h2>
            <p className="text-xs text-[color:var(--muted)] mt-1">
              حالة الرسوم: <strong className="text-[#8b7340] bg-[#f8f5ec] px-2 py-0.5 rounded dark:bg-[#2a2214] dark:text-[#e8d39c]">{BILLING_STATUS_LABEL[billing.status]}</strong>
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
            <h2 className="font-bold text-[color:var(--text)] text-lg">تنزيل PDF</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)] leading-6">
              رسوم تنزيل السيرة الذاتية الاحترافية بصيغة PDF هي 2 دينار أردني.
              الحالة الحالية: <strong className="text-[#8b7340] bg-[#f8f5ec] px-2 py-1 rounded dark:bg-[#2a2214] dark:text-[#e8d39c]">{BILLING_STATUS_LABEL[billing.status]}</strong>
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
              <div className="mt-5 pt-5 border-t border-navy-50 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">👑</span>
                  <h3 className="font-bold text-[color:var(--text)] text-sm">ترقية إلى باقة Plus</h3>
                </div>
                <p className="text-xs text-[color:var(--muted)] leading-6 mb-3">
                  أضف صورتك الشخصية للسيرة، نزّلها بدون رسوم، وتقدّم على الوظائف بلا حدود. عرض عيد الاستقلال: 2 دينار شهرياً، والسعر الأساسي 4 دنانير.
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
