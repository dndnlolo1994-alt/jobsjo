import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/auth";
import { StatCard } from "@/components/StatCard";

export const metadata: Metadata = { title: "بوابة الشركات", robots: { index: false, follow: false } };

export default async function EmployerPage() {
  const user = await requireEmployer();
  
  // Fetch jobs posted by this specific employer (or all if admin)
  const jobs = await prisma.job.findMany({ 
    where: user.role === "ADMIN" ? {} : { postedById: user.id }, 
    include: { _count: { select: { applications: true } } }, 
    orderBy: { createdAt: "desc" }
  });
  
  const totalApps = jobs.reduce((s, j) => s + j._count.applications, 0);
  const totalViews = jobs.reduce((s, j) => s + j.viewCount, 0);

  // Status labels and styles mapping
  const STATUS_MAP: Record<string, { label: string; className: string }> = {
    PUBLISHED: { label: "منشورة", className: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    DRAFT: { label: "مسودة", className: "bg-amber-50 text-amber-700 border-amber-100" },
    PENDING_REVIEW: { label: "قيد المراجعة", className: "bg-orange-50 text-orange-700 border-orange-100" },
    EXPIRED: { label: "منتهية", className: "bg-slate-100 text-slate-600 border-slate-200" },
    REJECTED: { label: "مرفوضة", className: "bg-rose-50 text-rose-700 border-rose-100" },
  };

  return (
    <section className="container-jo py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white border border-slate-150/60 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-navy-950">بوابة الشركات</h1>
            <span className="bg-emerald-550 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">صاحب عمل</span>
          </div>
          <p className="text-sm text-navy-500 mt-1">أهلاً بك، {user.fullName}. أدر وظائفك واستقبل طلبات الباحثين عن عمل بكل سهولة.</p>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <Link className="btn-outline text-sm px-5 py-2.5 border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:scale-[1.01] active:scale-[0.99] transition-transform" href="/employer/candidates">
            🔍 البحث عن مرشحين
          </Link>
          <Link className="btn-primary text-sm px-5 py-2.5 shadow-md shadow-emerald-600/10 hover:scale-[1.01] active:scale-[0.99] transition-transform" href="/employer/jobs/new">
            ➕ نشر وظيفة جديدة
          </Link>
          <form action="/api/auth/logout" method="POST" className="inline-block">
            <button className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-100/70 hover:bg-rose-100 px-3.5 py-2.5 rounded-xl transition-all">
              خروج
            </button>
          </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="📦 شواغرك النشطة" value={jobs.length} />
        <StatCard label="📥 طلبات التقديم" value={totalApps > 0 ? totalApps : "-"} />
        <StatCard label="👁️ مشاهدات الوظائف" value={totalViews} />
        <StatCard label="⚡ باقة الحساب" value={user.role === "ADMIN" ? "ADMIN" : "FREE"} />
      </div>

      {/* Jobs Listing Table */}
      <div className="bg-white border border-slate-150/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-navy-900 text-lg">📁 إدارة الوظائف المنشورة</h2>
          <span className="text-xs text-navy-400 font-medium">المعروض: {jobs.length} وظيفة</span>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center text-navy-500 space-y-3">
            <div className="text-4xl">📭</div>
            <p className="font-bold text-sm">لا توجد لديك وظائف منشورة حالياً.</p>
            <p className="text-xs text-navy-400">انقر على زر "نشر وظيفة جديدة" بالأعلى للبدء في استقطاب الموظفين.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-navy-700 font-bold">
                  <th className="p-4">اسم الوظيفة / الشركة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">الموقع الجغرافي</th>
                  <th className="p-4 text-center">عدد المتقدمين</th>
                  <th className="p-4 text-center">المشاهدات</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => {
                  const status = STATUS_MAP[j.status] || { label: j.status, className: "bg-slate-50 text-slate-700" };
                  return (
                    <tr key={j.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-navy-950">
                        <div>
                          <div className="text-navy-950 font-extrabold">{j.title}</div>
                          {j.companyNameText && <span className="text-[10px] text-navy-400 font-normal">{j.companyNameText}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-navy-600 font-medium">{j.city}{j.area ? ` · ${j.area}` : ""}</td>
                      <td className="p-4 text-center font-bold text-emerald-600">{j._count.applications > 0 ? j._count.applications : "-"}</td>
                      <td className="p-4 text-center text-navy-500 font-medium">{j.viewCount}</td>
                      <td className="p-4 text-center">
                        <Link 
                          className="btn-outline text-xs px-3.5 py-2 inline-block rounded-xl font-bold hover:scale-[1.01] active:scale-[0.99] transition-transform" 
                          href={`/employer/jobs/${j.id}/applications`}
                        >
                          👁️ عرض المرشحين
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
