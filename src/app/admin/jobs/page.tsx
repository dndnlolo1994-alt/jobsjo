import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminApproveJobAction, adminRejectJobAction } from "@/lib/actions/platform";
import { JOB_STATUS_LABEL, SOURCE_TYPE_LABEL, formatDateArabic, JOB_TYPE_LABEL } from "@/lib/utils";

export const metadata: Metadata = { title: "إدارة وتدقيق الوظائف", robots: { index: false, follow: false } };

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAdmin();
  const { tab } = await searchParams;
  const activeTab = tab || "pending";

  // Fetch all jobs in the system
  const jobs = await prisma.job.findMany({
    include: { company: true },
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  // Fetch posted by users to display publisher info
  const postedByIds = jobs.map((j) => j.postedById).filter(Boolean) as string[];
  const postedByUsers = postedByIds.length > 0 
    ? await prisma.user.findMany({
        where: { id: { in: postedByIds } },
        select: { id: true, fullName: true, email: true, phone: true }
      })
    : [];
  
  const userMap = new Map(postedByUsers.map((u) => [u.id, u]));

  const pendingJobs = jobs.filter((j) => j.status === "PENDING_REVIEW");
  const publishedJobs = jobs.filter((j) => j.status === "PUBLISHED");
  const rejectedJobs = jobs.filter((j) => j.status === "REJECTED");
  const draftJobs = jobs.filter((j) => j.status === "DRAFT");

  // Server Actions for Approve / Reject in page
  async function approveAction(formData: FormData) {
    "use server";
    const id = formData.get("jobId") as string;
    await adminApproveJobAction(id);
  }

  async function rejectAction(formData: FormData) {
    "use server";
    const id = formData.get("jobId") as string;
    await adminRejectJobAction(id);
  }

  const STATUS_BADGES: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-100",
    PENDING_REVIEW: "bg-orange-50 text-orange-700 border-orange-100 animate-pulse",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-100",
    DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
    EXPIRED: "bg-amber-50 text-amber-700 border-amber-100",
  };

  const displayedJobs = 
    activeTab === "pending" ? pendingJobs :
    activeTab === "published" ? publishedJobs :
    activeTab === "rejected" ? rejectedJobs :
    activeTab === "draft" ? draftJobs : jobs;

  return (
    <section className="container-jo py-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white border border-slate-150/60 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-navy-950">إدارة وتدقيق الوظائف</h1>
          <p className="text-sm text-navy-500 mt-1">راجع الوظائف المقدمة من أصحاب الشركات، وافق على النشر، أو ارفض المحتوى غير اللائق.</p>
        </div>
        <Link className="btn-primary text-sm px-5 py-2.5 shadow-md shadow-emerald-600/10 hover:scale-[1.01] transition-transform" href="/admin/jobs/new">
          ➕ إضافة وظيفة يدوية
        </Link>
      </div>

      {/* Stats Counter Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/jobs?tab=pending" className={`card-pad text-right transition-all hover:scale-[1.01] ${activeTab === "pending" ? "border-orange-500/30 bg-orange-50/20" : "bg-white"}`}>
          <div className="text-xs text-navy-400 font-bold">⏳ بانتظار المراجعة</div>
          <div className="text-3xl font-black text-orange-600 mt-1">{pendingJobs.length}</div>
        </Link>
        <Link href="/admin/jobs?tab=published" className={`card-pad text-right transition-all hover:scale-[1.01] ${activeTab === "published" ? "border-emerald-500/30 bg-emerald-50/20" : "bg-white"}`}>
          <div className="text-xs text-navy-400 font-bold">✅ الوظائف المنشورة</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{publishedJobs.length}</div>
        </Link>
        <Link href="/admin/jobs?tab=rejected" className={`card-pad text-right transition-all hover:scale-[1.01] ${activeTab === "rejected" ? "border-rose-500/30 bg-rose-50/20" : "bg-white"}`}>
          <div className="text-xs text-navy-400 font-bold">❌ الوظائف المرفوضة</div>
          <div className="text-3xl font-black text-rose-600 mt-1">{rejectedJobs.length}</div>
        </Link>
        <Link href="/admin/jobs?tab=all" className={`card-pad text-right transition-all hover:scale-[1.01] ${activeTab === "all" ? "border-navy-500/30 bg-navy-50/10" : "bg-white"}`}>
          <div className="text-xs text-navy-400 font-bold">📁 إجمالي الوظائف</div>
          <div className="text-3xl font-black text-navy-900 mt-1">{jobs.length}</div>
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-150 mb-6 gap-2">
        <Link 
          href="/admin/jobs?tab=pending" 
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 -mb-[2px] ${activeTab === "pending" ? "border-orange-500 text-orange-600 font-extrabold" : "border-transparent text-navy-400 hover:text-navy-700"}`}
        >
          ⏳ بانتظار التدقيق ({pendingJobs.length})
        </Link>
        <Link 
          href="/admin/jobs?tab=published" 
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 -mb-[2px] ${activeTab === "published" ? "border-emerald-500 text-emerald-600 font-extrabold" : "border-transparent text-navy-400 hover:text-navy-700"}`}
        >
          ✅ المنشورة ({publishedJobs.length})
        </Link>
        <Link 
          href="/admin/jobs?tab=rejected" 
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 -mb-[2px] ${activeTab === "rejected" ? "border-rose-500 text-rose-600 font-extrabold" : "border-transparent text-navy-400 hover:text-navy-700"}`}
        >
          ❌ المرفوضة ({rejectedJobs.length})
        </Link>
        <Link 
          href="/admin/jobs?tab=all" 
          className={`pb-3.5 px-4 font-bold text-sm transition-all border-b-2 -mb-[2px] ${activeTab === "all" ? "border-navy-600 text-navy-950 font-extrabold" : "border-transparent text-navy-400 hover:text-navy-700"}`}
        >
          📂 الكل ({jobs.length})
        </Link>
      </div>

      {/* Jobs Feed / Moderation Panel */}
      <div className="space-y-4">
        {displayedJobs.length === 0 ? (
          <div className="card-pad text-center py-12 text-navy-400 bg-white border border-slate-150/60 rounded-2xl shadow-sm">
            <span className="text-3xl block mb-2">📭</span>
            <p className="font-bold text-sm text-navy-800">لا توجد وظائف معروضة في هذا القسم حاليًا.</p>
            <p className="text-xs mt-1">عند نشر وظائف جديدة من أصحاب العمل أو منسقي الإدارة ستظهر هنا.</p>
          </div>
        ) : (
          displayedJobs.map((j) => {
            const publisher = j.postedById ? userMap.get(j.postedById) : null;
            return (
              <div key={j.id} className="bg-white border border-slate-150/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-extrabold text-lg text-navy-950">{j.title}</h2>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGES[j.status] || "bg-slate-50 text-slate-700 border-slate-150"}`}>
                      {JOB_STATUS_LABEL[j.status] || j.status}
                    </span>
                    {j.featured && <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">⭐ مميزة</span>}
                    {j.urgent && <span className="bg-red-150 text-red-700 border border-red-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">⚡ عاجلة</span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-600 font-medium">
                    <div>🏢 الشركة: <strong className="text-navy-950">{j.company?.name ?? j.companyNameText ?? "غير محدد"}</strong></div>
                    <div>📍 الموقع: <strong className="text-navy-950">{j.city} {j.area ? `· ${j.area}` : ""}</strong></div>
                    <div>💼 نوع الدوام: <strong className="text-navy-950">{JOB_TYPE_LABEL[j.jobType] || j.jobType}</strong></div>
                    <div>🗓️ النشر الأصلي: <strong className="text-navy-950">{formatDateArabic(j.createdAt)}</strong></div>
                  </div>

                  {/* Publisher / Employer Info Badge */}
                  {publisher && (
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs mt-2 space-y-1 max-w-xl">
                      <div className="text-[10px] uppercase tracking-wider text-navy-400 font-bold">👤 معلومات الناشر (صاحب العمل):</div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-navy-700 font-bold">
                        <span>الاسم: {publisher.fullName}</span>
                        <span>البريد: {publisher.email}</span>
                        {publisher.phone && <span>الهاتف: {publisher.phone}</span>}
                      </div>
                    </div>
                  )}

                  {/* Contact Methods details */}
                  <div className="text-xs text-navy-500 flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-slate-100 mt-2">
                    {j.contactEmail && <span>📧 بريد التقديم: <strong className="text-navy-800">{j.contactEmail}</strong></span>}
                    {j.contactWhatsapp && <span>💬 واتساب: <strong className="text-navy-800">{j.contactWhatsapp}</strong></span>}
                    {j.externalUrl && <a href={j.externalUrl} target="_blank" className="text-emerald-600 underline font-bold">🔗 الرابط الخارجي</a>}
                  </div>
                </div>

                {/* Interaction Actions */}
                <div className="flex flex-row md:flex-col lg:flex-row items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0">
                  {j.status === "PENDING_REVIEW" && (
                    <>
                      <form action={approveAction}>
                        <input type="hidden" name="jobId" value={j.id} />
                        <button className="btn-primary text-xs px-4 py-2 hover:scale-[1.01] transition-transform whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm">
                          ✔️ موافقة ونشر
                        </button>
                      </form>
                      
                      <form action={rejectAction}>
                        <input type="hidden" name="jobId" value={j.id} />
                        <button className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 text-xs px-4 py-2 hover:scale-[1.01] transition-transform whitespace-nowrap rounded-xl font-bold">
                          ❌ رفض
                        </button>
                      </form>
                    </>
                  )}

                  <Link 
                    className="btn-outline text-xs px-4 py-2 hover:scale-[1.01] transition-transform whitespace-nowrap rounded-xl font-bold" 
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

