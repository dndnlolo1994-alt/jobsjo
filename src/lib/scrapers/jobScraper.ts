import * as cheerio from "cheerio";

export interface ScrapedJob {
  title: string;
  companyName: string;
  city: string;
  type: string;
  description: string;
  sourceUrl: string;
  sourceName: string;
  postedAt: Date;
  expiresAt?: Date;
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
  const c = cityStr.trim().toLowerCase();
  if (c.includes("عمان") || c.includes("عمّان")) return "عمّان";
  if (c.includes("amman")) return "عمّان";
  if (c.includes("اربد") || c.includes("إربد")) return "إربد";
  if (c.includes("irbid")) return "إربد";
  if (c.includes("الزرقاء")) return "الزرقاء";
  if (c.includes("zarqa")) return "الزرقاء";
  if (c.includes("العقبة")) return "العقبة";
  if (c.includes("aqaba")) return "العقبة";
  if (c.includes("السلط")) return "السلط";
  if (c.includes("salt")) return "السلط";
  if (c.includes("مادبا")) return "مادبا";
  if (c.includes("madaba")) return "مادبا";
  if (c.includes("الكرك")) return "الكرك";
  if (c.includes("karak")) return "الكرك";
  if (c.includes("الطفيلة")) return "الطفيلة";
  if (c.includes("tafilah")) return "الطفيلة";
  if (c.includes("معان")) return "معان";
  if (c.includes("maan") || c.includes("ma'an")) return "معان";
  if (c.includes("جرش")) return "جرش";
  if (c.includes("jerash")) return "جرش";
  if (c.includes("عجلون")) return "عجلون";
  if (c.includes("ajloun")) return "عجلون";
  if (c.includes("المفرق")) return "المفرق";
  if (c.includes("mafraq")) return "المفرق";
  return "عمّان";
}

// Helper to map category name to valid platform category
function mapCategory(catStr: string): string {
  const cat = catStr.trim().toLowerCase();
  if (cat.includes("مطعم") || cat.includes("ضيافة") || cat.includes("غذائي")) return "مطاعم وضيافة";
  if (cat.includes("restaurant") || cat.includes("hospitality")) return "مطاعم وضيافة";
  if (cat.includes("مبيعات") || cat.includes("تسويق") || cat.includes("سيلز") || cat.includes("sales") || cat.includes("marketing") || cat.includes("business development")) return "مبيعات";
  if (cat.includes("كاشير") || cat.includes("صندوق") || cat.includes("cashier")) return "كاشير";
  if (cat.includes("توصيل") || cat.includes("سائق") || cat.includes("سواق") || cat.includes("driver") || cat.includes("delivery")) return "توصيل وسائقين";
  if (cat.includes("مصنع") || cat.includes("إنتاج") || cat.includes("عامل") || cat.includes("production")) return "مصانع وإنتاج";
  if (cat.includes("مستودع") || cat.includes("لوجستي") || cat.includes("logistics") || cat.includes("procurement") || cat.includes("supply")) return "مستودعات";
  if (cat.includes("محاسب") || cat.includes("مالية") || cat.includes("تدقيق") || cat.includes("finance") || cat.includes("accountant") || cat.includes("accounting")) return "محاسبة";
  if (cat.includes("خدمة عملاء") || cat.includes("استقبال") || cat.includes("كول سنتر") || cat.includes("customer") || cat.includes("administrative assistant")) return "خدمة عملاء";
  if (cat.includes("تقنية") || cat.includes("برمج") || cat.includes("اتصالات") || cat.includes("شبكات") || cat.includes("برمجيات") || cat.includes("software") || cat.includes("data") || cat.includes("information system") || cat.includes(" it ")) return "تقنية المعلومات";
  if (cat.includes("تعليم") || cat.includes("مدرس") || cat.includes("تدريب") || cat.includes("معلم") || cat.includes("education") || cat.includes("youth")) return "تعليم وتدريب";
  if (cat.includes("صيدل") || cat.includes("عيادة") || cat.includes("تمريض") || cat.includes("طبي") || cat.includes("health") || cat.includes("medical") || cat.includes("epidemiology") || cat.includes("lab")) return "صيدليات وعيادات";
  if (cat.includes("تصميم") || cat.includes("ديزاين") || cat.includes("إعلام") || cat.includes("design") || cat.includes("media")) return "تصميم وتسويق";
  if (cat.includes("منزل") || cat.includes("نظافة") || cat.includes("تنظيف")) return "أعمال منزلية";
  return "مبيعات"; // default fallback
}

function parseDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
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
    if (!xml.includes("<rss") && !xml.includes("<item")) {
      throw new Error("Bayt did not return an RSS feed");
    }
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
        category: mapCategory(`${titleText} ${description}`)
      });
    });

  } catch (error) {
    console.warn("Bayt live scrape failed; skipping source:", error);
  }

  return jobs;
}

export async function scrapeAkhtaboot(): Promise<ScrapedJob[]> {
  console.warn("Akhtaboot scraper is disabled here because this module no longer imports mock feeds.");
  return [];
}

export async function scrapeIndeed(): Promise<ScrapedJob[]> {
  console.warn("Indeed scraper is disabled here because this module no longer imports mock feeds.");
  return [];
}

export async function scrapeUnChannel(): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const url = "https://unchannel.org/search-type/ngo/jordan";

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; JoJobsBot/1.0; +https://www.jordan-job.shop)",
        "Accept-Language": "en,ar;q=0.9"
      },
      next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error(`UNChannel status: ${res.status}`);

    const html = await res.text();
    const $ = cheerio.load(html);

    $("a.block[href^='/jobs/']").each((_, el) => {
      const link = $(el).attr("href");
      const article = $(el).find("article").first();
      const title = cleanText(article.find("h2").first().text());
      const companyName = cleanText(article.find("h2").first().next("p").text());
      const fullText = cleanText(article.text());
      const type = parseJobType(article.find("span.rounded").first().text() || fullText);
      const dateText = cleanText(article.find("span").last().text());
      const expiresAt = parseDate(dateText) ?? new Date(Date.now() + 30 * 86400000);

      if (!link || !title || !companyName) return;

      jobs.push({
        title,
        companyName,
        city: parseCity(fullText),
        type,
        description: `فرصة عمل منشورة على UNChannel لدى ${companyName}. المدينة/الدولة: ${fullText.includes("Jordan") ? "الأردن" : "الأردن"}. آخر موعد ظاهر في المصدر: ${dateText || "راجع المصدر"}.`,
        sourceUrl: new URL(link, "https://unchannel.org").href,
        sourceName: "UNChannel",
        postedAt: new Date(),
        expiresAt,
        category: mapCategory(`${title} ${companyName}`)
      });
    });
  } catch (error) {
    console.error("UNChannel scrape failed:", error);
  }

  return jobs;
}

export async function scrapeAllSources(): Promise<ScrapedJob[]> {
  const allJobs: ScrapedJob[] = [];
  const [bayt, unChannel] = await Promise.all([
    scrapeBayt().catch(() => []),
    scrapeUnChannel().catch(() => [])
  ]);
  allJobs.push(...bayt, ...unChannel);
  return allJobs;
}
