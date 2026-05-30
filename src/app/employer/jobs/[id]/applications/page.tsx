import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/auth";
import { APP_STATUS_LABEL, fromCsv } from "@/lib/utils";
import { topReasons } from "@/lib/matching/reasons";
import { computeMatch } from "@/lib/matching/job-score";
import { adminUpdateApplicationStatus } from "@/lib/actions/platform";

export const metadata: Metadata = { title: "مرشحو الوظيفة", robots: { index: false, follow: false } };

export default async function EmployerApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireEmployer();
  const { id } = await params;
  const job = await prisma.job.findUnique({ 
    where: { id }, 
    include: { 
      applications: { 
        include: { 
          jobSeeker: { 
            include: { 
              jobSeekerProfile: true, 
              cvProfile: true 
            } 
          } 
        } 
      } 
    } 
  });
  
  if (!job) notFound();
  if (user.role !== "ADMIN" && job.postedById && job.postedById !== user.id) notFound();

  // Sort applications: PLUS plan seekers first, then by matchScore descending
  const sortedApplications = [...job.applications].sort((a, b) => {
    const aPlus = a.jobSeeker.jobSeekerProfile?.plan === "PLUS" ? 1 : 0;
    const bPlus = b.jobSeeker.jobSeekerProfile?.plan === "PLUS" ? 1 : 0;
    if (aPlus !== bPlus) return bPlus - aPlus;
    return b.matchScore - a.matchScore;
  });

  const workflowStatuses = ["VIEWED", "SHORTLISTED", "INTERVIEW", "HIRED", "REJECTED"];

  return (
    <section className="container-jo py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title mb-1">مرشحو وظيفة: {job.title}</h1>
          <p className="section-sub mb-0">كل تغيير حالة يرسل تحديثاً للمتقدم ويتم تسجيل قبول الإرسال من مزود البريد.</p>
        </div>
        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
          {sortedApplications.length.toLocaleString("ar-JO")} متقدم
        </span>
      </div>
      <div className="space-y-4">
        {sortedApplications.map((a) => {
          const profile = a.jobSeeker.jobSeekerProfile;
          const score = profile ? computeMatch(job, { ...profile, hasCv: !!a.jobSeeker.cvProfile }) : { score: a.matchScore, reasons: [] };
          const isPlus = profile?.plan === "PLUS";
          const emailBadges = [
            a.applicantConfirmationSentAt ? "تأكيد المتقدم مرسل" : "تأكيد المتقدم غير مؤكد",
            a.employerNotificationSentAt ? "إشعار الشركة مرسل" : "إشعار الشركة غير مؤكد",
            a.statusNotificationSentAt ? "آخر تحديث حالة مرسل" : null,
          ].filter(Boolean);

          return (
            <div className={`card-pad border transition-all duration-300 ${
              isPlus ? "border-emerald-250 bg-emerald-500/[0.02] shadow-md shadow-emerald-500/[0.02]" : "border-slate-100"
            }`} key={a.id}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-navy-950">{a.jobSeeker.fullName}</h2>
                    {isPlus && (
                      <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <span>👑</span> باحث بلس
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-navy-600">{profile?.city ?? "مدينة غير محددة"} · {APP_STATUS_LABEL[a.status]} · نسبة المطابقة {score.score}%</p>
                  <p className="text-xs text-navy-500 mt-1">المهارات: {fromCsv(profile?.skills).join("، ") || "غير مدخلة"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {workflowStatuses.map((s) => (
                    <form key={s} action={adminUpdateApplicationStatus.bind(null, a.id, s)}>
                      <button
                        className={`btn-outline text-xs px-3 py-1.5 rounded-xl ${a.status === s ? "border-emerald-500 bg-emerald-50 text-emerald-800" : ""}`}
                        disabled={a.status === s}
                      >
                        {APP_STATUS_LABEL[s]}
                      </button>
                    </form>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {emailBadges.map((badge) => (
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-[11px] font-extrabold ${
                      badge?.includes("غير")
                        ? "border-amber-100 bg-amber-50 text-amber-800"
                        : "border-emerald-100 bg-emerald-50 text-emerald-700"
                    }`}
                    key={badge}
                  >
                    {badge}
                  </span>
                ))}
                {a.employerNotificationTo && (
                  <span className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600" dir="ltr">
                    {a.employerNotificationTo}
                  </span>
                )}
                {a.notificationError && (
                  <span className="rounded-lg border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                    يحتاج متابعة بريدية
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {topReasons(score, 5).map((r) => (
                  <span className="badge-info" key={r.key}>{r.key}</span>
                ))}
              </div>
              {a.coverNote && <p className="text-sm mt-3 text-navy-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{a.coverNote}</p>}
            </div>
          );
        })}
      </div>
      {job.applications.length === 0 && <div className="card-pad text-navy-500">لا يوجد متقدمون بعد.</div>}
    </section>
  );
}
