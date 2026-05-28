import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { jobQualityChecklist, findDuplicateJobWarnings } from "@/lib/search/jobs";

export const metadata: Metadata = { title: "تعديل وظيفة", robots: { index: false, follow: false } };

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();
  const checklist = jobQualityChecklist(job);
  const dupes = await findDuplicateJobWarnings({ title: job.title, companyNameText: job.companyNameText, city: job.city, sourceUrl: job.sourceUrl, excludeId: job.id });
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">تعديل: {job.title}</h1>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-pad">
          <h2 className="font-bold mb-3">فحص الجودة</h2>
          <ul className="space-y-2 text-sm">{checklist.map((c) => <li key={c.key} className={c.ok ? "text-emerald-700" : "text-red-700"}>{c.ok ? "✓" : "!"} {c.label}</li>)}</ul>
        </div>
        <div className="card-pad">
          <h2 className="font-bold mb-3">تنبيهات التكرار</h2>
          {dupes.length === 0 ? <p className="text-sm text-navy-500">لا توجد وظائف مشابهة واضحة.</p> : dupes.map((d) => <Link className="block link text-sm" href={`/admin/jobs/${d.id}/edit`} key={d.id}>{d.title} - {d.city}</Link>)}
        </div>
      </div>
      <div className="card-pad mt-5 text-navy-600">تعديل الحقول الكامل مخطط للمرحلة التالية. حالياً يمكن للأدمن إنشاء وظائف كاملة ومراقبة الجودة والتكرار من هنا.</div>
    </section>
  );
}
