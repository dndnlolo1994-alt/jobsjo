import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { JobCard } from "@/components/JobCard";

export const metadata: Metadata = { title: "وظائفي المحفوظة", robots: { index: false, follow: false } };

export default async function SavedJobsPage() {
  const user = await requireJobSeeker();
  const saved = await prisma.savedJob.findMany({ where: { userId: user.id }, include: { job: { include: { company: { select: { name: true, slug: true, logoUrl: true } } } } }, orderBy: { createdAt: "desc" } });
  return <section className="container-jo py-8"><h1 className="section-title">وظائفي المحفوظة</h1><div className="space-y-4">{saved.map((s) => <JobCard key={s.id} job={s.job} />)}</div>{saved.length === 0 && <div className="card-pad text-navy-500">لا توجد وظائف محفوظة.</div>}</section>;
}
