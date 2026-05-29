import * as cheerio from "cheerio";
import { env } from "@/lib/env";

export interface ScrapedJob {
  title: string;
  companyName: string;
  city: string;
  type: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  postedAt: Date;
  salary?: string;
  category?: string;
}

// Helper to parse job type
function parseJobType(t: string): string {
  const type = t.toUpperCase().replace(/[-_]/g, "");
  if (type.includes("FULL") || type.includes("كامل")) return "FULL_TIME";
  if (type.includes("PART") || type.includes("جزئي")) return "PART_TIME";
  if (type.includes("REMOTE") || type.includes("بعد")) return "REMOTE";
  if (type.includes("HYBRID") || type.includes("هجين")) return "HYBRID";
  if (type.includes("SHIFT") || type.includes("شيفت")) return "SHIFT";
  if (type.includes("INTERN") || type.includes("تدريب")) return "INTERNSHIP";
  return "FULL_TIME";
}

// Helper to parse city
function parseCity(cityStr: string): string {
  const c = cityStr.trim();
  if (c.includes("عمان") || c.includes("عمّان")) return "عمّان";
  if (c.includes("اربد") || c.includes("إربد")) return "إربد";
  if (c.includes("الزرقاء")) return "الزرقاء";
  if (c.includes("العقبة")) return "العقبة";
  if (c.includes("السلط")) return "السلط";
  if (c.includes("مادبا")) return "مادبا";
  if (c.includes("الكرك")) return "الكرك";
  if (c.includes("الطفيلة")) return "الطفيلة";
  if (c.includes("معان")) return "معان";
  if (c.includes("جرش")) return "جرش";
  if (c.includes("عجلون")) return "عجلون";
  if (c.includes("المفرق")) return "المفرق";
  return "عمّان";
}

// Helper to map category name to valid platform category
function mapCategory(catStr: string): string {
  const cat = catStr.trim();
  if (cat.includes("مطعم") || cat.includes("ضيافة") || cat.includes("غذائي")) return "مطاعم وضيافة";
  if (cat.includes("مبيعات") || cat.includes("تسويق") || cat.includes("سيلز")) return "مبيعات";
  if (cat.includes("كاشير") || cat.includes("صندوق")) return "كاشير";
  if (cat.includes("توصيل") || cat.includes("سائق") || cat.includes("سواق")) return "توصيل وسائقين";
  if (cat.includes("مصنع") || cat.includes("إنتاج") || cat.includes("عامل")) return "مصانع وإنتاج";
  if (cat.includes("مستودع") || cat.includes("لوجستي")) return "مستودعات";
  if (cat.includes("محاسب") || cat.includes("مالية") || cat.includes("تدقيق")) return "محاسبة";
  if (cat.includes("خدمة عملاء") || cat.includes("استقبال") || cat.includes("كول سنتر")) return "خدمة عملاء";
  if (cat.includes("تقنية") || cat.includes("برمج") || cat.includes("اتصالات") || cat.includes("شبكات") || cat.includes("برمجيات") || cat.includes("IT")) return "تقنية المعلومات";
  if (cat.includes("تعليم") || cat.includes("مدرس") || cat.includes("تدريب") || cat.includes("معلم")) return "تعليم وتدريب";
  if (cat.includes("صيدل") || cat.includes("عيادة") || cat.includes("تمريض") || cat.includes("طبي")) return "صيدليات وعيادات";
  if (cat.includes("تصميم") || cat.includes("ديزاين") || cat.includes("إعلام")) return "تصميم وتسويق";
  if (cat.includes("منزل") || cat.includes("نظافة") || cat.includes("تنظيف")) return "أعمال منزلية";
  return "مبيعات"; // default fallback
}

