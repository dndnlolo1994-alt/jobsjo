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
          <span>تم إرسال طلب التقديم للوظيفة بنجاح! يمكنك تتبع حالة طلباتك في هذه الصفحة.</span>
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
            : "تم التقديم";
          
          return (
            <div className="card-pad" key={a.id}>
              <h2 className="font-bold text-navy-900">{a.job.title}</h2>
              <p className="text-sm text-navy-600">
                {a.job.company?.name ?? a.job.companyNameText} · {formatDateArabic(a.createdAt)} · 
                <span className={`inline-block mr-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isPlus ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-slate-100 text-slate-700"
                }`}>
                  {statusText}
                </span>
              </p>
              {a.coverNote && <p className="text-sm mt-2 text-navy-500 leading-relaxed">{a.coverNote}</p>}
            </div>
          );
        })}
      </div>
      {apps.length === 0 && <div className="card-pad text-navy-500">لم تتقدم لأي وظيفة بعد.</div>}
    </section>
  );
}
