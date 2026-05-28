import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
export const metadata: Metadata = { title: "البلاغات", robots: { index: false, follow: false } };
export default async function Page(){ await requireAdmin(); const items=await prisma.reportedJob.findMany({include:{job:true,user:true},orderBy:{createdAt:"desc"},take:100}); return <section className="container-jo py-8"><h1 className="section-title">بلاغات الوظائف</h1><div className="space-y-3">{items.map(i=><div className="card-pad" key={i.id}><b>{i.job.title}</b><p className="text-sm text-navy-600">{i.reason} · {i.resolved ? "محلول" : "مفتوح"}</p>{i.details&&<p className="text-sm mt-2">{i.details}</p>}</div>)}</div></section>; }
