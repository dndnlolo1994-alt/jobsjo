import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "دليل الشركات", description: "شركات لديها وظائف منشورة على جوبز الأردن." };

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({ include: { jobs: { where: { status: "PUBLISHED" }, select: { id: true } } }, orderBy: { createdAt: "desc" }, take: 80 });
  return <section className="container-jo py-8"><h1 className="section-title">دليل الشركات</h1><div className="grid md:grid-cols-3 gap-4">{companies.map((c) => <Link className="card-pad" href={`/companies/${c.slug}`} key={c.id}><h2 className="font-bold">{c.name}</h2><p className="text-sm text-navy-600">{c.city ?? "الأردن"} · {c.jobs.length} وظيفة مفتوحة</p>{c.verificationStatus === "VERIFIED" && <span className="badge-success mt-2">موثقة</span>}</Link>)}</div></section>;
}
