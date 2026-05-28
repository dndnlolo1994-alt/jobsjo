import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { ensureCvPdfBilling } from "@/lib/billing/cv";
import { BILLING_STATUS_LABEL } from "@/lib/utils";
import { CvEditorForm } from "@/components/cv/CvEditorForm";

export const metadata: Metadata = { title: "سيرتي الذاتية", robots: { index: false, follow: false } };

export default async function MyCvPage() {
  const user = await requireJobSeeker();
  
  const cv = await prisma.cVProfile.findUnique({
    where: { userId: user.id },
    include: {
      experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
    },
  });
  
  const billing = await ensureCvPdfBilling(user.id, cv?.id);
  
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">باني السيرة الذاتية الاحترافي</h1>
      <p className="section-sub">اكتب بياناتك، خبراتك، تعليمك، مهاراتك، ارفع صورتك، واختر القالب المناسب لتنزيلها PDF.</p>
      
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Quick mobile download/preview banner at top */}
        <div className="lg:hidden card-pad bg-white border border-navy-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-navy-900 text-sm">تنزيل السيرة الذاتية PDF</h2>
            <p className="text-xs text-navy-500 mt-1">
              حالة الرسوم: <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{BILLING_STATUS_LABEL[billing.status]}</strong>
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link className="btn-outline text-xs py-2 px-3 flex-1 text-center" href="/me/cv/preview">👁 معاينة</Link>
            <Link className="btn-primary text-xs py-2 px-3 flex-1 text-center" href="/me/cv/download">📥 تنزيل / طباعة</Link>
          </div>
        </div>

        <CvEditorForm cv={cv} defaultEmail={user.email} defaultFullName={user.fullName} />
        
        <aside className="space-y-4">
          <div className="card-pad sticky top-20">
            <h2 className="font-bold text-navy-900 text-lg">تنزيل PDF</h2>
            <p className="mt-2 text-sm text-navy-600 leading-6">
              رسوم تنزيل السيرة الذاتية الاحترافية بصيغة PDF هي 2 دينار أردني.
              الحالة الحالية: <strong className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{BILLING_STATUS_LABEL[billing.status]}</strong>
            </p>
            <div className="grid gap-2 mt-5">
              <Link className="btn-outline text-sm" href="/me/cv/preview">👁 معاينة السيرة</Link>
              <Link className="btn-primary text-sm" href="/me/cv/download">📥 تنزيل / طباعة PDF</Link>
              <Link className="btn-ghost text-sm" href="/me/billing">💳 تعليمات الدفع</Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
