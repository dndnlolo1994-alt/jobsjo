import type { Metadata } from "next";
import Link from "next/link";
import {
  Ban,
  Briefcase,
  Building2,
  CheckCircle,
  CreditCard,
  Eye,
  FileCheck2,
  PlusCircle,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  adminApproveJobAction,
  adminDeletePaymentAction,
  adminRejectJobAction,
  adminReviewClaimAction,
  adminUpdateJobSeekerPlanAction,
  adminUpdatePaymentAction,
} from "@/lib/actions/platform";
import { BILLING_TYPE_LABEL, formatDateArabic, formatJod } from "@/lib/utils";

export const metadata: Metadata = { title: "لوحة الأدمن | جوبز الأردن", robots: { index: false, follow: false } };

const actionBase =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-extrabold transition-colors active:scale-[0.98]";
const actionPrimary = `${actionBase} bg-emerald-600 text-white hover:bg-emerald-500`;
const actionBlue = `${actionBase} bg-primary-600 text-white hover:bg-primary-500`;
const actionNeutral = `${actionBase} border border-slate-200 bg-white text-slate-800 hover:bg-slate-50`;
const actionDanger = `${actionBase} border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`;

function MetricCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  tone: "blue" | "emerald" | "amber" | "rose" | "slate";
  icon: LucideIcon;
}) {
  const tones = {
    blue: "border-primary-100 bg-primary-50/70 text-primary-700",
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
    amber: "border-amber-100 bg-amber-50/70 text-amber-700",
    rose: "border-rose-100 bg-rose-50/70 text-rose-700",
    slate: "border-slate-200 bg-white text-slate-700",
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-lg border ${tones}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="text-3xl font-extrabold leading-none text-slate-950">{value}</div>
    </div>
  );
}

