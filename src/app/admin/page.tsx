import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { StatCard } from "@/components/StatCard";

export const metadata: Metadata = { title: "لوحة الأدمن", robots: { index: false, follow: false } };

export default async function AdminPage() {
  await requireAdmin();
  const [published, pending, expired, seekers, employers, appsToday, unpaid, paid, claims, reports, revenue] = await Promise.all([
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.job.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.job.count({ where: { status: "EXPIRED" } }),
    prisma.user.count({ where: { role: "JOB_SEEKER" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.application.count({ where: { createdAt: { gte: new Date(new Date().toDateString()) } } }),
    prisma.billingRecord.count({ where: { status: "UNPAID" } }),
    prisma.billingRecord.count({ where: { status: "PAID" } }),
    prisma.companyClaim.count({ where: { status: "PENDING" } }),
    prisma.reportedJob.count({ where: { resolved: false } }),
    prisma.billingRecord.findMany({ where: { status: "PAID" }, select: { amountJod: true } }),
  ]);
  const rev = revenue.reduce((s, r) => s + Number(r.amountJod), 0);
  const links = [["الوظائف", "/admin/jobs"], ["إضافة وظيفة", "/admin/jobs/new"], ["المصادر", "/admin/sources"], ["المدفوعات", "/admin/payments"], ["المطالبات", "/admin/claims"], ["الشركات", "/admin/companies"], ["أصحاب العمل", "/admin/employers"], ["الباحثون", "/admin/job-seekers"], ["الطلبات", "/admin/applications"], ["البلاغات", "/admin/reports"], ["الإعدادات", "/admin/settings"]];
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">لوحة إدارة جوبز الأردن</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="وظائف منشورة" value={published} /><StatCard label="بانتظار المراجعة" value={pending} tone="warning" /><StatCard label="وظائف منتهية" value={expired} /><StatCard label="باحثون عن عمل" value={seekers} />
        <StatCard label="أصحاب عمل" value={employers} /><StatCard label="طلبات اليوم" value={appsToday} /><StatCard label="مدفوعات غير مدفوعة" value={unpaid} tone="danger" /><StatCard label="مدفوعات مدفوعة" value={paid} tone="success" />
        <StatCard label="إيراد يدوي" value={`${rev} د`} tone="success" /><StatCard label="مطالبات شركات" value={claims} /><StatCard label="بلاغات مفتوحة" value={reports} tone="warning" />
      </div>
      <div className="grid md:grid-cols-4 gap-3 mt-6">{links.map(([label, href]) => <Link className="card-pad font-bold hover:border-emerald-300" key={href} href={href}>{label}</Link>)}</div>
    </section>
  );
}
