import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.jordan-job.shop";

  // 1. Static Pages definitions with priority and changeFrequency
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${base}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/companies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${base}/cv-builder`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${base}/contact`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  let dynamicJobs: MetadataRoute.Sitemap = [];
  let dynamicCompanies: MetadataRoute.Sitemap = [];

  try {
    // 2. Fetch active jobs from DB via Prisma
    const jobs = await prisma.job.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    });

    dynamicJobs = jobs.map((job) => ({
      url: `${base}/jobs/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: "daily",
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Error generating sitemap jobs:", error);
  }

  try {
    // 3. Fetch active companies from DB via Prisma
    const companies = await prisma.company.findMany({
      where: { publishedAt: { not: null } },
      select: { slug: true, updatedAt: true },
    });

    dynamicCompanies = companies.map((company) => ({
      url: `${base}/companies/${company.slug}`,
      lastModified: company.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error generating sitemap companies:", error);
  }

  return [...staticPages, ...dynamicJobs, ...dynamicCompanies];
}
