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

  // Build card wrapper classes based on whether it is featured
  const cardClasses = job.featured
    ? "card-pad block border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.02] to-white hover:border-amber-500/45 transition-all duration-300 relative group overflow-hidden hover:-translate-y-1.5 rounded-2xl shadow-[0_10px_35px_-4px_rgba(202,162,72,0.05)] hover:shadow-[0_20px_48px_-4px_rgba(202,162,72,0.11)]"
    : "card-pad block border border-slate-100 bg-white hover:border-emerald-500/30 transition-all duration-300 relative group overflow-hidden hover:-translate-y-1.5 rounded-2xl shadow-[0_10px_35px_-4px_rgba(15,23,42,0.03)] hover:shadow-[0_20px_48px_-4px_rgba(15,23,42,0.08)]";

  return (
    <Link href={`/jobs/${job.slug}`} className={cardClasses}>
      {/* Visual Indicator Bar */}
      <div className={`absolute inset-y-0 right-0 w-1 transition-all duration-300 ${
        job.featured 
          ? "bg-amber-400 group-hover:w-1.5" 
          : "bg-emerald-600 group-hover:w-1.5"
      }`} />

      <div className="flex items-start gap-4">
        {/* Company Logo container */}
        <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-50 border border-slate-100/80 grid place-items-center text-navy-700 font-extrabold shadow-sm overflow-hidden group-hover:scale-105 transition-transform duration-300">
          {job.company?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.company.logoUrl}
              alt={companyName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-navy-700 text-lg">{companyName.slice(0, 1)}</span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header Badges */}
          {(job.featured || job.urgent) && (
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {job.featured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  👑 مميزة
                </span>
              )}
              {job.urgent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  🔥 عاجل
                </span>
              )}
            </div>
          )}

          {/* Job Title */}
          <h3 className="font-bold text-navy-900 group-hover:text-emerald-700 transition-colors duration-200 text-sm sm:text-base leading-snug line-clamp-2">
            {job.title}
          </h3>

          {/* Company and City info with bullet separators */}
          <div className="text-xs sm:text-sm text-navy-500 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
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

          {/* Bottom Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
              {JOB_TYPE_LABEL[job.jobType] ?? job.jobType}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-slate-100 text-navy-600 border border-slate-200/60">
              الراتب: {salary}
            </span>
            {job.noExperienceRequired && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100">
                بدون خبرة
              </span>
            )}
            {job.womenFriendly && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                مناسبة للسيدات
              </span>
            )}
            {matchScore !== undefined && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-extrabold ${
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

        {/* Date Posted (Desktop only) */}
        {job.publishedAt && (
          <div className="text-[11px] text-navy-400 font-medium shrink-0 hidden sm:flex items-center gap-1 pt-1">
            <span>🕒</span>
            <span>{formatRelativeArabic(job.publishedAt)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