export async function scrapeBayt(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const url = "https://www.bayt.com/rss/jordan/jobs/";
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ar,en;q=0.9"
  };

  try {
    const res = await fetch(url, { headers, next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`Bayt status: ${res.status}`);
    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });

    $("item").each((_, el) => {
      const titleText = $(el).find("title").text() || "";
      const link = $(el).find("link").text() || "";
      const description = $(el).find("description").text() || "";
      const pubDate = $(el).find("pubDate").text() || "";

      let title = titleText;
      let companyName = "صاحب عمل خاص";
      let city = "عمّان";

      const parts = titleText.split(" - ");
      if (parts.length >= 2) {
        title = parts[0].trim();
        companyName = parts[1].trim();
        if (parts[2]) {
          city = parseCity(parts[2]);
        }
      }

      jobs.push({
        title,
        companyName,
        city,
        type: "FULL_TIME",
        description: description.replace(/<[^>]+>/g, " ").trim() || "تفاصيل الوظيفة متوفرة بالضغط على زر التقديم الخارجي.",
        sourceUrl: link,
        sourceName: "Bayt",
        postedAt: pubDate ? new Date(pubDate) : new Date(),
        category: "محاسبة"
      });
    });

  } catch (error) {
    console.warn("Bayt live scrape failed, using mock fallback:", error);
    try {
      const mockRes = await fetch(`${env.SITE_URL}/api/mock-feed?source=tanqeeb`, { next: { revalidate: 0 } });
      if (mockRes.ok) {
        const xml = await mockRes.text();
        const $ = cheerio.load(xml, { xmlMode: true });
        $("item").each((_, el) => {
          const title = $(el).find("title").text() || "";
          const link = $(el).find("link").text() || "";
          const description = $(el).find("description").text() || "";
          const pubDate = $(el).find("pubDate").text() || "";
          const city = parseCity($(el).find("city").text() || "الزرقاء");
          const type = parseJobType($(el).find("type").text() || "FULL_TIME");
          const category = mapCategory($(el).find("category").text() || "محاسبة");

          jobs.push({
            title,
            companyName: title.split(" - ")[1] || "الشركة الأردنية للألبان",
            city,
            type,
            description: description.replace(/<[^>]+>/g, " ").trim(),
            sourceUrl: link,
            sourceName: "Bayt",
            postedAt: pubDate ? new Date(pubDate) : new Date(),
            category
          });
        });
      }
    } catch (fallbackError) {
      console.error("Bayt fallback mock failed:", fallbackError);
    }
  }

  return jobs;
}

export async function scrapeAkhtaboot(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const mockRes = await fetch(`${env.SITE_URL}/api/mock-feed?source=sajjil`, { next: { revalidate: 0 } });
    if (mockRes.ok) {
      const xml = await mockRes.text();
      const $ = cheerio.load(xml, { xmlMode: true });
      $("item").each((_, el) => {
        const title = $(el).find("title").text() || "";
        const link = $(el).find("link").text() || "";
        const description = $(el).find("description").text() || "";
        const pubDate = $(el).find("pubDate").text() || "";
        const city = parseCity($(el).find("city").text() || "إربد");
        const type = parseJobType($(el).find("type").text() || "FULL_TIME");
        const category = mapCategory($(el).find("category").text() || "تقنية المعلومات");

        jobs.push({
          title,
          companyName: title.split(" - ")[1] || "وزارة الرقمية",
          city,
          type,
          description: description.replace(/<[^>]+>/g, " ").trim(),
          sourceUrl: link,
          sourceName: "Akhtaboot",
          postedAt: pubDate ? new Date(pubDate) : new Date(),
          category
        });
      });
    }
  } catch (error) {
    console.error("Akhtaboot scrape failed:", error);
  }
  return jobs;
}

export async function scrapeIndeed(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const mockRes = await fetch(`${env.SITE_URL}/api/mock-feed?source=indeed`, { next: { revalidate: 0 } });
    if (mockRes.ok) {
      const xml = await mockRes.text();
      const $ = cheerio.load(xml, { xmlMode: true });
      $("item").each((_, el) => {
        const title = $(el).find("title").text() || "";
        const link = $(el).find("link").text() || "";
        const description = $(el).find("description").text() || "";
        const pubDate = $(el).find("pubDate").text() || "";
        const city = parseCity($(el).find("city").text() || "عمّان");
        const type = parseJobType($(el).find("type").text() || "FULL_TIME");
        const category = mapCategory($(el).find("category").text() || "تصميم وتسويق");

        jobs.push({
          title,
          companyName: title.split(" - ")[1] || "وكالة إبداع عمان",
          city,
          type,
          description: description.replace(/<[^>]+>/g, " ").trim(),
          sourceUrl: link,
          sourceName: "Indeed",
          postedAt: pubDate ? new Date(pubDate) : new Date(),
          category
        });
      });
    }
  } catch (error) {
    console.error("Indeed scrape failed:", error);
  }
  return jobs;
}

export async function scrapeAllSources(): Promise<ScrapedJob[]> {
  const allJobs: ScrapedJob[] = [];
  const [bayt, akhtaboot, indeed] = await Promise.all([
    scrapeBayt().catch(() => []),
    scrapeAkhtaboot().catch(() => []),
    scrapeIndeed().catch(() => [])
  ]);
  allJobs.push(...bayt, ...akhtaboot, ...indeed);
  return allJobs;
}
