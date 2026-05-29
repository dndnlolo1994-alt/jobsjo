import Link from "next/link";
import { Briefcase } from "lucide-react";
import {
  JOB_TYPE_LABEL,
  formatJod,
  formatRelativeArabic,
} from "@/lib/utils";

type Props = {
  job: {
    id: string;
    slug: string;
    title: string;
    city: string;
    area?: string | null;
    jobType: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryText?: string | null;
    featured: boolean;
    urgent: boolean;
    publishedAt?: Date | null;
    companyNameText?: string | null;
    company?: { name: string; logoUrl?: string | null; slug: string } | null;
    sourceType?: string;
    source?: string | null;
    isVerified?: boolean;
    noExperienceRequired?: boolean;
    womenFriendly?: boolean;
  };
  matchScore?: number;
};

export function JobCard({ job, matchScore }: Props) {
  const companyName = job.company?.name ?? job.companyNameText ?? "صاحب عمل خاص";
  
  const salary =
    job.salaryMin || job.salaryMax
      ? `${formatJod(job.salaryMin ?? job.salaryMax ?? 0)}${
          job.salaryMax && job.salaryMin && job.salaryMax !== job.salaryMin
            ? ` - ${formatJod(job.salaryMax)}`
            : ""
        }`
      : job.salaryText || "غير محدد";

  const cardClasses = [
    "block rounded-2xl border transition-all duration-200 relative group overflow-hidden shadow-[0_8px_28px_rgba(15,23,42,0.045)] hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(15,23,42,0.09)]",
    job.featured
      ? "border-amber-200 bg-white hover:border-amber-300"
      : "border-slate-100 bg-white hover:border-emerald-200",
  ].join(" ");

  return (
    <Link href={`/jobs/${job.slug}`} className={cardClasses}>
      {job.featured ? (
        <div className="bg-gradient-to-l from-amber-400 via-amber-300 to-emerald-500 px-4 py-1.5 text-[11px] font-extrabold text-navy-950">
          وظيفة مميزة
        </div>
      ) : (
        <div className="h-1 bg-emerald-500/80 transition-all duration-300" />
      )}

      <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-emerald-400/20 bg-navy-950 text-white shadow-md shadow-navy-950/10 transition-transform duration-200 group-hover:scale-[1.03]">
          {job.company?.logoUrl ? (
            <img
               src={job.company.logoUrl}
               alt={companyName}
               className="w-full h-full object-cover"
            />
          ) : (
            <Briefcase className="h-6 w-6 text-emerald-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {job.urgent && (
                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                    عاجل
                  </span>
                )}
                <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {JOB_TYPE_LABEL[job.jobType] ?? job.jobType}
                </span>
              </div>
              <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-navy-950 transition-colors duration-200 group-hover:text-emerald-700 sm:text-base">
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-semibold text-navy-500 sm:text-[13px]">
                <span>{companyName}</span>
                <span className="text-slate-300" aria-hidden="true">•</span>
                <span>{job.city}</span>
                {job.area && (
                  <>
                    <span className="text-slate-300" aria-hidden="true">•</span>
                    <span>{job.area}</span>
                  </>
                )}
              </div>
            </div>

            {job.publishedAt && (
              <div className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-navy-500 sm:text-[11px]">
                {formatRelativeArabic(job.publishedAt)}
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {job.source === "scraped" ? (
              <span className="inline-flex items-center rounded-lg border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[10px] sm:text-xs font-bold text-orange-700">
                مصدر خارجي
              </span>
            ) : (
              <span className="inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] sm:text-xs font-bold text-emerald-700">
                ✓ موثقة
              </span>
            )}
            <span className="inline-flex items-center rounded-lg border border-slate-200/70 bg-slate-50 px-2 py-1 text-[10px] sm:text-xs font-bold text-navy-700">
              الراتب: {salary}
            </span>
            {job.noExperienceRequired && (
              <span className="inline-flex items-center rounded-lg border border-sky-100 bg-sky-50 px-2 py-1 text-[10px] sm:text-xs font-bold text-sky-700">
                بدون خبرة
              </span>
            )}
            {job.womenFriendly && (
              <span className="inline-flex items-center rounded-lg border border-fuchsia-100 bg-fuchsia-50 px-2 py-1 text-[10px] sm:text-xs font-bold text-fuchsia-700">
                مناسبة للسيدات
              </span>
            )}
            {matchScore !== undefined && (
              <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-extrabold ${
                matchScore >= 75
                  ? "bg-emerald-500/20 text-emerald-800 border border-emerald-500/30"
                  : matchScore >= 50
                  ? "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${matchScore >= 75 ? "bg-emerald-500 animate-pulse" : matchScore >= 50 ? "bg-amber-500" : "bg-slate-400"}`} />
                مطابقة {matchScore}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
