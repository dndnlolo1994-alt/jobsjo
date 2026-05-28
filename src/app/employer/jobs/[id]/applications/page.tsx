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
  const job = await prisma.job.findUnique({ where: { id }, include: { applications: { include: { jobSeeker: { include: { jobSeekerProfile: true, cvProfile: true } } }, orderBy: { matchScore: "desc" } } } });
  if (!job) notFound();
  if (user.role !== "ADMIN" && job.postedById && job.postedById !== user.id) notFound();
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">مرشحو وظيفة: {job.title}</h1>
      <div className="space-y-4">{job.applications.map((a) => {
        const profile = a.jobSeeker.jobSeekerProfile;
        const score = profile ? computeMatch(job, { ...profile, hasCv: !!a.jobSeeker.cvProfile }) : { score: a.matchScore, reasons: [] };
        return <div className="card-pad" key={a.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">{a.jobSeeker.fullName}</h2><p className="text-sm text-navy-600">{profile?.city ?? "مدينة غير محددة"} · {APP_STATUS_LABEL[a.status]} · نسبة المطابقة {score.score}%</p><p className="text-xs text-navy-500 mt-1">المهارات: {fromCsv(profile?.skills).join("، ") || "غير مدخلة"}</p></div><div className="flex flex-wrap gap-2">{["SHORTLISTED","INTERVIEW","REJECTED","HIRED"].map((s) => <form key={s} action={adminUpdateApplicationStatus.bind(null, a.id, s)}><button className="btn-outline">{APP_STATUS_LABEL[s]}</button></form>)}</div></div><div className="flex flex-wrap gap-2 mt-3">{topReasons(score, 5).map((r) => <span className="badge-info" key={r.key}>{r.key}</span>)}</div>{a.coverNote && <p className="text-sm mt-3">{a.coverNote}</p>}</div>;
      })}</div>
      {job.applications.length === 0 && <div className="card-pad text-navy-500">لا يوجد متقدمون بعد.</div>}
    </section>
  );
}
