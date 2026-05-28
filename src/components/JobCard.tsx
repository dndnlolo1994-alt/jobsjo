import Link from "next/link";
import {
  JOB_TYPE_LABEL,
  formatJod,
  formatRelativeArabic,
} from "@/lib/utils";
import { Badge } from "./Badge";

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

  return (
    <Link
      href={`/jobs/${job.slug}`}
      className="card-pad block hover:shadow-cardHover transition-all relative group overflow-hidden hover:-translate-y-0.5"
    >
      <div className="absolute inset-y-0 right-0 w-1 job-card-accent" />
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-lg bg-navy-50 border border-navy-100 grid place-items-center text-navy-700 font-bold">
          {job.company?.logoUrl ? (
            <img
              src={job.company.logoUrl}
              alt={companyName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            companyName.slice(0, 1)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 mb-2">
            {job.featured && <Badge variant="warning">مميزة</Badge>}
            {job.urgent && <Badge variant="danger">عاجل</Badge>}
          </div>
          <h3 className="font-bold text-navy-900 group-hover:text-emerald-700 line-clamp-2">
            {job.title}
          </h3>
          <div className="text-sm text-navy-500 mt-1">
            {companyName} · {job.city}
            {job.area ? ` — ${job.area}` : ""}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="info">{JOB_TYPE_LABEL[job.jobType] ?? job.jobType}</Badge>
            <Badge variant="muted">الراتب: {salary}</Badge>
            {job.noExperienceRequired && <Badge variant="success">بدون خبرة</Badge>}
            {job.womenFriendly && <Badge variant="success">مناسبة للسيدات</Badge>}
            {matchScore !== undefined && (
              <Badge variant={matchScore >= 60 ? "success" : "muted"}>
                مطابقة {matchScore}%
              </Badge>
            )}
          </div>
        </div>

        <div className="text-xs text-navy-400 shrink-0 hidden sm:block pt-1">
          {job.publishedAt ? formatRelativeArabic(job.publishedAt) : ""}
        </div>
      </div>
    </Link>
  );
}
