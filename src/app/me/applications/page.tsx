import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { APP_STATUS_LABEL, formatDateArabic } from "@/lib/utils";

export const metadata: Metadata = { title: "طلباتي", robots: { index: false, follow: false } };

export default async function ApplicationsPage() {
  const user = await requireJobSeeker();
  const apps = await prisma.application.findMany({ where: { jobSeekerId: user.id }, include: { job: { include: { company: true } } }, orderBy: { createdAt: "desc" } });
  return (
    <section className="container-jo py-8">
      <h1 className="section-title">طلبات التقديم</h1>
      <div className="space-y-3">{apps.map((a) => <div className="card-pad" key={a.id}><h2 className="font-bold">{a.job.title}</h2><p className="text-sm text-navy-600">{a.job.company?.name ?? a.job.companyNameText} · {formatDateArabic(a.createdAt)} · {APP_STATUS_LABEL[a.status]}</p>{a.coverNote && <p className="text-sm mt-2">{a.coverNote}</p>}</div>)}</div>
      {apps.length === 0 && <div className="card-pad text-navy-500">لم تتقدم لأي وظيفة بعد.</div>}
    </section>
  );
}
