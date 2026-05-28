import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { APP_STATUS_LABEL } from "@/lib/utils";
export const metadata: Metadata = { title: "طلبات التقديم", robots: { index: false, follow: false } };
export default async function Page(){ await requireAdmin(); const items=await prisma.application.findMany({include:{job:true,jobSeeker:true},orderBy:{createdAt:"desc"},take:100}); return <section className="container-jo py-8"><h1 className="section-title">كل طلبات التقديم</h1><div className="space-y-3">{items.map(i=><div className="card-pad" key={i.id}><b>{i.job.title}</b><p className="text-sm text-navy-600">{i.jobSeeker.fullName} · {APP_STATUS_LABEL[i.status]} · مطابقة {i.matchScore}%</p></div>)}</div></section>; }
