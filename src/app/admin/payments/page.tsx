import type { Metadata } from "next";
import { CheckCircle, CreditCard, RotateCcw, Trash2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminDeletePaymentAction, adminUpdatePaymentAction } from "@/lib/actions/platform";
import { BILLING_STATUS_LABEL, BILLING_TYPE_LABEL, formatDateArabic, formatJod } from "@/lib/utils";

export const metadata: Metadata = { title: "إدارة المدفوعات", robots: { index: false, follow: false } };

const actionBase =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-extrabold transition-colors active:scale-[0.98]";

function statusClass(status: string) {
  if (status === "PAID") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "WAIVED") return "border-primary-100 bg-primary-50 text-primary-700";
  if (status === "UNPAID") return "border-rose-100 bg-rose-50 text-rose-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

export default async function PaymentsPage() {
  await requireAdmin();
  const [payments, unpaidCount, paidCount, waivedCount] = await Promise.all([
    prisma.billingRecord.findMany({
      include: { user: true, job: true },
      orderBy: { createdAt: "desc" },
      take: 120,
    }),
    prisma.billingRecord.count({ where: { status: "UNPAID" } }),
    prisma.billingRecord.count({ where: { status: "PAID" } }),
    prisma.billingRecord.count({ where: { status: "WAIVED" } }),
  ]);

  return (
    <section className="space-y-5">
      <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 text-xs font-extrabold text-primary-700">التحكم المالي اليدوي</p>
            <h1 className="text-2xl font-extrabold text-slate-950">إدارة المدفوعات والطلبات</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              فعّل، أعفِ، ألغِ، أو احذف طلبات الدفع من نفس الشاشة.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
            <span className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-rose-700">{unpaidCount} معلق</span>
            <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">{paidCount} مدفوع</span>
            <span className="rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-primary-700">{waivedCount} معفى</span>
          </div>
        </div>
      </header>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        {payments.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-slate-400">لا توجد سجلات دفع حتى الآن.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <div key={payment.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-extrabold text-slate-950">{BILLING_TYPE_LABEL[payment.type]}</h2>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${statusClass(payment.status)}`}>
                      {BILLING_STATUS_LABEL[payment.status]}
                    </span>
                  </div>
                  <div className="grid gap-1 text-xs font-medium text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                    <p className="truncate">المستخدم: <strong className="text-slate-800">{payment.user?.fullName ?? "بدون مستخدم"}</strong></p>
                    <p className="truncate">البريد: {payment.user?.email ?? "غير متوفر"}</p>
                    <p>المبلغ: <strong className="text-emerald-700">{formatJod(String(payment.amountJod))}</strong></p>
                    <p>التاريخ: {formatDateArabic(payment.createdAt)}</p>
                  </div>
                  {payment.adminNote && <p className="mt-2 text-xs font-medium leading-6 text-slate-600">{payment.adminNote}</p>}
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <form action={adminUpdatePaymentAction.bind(null, payment.id, "PAID")}>
                    <button type="submit" className={`${actionBase} bg-emerald-600 text-white hover:bg-emerald-500`}>
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      مدفوع
                    </button>
                  </form>
                  <form action={adminUpdatePaymentAction.bind(null, payment.id, "WAIVED")}>
                    <button type="submit" className={`${actionBase} bg-primary-600 text-white hover:bg-primary-500`}>إعفاء</button>
                  </form>
                  <form action={adminUpdatePaymentAction.bind(null, payment.id, "UNPAID")}>
                    <button type="submit" className={`${actionBase} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50`}>
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      غير مدفوع
                    </button>
                  </form>
                  <form action={adminUpdatePaymentAction.bind(null, payment.id, "CANCELLED")}>
                    <button type="submit" className={`${actionBase} border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100`}>
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      إلغاء
                    </button>
                  </form>
                  <form action={adminDeletePaymentAction.bind(null, payment.id)}>
                    <button type="submit" className={`${actionBase} border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
