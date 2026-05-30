import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { JobStatus } from "@/generated/client";
import { requireAdmin } from "@/lib/auth";
import { adminApproveJobAction, adminRejectJobAction } from "@/lib/actions/platform";
import { JOB_STATUS_LABEL, SOURCE_TYPE_LABEL, formatDateArabic, JOB_TYPE_LABEL } from "@/lib/utils";

export const metadata: Metadata = { title: "إدارة وتدقيق الوظائف", robots: { index: false, follow: false } };

const statCardBase = "rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-right shadow-2xl shadow-black/10 backdrop-blur-xl transition-colors hover:border-[#c0a368]/35 hover:bg-white/[0.09]";
const tabBase = "rounded-full border px-4 py-2 text-sm font-extrabold transition-colors";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const { tab } = await searchParams;
  const activeTab = tab || "pending";
  const statusForTab: Record<string, JobStatus | undefined> = {
    pending: "PENDING_REVIEW",
    published: "PUBLISHED",
    rejected: "REJECTED",
    draft: "DRAFT",
    all: undefined,
  };
  const activeStatus = statusForTab[activeTab] ?? "PENDING_REVIEW";

  const [jobs, statusCounts] = await Promise.all([
    prisma.job.findMany({
      where: activeStatus ? { status: activeStatus } : undefined,
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: activeStatus ? 60 : 100,
    }),
    prisma.job.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);
  const countByStatus = new Map(statusCounts.map((row) => [row.status, row._count._all]));
  const pendingJobsCount = countByStatus.get("PENDING_REVIEW") ?? 0;
  const publishedJobsCount = countByStatus.get("PUBLISHED") ?? 0;
  const rejectedJobsCount = countByStatus.get("REJECTED") ?? 0;
  const draftJobsCount = countByStatus.get("DRAFT") ?? 0;
  const allJobsCount = statusCounts.reduce((sum, row) => sum + row._count._all, 0);

  // Fetch posted by users to display publisher info
  const postedByIds = jobs.map((j) => j.postedById).filter(Boolean) as string[];
  const postedByUsers = postedByIds.length > 0 
    ? await prisma.user.findMany({
        where: { id: { in: postedByIds } },
        select: { id: true, fullName: true, email: true, phone: true }
      })
    : [];
  
  const userMap = new Map(postedByUsers.map((u) => [u.id, u]));

  // Replaced local inline server actions with direct bound imported actions to fix Next.js 15 crashes

  const STATUS_BADGES: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    PENDING_REVIEW: "bg-orange-50 text-orange-700 border-orange-100 animate-pulse",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    EXPIRED: "bg-amber-50 text-amber-700 border-amber-100",
  };

  const displayedJobs = jobs;

  return (
    <section className="py-2">
      {/* Header Panel */}
      <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-[#c0a368]/20 bg-[linear-gradient(135deg,rgba(17,21,36,0.95),rgba(15,23,42,0.82))] p-6 shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[#c0a368]/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="mb-2 inline-flex rounded-full border border-[#c0a368]/30 bg-[#c0a368]/10 px-3 py-1 text-xs font-extrabold text-[#e8d39c]">مراجعة الوظائف</p>
          <h1 className="text-3xl font-extrabold text-white">إدارة وتدقيق الوظائف</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">راجع الوظائف المقدمة من أصحاب الشركات، وافق على النشر، أو ارفض المحتوى غير اللائق.</p>
        </div>
        <Link className="inline-flex items-center justify-center rounded-full bg-[#c0a368] px-5 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-[#c0a368]/20 transition-colors hover:bg-[#d4ba79]" href="/admin/jobs/new">
          ➕ إضافة وظيفة يدوية
        </Link>
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/jobs?tab=pending" className={`${statCardBase} ${activeTab === "pending" ? "border-orange-400/40 bg-orange-500/10" : ""}`}>
          <div className="text-xs text-slate-400 font-bold">⏳ بانتظار المراجعة</div>
          <div className="text-3xl font-black text-orange-600 mt-1">{pendingJobsCount}</div>
        </Link>
        <Link href="/admin/jobs?tab=published" className={`${statCardBase} ${activeTab === "published" ? "border-emerald-400/40 bg-emerald-500/10" : ""}`}>
          <div className="text-xs text-slate-400 font-bold">✅ الوظائف المنشورة</div>
          <div className="text-3xl font-black text-emerald-300 mt-1">{publishedJobsCount}</div>
        </Link>
        <Link href="/admin/jobs?tab=rejected" className={`${statCardBase} ${activeTab === "rejected" ? "border-rose-400/40 bg-rose-500/10" : ""}`}>
          <div className="text-xs text-slate-400 font-bold">❌ الوظائف المرفوضة</div>
          <div className="text-3xl font-black text-rose-300 mt-1">{rejectedJobsCount}</div>
        </Link>
        <Link href="/admin/jobs?tab=all" className={`${statCardBase} ${activeTab === "all" ? "border-[#c0a368]/40 bg-[#c0a368]/10" : ""}`}>
          <div className="text-xs text-slate-400 font-bold">📁 إجمالي الوظائف</div>
          <div className="text-3xl font-black text-white mt-1">{allJobsCount}</div>
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-white/[0.05] p-2 backdrop-blur-xl">
        <Link 
          href="/admin/jobs?tab=pending" 
          className={`${tabBase} ${activeTab === "pending" ? "border-orange-400/40 bg-orange-500/15 text-orange-200" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}
        >
          ⏳ بانتظار التدقيق ({pendingJobsCount})
        </Link>
        <Link 
          href="/admin/jobs?tab=published" 
          className={`${tabBase} ${activeTab === "published" ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}
        >
          ✅ المنشورة ({publishedJobsCount})
        </Link>
        <Link 
          href="/admin/jobs?tab=rejected" 
          className={`${tabBase} ${activeTab === "rejected" ? "border-rose-400/40 bg-rose-500/15 text-rose-200" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}
        >
          ❌ المرفوضة ({rejectedJobsCount})
        </Link>
        <Link 
          href="/admin/jobs?tab=all" 
          className={`${tabBase} ${activeTab === "all" ? "border-[#c0a368]/40 bg-[#c0a368]/15 text-[#e8d39c]" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-white"}`}
        >
          📂 الكل ({allJobsCount})
        </Link>
      </div>

      {/* Jobs Feed / Moderation Panel */}
      <div className="space-y-4">
        {displayedJobs.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] py-12 text-center text-slate-400 shadow-2xl shadow-black/10 backdrop-blur-xl">
            <span className="text-3xl block mb-2">📭</span>
            <p className="font-bold text-sm text-white">لا توجد وظائف معروضة في هذا القسم حاليًا.</p>
            <p className="text-xs mt-1">عند نشر وظائف جديدة من أصحاب العمل أو منسقي الإدارة ستظهر هنا.</p>
          </div>
        ) : (
          displayedJobs.map((j) => {
            const publisher = j.postedById ? userMap.get(j.postedById) : null;
            return (
              <div key={j.id} className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/10 backdrop-blur-xl transition-colors hover:border-[#c0a368]/35 hover:bg-white/[0.09] md:flex-row md:items-center">
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-extrabold text-lg text-white">{j.title}</h2>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGES[j.status] || "bg-slate-50 text-slate-700 border-slate-150"}`}>
                      {JOB_STATUS_LABEL[j.status] || j.status}
                    </span>
                    {j.featured && <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">⭐ مميزة</span>}
                    {j.urgent && <span className="bg-red-150 text-red-700 border border-red-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">⚡ عاجلة</span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                    <div>🏢 الشركة: <strong className="text-slate-100">{j.company?.name ?? j.companyNameText ?? "غير محدد"}</strong></div>
                    <div>📍 الموقع: <strong className="text-slate-100">{j.city} {j.area ? `· ${j.area}` : ""}</strong></div>
                    <div>💼 نوع الدوام: <strong className="text-slate-100">{JOB_TYPE_LABEL[j.jobType] || j.jobType}</strong></div>
                    <div>🗓️ النشر الأصلي: <strong className="text-slate-100">{formatDateArabic(j.createdAt)}</strong></div>
                  </div>

                  {/* Publisher / Employer Info Badge */}
                  {publisher && (
                    <div className="mt-2 max-w-xl space-y-1 rounded-2xl border border-white/10 bg-slate-950/40 p-2.5 text-xs">
                      <div className="text-[10px] uppercase tracking-wider text-[#e8d39c] font-bold">👤 معلومات الناشر (صاحب العمل):</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-slate-300 font-bold">
                        <span>الاسم: {publisher.fullName}</span>
                        <span>البريد: {publisher.email}</span>
                        {publisher.phone && <span>الهاتف: {publisher.phone}</span>}
                      </div>
                    </div>
                  )}

                  {/* Contact Methods details */}
                  <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-white/10 mt-2">
                    {j.contactEmail && <span>📧 بريد التقديم: <strong className="text-slate-100">{j.contactEmail}</strong></span>}
                    {j.contactWhatsapp && <span>💬 واتساب: <strong className="text-slate-100">{j.contactWhatsapp}</strong></span>}
                    {j.externalUrl && <a href={j.externalUrl} target="_blank" className="text-[#e8d39c] underline font-bold">🔗 الرابط الخارجي</a>}
                  </div>
                </div>

                {/* Interaction Actions */}
                <div className="flex flex-row md:flex-col lg:flex-row items-center gap-2 w-full md:w-auto justify-end border-t border-white/10 md:border-t-0 pt-4 md:pt-0">
                  {j.status === "PENDING_REVIEW" && (
                    <>
                      <form action={adminApproveJobAction.bind(null, j.id)}>
                        <button className="rounded-full bg-[#c0a368] px-4 py-2 text-xs font-extrabold text-slate-950 shadow-lg shadow-[#c0a368]/15 transition-colors hover:bg-[#d4ba79] whitespace-nowrap">
                          ✔️ موافقة ونشر
                        </button>
                      </form>
                      
                      <form action={adminRejectJobAction.bind(null, j.id)}>
                        <button className="rounded-full border border-rose-800/60 bg-rose-950/50 px-4 py-2 text-xs font-extrabold text-rose-100 transition-colors hover:bg-rose-900 whitespace-nowrap">
                          ❌ رفض
                        </button>
                      </form>
                    </>
                  )}

                  <Link 
                    className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-extrabold text-slate-100 transition-colors hover:bg-slate-800 whitespace-nowrap" 
                    href={`/admin/jobs/${j.id}/edit`}
                  >
                    ⚙️ تفاصيل
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

