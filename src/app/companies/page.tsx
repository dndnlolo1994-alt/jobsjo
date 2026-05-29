import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Building2, BriefcaseBusiness, Mail, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "دليل الشركات",
  description: "شركات لديها وظائف منشورة على جوبز الأردن.",
};

export const revalidate = 3600;

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      jobs: { where: { status: "PUBLISHED" }, select: { id: true } },
    },
    orderBy: [{ verificationStatus: "desc" }, { createdAt: "desc" }],
    take: 80,
  });

  const inferredCompanies = companies.length > 0 ? [] : await getCompaniesFromPublishedJobs();
  const hasCompanies = companies.length > 0 || inferredCompanies.length > 0;

  return (
    <section className="container-jo py-8">
      <div className="mb-6">
        <h1 className="section-title">دليل الشركات</h1>
        <p className="section-sub">شركات أردنية وفرص عمل مفتوحة مع بيانات تواصل أوضح.</p>
      </div>

      {!hasCompanies ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-[0_8px_28px_rgba(15,23,42,0.045)]">
          <Building2 className="mx-auto h-10 w-10 text-emerald-600" />
          <h2 className="mt-3 text-lg font-extrabold text-navy-950">دليل الشركات قيد التحديث</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-navy-500">
            لا توجد شركات منشورة حالياً، ويمكنك تصفح الوظائف المتاحة مباشرة.
          </p>
          <Link href="/jobs" className="btn-primary mt-5 text-sm">تصفح الوظائف</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Link
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_16px_38px_rgba(15,23,42,0.09)]"
              href={`/companies/${company.slug}`}
              key={company.id}
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                  {company.logoUrl ? (
                    <Image src={company.logoUrl} alt={company.name} width={48} height={48} className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 text-sm font-extrabold leading-snug text-navy-950 group-hover:text-emerald-700 sm:text-base">
                      {company.name}
                    </h2>
                    {company.verificationStatus === "VERIFIED" && (
                      <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        موثقة
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-navy-500">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{company.city ?? "الأردن"}</span>
                    {company.industry && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>{company.industry}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-lg font-extrabold text-navy-950">{company.jobs.length.toLocaleString("ar-JO")}</div>
                  <div className="text-[11px] font-bold text-navy-500">وظائف مفتوحة</div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-lg font-extrabold text-navy-950">{company.companySize ?? "غير محدد"}</div>
                  <div className="text-[11px] font-bold text-navy-500">حجم الشركة</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] font-bold text-emerald-700">
                <Mail className="h-3.5 w-3.5" />
                <span>{company.email || company.website || company.whatsapp ? "بيانات التواصل متاحة داخل صفحة الشركة" : "افتح صفحة الشركة لعرض التفاصيل والوظائف"}</span>
              </div>
            </Link>
          ))}

          {inferredCompanies.map((company) => (
            <Link
              className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_16px_38px_rgba(15,23,42,0.09)]"
              href={`/jobs?q=${encodeURIComponent(company.name)}`}
              key={company.key}
            >
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-sm font-extrabold leading-snug text-navy-950 group-hover:text-emerald-700 sm:text-base">
                    {company.name}
                  </h2>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-navy-500">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{company.city ?? "الأردن"}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="text-lg font-extrabold text-navy-950">{company.jobsCount.toLocaleString("ar-JO")}</div>
                <div className="text-[11px] font-bold text-navy-500">وظائف منشورة</div>
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] font-bold text-emerald-700">
                <Mail className="h-3.5 w-3.5" />
                <span>عرض وظائف هذه الجهة</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

async function getCompaniesFromPublishedJobs() {
  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      city: true,
      companyNameText: true,
      sourceName: true,
      company: { select: { id: true, name: true, city: true } },
    },
    orderBy: [{ publishedAt: "desc" }],
    take: 240,
  });

  const companiesByKey = new Map<string, { key: string; name: string; city: string | null; jobsCount: number }>();

  for (const job of jobs) {
    const name = job.company?.name ?? job.companyNameText ?? job.sourceName;
    if (!name) continue;
    const key = job.company?.id ?? name.trim().toLowerCase();
    const current = companiesByKey.get(key);
    if (current) {
      current.jobsCount += 1;
      current.city ||= job.company?.city ?? job.city;
    } else {
      companiesByKey.set(key, {
        key,
        name,
        city: job.company?.city ?? job.city,
        jobsCount: 1,
      });
    }
  }

  return [...companiesByKey.values()].sort((a, b) => b.jobsCount - a.jobsCount).slice(0, 80);
}
