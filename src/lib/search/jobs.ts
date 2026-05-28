import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type JobSearchParams = {
  q?: string;
  city?: string;
  area?: string;
  category?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  experience?: string;
  education?: string;
  noExperience?: boolean;
  womenFriendly?: boolean;
  remote?: boolean;
  hybrid?: boolean;
  sourceType?: string;
  sort?: "newest" | "featured" | "urgent" | "best-match" | "salary-high" | "salary-low";
  page?: number;
  perPage?: number;
  includeAdminFilters?: boolean;
};

export function parseJobSearchParams(searchParams: Record<string, string | string[] | undefined>): JobSearchParams {
  const val = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const int = (k: string) => {
    const n = Number(val(k));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  return {
    q: val("q")?.trim(),
    city: val("city") || undefined,
    area: val("area") || undefined,
    category: val("category") || undefined,
    jobType: val("jobType") || undefined,
    salaryMin: int("salaryMin"),
    salaryMax: int("salaryMax"),
    experience: val("experience") || undefined,
    education: val("education") || undefined,
    noExperience: val("noExperience") === "1",
    womenFriendly: val("womenFriendly") === "1",
    remote: val("remote") === "1",
    hybrid: val("hybrid") === "1",
    sourceType: val("sourceType") || undefined,
    sort: (val("sort") as JobSearchParams["sort"]) || "newest",
    page: int("page") ?? 1,
  };
}

export async function searchJobsAdvanced(params: JobSearchParams) {
  const page = Math.max(1, params.page ?? 1);
  const perPage = Math.min(36, Math.max(6, params.perPage ?? 12));
  const where: Prisma.JobWhereInput = { status: "PUBLISHED" };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { requirements: { contains: params.q, mode: "insensitive" } },
      { responsibilities: { contains: params.q, mode: "insensitive" } },
      { companyNameText: { contains: params.q, mode: "insensitive" } },
      { skills: { contains: params.q, mode: "insensitive" } },
      { company: { name: { contains: params.q, mode: "insensitive" } } },
    ];
  }
  if (params.city) where.city = params.city;
  if (params.area) where.area = { contains: params.area, mode: "insensitive" };
  if (params.category) where.jobCategory = params.category;
  if (params.jobType) where.jobType = params.jobType as never;
  if (params.experience) where.experienceLevel = params.experience as never;
  if (params.education) where.educationLevel = params.education as never;
  if (params.noExperience) where.noExperienceRequired = true;
  if (params.womenFriendly) where.womenFriendly = true;
  if (params.remote) where.jobType = "REMOTE";
  if (params.hybrid) where.jobType = "HYBRID";
  if (params.sourceType && params.includeAdminFilters) where.sourceType = params.sourceType as never;
  if (params.salaryMin) where.OR = [...(where.OR ?? []), { salaryMax: { gte: params.salaryMin } }, { salaryMin: { gte: params.salaryMin } }];
  if (params.salaryMax) where.salaryMin = { lte: params.salaryMax };

  const orderBy: Prisma.JobOrderByWithRelationInput[] =
    params.sort === "featured" ? [{ featured: "desc" }, { publishedAt: "desc" }] :
    params.sort === "urgent" ? [{ urgent: "desc" }, { publishedAt: "desc" }] :
    params.sort === "salary-high" ? [{ salaryMax: "desc" }, { salaryMin: "desc" }] :
    params.sort === "salary-low" ? [{ salaryMin: "asc" }, { salaryMax: "asc" }] :
    [{ pinnedUntil: "desc" }, { featured: "desc" }, { urgent: "desc" }, { publishedAt: "desc" }];

  let items: Array<Prisma.JobGetPayload<{ include: { company: { select: { name: true; logoUrl: true; slug: true } } } }>> = [];
  let total = 0;

  if (params.q) {
    try {
      const q = `%${params.q}%`;
      const conditions: Prisma.Sql[] = [
        Prisma.sql`j."status"::text = 'PUBLISHED'`,
        Prisma.sql`(
          j."title" ILIKE ${q}
          OR c."name" ILIKE ${q}
          OR j."companyNameText" ILIKE ${q}
          OR j."skills" ILIKE ${q}
          OR j."description" ILIKE ${q}
          OR j."requirements" ILIKE ${q}
        )`,
      ];

      if (params.city) conditions.push(Prisma.sql`j."city" = ${params.city}`);
      if (params.area) conditions.push(Prisma.sql`j."area" ILIKE ${`%${params.area}%`}`);
      if (params.category) conditions.push(Prisma.sql`j."jobCategory" = ${params.category}`);
      if (params.jobType) conditions.push(Prisma.sql`j."jobType"::text = ${params.jobType}`);
      if (params.experience) conditions.push(Prisma.sql`j."experienceLevel"::text = ${params.experience}`);
      if (params.education) conditions.push(Prisma.sql`j."educationLevel"::text = ${params.education}`);
      if (params.noExperience) conditions.push(Prisma.sql`j."noExperienceRequired" = true`);
      if (params.womenFriendly) conditions.push(Prisma.sql`j."womenFriendly" = true`);
      if (params.remote) conditions.push(Prisma.sql`j."jobType"::text = 'REMOTE'`);
      if (params.hybrid) conditions.push(Prisma.sql`j."jobType"::text = 'HYBRID'`);
      if (params.sourceType && params.includeAdminFilters) conditions.push(Prisma.sql`j."sourceType"::text = ${params.sourceType}`);
      if (params.salaryMin) {
        conditions.push(Prisma.sql`(j."salaryMax" >= ${params.salaryMin} OR j."salaryMin" >= ${params.salaryMin})`);
      }
      if (params.salaryMax) conditions.push(Prisma.sql`j."salaryMin" <= ${params.salaryMax}`);

      const whereSql = Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}`;
      const orderSql =
        params.sort === "salary-high" ? Prisma.sql`j."salaryMax" DESC NULLS LAST, j."salaryMin" DESC NULLS LAST` :
        params.sort === "salary-low" ? Prisma.sql`j."salaryMin" ASC NULLS LAST, j."salaryMax" ASC NULLS LAST` :
        params.sort === "featured" ? Prisma.sql`j."featured" DESC, j."publishedAt" DESC NULLS LAST` :
        params.sort === "urgent" ? Prisma.sql`j."urgent" DESC, j."publishedAt" DESC NULLS LAST` :
        Prisma.sql`
          CASE
            WHEN j."title" ILIKE ${q} THEN 1
            WHEN c."name" ILIKE ${q} OR j."companyNameText" ILIKE ${q} THEN 2
            WHEN j."skills" ILIKE ${q} THEN 3
            WHEN j."description" ILIKE ${q} THEN 4
            ELSE 5
          END ASC,
          j."pinnedUntil" DESC NULLS LAST,
          j."featured" DESC,
          j."urgent" DESC,
          j."publishedAt" DESC NULLS LAST
        `;

      const [rows, countRows] = await Promise.all([
        prisma.$queryRaw<Array<{ id: string }>>`
          SELECT j."id"
          FROM "Job" j
          LEFT JOIN "Company" c ON c."id" = j."companyId"
          ${whereSql}
          ORDER BY ${orderSql}
          LIMIT ${perPage} OFFSET ${(page - 1) * perPage}
        `,
        prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint AS count
          FROM "Job" j
          LEFT JOIN "Company" c ON c."id" = j."companyId"
          ${whereSql}
        `,
      ]);

      const ids = rows.map((r) => r.id);
      total = Number(countRows[0]?.count ?? 0);
      if (ids.length) {
        const found = await prisma.job.findMany({
          where: { id: { in: ids } },
          include: { company: { select: { name: true, logoUrl: true, slug: true } } },
        });
        const order = new Map(ids.map((id, i) => [id, i]));
        items = found.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      }
      return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
    } catch {
      // Fall back to Prisma filters below when raw search is unavailable.
    }
  }

  try {
    [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: { company: { select: { name: true, logoUrl: true, slug: true } } },
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.job.count({ where }),
    ]);
  } catch {
    items = [];
    total = 0;
  }

  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function findDuplicateJobWarnings(input: {
  title: string;
  companyNameText?: string | null;
  city: string;
  sourceUrl?: string | null;
  excludeId?: string;
}) {
  const duplicates = await prisma.job.findMany({
    where: {
      id: input.excludeId ? { not: input.excludeId } : undefined,
      status: { in: ["DRAFT", "PENDING_REVIEW", "PUBLISHED"] },
      OR: [
        {
          title: { contains: input.title.slice(0, 18), mode: "insensitive" },
          city: input.city,
          companyNameText: input.companyNameText ? { contains: input.companyNameText, mode: "insensitive" } : undefined,
        },
        input.sourceUrl ? { sourceUrl: input.sourceUrl } : {},
      ],
    },
    select: { id: true, title: true, city: true, companyNameText: true, slug: true, sourceUrl: true, status: true },
    take: 5,
  });
  return duplicates.filter((d) => d.title || d.sourceUrl);
}

export function jobQualityChecklist(job: {
  title?: string | null;
  city?: string | null;
  companyNameText?: string | null;
  companyId?: string | null;
  contactMethod?: string | null;
  requirements?: string | null;
  expiresAt?: Date | string | null;
  sourceType?: string | null;
  sourceName?: string | null;
}) {
  return [
    { key: "title", label: "عنوان واضح", ok: !!job.title && job.title.length >= 4 },
    { key: "city", label: "مدينة محددة", ok: !!job.city },
    { key: "company", label: "شركة أو مصدر واضح", ok: !!job.companyId || !!job.companyNameText || !!job.sourceName },
    { key: "apply", label: "طريقة تقديم", ok: !!job.contactMethod },
    { key: "requirements", label: "متطلبات مكتوبة", ok: !!job.requirements && job.requirements.length >= 10 },
    { key: "expiry", label: "تاريخ انتهاء", ok: !!job.expiresAt },
    { key: "source", label: "ملاحظة مصدر للإعلانات المنسّقة", ok: job.sourceType === "EMPLOYER_DIRECT" || !!job.sourceName },
  ];
}
