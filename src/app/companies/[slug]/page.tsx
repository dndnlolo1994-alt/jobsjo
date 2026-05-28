import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/JobCard";
import { createClaimAction } from "@/lib/actions/platform";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const company = await prisma.company.findUnique({
    where: { slug: decodedSlug },
    select: { name: true, description: true, city: true, industry: true },
  });
  if (!company) return { title: "شركة غير موجودة | جوبز الأردن" };

  const title = `وظائف شركة ${company.name} في الأردن | جوبز الأردن`;
  const description = company.description
    ? company.description.slice(0, 160)
    : `تصفح الوظائف الشاغرة وفرص العمل المتاحة لدى شركة ${company.name} في ${company.city || "الأردن"} في قطاع ${company.industry || "التشغيل"}.`;

  return {
    title,
    description,
    keywords: ["وظائف شركات", company.name, company.city, company.industry].filter(Boolean) as string[],
  };
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const company = await prisma.company.findUnique({ where: { slug: decodedSlug }, include: { jobs: { where: { status: "PUBLISHED" }, include: { company: { select: { name: true, slug: true, logoUrl: true } } }, orderBy: { publishedAt: "desc" } } } });
  if (!company) notFound();
  const orgLd = company.name && company.city ? { "@context": "https://schema.org", "@type": "Organization", name: company.name, address: { "@type": "PostalAddress", addressCountry: "JO", addressLocality: company.city }, url: company.website ?? undefined } : null;
  return <section className="container-jo py-8">{orgLd && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(orgLd)}} />}<div className="card-pad mb-6"><h1 className="text-3xl font-extrabold">{company.name}</h1><p className="text-navy-600 mt-2">{company.city ?? "الأردن"}{company.area ? ` - ${company.area}` : ""}</p>{company.description && <p className="mt-4 leading-7">{company.description}</p>}</div><div className="grid lg:grid-cols-[1fr_340px] gap-6"><main className="space-y-4"><h2 className="section-title">الوظائف المفتوحة</h2>{company.jobs.map((j) => <JobCard key={j.id} job={j} />)}{company.jobs.length===0&&<div className="card-pad text-navy-500">لا توجد وظائف منشورة حالياً.</div>}</main>{company.verificationStatus !== "VERIFIED" && <aside className="card-pad h-fit"><h2 className="font-bold mb-3">هل أنت صاحب الشركة؟ طالب بإدارة الصفحة</h2><form action={createClaimAction.bind(null, null)} className="space-y-3"><input type="hidden" name="companyId" value={company.id}/><input className="input" name="claimantName" placeholder="اسمك" required/><input className="input" name="phone" placeholder="رقم الهاتف" required/><input className="input" name="email" type="email" placeholder="البريد الإلكتروني" required/><input className="input" name="companyRole" placeholder="صفتك في الشركة" required/><textarea className="input" name="proofText" placeholder="كيف نتحقق من ملكيتك أو صفتك؟"/><input className="input" name="websiteOrSocialUrl" placeholder="رابط موقع أو صفحة إن وجد"/><button className="btn-primary w-full">إرسال المطالبة</button></form></aside>}</div></section>;
}
