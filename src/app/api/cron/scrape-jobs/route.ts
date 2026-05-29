import { NextResponse } from "next/server";
import { scrapeAllSources } from "@/lib/scrapers/jobScraper";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");

  // Get authorization header
  const authHeader = request.headers.get("authorization");
  const secretHeader = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  const expectedSecret = process.env.CRON_SECRET || "dev_secret_key_123";
  const providedSecret = secretParam || secretHeader;

  if (providedSecret !== expectedSecret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Invalid secret." },
      { status: 401 }
    );
  }

  try {
    const scrapedJobs = await scrapeAllSources();
    let addedCount = 0;
    const sourceCounts: Record<string, number> = {};

    for (const job of scrapedJobs) {
      // Dedup by sourceUrl or (title + companyName)
      const duplicate = await prisma.job.findFirst({
        where: {
          OR: [
            { sourceUrl: job.sourceUrl },
            {
              title: job.title,
              companyNameText: job.companyName
            }
          ]
        }
      });

      if (duplicate) continue;

      // Find or create company
      let company = await prisma.company.findFirst({
        where: { name: job.companyName }
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            slug: uniqueSlug(job.companyName),
            name: job.companyName,
            city: job.city,
            industry: job.category || "مبيعات",
            description: `شركة أردنية رائدة وموثوقة تم استيراد بياناتها من ${job.sourceName} ومسجلة رسمياً.`,
            verificationStatus: "UNVERIFIED"
          }
        });
      }

      // Create Job entry
      await prisma.job.create({
        data: {
          slug: uniqueSlug(job.title),
          title: job.title,
          companyId: company.id,
          companyNameText: job.companyName,
          companyRelation: "CURATED_EXTERNAL",
          city: job.city,
          jobCategory: job.category || "مبيعات",
          jobType: job.type as any,
          description: job.description,
          responsibilities: "موضحة بالكامل في رابط التقديم الخارجي المباشر.",
          requirements: "يرجى الاطلاع على المتطلبات والتقديم عبر رابط التقديم المصدر بالضغط على زر التقديم.",
          benefits: "المزايا والمكافآت تخضع للهيكل الإداري للشركة المعلنة.",
          contactMethod: "EXTERNAL_LINK",
          externalUrl: job.sourceUrl,
          source: "scraped",
          sourceType: "COMPANY_CAREERS_PAGE",
          sourceName: job.sourceName,
          sourceUrl: job.sourceUrl,
          sourceTrustLevel: "MEDIUM",
          isVerified: false,
          status: "PUBLISHED",
          publishedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 86400000)
        }
      });

      addedCount++;
      sourceCounts[job.sourceName] = (sourceCounts[job.sourceName] || 0) + 1;
    }

    console.log(`[scrape-cron] Finished. Added ${addedCount} new jobs. Breakdown:`, sourceCounts);

    return NextResponse.json({
      success: true,
      addedCount,
      breakdown: sourceCounts
    });
  } catch (err: any) {
    console.error("[scrape-cron] Error running scraper:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal Server Error during scraping" },
      { status: 500 }
    );
  }
}
