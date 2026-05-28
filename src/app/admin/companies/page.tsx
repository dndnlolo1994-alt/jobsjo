import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
export const metadata: Metadata = { title: "الشركات", robots: { index: false, follow: false } };
export default async function Page(){ await requireAdmin(); const items=await prisma.company.findMany({orderBy:{createdAt:"desc"},take:100}); return <section className="container-jo py-8"><h1 className="section-title">الشركات</h1><div className="space-y-3">{items.map(i=><div className="card-pad" key={i.id}><b>{i.name}</b><p className="text-sm text-navy-600">{i.city ?? "مدينة غير محددة"} · {i.verificationStatus}</p></div>)}</div></section>; }
