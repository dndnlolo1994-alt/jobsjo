import { env } from "@/lib/env";
import { JOB_TYPE_LABEL, EDUCATION_LEVEL_LABEL, EXPERIENCE_LEVEL_LABEL } from "@/lib/utils";

export function stripHtml(text: string | null | undefined) {
  return (text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function buildJobPostingJsonLd(job: {
  slug: string;
  title: string;
  description: string;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  companyNameText?: string | null;
  company?: { name: string; website?: string | null } | null;
  city: string;
  area?: string | null;
  jobType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  publishedAt?: Date | null;
  originalPostedAt?: Date | null;
  expiresAt?: Date | null;
  educationLevel?: string | null;
  experienceLevel?: string | null;
  status: string;
}) {
  if (job.status !== "PUBLISHED" || !job.title || !job.description || !job.city || !job.publishedAt) return null;
  const orgName = job.company?.name ?? job.companyNameText ?? "صاحب عمل عبر جوبز الأردن";
  const description = [
    job.description,
    job.responsibilities ? `المسؤوليات: ${job.responsibilities}` : "",
    job.requirements ? `المتطلبات: ${job.requirements}` : "",
    job.benefits ? `المزايا: ${job.benefits}` : "",
  ].filter(Boolean).join("\n\n");

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: stripHtml(description),
    datePosted: (job.originalPostedAt ?? job.publishedAt).toISOString(),
    employmentType: JOB_TYPE_LABEL[job.jobType] ?? job.jobType,
    hiringOrganization: {
      "@type": "Organization",
      name: orgName,
      ...(job.company?.website ? { sameAs: job.company.website } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "JO",
        addressLocality: job.city,
        streetAddress: job.area ?? job.city,
      },
    },
    url: `${env.SITE_URL}/jobs/${job.slug}`,
    directApply: true,
  };

  if (job.expiresAt) data.validThrough = job.expiresAt.toISOString();
  if (job.educationLevel) data.educationRequirements = EDUCATION_LEVEL_LABEL[job.educationLevel] ?? job.educationLevel;
  if (job.experienceLevel) data.experienceRequirements = EXPERIENCE_LEVEL_LABEL[job.experienceLevel] ?? job.experienceLevel;

  if (job.salaryMin || job.salaryMax) {
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.currency ?? "JOD",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin ?? job.salaryMax,
        maxValue: job.salaryMax ?? job.salaryMin,
        unitText: "MONTH",
      },
    };
  }

  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);
  return data;
}
