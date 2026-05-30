import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { APP_STATUS_LABEL, formatDateArabic } from "@/lib/utils";

export const metadata: Metadata = { title: "طلبات التقديم", robots: { index: false, follow: false } };

function emailStatus(app: {
  applicantConfirmationSentAt: Date | null;
  employerNotificationSentAt: Date | null;
  statusNotificationSentAt: Date | null;
  notificationError: string | null;
}) {
  if (app.notificationError) return { label: "يحتاج متابعة", className: "border-rose-100 bg-rose-50 text-rose-700" };
  if (app.applicantConfirmationSentAt && app.employerNotificationSentAt) {
    return { label: "الإيميلات مرسلة", className: "border-emerald-100 bg-emerald-50 text-emerald-700" };
  }
  if (app.statusNotificationSentAt) return { label: "تحديث حالة مرسل", className: "border-blue-100 bg-blue-50 text-blue-700" };
  return { label: "قيد التحقق", className: "border-amber-100 bg-amber-50 text-amber-700" };
}

export default async function Page() {
  await requireAdmin();

  const [items, total, needsAttention, sentEmployer] = await Promise.all([
    prisma.application.findMany({
      include: { job: { include: { company: true } }, jobSeeker: true },
      orderBy: { createdAt: "desc" },
      take: 120,
    }),
    prisma.application.count(),
    prisma.application.count({ where: { notificationError: { not: null } } }),
    prisma.application.count({ where: { employerNotificationSentAt: { not: null } } }),
  ]);

  return (
    <section className="space-y-5">
      <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-extrabold text-primary-700">تشغيل الطلبات والإيميلات</p>
            <h1 className="text-2xl font-extrabold text-slate-950">كل طلبات التقديم</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              راقب الطلبات، حالة إرسال الإيميل للمتقدم وصاحب العمل، وروابط مراجعة المرشحين.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
            <span className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-700">{total} طلب</span>
            <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">{sentEmployer} إشعار شركة</span>
            <span className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-rose-700">{needsAttention} متابعة</span>
          </div>
        </div>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {items.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-bold text-slate-400">لا توجد طلبات تقديم حتى الآن.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const trace = emailStatus(item);
              const companyName = item.job.company?.name ?? item.job.companyNameText ?? "صاحب عمل خاص";
              return (
                <div key={item.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-extrabold text-slate-950">{item.job.title}</h2>
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700">
                        {APP_STATUS_LABEL[item.status]}
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${trace.className}`}>
                        {trace.label}
                      </span>
                    </div>
                    <div className="grid gap-1 text-xs font-medium text-slate-500 md:grid-cols-2 xl:grid-cols-4">
                      <p className="truncate">المتقدم: <strong className="text-slate-800">{item.jobSeeker.fullName}</strong></p>
                      <p className="truncate">البريد: {item.jobSeeker.email}</p>
                      <p className="truncate">الشركة: {companyName}</p>
                      <p>التاريخ: {formatDateArabic(item.createdAt)}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                      {item.applicantConfirmationSentAt && <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">تأكيد المتقدم: {formatDateArabic(item.applicantConfirmationSentAt)}</span>}
                      {item.employerNotificationSentAt && <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">إشعار الشركة: {formatDateArabic(item.employerNotificationSentAt)}</span>}
                      {item.statusNotificationSentAt && <span className="rounded-lg bg-blue-50 px-2 py-1 text-blue-700">آخر تحديث: {formatDateArabic(item.statusNotificationSentAt)}</span>}
                      {item.employerNotificationTo && <span className="rounded-lg bg-slate-50 px-2 py-1 text-slate-600" dir="ltr">{item.employerNotificationTo}</span>}
                      {item.notificationError && <span className="rounded-lg bg-rose-50 px-2 py-1 text-rose-700">خطأ: {item.notificationError}</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link href={`/jobs/${item.job.slug}`} className="btn-outline rounded-lg px-3 py-2 text-xs">عرض الوظيفة</Link>
                    <Link href={`/employer/jobs/${item.jobId}/applications`} className="btn-primary rounded-lg px-3 py-2 text-xs">ملف المرشحين</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
