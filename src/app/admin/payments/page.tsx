import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminUpdatePaymentAction } from "@/lib/actions/platform";
import { BILLING_STATUS_LABEL, BILLING_TYPE_LABEL, formatJod } from "@/lib/utils";

export const metadata: Metadata = { title: "إدارة المدفوعات", robots: { index: false, follow: false } };

export default async function PaymentsPage() {
  await requireAdmin();
  const payments = await prisma.billingRecord.findMany({ include: { user: true, job: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">المدفوعات اليدوية</h1>
      <div className="space-y-3">{payments.map((p) => <div className="card-pad" key={p.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">{BILLING_TYPE_LABEL[p.type]}</h2><p className="text-sm text-navy-600">{p.user?.fullName ?? "بدون مستخدم"} · {formatJod(String(p.amountJod))} · {BILLING_STATUS_LABEL[p.status]}</p>{p.adminNote && <p className="text-sm mt-2">{p.adminNote}</p>}</div><div className="flex flex-wrap gap-2"><form action={adminUpdatePaymentAction.bind(null, p.id, "PAID")}><button className="btn-primary">مدفوع</button></form><form action={adminUpdatePaymentAction.bind(null, p.id, "WAIVED")}><button className="btn-outline">إعفاء</button></form><form action={adminUpdatePaymentAction.bind(null, p.id, "UNPAID")}><button className="btn-ghost">غير مدفوع</button></form></div></div></div>)}</div>
    </section>
  );
}
