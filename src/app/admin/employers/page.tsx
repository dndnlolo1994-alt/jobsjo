import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
export const metadata: Metadata = { title: "أصحاب العمل", robots: { index: false, follow: false } };
export default async function Page(){ await requireAdmin(); const items=await prisma.user.findMany({where:{role:"EMPLOYER"},include:{employerProfile:{include:{company:true}}},orderBy:{createdAt:"desc"},take:100}); return <section className="container-jo py-8"><h1 className="section-title">أصحاب العمل</h1><div className="space-y-3">{items.map(i=><div className="card-pad" key={i.id}><b>{i.fullName}</b><p className="text-sm text-navy-600">{i.email} · {i.employerProfile?.company?.name ?? "لم تربط شركة"} · {i.isSuspended ? "موقوف" : "نشط"}</p></div>)}</div></section>; }
