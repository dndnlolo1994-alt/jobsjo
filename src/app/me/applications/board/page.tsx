import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { APP_STATUS_LABEL, formatDateArabic } from "@/lib/utils";

export const metadata: Metadata = { title: "لوحة تتبع الطلبات", robots: { index: false, follow: false } };

const columns = [
  { title: "قدّمت", statuses: ["SUBMITTED"] },
  { title: "بانتظار رد", statuses: ["VIEWED", "SHORTLISTED"] },
  { title: "مقابلة", statuses: ["INTERVIEW"] },
  { title: "مقبول", statuses: ["HIRED"] },
  { title: "مرفوض", statuses: ["REJECTED", "WITHDRAWN"] },
];

export default async function ApplicationsBoardPage() {
  const user = await requireJobSeeker();
  const [apps, seeker] = await Promise.all([
    prisma.application.findMany({
      where: { jobSeekerId: user.id },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobSeekerProfile.findUnique({ where: { userId: user.id }, select: { plan: true } }),
  ]);
  const isPlus = seeker?.plan === "PLUS";

  return (
    <section className="container-jo py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">لوحة تتبع الطلبات</h1>
          <p className="section-sub">تابع كل طلباتك حسب المرحلة.</p>
        </div>
        <Link href="/me/applications" className="btn-outline text-sm">عرض القائمة</Link>
      </div>

      {!isPlus && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
          حسابك مجاني: تظهر الطلبات بحالة عامة فقط. <Link href="/pricing" className="underline">ترقية Plus لرؤية التحديثات التفصيلية</Link>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => {
          const items = isPlus
            ? apps.filter((app) => column.statuses.includes(app.status))
            : column.title === "قدّمت"
              ? apps
              : [];
          return (
            <div key={column.title} className="min-h-64 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-extrabold text-navy-900">{column.title}</h2>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-navy-500">{items.length.toLocaleString("ar-JO")}</span>
              </div>
              <div className="space-y-3">
                {items.map((app) => (
                  <Link key={app.id} href={`/jobs/${app.job.slug}`} className="block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <h3 className="line-clamp-2 text-sm font-extrabold text-navy-950">{app.job.title}</h3>
                    <p className="mt-1 text-xs text-navy-500">{app.job.company?.name ?? app.job.companyNameText ?? "صاحب عمل خاص"}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-navy-500">
                      <span>{formatDateArabic(app.createdAt)}</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                        {isPlus ? APP_STATUS_LABEL[app.status] : "تم التقديم"}
                      </span>
                      {app.employerNotificationSentAt && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">إشعار الشركة مرسل</span>
                      )}
                      {app.statusNotificationSentAt && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">آخر تحديث مرسل للإيميل</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
