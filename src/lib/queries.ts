// استعلامات مشتركة للوظائف والشركات

import { prisma } from "./prisma";
import type { JobType } from "@/generated/client";

export type JobsQueryParams = {
  q?: string;
  city?: string;
  area?: string;
  category?: string;
  jobType?: string;
  salaryMin?: number;
  noExperience?: boolean;
  womenFriendly?: boolean;
  hasWhatsApp?: boolean;
  sort?: "newest" | "featured" | "match";
  page?: number;
  perPage?: number;
};

export async function searchJobs(params: JobsQueryParams) {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(50, Math.max(5, params.perPage ?? 12));
  const where: any = { status: "PUBLISHED" };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { companyNameText: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.city) where.city = params.city;
  if (params.area) where.area = params.area;
  if (params.category) where.jobCategory = params.category;
  if (params.jobType) where.jobType = params.jobType as JobType;
  if (params.salaryMin) where.salaryMin = { gte: params.salaryMin };
  if (params.noExperience) where.noExperienceRequired = true;
  if (params.womenFriendly) where.womenFriendly = true;
  if (params.hasWhatsApp) where.contactMethod = "WHATSAPP";

  const orderBy: any =
    params.sort === "featured"
      ? [{ featured: "desc" }, { publishedAt: "desc" }]
      : [{ publishedAt: "desc" }];

  const [items, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: { company: { select: { name: true, logoUrl: true, slug: true } } },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.job.count({ where }),
  ]);

  return { items, total, page, perPage, pages: Math.ceil(total / perPage) };
}

export async function getJobBySlug(slug: string) {
  return prisma.job.findUnique({
    where: { slug },
    include: {
      company: true,
    },
  });
}

export async function getSimilarJobs(jobId: string, city: string, category: string, take = 4) {
  return prisma.job.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: jobId },
      OR: [{ city }, { jobCategory: category }],
    },
    take,
    include: { company: { select: { name: true, logoUrl: true, slug: true } } },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
}

export async function listPublicCompanies(q?: string) {
  return prisma.company.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: [{ verificationStatus: "desc" }, { createdAt: "desc" }],
    take: 60,
  });
}
