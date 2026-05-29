import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/JobCard";
import { createClaimAction } from "@/lib/actions/platform";
import { getSessionUser } from "@/lib/session";
import { CompanyReviewForm } from "@/components/CompanyReviewForm";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { Building2, ExternalLink, Mail, MessageCircle } from "lucide-react";

export const revalidate = 3600;

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
  const hiringEmail = company.email ?? company.jobs.find((job) => job.contactEmail)?.contactEmail ?? null;
  const mailSubject = `استفسار توظيف عبر جوبز الأردن - ${company.name}`;
  const orgLd = company.name && company.city ? { "@context": "https://schema.org", "@type": "Organization", name: company.name, address: { "@type": "PostalAddress", addressCountry: "JO", addressLocality: company.city }, url: company.website ?? undefined } : null;
  return (
    <section className="container-jo py-8">
      {orgLd && <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(orgLd)}} />}
      
      {claimed === "true" && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-sm p-4 rounded-2xl mb-6 font-bold flex items-center gap-2">
          <span>✓</span>
          <span>تم إرسال طلب المطالبة بنجاح! سنقوم بمراجعة الطلب والتواصل معك قريباً لتفعيل حساب شركتك.</span>
        </div>
      )}

      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-950/5">
        <div className="relative min-h-40 bg-gradient-to-l from-navy-950 via-emerald-950 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(209,179,111,0.22),transparent_24rem)]" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-emerald-500 via-amber-300 to-transparent" />
        </div>
        <div className="p-5 sm:p-7">
          <div className="-mt-20 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-3xl border-4 border-white bg-slate-50 text-3xl font-extrabold text-emerald-800 shadow-lg">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logoUrl} alt={company.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-12 w-12 text-emerald-700" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-navy-950">{company.name}</h1>
                <p className="mt-2 text-sm font-semibold text-navy-600">
                  {company.industry ?? "قطاع غير محدد"} · {company.companySize ?? "حجم غير محدد"} · {company.city ?? "الأردن"}{company.area ? ` - ${company.area}` : ""}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
              <div className="text-2xl font-extrabold text-emerald-700">{company.jobs.length.toLocaleString("ar-JO")}</div>
              <div className="text-xs font-bold text-emerald-900">وظائف مفتوحة</div>
            </div>
          </div>
          {company.description && <p className="mt-5 max-w-4xl leading-8 text-navy-700">{company.description}</p>}
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
