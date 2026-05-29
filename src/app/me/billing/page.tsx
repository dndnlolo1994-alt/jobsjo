import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { BILLING_STATUS_LABEL, BILLING_TYPE_LABEL, PAYMENT_METHOD_LABEL, formatDateArabic, formatJod } from "@/lib/utils";
import { env } from "@/lib/env";
import { tplCvPaymentInfo } from "@/lib/whatsapp";
import { RequestPlusButton } from "@/components/RequestPlusButton";

export const metadata: Metadata = { title: "الدفع والفواتير", robots: { index: false, follow: false } };

export default async function BillingPage() {
  const user = await requireUser();
  const [records, seeker] = await Promise.all([
    prisma.billingRecord.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.jobSeekerProfile.findUnique({ where: { userId: user.id }, select: { plan: true } }),
  ]);
  const showUpgrade = !!seeker && seeker.plan !== "PLUS";
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">الدفع والفواتير</h1>
      {showUpgrade && (
        <div className="card-pad mb-5 bg-emerald-50/40 border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">👑</span>
            <h2 className="font-bold text-navy-900">ترقية إلى باقة Plus (عرض عيد الاستقلال: 2 بدل 4 دينار/شهرياً)</h2>
          </div>
          <p className="text-sm text-navy-600 leading-7 mb-3">
            صورة شخصية على سيرتك الذاتية، تنزيل PDF بدون رسوم، نسخة إنجليزية كاملة، وتقديم غير محدود على الوظائف. اضغط لإرسال طلب الترقية ثم أرسل إثبات الدفع ليُفعّل حسابك فوراً.
          </p>
          <div className="max-w-xs">
            <RequestPlusButton />
          </div>
        </div>
      )}
      <div className="card-pad mb-5">
        <h2 className="font-bold">طرق الدفع اليدوي</h2>
        <p className="text-sm text-navy-600 mt-2">الدفع متاح نقدًا، CliQ، حوالة بنكية، محفظة إلكترونية، أو طريقة أخرى يتم الاتفاق عليها. أرسل رقم السجل أو اسمك لفريق الدعم بعد الدفع.</p>
        <a className="btn-primary mt-4" href={tplCvPaymentInfo({ phone: env.PLATFORM_WHATSAPP, amount: 2 })} target="_blank">التواصل مع الدعم عبر واتساب</a>
      </div>
      <div className="space-y-3">{records.map((r) => <div className="card-pad" key={r.id}><div className="flex justify-between gap-3"><strong>{BILLING_TYPE_LABEL[r.type]}</strong><span>{formatJod(String(r.amountJod))}</span></div><p className="text-sm text-navy-600">الحالة: {BILLING_STATUS_LABEL[r.status]} · الطريقة: {r.paymentMethod ? PAYMENT_METHOD_LABEL[r.paymentMethod] : "لم تحدد"} · {formatDateArabic(r.createdAt)}</p>{r.adminNote && <p className="text-sm mt-2">{r.adminNote}</p>}</div>)}</div>
      {records.length === 0 && <div className="card-pad text-navy-500">لا توجد سجلات دفع بعد.</div>}
    </section>
  );
}
