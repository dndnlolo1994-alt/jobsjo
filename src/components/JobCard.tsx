import Link from "next/link";
import Image from "next/image";
import { JOB_TYPE_LABEL, formatJod, formatRelativeArabic } from "@/lib/utils";

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

/* First letter avatar colour pairs */
const AVATAR_COLORS = [
  ["#EBF0FF", "#1B4FDB"],
  ["#FFF0EB", "#E85A22"],
  ["#F0FDF4", "#059669"],
  ["#FEF3C7", "#D97706"],
  ["#F3E8FF", "#7C3AED"],
  ["#FEE2E2", "#DC2626"],
];

function avatarColors(name: string) {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function JobCard({ job, matchScore }: Props) {
  const companyName = job.company?.name ?? job.companyNameText ?? "صاحب عمل خاص";
  const firstLetter = companyName[0] ?? "ج";
  const [bg, fg]    = avatarColors(companyName);

  const salary =
    job.salaryMin || job.salaryMax
      ? `${formatJod(job.salaryMin ?? job.salaryMax ?? 0)}${
          job.salaryMax && job.salaryMin && job.salaryMax !== job.salaryMin
            ? ` – ${formatJod(job.salaryMax)}`
            : ""
        }`
      : job.salaryText || null;

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="block card relative group"
      style={job.featured ? { borderColor: "rgba(255,107,53,0.30)" } : undefined}
    >
      {/* ── Top accent bar ─────────────────────────────────────── */}
      {job.featured ? (
        <div
          className="px-4 py-1.5 text-[11px] font-extrabold text-white flex items-center gap-1.5"
          style={{ background: "linear-gradient(90deg, #FF6B35, #FF8C5A)" }}
        >
          <span>★</span> وظيفة مميزة
        </div>
      ) : (
        <div
          className="h-[3px] transition-all duration-300"
          style={{ background: "linear-gradient(90deg, #1B4FDB, #4F79FF)" }}
        />
      )}

      {/* ── Card body ──────────────────────────────────────────── */}
      <div className="flex items-start gap-3.5 p-4 sm:gap-4 sm:p-5">

        {/* Avatar / Logo */}
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border text-lg font-extrabold overflow-hidden transition-transform duration-200 group-hover:scale-105"
          style={{ background: bg, color: fg, borderColor: `${fg}22` }}
        >
          {job.company?.logoUrl ? (
            <Image
              src={job.company.logoUrl}
              alt={companyName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            firstLetter
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-1.5">
                {job.urgent && (
                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                    ⚡ عاجل
                  </span>
                )}
                <span className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-2.5 py-0.5 text-[10px] font-bold text-primary-600">
                  {JOB_TYPE_LABEL[job.jobType] ?? job.jobType}
                </span>
              </div>

              {/* Title */}
              <h3 className="line-clamp-2 text-sm font-extrabold leading-snug transition-colors duration-200 group-hover:text-primary-600 sm:text-base"
                  style={{ color: "var(--color-text)" }}>
                {job.title}
              </h3>

              {/* Company + City */}
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-semibold sm:text-[13px]"
                   style={{ color: "var(--color-muted)" }}>
                <span>{companyName}</span>
                <span className="text-gray-300" aria-hidden>•</span>
                <span>📍 {job.city}{job.area ? ` — ${job.area}` : ""}</span>
              </div>
            </div>

            {/* Time stamp */}
            {job.publishedAt && (
              <div className="shrink-0 rounded-full border border-gray-100 bg-gray-50 px-2.5 py-1 text-[10px] font-semibold text-gray-500 sm:text-[11px] whitespace-nowrap">
                {formatRelativeArabic(job.publishedAt)}
              </div>
            )}
          </div>

          {/* Footer row */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">

            {/* Salary */}
            {salary && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-emerald-700">
                💰 {salary}
              </span>
            )}
            {!salary && (
              <span className="inline-flex items-center rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-[10px] sm:text-xs font-semibold text-gray-500">
                الراتب غير محدد
              </span>
            )}

            {/* Source */}
            {job.source === "scraped" ? (
              <span className="inline-flex items-center rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-orange-700">
                مصدر خارجي
              </span>
            ) : (
              <span className="inline-flex items-center rounded-lg border border-primary-100 bg-primary-50 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-primary-600">
                ✓ موثقة
              </span>
            )}

            {job.noExperienceRequired && (
              <span className="inline-flex items-center rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-sky-700">
                بدون خبرة
              </span>
            )}
            {job.womenFriendly && (
              <span className="inline-flex items-center rounded-lg border border-fuchsia-100 bg-fuchsia-50 px-2.5 py-1 text-[10px] sm:text-xs font-bold text-fuchsia-700">
                مناسبة للسيدات
              </span>
            )}

            {/* Match score */}
            {matchScore !== undefined && (
              <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] sm:text-xs font-extrabold ${
                matchScore >= 75
                  ? "bg-emerald-500/15 text-emerald-800 border border-emerald-500/25"
                  : matchScore >= 50
                  ? "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${matchScore >= 75 ? "bg-emerald-500 animate-pulse" : matchScore >= 50 ? "bg-amber-500" : "bg-gray-400"}`} />
                مطابقة {matchScore}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
