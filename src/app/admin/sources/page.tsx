import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminCreateSourceAction, adminToggleSourceAction } from "@/lib/actions/platform";
import { SOURCE_TRUST_LABEL, SOURCE_TYPE_LABEL } from "@/lib/utils";

export const metadata: Metadata = { title: "مصادر الوظائف", robots: { index: false, follow: false } };

export default async function SourcesPage() {
  await requireAdmin();
  async function createSource(formData: FormData) {
    "use server";
    await adminCreateSourceAction(null, formData);
  }
  const sources = await prisma.jobSource.findMany({ include: { jobs: { select: { id: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">مصادر الوظائف الموثوقة</h1>
      <form action={createSource} className="card-pad grid md:grid-cols-2 gap-4 mb-6">
            <div><label className="label">اسم المصدر</label><input name="sourceName" className="input" required /></div>
            <div><label className="label">المؤسسة</label><input name="organizationName" className="input" /></div>
            <div><label className="label">نوع المصدر</label><select name="sourceType" className="input">{Object.entries(SOURCE_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="label">مستوى الثقة</label><select name="trustLevel" className="input"><option value="HIGH">عالية</option><option value="MEDIUM">متوسطة</option><option value="LOW">منخفضة</option></select></div>
            <div className="md:col-span-2"><label className="label">الرابط</label><input name="sourceUrl" className="input" /></div>
            <div className="md:col-span-2"><label className="label">ملاحظات</label><textarea name="notes" className="input" /></div>
            <button className="btn-primary md:col-span-2">حفظ المصدر</button>
      </form>
      <div className="space-y-3">{sources.map((s) => <div className="card-pad" key={s.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">{s.sourceName}</h2><p className="text-sm text-navy-600">{SOURCE_TYPE_LABEL[s.sourceType]} · ثقة {SOURCE_TRUST_LABEL[s.trustLevel]} · {s.jobs.length} وظيفة مرتبطة</p>{s.sourceUrl && <a className="link text-sm" href={s.sourceUrl} target="_blank">فتح المصدر</a>}</div><form action={adminToggleSourceAction.bind(null, s.id, !s.active)}><button className={s.active ? "btn-outline" : "btn-primary"}>{s.active ? "تعطيل" : "تفعيل"}</button></form></div>{s.notes && <p className="text-sm mt-2">{s.notes}</p>}</div>)}</div>
    </section>
  );
}
