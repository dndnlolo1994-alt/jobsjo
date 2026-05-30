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
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-[11px] font-extrabold transition-colors active:scale-[0.98]";
const actionPrimary = `${actionBase} bg-[#c0a368] text-slate-950 shadow-lg shadow-[#c0a368]/15 hover:bg-[#d4ba79]`;
const actionBlue = `${actionBase} bg-blue-600 text-white shadow-lg shadow-blue-950/20 hover:bg-blue-500`;
const actionNeutral = `${actionBase} border border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-800`;
const actionDanger = `${actionBase} border border-rose-800/60 bg-rose-950/50 text-rose-100 hover:bg-rose-900`;
const panelClass = "overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/20 backdrop-blur-xl";
const panelHeaderClass = "flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4";
const rowClass = "flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.035] lg:flex-row lg:items-center lg:justify-between";

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
    blue: "border-blue-400/20 bg-blue-500/10 text-blue-200",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
    amber: "border-[#c0a368]/30 bg-[#c0a368]/12 text-[#f0dcaa]",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-200",
    slate: "border-slate-400/15 bg-white/5 text-slate-200",
  }[tone];

  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/10 backdrop-blur-xl transition-colors hover:border-[#c0a368]/35 hover:bg-white/[0.09]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-300">{label}</span>
        <span className={`grid h-10 w-10 place-items-center rounded-2xl border ${tones}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="text-3xl font-extrabold leading-none text-white">{value}</div>
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
    revenueAggregate,
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
    prisma.billingRecord.aggregate({ where: { status: "PAID" }, _sum: { amountJod: true } }),
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

  const totalRevenue = Number(revenueAggregate._sum.amountJod ?? 0);

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-[2rem] border border-[#c0a368]/20 bg-[linear-gradient(135deg,rgba(17,21,36,0.95),rgba(15,23,42,0.82))] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl lg:p-7">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#c0a368]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 inline-flex rounded-full border border-[#c0a368]/30 bg-[#c0a368]/10 px-3 py-1 text-xs font-extrabold text-[#e8d39c]">مركز تشغيل جوبز الأردن</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">لوحة إدارة المنصة</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-7 text-slate-300">
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
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div>
              <h2 className="font-extrabold text-white">طلبات المدفوعات</h2>
              <p className="text-xs font-medium text-slate-400">تفعيل، إعفاء، إلغاء، أو حذف الطلب نهائياً.</p>
            </div>
            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-extrabold text-rose-200">
              {unpaidCount} معلق
            </span>
          </div>

          <div className="divide-y divide-white/10">
            {pendingPayments.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm font-bold text-slate-400">لا توجد مدفوعات معلقة حالياً.</p>
            ) : (
              pendingPayments.map((record) => (
                <div key={record.id} className={rowClass}>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-white">{BILLING_TYPE_LABEL[record.type]}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {record.user?.fullName ?? "بدون مستخدم"} · {record.user?.email ?? "لا يوجد بريد"} · {formatJod(String(record.amountJod))}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">{formatDateArabic(record.createdAt)}</p>
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

          <div className="border-t border-white/10 px-5 py-3">
            <Link href="/admin/payments" className="text-xs font-extrabold text-[#e8d39c] hover:text-white">
              عرض كل المدفوعات والاشتراكات ←
            </Link>
          </div>
        </div>

        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div>
              <h2 className="font-extrabold text-white">ترقية الباحثين إلى Plus</h2>
              <p className="text-xs font-medium text-slate-400">أحدث الحسابات المجانية مع زر تفعيل مباشر.</p>
            </div>
            <UserPlus className="h-5 w-5 text-[#e8d39c]" aria-hidden="true" />
          </div>
          <div className="divide-y divide-white/10">
            {recentFreeSeekers.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm font-bold text-slate-400">لا يوجد باحثون مجانيون بحاجة لترقية.</p>
            ) : (
              recentFreeSeekers.map((user) => (
                <div key={user.id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.035] sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-white">{user.fullName || "باحث بدون اسم"}</p>
                    <p className="truncate text-xs font-medium text-slate-400">{user.email}</p>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">{user.cvProfile ? "لديه CV" : "لم ينشئ CV بعد"}</p>
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
          <div className="border-t border-white/10 px-5 py-3">
            <Link href="/admin/job-seekers" className="text-xs font-extrabold text-[#e8d39c] hover:text-white">
              إدارة كل الباحثين ←
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div>
              <h2 className="font-extrabold text-white">مطالبات ملكية الشركات</h2>
              <p className="text-xs font-medium text-slate-400">قبول المطالبة يربط صاحب الطلب بالشركة ويوثقها.</p>
            </div>
            <span className="rounded-full border border-[#c0a368]/30 bg-[#c0a368]/10 px-3 py-1 text-xs font-extrabold text-[#e8d39c]">
              {claimsCount} معلقة
            </span>
          </div>
          <div className="divide-y divide-white/10">
            {pendingClaims.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm font-bold text-slate-400">لا توجد مطالبات معلقة حالياً.</p>
            ) : (
              pendingClaims.map((claim) => (
                <div key={claim.id} className={rowClass}>
                  <div>
                    <p className="text-sm font-extrabold text-white">{claim.company.name}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
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

        <div className={panelClass}>
          <div className={panelHeaderClass}>
            <div>
              <h2 className="font-extrabold text-white">وظائف بانتظار النشر</h2>
              <p className="text-xs font-medium text-slate-400">مراجعة سريعة قبل ظهور الوظيفة للباحثين.</p>
            </div>
            <span className="rounded-full border border-[#c0a368]/30 bg-[#c0a368]/10 px-3 py-1 text-xs font-extrabold text-[#e8d39c]">
              {pendingJobsCount} وظيفة
            </span>
          </div>
          <div className="divide-y divide-white/10">
            {pendingJobs.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm font-bold text-slate-400">لا توجد وظائف معلقة مراجعة.</p>
            ) : (
              pendingJobs.map((job) => (
                <div key={job.id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-white/[0.035]">
                  <div>
                    <p className="text-sm font-extrabold text-white">{job.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
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
