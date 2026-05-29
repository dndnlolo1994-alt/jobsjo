import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/Badge";
import { JOB_TYPE_LABEL, EXPERIENCE_LEVEL_LABEL, EDUCATION_LEVEL_LABEL, formatDateArabic, formatJod } from "@/lib/utils";
import { JobPostingSchema } from "@/components/seo/JobPostingSchema";
import { applyToJobAction } from "@/lib/actions/platform";
import { tplApplyToJob } from "@/lib/whatsapp";
import { getSession } from "@/lib/session";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { publicMetadata } from "@/lib/seo/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
    orderBy: { publishedAt: "desc" },
    take: 100,
  });
  return jobs.map((job) => ({
    slug: job.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const job = await prisma.job.findUnique({
    where: { slug: decodedSlug },
    select: {
      title: true,
      description: true,
      status: true,
      city: true,
      jobCategory: true,
      salaryMin: true,
      salaryMax: true,
      salaryText: true,
      companyNameText: true,
      company: { select: { name: true } },
    },
  });
  if (!job) return {};
  const isPublished = job.status === "PUBLISHED";
  const companyName = job.company?.name ?? job.companyNameText ?? "صاحب عمل خاص";
  const salary = job.salaryText ?? (job.salaryMin || job.salaryMax ? `${formatJod(job.salaryMin ?? job.salaryMax)} - ${formatJod(job.salaryMax ?? job.salaryMin)}` : "راتب غير محدد");
  const desc = `${job.title} في ${companyName} — ${job.city} | ${salary}. ${job.description}`.slice(0, 160);

  return {
    ...publicMetadata({
      title: `${job.title} - فرصة عمل في ${job.city}`,
      description: desc,
      path: `/jobs/${decodedSlug}`,
      keywords: ["وظائف", job.title, job.city, job.jobCategory, "جوبز الأردن"].filter(Boolean) as string[],
    }),
    robots: isPublished ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const job = await prisma.job.findUnique({ where: { slug: decodedSlug }, include: { company: true } });
  if (!job) notFound();
  
  const companyName = job.company?.name ?? job.companyNameText ?? "صاحب عمل خاص";
  const salary = job.salaryText ?? (job.salaryMin || job.salaryMax ? `${formatJod(job.salaryMin ?? 0)} - ${formatJod(job.salaryMax ?? job.salaryMin ?? 0)}` : "غير محدد");
  const whatsapp = job.contactWhatsapp ? tplApplyToJob({ phone: job.contactWhatsapp, seekerName: "اسمي", jobTitle: job.title, city: job.city }) : null;

  // Check login seeker plan & application limits
  const session = await getSession();
  const user = session?.user;
  
  let isSeeker = false;
  let isFreePlan = true;
  let appCount = 0;
  let hasApplied = false;
  
  if (user) {
    if (user.role === "JOB_SEEKER") {
      isSeeker = true;
      const [profile, count, existingApp] = await Promise.all([
        prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } }),
        prisma.application.count({ where: { jobSeekerId: user.id } }),
        prisma.application.findFirst({ where: { jobId: job.id, jobSeekerId: user.id } }),
      ]);
      isFreePlan = !profile || profile.plan === "FREE";
      appCount = count;
      hasApplied = !!existingApp;
    } else {
      // Admins and Employers are not restricted
      isFreePlan = false;
    }
  } else {
    // Guests are treated as free
    isFreePlan = true;
  }

  const reachedLimit = isSeeker && isFreePlan && appCount >= 5;

  return (
    <article className="container-jo py-8">
      <BreadcrumbJsonLd items={[{ name: "وظائف الأردن", path: "/jobs" }, { name: job.title, path: `/jobs/${job.slug}` }]} />
      <JobPostingSchema job={job} />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <main className="space-y-5">
          <section className="card-pad">
            <div className="flex flex-wrap gap-2 mb-3">
              {job.featured && <Badge variant="warning">مميزة</Badge>}
              {job.urgent && <Badge variant="danger">عاجلة</Badge>}
              <Badge>{JOB_TYPE_LABEL[job.jobType]}</Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-navy-900">{job.title}</h1>
            <p className="text-navy-600 mt-2">{companyName} · {job.city}{job.area ? ` — ${job.area}` : ""}</p>
            <div className="grid sm:grid-cols-3 gap-3 mt-5">
              <Info label="الراتب" value={salary} />
              <Info label="الخبرة" value={EXPERIENCE_LEVEL_LABEL[job.experienceLevel]} />
              <Info label="التعليم" value={EDUCATION_LEVEL_LABEL[job.educationLevel]} />
            </div>
          </section>
          <Section title="وصف الوظيفة" text={job.description} />
          <Section title="المسؤوليات" text={job.responsibilities} />
          <Section title="المتطلبات" text={job.requirements} />
          <Section title="المزايا" text={job.benefits} />
          
          {job.sourceType !== "EMPLOYER_DIRECT" && (
            <section className="card-pad border-sand-200 bg-sand-50">
              <h2 className="font-bold text-navy-900">ملاحظة المصدر</h2>
              <p className="text-sm text-navy-700 mt-2">تم إدخال هذه الوظيفة من مصدر عام أو يدويًا. إذا كنت صاحب الإعلان يمكنك طلب تعديلها أو إزالتها.</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <a className="btn-outline" href={`/companies/${job.company?.slug ?? ""}`}>أنا صاحب هذا الإعلان</a>
                <a className="btn-outline" href="/contact">طلب إزالة أو تعديل</a>
                <a className="btn-danger" href="/contact">الإبلاغ عن إعلان</a>
              </div>
            </section>
          )}
        </main>
        
        <aside className="space-y-4">
          <div className="card-pad sticky top-20">
            <h2 className="font-bold text-navy-900 mb-3 text-lg border-b border-navy-50 pb-2">التقديم للوظيفة</h2>
            
            {/* If user is not logged in */}
            {!user && (
              <div className="space-y-3">
                <p className="text-xs text-navy-600 leading-5">
                  يرجى تسجيل الدخول كباحث عمل لتتمكن من التقديم مباشرة عبر المنصة بسيرتك الذاتية الموثقة.
                </p>
                <Link href={`/login?redirect=/jobs/${job.slug}`} className="btn-primary w-full text-sm">تسجيل الدخول للتقديم</Link>
              </div>
            )}

            {/* If user is logged in as Job Seeker or guest */}
            {(isSeeker || !user) && (
              <>
                {hasApplied ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-xs font-bold text-center">
                    ✓ لقد تقدمت لهذه الوظيفة سابقاً
                  </div>
                ) : reachedLimit ? (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-red-800 text-xs font-bold leading-5">
                      ⚠️ لقد استهلكت جميع التقديمات المجانية المتاحة لك (5/5). يرجى الترقية لباقة Plus للتقديم.
                    </div>
                    <Link href="/pricing" className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full text-xs font-bold text-center">
                      اشترك في باقة Plus المميزة ⚡
                    </Link>
                  </div>
                ) : (
                  job.contactMethod === "INTERNAL_APPLY" && (
                    <form action={applyToJobAction.bind(null, null)} className="space-y-3">
                      <input type="hidden" name="jobId" value={job.id} />
                      <textarea className="input min-h-28 text-sm" name="coverNote" placeholder="اكتب رسالة قصيرة ومقنعة لصاحب العمل (اختياري)..." />
                      <SubmitButton className="btn-primary w-full text-sm" pendingText="جاري إرسال الطلب...">
                        إرسال طلب التقديم السريع
                      </SubmitButton>
                      
                      {isFreePlan && (
                        <p className="text-[10px] text-navy-500 text-center mt-2 leading-relaxed">
                          باقة مجانية: مستهلك {appCount} من 5 تقديمات.
                        </p>
                      )}
                    </form>
                  )
                )}
                
                {/* External options gated for FREE users */}
                {job.contactMethod === "WHATSAPP" && (
                  isFreePlan ? (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2 mt-3">
                      <p className="text-xs text-slate-500 leading-relaxed">تقديم مباشر عبر الواتساب مغلق للخطط المجانية.</p>
                      <Link href="/pricing" className="btn bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold w-full">
                        اشترك في Plus لفتح التقديم 🔓
                      </Link>
                    </div>
                  ) : (
                    whatsapp && <a className="btn-primary w-full text-sm mt-3" href={whatsapp} target="_blank">تقديم مباشر عبر واتساب</a>
                  )
                )}

                {job.contactMethod === "EMAIL" && job.contactEmail && (
                  <a className="btn-primary w-full text-sm mt-3" href={`mailto:${job.contactEmail}?subject=${encodeURIComponent(`تقديم لوظيفة: ${job.title}`)}`}>
                    تقديم عبر البريد الإلكتروني
                  </a>
                )}

                {job.contactMethod === "EXTERNAL_LINK" && job.externalUrl && (
                  isFreePlan ? (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-2 mt-3">
                      <p className="text-xs text-slate-500 leading-relaxed">رابط التقديم الخارجي للشركة مغلق للخطط المجانية.</p>
                      <Link href="/pricing" className="btn bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold w-full">
                        اشترك في Plus لفتح التقديم 🔓
                      </Link>
                    </div>
                  ) : (
                    <a className="btn-primary w-full text-sm mt-3" href={job.externalUrl} target="_blank">فتح رابط التقديم الخارجي</a>
                  )
                )}
              </>
            )}

            {/* If user is an employer or admin */}
            {user && user.role !== "JOB_SEEKER" && (
              <div className="bg-navy-50 border border-navy-150 p-3 rounded-lg text-navy-700 text-xs text-center leading-relaxed font-semibold">
                أنت مسجل كـ {user.role === "ADMIN" ? "أدمن" : "صاحب عمل"}. خيارات التقديم للباحثين فقط.
              </div>
            )}

            <div className="text-[11px] text-navy-500 mt-5 pt-4 border-t border-navy-50 space-y-1.5">
              <p>تاريخ النشر: {formatDateArabic(job.publishedAt)}</p>
              <p>ينتهي في: {formatDateArabic(job.expiresAt)}</p>
              <p>المصدر: {job.sourceName ?? "جوبز الأردن"}</p>
              {job.contactEmail && (job.contactMethod === "EMAIL" || user?.role === "ADMIN") && (
                <p>
                  بريد الشركة:{" "}
                  <a className="link font-bold" href={`mailto:${job.contactEmail}?subject=${encodeURIComponent(`استفسار حول وظيفة: ${job.title}`)}`}>
                    {job.contactEmail}
                  </a>
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return <div className="rounded-xl bg-navy-50 p-3"><div className="text-xs text-navy-500">{label}</div><div className="font-bold text-navy-900 text-sm mt-0.5">{value ?? "غير محدد"}</div></div>;
}

function Section({ title, text }: { title: string; text?: string | null }) {
  if (!text) return null;
  return <section className="card-pad"><h2 className="text-xl font-bold text-navy-900 mb-3">{title}</h2><p className="leading-8 whitespace-pre-line text-navy-700 text-sm">{text}</p></section>;
}
