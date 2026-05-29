import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { StatCard } from "@/components/StatCard";
import { adminUpdatePaymentAction, adminReviewClaimAction, adminApproveJobAction, adminRejectJobAction } from "@/lib/actions/platform";
import { BILLING_STATUS_LABEL, BILLING_TYPE_LABEL, formatJod, formatDateArabic } from "@/lib/utils";

export const metadata: Metadata = { title: "لوحة الأدمن | جوبز الأردن", robots: { index: false, follow: false } };

export default async function AdminPage() {
  await requireAdmin();
  
  // Fetch metrics and recent items concurrently
  const [
    published, 
    pendingJobsCount, 
    expired, 
    seekers, 
    employers, 
    appsToday, 
    unpaidCount, 
    paidCount, 
    claimsCount, 
    reportsCount, 
    revenueRecords,
    pendingPayments,
    pendingClaims,
    pendingJobs
  ] = await Promise.all([
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
    // Pending items for immediate dashboard activation
    prisma.billingRecord.findMany({ 
      where: { status: "UNPAID" }, 
      include: { user: true }, 
      orderBy: { createdAt: "desc" },
      take: 4 
    }),
    prisma.companyClaim.findMany({ 
      where: { status: "PENDING" }, 
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 4 
    }),
    prisma.job.findMany({ 
      where: { status: "PENDING_REVIEW" }, 
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 4 
    }),
  ]);

  const totalRevenue = revenueRecords.reduce((sum, r) => sum + Number(r.amountJod), 0);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">نظرة عامة على النظام</h1>
          <p className="text-sm text-navy-400 mt-1 font-medium">متابعة إحصائيات المنصة، المدفوعات اليدوية، والوظائف المعلقة.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/jobs/new" className="btn-primary text-xs py-2 px-4 rounded-xl shadow-sm shadow-emerald-500/10">
            ➕ إضافة وظيفة يدوية
          </Link>
          <a href="/" target="_blank" className="btn-outline text-xs py-2 px-4 rounded-xl">
            👁️ عرض الموقع
          </a>
        </div>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="وظائف منشورة" value={published} />
        <StatCard label="بانتظار المراجعة" value={pendingJobsCount} tone={pendingJobsCount > 0 ? "warning" : "default"} />
        <StatCard label="طلبات اليوم" value={appsToday} />
        <StatCard label="الباحثون عن عمل" value={seekers} />
        <StatCard label="أصحاب العمل" value={employers} />
        <StatCard label="مدفوعات معلقة" value={unpaidCount} tone={unpaidCount > 0 ? "danger" : "default"} />
        <StatCard label="إجمالي الإيرادات" value={`${totalRevenue} د.أ`} tone="success" />
        <StatCard label="مطالبات معلقة" value={claimsCount} tone={claimsCount > 0 ? "warning" : "default"} />
      </div>

      {/* Critical Action Items Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        
        {/* Unpaid / Pending Payments Activation Widget */}
        <div className="card bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="font-extrabold text-navy-950 text-base flex items-center gap-2">
                <span>💳</span> طلبات المدفوعات بانتظار التفعيل
              </h2>
              <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-100">
                {unpaidCount} طلب معلق
              </span>
            </div>

            {pendingPayments.length === 0 ? (
              <div className="text-center py-10 text-navy-400 text-xs font-semibold">
                🎉 لا توجد طلبات مدفوعات معلقة حالياً. كل شيء مفعل!
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingPayments.map((record) => (
                  <div key={record.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-navy-900">{BILLING_TYPE_LABEL[record.type]}</p>
                      <p className="text-[11px] text-navy-500 mt-1">
                        المستخدم: <strong className="text-navy-700">{record.user?.fullName}</strong> · المبلغ: <strong className="text-emerald-700">{formatJod(String(record.amountJod))}</strong>
                      </p>
                      {record.createdAt && (
                        <p className="text-[9px] text-navy-400 mt-0.5">التاريخ: {formatDateArabic(record.createdAt)}</p>
                      )}
                    </div>
                    
                    {/* Quick Activation Buttons */}
                    <div className="flex gap-1.5 w-full sm:w-auto self-end sm:self-center">
                      <form action={adminUpdatePaymentAction.bind(null, record.id, "PAID")} className="flex-1 sm:flex-none">
                        <button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-[0.98]">
                          ✅ تفعيل
                        </button>
                      </form>
                      <form action={adminUpdatePaymentAction.bind(null, record.id, "WAIVED")} className="flex-1 sm:flex-none">
                        <button type="submit" className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-[0.98]">
                          إعفاء
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <Link href="/admin/payments" className="text-xs font-bold text-emerald-700 hover:text-emerald-600 transition-colors">
              عرض جميع سجلات المدفوعات والاشتراكات ←
            </Link>
          </div>
        </div>

        {/* Company Claim Approval Widget */}
        <div className="card bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="font-extrabold text-navy-950 text-base flex items-center gap-2">
                <span>🛡️</span> مطالبات ملكية الشركات المعلقة
              </h2>
              <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
                {claimsCount} مطالبة معلقة
              </span>
            </div>

            {pendingClaims.length === 0 ? (
              <div className="text-center py-10 text-navy-400 text-xs font-semibold">
                🛡️ لا توجد طلبات مطالبة ملكية معلقة حالياً.
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingClaims.map((claim) => (
                  <div key={claim.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-navy-900">مطالبة لشركة: {claim.company.name}</p>
                      <p className="text-[11px] text-navy-500 mt-1">
                        بواسطة: <strong className="text-navy-700">{claim.claimantName}</strong> · الدور: <strong className="text-navy-600">{claim.companyRole}</strong>
                      </p>
                      <p className="text-[9px] text-navy-400 mt-0.5">الهاتف: {claim.phone} · البريد: {claim.email}</p>
                    </div>
                    
                    {/* Approve / Reject Actions */}
                    <div className="flex gap-1.5 w-full sm:w-auto self-end sm:self-center">
                      <form action={adminReviewClaimAction.bind(null, claim.id, "APPROVED")} className="flex-1 sm:flex-none">
                        <button type="submit" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-[0.98]">
                          ✔️ قبول
                        </button>
                      </form>
                      <form action={adminReviewClaimAction.bind(null, claim.id, "REJECTED")} className="flex-1 sm:flex-none">
                        <button type="submit" className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-[0.98]">
                          رفض
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <Link href="/admin/claims" className="text-xs font-bold text-emerald-700 hover:text-emerald-600 transition-colors">
              عرض جميع مطالبات الشركات وتعيين الملاك ←
            </Link>
          </div>
        </div>

      </div>

      {/* Jobs Pending Review Section */}
      <div className="card bg-white p-6 shadow-sm border border-slate-100 mt-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <h2 className="font-extrabold text-navy-950 text-base flex items-center gap-2">
            <span>💼</span> وظائف جديدة بانتظار المراجعة والنشر
          </h2>
          <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100">
            {pendingJobsCount} وظيفة معلقة
          </span>
        </div>

        {pendingJobs.length === 0 ? (
          <div className="text-center py-8 text-navy-400 text-xs font-semibold">
            ✨ جميع الوظائف تمت مراجعتها ونشرها. لا توجد وظائف معلقة مراجعة!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {pendingJobs.map((job) => (
              <div key={job.id} className="p-4 rounded-2xl border border-slate-150/60 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-500/20 transition-all flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-navy-900 text-sm leading-snug">{job.title}</h3>
                  <p className="text-xs text-navy-500 mt-1">{job.company?.name ?? job.companyNameText} · {job.city}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100/50">
                  <span className="text-[10px] text-navy-400">ينتهي في: {formatDateArabic(job.expiresAt)}</span>
                  <div className="flex items-center gap-1.5">
                    <form action={adminApproveJobAction.bind(null, job.id)}>
                      <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-[0.98] whitespace-nowrap">
                        ✅ موافقة
                      </button>
                    </form>
                    <form action={adminRejectJobAction.bind(null, job.id)}>
                      <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-[0.98] whitespace-nowrap">
                        رفض
                      </button>
                    </form>
                    <Link href={`/admin/jobs/${job.id}/edit`} className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap">
                      ✍️ تعديل
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
