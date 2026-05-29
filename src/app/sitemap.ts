import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/jobs"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/companies"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/pricing"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  let dynamicJobs: MetadataRoute.Sitemap = [];
  let dynamicCompanies: MetadataRoute.Sitemap = [];

  try {
    const jobs = await prisma.job.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    });

    dynamicJobs = jobs.map((job) => ({
      url: absoluteUrl(`/jobs/${job.slug}`),
      lastModified: job.updatedAt,
      changeFrequency: "daily",
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Error generating sitemap jobs:", error);
  }

  try {
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { publishedAt: { not: null } },
          { verificationStatus: "VERIFIED" },
          { jobs: { some: { status: "PUBLISHED" } } },
        ],
      },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 300,
    });

    dynamicCompanies = companies.map((company) => ({
      url: absoluteUrl(`/companies/${company.slug}`),
      lastModified: company.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error generating sitemap companies:", error);
  }

  return [...staticPages, ...dynamicJobs, ...dynamicCompanies];
}