export default async function AdminPage() {
  await requireAdmin();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    published,
    pendingJobsCount,
    seekers,
    employers,
    appsToday,
    unpaidCount,
    claimsCount,
    reportsCount,
    revenueRecords,
    pendingPayments,
    pendingClaims,
    pendingJobs,
    recentFreeSeekers,
  ] = await Promise.all([
    prisma.job.count({ where: { status: "PUBLISHED" } }),
    prisma.job.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.user.count({ where: { role: "JOB_SEEKER" } }),
    prisma.user.count({ where: { role: "EMPLOYER" } }),
    prisma.application.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.billingRecord.count({ where: { status: "UNPAID" } }),
    prisma.companyClaim.count({ where: { status: "PENDING" } }),
    prisma.reportedJob.count({ where: { resolved: false } }),
    prisma.billingRecord.findMany({ where: { status: "PAID" }, select: { amountJod: true } }),
    prisma.billingRecord.findMany({
      where: { status: "UNPAID" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.companyClaim.findMany({
      where: { status: "PENDING" },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.job.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.user.findMany({
      where: {
        role: "JOB_SEEKER",
        OR: [{ jobSeekerProfile: { is: null } }, { jobSeekerProfile: { is: { plan: "FREE" } } }],
      },
      include: { jobSeekerProfile: true, cvProfile: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const totalRevenue = revenueRecords.reduce((sum, r) => sum + Number(r.amountJod), 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-extrabold text-emerald-700">مركز تشغيل جوبز الأردن</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">لوحة إدارة المنصة</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            مراجعة الطلبات، تفعيل المدفوعات، ترقية الباحثين، ونشر الوظائف من مكان واحد.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/jobs/new" className={actionPrimary}>
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            إضافة وظيفة
          </Link>
          <a href="/" target="_blank" className={actionNeutral}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            عرض الموقع
          </a>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="وظائف منشورة" value={published} tone="blue" icon={Briefcase} />
        <MetricCard label="بانتظار المراجعة" value={pendingJobsCount} tone={pendingJobsCount > 0 ? "amber" : "slate"} icon={FileCheck2} />
        <MetricCard label="طلبات اليوم" value={appsToday} tone="emerald" icon={CheckCircle} />
        <MetricCard label="الباحثون عن عمل" value={seekers} tone="slate" icon={Users} />
        <MetricCard label="أصحاب العمل" value={employers} tone="slate" icon={Building2} />
        <MetricCard label="مدفوعات معلقة" value={unpaidCount} tone={unpaidCount > 0 ? "rose" : "slate"} icon={CreditCard} />
        <MetricCard label="الإيرادات المؤكدة" value={`${totalRevenue} د.أ`} tone="emerald" icon={CreditCard} />
        <MetricCard label="بلاغات مفتوحة" value={reportsCount} tone={reportsCount > 0 ? "rose" : "slate"} icon={Ban} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-extrabold text-slate-950">طلبات المدفوعات</h2>
              <p className="text-xs font-medium text-slate-500">تفعيل، إعفاء، إلغاء، أو حذف الطلب نهائياً.</p>
            </div>
            <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-extrabold text-rose-700">
              {unpaidCount} معلق
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingPayments.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm font-bold text-slate-400">لا توجد مدفوعات معلقة حالياً.</p>
            ) : (
              pendingPayments.map((record) => (
                <div key={record.id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-950">{BILLING_TYPE_LABEL[record.type]}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {record.user?.fullName ?? "بدون مستخدم"} · {record.user?.email ?? "لا يوجد بريد"} · {formatJod(String(record.amountJod))}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-slate-400">{formatDateArabic(record.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <form action={adminUpdatePaymentAction.bind(null, record.id, "PAID")}>
                      <button type="submit" className={actionPrimary}>
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        تفعيل
                      </button>
                    </form>
                    <form action={adminUpdatePaymentAction.bind(null, record.id, "WAIVED")}>
                      <button type="submit" className={actionBlue}>إعفاء</button>
                    </form>
                    <form action={adminUpdatePaymentAction.bind(null, record.id, "CANCELLED")}>
                      <button type="submit" className={actionNeutral}>
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        إلغاء
                      </button>
                    </form>
                    <form action={adminDeletePaymentAction.bind(null, record.id)}>
                      <button type="submit" className={actionDanger}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        حذف
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-5 py-3">
            <Link href="/admin/payments" className="text-xs font-extrabold text-primary-700 hover:text-primary-600">
              عرض كل المدفوعات والاشتراكات ←
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-extrabold text-slate-950">ترقية الباحثين إلى Plus</h2>
              <p className="text-xs font-medium text-slate-500">أحدث الحسابات المجانية مع زر تفعيل مباشر.</p>
            </div>
            <UserPlus className="h-5 w-5 text-emerald-700" aria-hidden="true" />
          </div>
          <div className="divide-y divide-slate-100">
            {recentFreeSeekers.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm font-bold text-slate-400">لا يوجد باحثون مجانيون بحاجة لترقية.</p>
            ) : (
              recentFreeSeekers.map((user) => (
                <div key={user.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-950">{user.fullName || "باحث بدون اسم"}</p>
                    <p className="truncate text-xs font-medium text-slate-500">{user.email}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-400">{user.cvProfile ? "لديه CV" : "لم ينشئ CV بعد"}</p>
                  </div>
                  <form action={adminUpdateJobSeekerPlanAction.bind(null, user.id, "PLUS")}>
                    <button type="submit" className={actionPrimary}>
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      تفعيل Plus
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <Link href="/admin/job-seekers" className="text-xs font-extrabold text-primary-700 hover:text-primary-600">
              إدارة كل الباحثين ←
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-extrabold text-slate-950">مطالبات ملكية الشركات</h2>
              <p className="text-xs font-medium text-slate-500">قبول المطالبة يربط صاحب الطلب بالشركة ويوثقها.</p>
            </div>
            <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
              {claimsCount} معلقة
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingClaims.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm font-bold text-slate-400">لا توجد مطالبات معلقة حالياً.</p>
            ) : (
              pendingClaims.map((claim) => (
                <div key={claim.id} className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-extrabold text-slate-950">{claim.company.name}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {claim.claimantName} · {claim.companyRole} · {claim.phone}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={adminReviewClaimAction.bind(null, claim.id, "APPROVED")}>
                      <button type="submit" className={actionPrimary}>
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        قبول
                      </button>
                    </form>
                    <form action={adminReviewClaimAction.bind(null, claim.id, "REJECTED")}>
                      <button type="submit" className={actionDanger}>رفض</button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-extrabold text-slate-950">وظائف بانتظار النشر</h2>
              <p className="text-xs font-medium text-slate-500">مراجعة سريعة قبل ظهور الوظيفة للباحثين.</p>
            </div>
            <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
              {pendingJobsCount} وظيفة
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingJobs.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm font-bold text-slate-400">لا توجد وظائف معلقة مراجعة.</p>
            ) : (
              pendingJobs.map((job) => (
                <div key={job.id} className="flex flex-col gap-3 px-5 py-4">
                  <div>
                    <p className="text-sm font-extrabold text-slate-950">{job.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {job.company?.name ?? job.companyNameText ?? "شركة غير محددة"} · {job.city} · ينتهي {formatDateArabic(job.expiresAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={adminApproveJobAction.bind(null, job.id)}>
                      <button type="submit" className={actionPrimary}>
                        <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        نشر
                      </button>
                    </form>
                    <form action={adminRejectJobAction.bind(null, job.id)}>
                      <button type="submit" className={actionDanger}>رفض</button>
                    </form>
                    <Link href={`/admin/jobs/${job.id}/edit`} className={actionNeutral}>تعديل</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
