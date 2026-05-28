import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { JORDAN_CITIES } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.SITE_URL;
  const staticPages = ["", "/jobs", "/companies", "/pricing", "/about", "/privacy", "/terms", "/contact"].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
  const cityPages = JORDAN_CITIES.map((city) => ({ url: `${base}/jobs?city=${encodeURIComponent(city)}`, lastModified: new Date() }));
  let jobs: MetadataRoute.Sitemap = [];
  let companies: MetadataRoute.Sitemap = [];
  try {
    const [j, c] = await Promise.all([
      prisma.job.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.company.findMany({ where: { publishedAt: { not: null } }, select: { slug: true, updatedAt: true } }),
    ]);
    jobs = j.map((x) => ({ url: `${base}/jobs/${x.slug}`, lastModified: x.updatedAt }));
    companies = c.map((x) => ({ url: `${base}/companies/${x.slug}`, lastModified: x.updatedAt }));
  } catch {}
  return [...staticPages, ...cityPages, ...jobs, ...companies];
}
