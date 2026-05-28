import Link from "next/link";
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
    "block rounded-2xl border bg-white/95 p-4 sm:p-5 transition-all duration-200 relative group overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-lg",
    job.featured
      ? "border-amber-200/80 hover:border-amber-300"
      : "border-slate-200 hover:border-emerald-200",
  ].join(" ");

  return (
    <Link href={`/jobs/${job.slug}`} className={cardClasses}>
      <div className={`absolute inset-x-0 top-0 h-1 transition-all duration-300 ${
        job.featured 
          ? "bg-gradient-to-l from-amber-400 via-amber-300 to-emerald-500" 
          : "bg-emerald-500/80"
      }`} />

      <div className="flex items-start gap-3 sm:gap-4 pt-1">
        <div className="shrink-0 w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/80 grid place-items-center text-navy-700 font-extrabold shadow-sm overflow-hidden transition-transform duration-200 group-hover:scale-[1.03]">
          {job.company?.logoUrl ? (
            <img
              src={job.company.logoUrl}
              alt={companyName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-navy-700 text-lg">{companyName.slice(0, 1)}</span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {(job.featured || job.urgent) && (
                <div className="mb-1.5 flex flex-wrap gap-1.5">
              {job.featured && (
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  مميزة
                </span>
              )}
              {job.urgent && (
                <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  عاجل
                </span>
              )}
            </div>
          )}

              <h3 className="text-sm sm:text-base font-extrabold leading-snug text-navy-900 transition-colors duration-200 line-clamp-2 group-hover:text-emerald-700">
                {job.title}
              </h3>
            </div>

            {job.publishedAt && (
              <div className="hidden shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-navy-500 sm:block">
                {formatRelativeArabic(job.publishedAt)}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm font-medium text-navy-500">
            <span>{companyName}</span>
            <span className="text-slate-300" aria-hidden="true">•</span>
            <span>{job.city}</span>
            {job.area && (
              <>
                <span className="text-slate-300" aria-hidden="true">•</span>
                <span className="text-navy-400 text-xs">{job.area}</span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[10px] sm:text-xs font-bold text-emerald-700">
              {JOB_TYPE_LABEL[job.jobType] ?? job.jobType}
            </span>
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
