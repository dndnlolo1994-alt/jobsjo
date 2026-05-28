import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/auth";
import { StatCard } from "@/components/StatCard";

export const metadata: Metadata = { title: "بوابة الشركات", robots: { index: false, follow: false } };

export default async function EmployerPage() {
  const user = await requireEmployer();
  const jobs = await prisma.job.findMany({ where: user.role === "ADMIN" ? {} : { postedById: user.id }, include: { applications: true }, orderBy: { createdAt: "desc" }, take: 30 });
  const apps = jobs.reduce((s, j) => s + j.applications.length, 0);
  return (
    <section className="container-jo py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="section-title mb-1">بوابة الشركات</h1>
          <p className="text-sm text-navy-500">إدارة الوظائف والمرشحين والفواتير اليدوية.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Link className="btn-primary text-sm px-4 py-2.5" href="/employer/jobs/new">نشر وظيفة</Link>
          <form action="/api/auth/logout" method="POST" className="inline-block">
            <button className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-3 py-2 rounded-lg transition-all">
              خروج
            </button>
          </form>
        </div>
      </div>
      <div className="grid sm:grid-cols-4 gap-4"><StatCard label="وظائفك" value={jobs.length} /><StatCard label="طلبات" value={apps} /><StatCard label="مشاهدات" value={jobs.reduce((s,j)=>s+j.viewCount,0)} /><StatCard label="الخطة" value="FREE" /></div>
      <div className="space-y-3 mt-6">{jobs.map((j) => <div className="card-pad" key={j.id}><div className="flex justify-between gap-3"><div><b>{j.title}</b><p className="text-sm text-navy-600">{j.status} · {j.city} · {j.applications.length} طلب</p></div><Link className="btn-outline" href={`/employer/jobs/${j.id}/applications`}>عرض المرشحين</Link></div></div>)}</div>
    </section>
  );
}
