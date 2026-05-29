import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/JobCard";
import { createClaimAction } from "@/lib/actions/platform";
import { getSessionUser } from "@/lib/session";
import { CompanyReviewForm } from "@/components/CompanyReviewForm";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Building2, ExternalLink, Mail, MessageCircle } from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { publicMetadata } from "@/lib/seo/site";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const company = await prisma.company.findUnique({
    where: { slug: decodedSlug },
    select: { name: true, description: true, city: true, industry: true },
  });
  if (!company) return { title: "شركة غير موجودة | جوبز الأردن" };

  const title = `وظائف شركة ${company.name} في الأردن`;
  const description = company.description
    ? company.description.slice(0, 160)
    : `تصفح الوظائف الشاغرة وفرص العمل المتاحة لدى شركة ${company.name} في ${company.city || "الأردن"} في قطاع ${company.industry || "التشغيل"}.`;

  return {
    ...publicMetadata({
      title,
      description,
      path: `/companies/${decodedSlug}`,
      keywords: ["وظائف شركات", company.name, company.city, company.industry].filter(Boolean) as string[],
    }),
  };
}

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ claimed?: string }>;
}) {
  const { slug } = await params;
  const { claimed } = await searchParams;
  const decodedSlug = decodeURIComponent(slug);
  const [company, user] = await Promise.all([
    prisma.company.findUnique({
      where: { slug: decodedSlug },
      include: {
        jobs: { where: { status: "PUBLISHED" }, include: { company: { select: { name: true, slug: true, logoUrl: true } } }, orderBy: { publishedAt: "desc" } },
        reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 8 },
      },
    }),
    getSessionUser(),
  ]);
  if (!company) notFound();
  const hiringEmail = company.email ?? company.jobs.find((job) => job.contactEmail && job.contactMethod === "EMAIL")?.contactEmail ?? null;
  const mailSubject = `استفسار توظيف عبر جوبز الأردن - ${company.name}`;
  const orgLd = company.name && company.city ? { "@context": "https://schema.org", "@type": "Organization", name: company.name, address: { "@type": "PostalAddress", addressCountry: "JO", addressLocality: company.city }, url: company.website ?? undefined } : null;
  return (
    <section className="container-jo py-6 pb-28 md:py-8 md:pb-8">
      <BreadcrumbJsonLd items={[{ name: "دليل الشركات", path: "/companies" }, { name: company.name, path: `/companies/${company.slug}` }]} />
      {orgLd && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(orgLd)}} />}
      
      {claimed === "true" && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-sm p-4 rounded-2xl mb-6 font-bold flex items-center gap-2">
          <span>✓</span>
          <span>تم إرسال طلب المطالبة بنجاح! سنقوم بمراجعة الطلب والتواصل معك قريباً لتفعيل حساب شركتك.</span>
        </div>
      )}

      <div className="mb-6 rounded-[1.75rem] border border-slate-100 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
        <div className="relative h-28 overflow-hidden rounded-t-[1.75rem] bg-[linear-gradient(135deg,#0f172a_0%,#15352d_48%,#08111f_100%)] sm:h-36 lg:h-44">
          <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.26),transparent_18rem),radial-gradient(circle_at_75%_10%,rgba(209,179,111,0.18),transparent_16rem)]" />
          <div className="absolute inset-x-5 top-5 flex justify-between opacity-15">
            <div className="h-12 w-28 rounded-full border border-white/40" />
            <div className="h-20 w-20 rounded-3xl border border-emerald-200/50" />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-emerald-500 via-amber-300 to-transparent" />
        </div>
        <div className="relative p-4 pt-0 sm:p-7 sm:pt-0">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-slate-50 text-2xl font-extrabold text-emerald-800 shadow-xl shadow-slate-950/10 sm:h-24 sm:w-24 sm:text-3xl">
                {company.logoUrl ? (
                  <Image src={company.logoUrl} alt={company.name} width={96} height={96} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-10 w-10 text-emerald-700 sm:h-12 sm:w-12" />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-extrabold leading-tight text-navy-950 sm:text-3xl">
                  {company.name}
                </h1>
                <p className="mt-2 text-sm font-semibold leading-7 text-navy-600">
                  {company.industry ?? "قطاع غير محدد"} · {company.companySize ?? "حجم غير محدد"} · {company.city ?? "الأردن"}{company.area ? ` - ${company.area}` : ""}
                </p>
              </div>
            </div>
            <div className="w-full rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center sm:w-auto sm:min-w-36">
              <div className="text-xl font-extrabold text-emerald-700 sm:text-2xl">{company.jobs.length.toLocaleString("ar-JO")}</div>
              <div className="text-xs font-bold text-emerald-900">وظائف مفتوحة</div>
            </div>
          </div>
          {company.description && <p className="mt-5 max-w-4xl text-base leading-8 text-navy-700">{company.description}</p>}
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            {hiringEmail && (
              <a href={`mailto:${hiringEmail}?subject=${encodeURIComponent(mailSubject)}`} className="btn-primary px-3 py-2">
                <Mail className="h-4 w-4" />
                تواصل بالإيميل
              </a>
            )}
            {company.whatsapp && (
              <a href={`https://wa.me/${company.whatsapp}`} target="_blank" className="btn-outline px-3 py-2">
                <MessageCircle className="h-4 w-4" />
                واتساب
              </a>
            )}
            {company.website && (
              <a href={company.website} target="_blank" className="btn-outline px-3 py-2">
                <ExternalLink className="h-4 w-4" />
                الموقع الإلكتروني
              </a>
            )}
            {company.facebookUrl && <a href={company.facebookUrl} target="_blank" className="btn-outline px-3 py-2">فيسبوك</a>}
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <main className="space-y-4">
          <h2 className="section-title">الوظائف المفتوحة</h2>
          {company.jobs.map((j) => <JobCard key={j.id} job={j} />)}
          {company.jobs.length===0&&<div className="card-pad text-navy-500">لا توجد وظائف منشورة حالياً.</div>}
          <section className="card-pad">
            <h2 className="mb-4 text-xl font-extrabold text-navy-950">تقييمات الشركة</h2>
            <div className="space-y-3">
              {company.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-extrabold text-navy-900">{review.title}</h3>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{review.rating}/5</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-navy-600">{review.comment}</p>
                </div>
              ))}
            </div>
            {company.reviews.length === 0 && <p className="text-sm text-navy-500">لا توجد تقييمات معتمدة بعد.</p>}
          </section>
        </main>
        <aside className="space-y-4">
          <div className="card-pad h-fit">
            <h2 className="mb-3 font-extrabold text-navy-950">التواصل مع الشركة</h2>
            <div className="space-y-2 text-sm text-navy-600">
              {hiringEmail ? (
                <a
                  className="btn-primary w-full text-sm"
                  href={`mailto:${hiringEmail}?subject=${encodeURIComponent(mailSubject)}`}
                >
                  <Mail className="h-4 w-4" />
                  إرسال إيميل للتوظيف
                </a>
              ) : (
                <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs leading-6">
                  لا يوجد بريد منشور لهذه الشركة حالياً. يمكنك التقديم على الوظائف المفتوحة أو مطالبة الشركة بإدارة الصفحة.
                </p>
              )}
              {company.whatsapp && (
                <a className="btn-outline w-full text-sm" href={`https://wa.me/${company.whatsapp}`} target="_blank">
                  <MessageCircle className="h-4 w-4" />
                  تواصل واتساب
                </a>
              )}
            </div>
          </div>

          <div className="card-pad h-fit">
            <h2 className="mb-3 font-bold">أضف تقييمك للشركة</h2>
            {user ? (
              <CompanyReviewForm companyId={company.id} />
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-navy-600">
                سجل الدخول لإضافة تقييم. <a className="link font-bold" href={`/login?redirect=/companies/${company.slug}`}>تسجيل الدخول</a>
              </div>
            )}
          </div>
          {company.verificationStatus !== "VERIFIED" && (
          <div className="card-pad h-fit">
            <h2 className="font-bold mb-3">هل أنت صاحب الشركة؟ طالب بإدارة الصفحة</h2>
            <form action={createClaimAction.bind(null, null)} className="space-y-3">
              <input type="hidden" name="companyId" value={company.id}/>
              <input className="input" name="claimantName" placeholder="اسمك" required/>
              <input className="input" name="phone" placeholder="رقم الهاتف" required/>
              <input className="input" name="email" type="email" placeholder="البريد الإلكتروني" required/>
              <input className="input" name="companyRole" placeholder="صفتك في الشركة" required/>
              <textarea className="input" name="proofText" placeholder="كيف نتحقق من ملكيتك أو صفتك؟"/>
              <input className="input" name="websiteOrSocialUrl" placeholder="رابط موقع أو صفحة إن وجد"/>
              <SubmitButton className="btn-primary w-full" pendingText="جاري إرسال المطالبة...">إرسال المطالبة</SubmitButton>
            </form>
          </div>
        )}
        </aside>
      </div>
    </section>
  );
}
