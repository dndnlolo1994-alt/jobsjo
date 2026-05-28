import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { JOB_STATUS_LABEL, SOURCE_TYPE_LABEL, formatDateArabic } from "@/lib/utils";

export const metadata: Metadata = { title: "إدارة الوظائف", robots: { index: false, follow: false } };

export default async function AdminJobsPage() {
  await requireAdmin();
  const jobs = await prisma.job.findMany({ include: { company: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <section className="container-jo py-8">
      <div className="flex justify-between gap-3 mb-5"><div><h1 className="section-title">إدارة الوظائف</h1><p className="section-sub">إنشاء، مراجعة، نشر، وإنهاء الوظائف.</p></div><Link className="btn-primary" href="/admin/jobs/new">إضافة وظيفة</Link></div>
      <div className="space-y-3">{jobs.map((j) => <div className="card-pad" key={j.id}><div className="flex flex-wrap justify-between gap-2"><div><h2 className="font-bold">{j.title}</h2><p className="text-sm text-navy-600">{j.company?.name ?? j.companyNameText ?? "بدون شركة"} · {j.city} · {JOB_STATUS_LABEL[j.status]}</p></div><Link className="btn-outline" href={`/admin/jobs/${j.id}/edit`}>تعديل</Link></div><p className="text-xs text-navy-500 mt-2">المصدر: {j.sourceName ?? SOURCE_TYPE_LABEL[j.sourceType]} · ينتهي: {formatDateArabic(j.expiresAt)}</p></div>)}</div>
    </section>
  );
}
