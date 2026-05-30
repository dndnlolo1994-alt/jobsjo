import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { APP_STATUS_LABEL, formatDateArabic } from "@/lib/utils";

export const metadata: Metadata = { title: "طلباتي", robots: { index: false, follow: false } };

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ applied?: string }>;
}) {
  const user = await requireJobSeeker();
  const { applied } = await searchParams;
  
  const [apps, seeker] = await Promise.all([
    prisma.application.findMany({ 
      where: { jobSeekerId: user.id }, 
      include: { job: { include: { company: true } } }, 
      orderBy: { createdAt: "desc" } 
    }),
    prisma.jobSeekerProfile.findUnique({ 
      where: { userId: user.id }, 
      select: { plan: true } 
    }),
  ]);

  const isPlus = seeker?.plan === "PLUS";

  return (
    <section className="container-jo py-8">
      {applied === "true" && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-sm p-4 rounded-2xl mb-6 font-bold flex items-center gap-2">
          <span>✓</span>
          <span>تم إرسال طلب التقديم بنجاح. سنعرض لك هنا حالة إشعار الشركة وتحديثات الطلب.</span>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title mb-0">طلبات التقديم</h1>
        <Link href="/me/applications/board" className="btn-outline text-sm">عرض لوحة التتبع</Link>
      </div>
      
      {seeker?.plan === "FREE" && (
        <div className="card-pad bg-amber-50/50 border border-amber-100 mb-6 text-xs text-amber-800 flex justify-between items-center gap-3">
          <span>👑 اشترك في باقة <strong>الباحث بلس (Plus)</strong> لتتبع حالة طلباتك في الوقت الحقيقي (تم العرض، مقابلة، قبول، إلخ).</span>
          <Link href="/pricing" className="btn-sand py-1.5 px-3 rounded-lg text-xs font-bold shrink-0">ترقية الحساب</Link>
        </div>
      )}

      <div className="space-y-3">
        {apps.map((a) => {
          const statusText = isPlus 
            ? APP_STATUS_LABEL[a.status] 
            : "تم التقديم بنجاح";
          const employerEmailText = a.employerNotificationSentAt
            ? "إشعار الشركة مرسل"
            : a.employerNotificationTo
              ? "إيميل الشركة قيد المراجعة"
              : "الطلب مسجل داخل المنصة";
          const confirmationText = a.applicantConfirmationSentAt
            ? "تأكيد الإيميل مرسل لك"
            : "تأكيد الإيميل قيد الإرسال";
          
          return (
            <div className="card-pad hover:border-emerald-100 transition-all duration-200" key={a.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-50">
                <div>
                  <h2 className="font-extrabold text-navy-950 text-base">{a.job.title}</h2>
                  <p className="text-sm text-navy-600 mt-1">
                    {a.job.company?.name ?? a.job.companyNameText}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                    📅 {formatDateArabic(a.createdAt)}
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                    isPlus 
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-150" 
                      : "bg-blue-50 text-blue-800 border border-blue-100"
                  }`}>
                    {isPlus ? "👑" : "💼"} {statusText}
                  </span>

                  {a.appliedVia === "INTERNAL" && (
                    <>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-emerald-600 text-white px-2.5 py-1 rounded-lg shadow-sm">
                        📧 {employerEmailText}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold bg-slate-900 text-white px-2.5 py-1 rounded-lg shadow-sm">
                        ✓ {confirmationText}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {a.coverNote ? (
                <div className="mt-3 p-3 bg-slate-50/60 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-navy-400 block mb-1">الرسالة المرفقة:</span>
                  <p className="text-xs text-navy-700 leading-relaxed whitespace-pre-line">{a.coverNote}</p>
                </div>
              ) : (
                <p className="text-[10px] text-navy-400 mt-2">لم يتم إرفاق رسالة تغطية إضافية مع الطلب.</p>
              )}
            </div>
          );
        })}
      </div>
      {apps.length === 0 && <div className="card-pad text-navy-500 text-center py-10">لم تتقدم لأي وظيفة بعد.</div>}
    </section>
  );
}
