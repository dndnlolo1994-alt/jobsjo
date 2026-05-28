import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils";

function mapCity(city: string): string {
  const c = city.trim();
  if (c.includes("عمان") || c.includes("عمّان")) return "عمّان";
  if (c.includes("اربد") || c.includes("إربد")) return "إربد";
  if (c.includes("الزرقاء")) return "الزرقاء";
  if (c.includes("العقبة")) return "العقبة";
  if (c.includes("السلط")) return "السلط";
  if (c.includes("الرمثا")) return "الرمثا";
  if (c.includes("مادبا")) return "مادبا";
  if (c.includes("جرش")) return "جرش";
  if (c.includes("عجلون")) return "عجلون";
  if (c.includes("المفرق")) return "المفرق";
  if (c.includes("الكرك")) return "الكرك";
  if (c.includes("الطفيلة")) return "الطفيلة";
  if (c.includes("معان")) return "معان";
  return "عمّان";
}

function classifyCategory(title: string, desc: string): string {
  const text = `${title} ${desc}`.toLowerCase();
  
  if (text.includes("محاسب") || text.includes("محاسبة") || text.includes("تدقيق") || text.includes("accountant") || text.includes("finance") || text.includes("مالي")) return "محاسبة";
  if (text.includes("كاشير") || text.includes("صندوق") || text.includes("cashier")) return "كاشير";
  if (text.includes("مبيعات") || text.includes("تسويق") || text.includes("sales") || text.includes("marketing") || text.includes("مروج") || text.includes("شراء")) return "مبيعات";
  if (text.includes("سائق") || text.includes("توصيل") || text.includes("سياقة") || text.includes("driver") || text.includes("delivery") || text.includes("مندوب توزيع")) return "توصيل وسائقين";
  if (text.includes("مستودع") || text.includes("مخزن") || text.includes("warehouse") || text.includes("سلاسل امداد") || text.includes("logistics")) return "مستودعات";
  if (text.includes("إنتاج") || text.includes("مصنع") || text.includes("فني تشغيل") || text.includes("factory") || text.includes("production") || text.includes("عامل")) return "مصانع وإنتاج";
  if (text.includes("ممرض") || text.includes("تمريض") || text.includes("طبيب") || text.includes("صيدلاني") || text.includes("صيدلية") || text.includes("أسنان") || text.includes("nurse") || text.includes("clinic") || text.includes("physiotherapy")) return "صيدليات وعيادات";
  if (text.includes("معلم") || text.includes("مدرس") || text.includes("تعليم") || text.includes("تدريب") || text.includes("teacher") || text.includes("school") || text.includes("mhpss") || text.includes("tutor")) return "تعليم وتدريب";
  if (text.includes("خدمة عملاء") || text.includes("استقبال") || text.includes("كول سنتر") || text.includes("reception") || text.includes("customer") || text.includes("call center")) return "خدمة عملاء";
  if (text.includes("شيف") || text.includes("طباخ") || text.includes("ويتر") || text.includes("مطعم") || text.includes("مقهى") || text.includes("باريستا") || text.includes("chef") || text.includes("restaurant") || text.includes("غذائي")) return "مطاعم وضيافة";
  if (text.includes("برمجيات") || text.includes("مطور") || text.includes("اتصالات") || text.includes("شبكات") || text.includes("برمجة") || text.includes("developer") || text.includes("it ") || text.includes("software") || text.includes("computer")) return "تقنية المعلومات";
  if (text.includes("مصمم") || text.includes("تصميم") || text.includes("designer") || text.includes("سوشيال") || text.includes("media") || text.includes("graphic")) return "تصميم وتسويق";
  if (text.includes("تنظيف") || text.includes("تدبير") || text.includes("cleaning") || text.includes("سيرفس")) return "أعمال منزلية";

  return "مبيعات";
}

function classifyJobType(title: string, desc: string): "FULL_TIME" | "PART_TIME" | "SHIFT" | "TEMPORARY" | "INTERNSHIP" | "REMOTE" | "HYBRID" {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes("عن بعد") || text.includes("remote")) return "REMOTE";
  if (text.includes("هجين") || text.includes("hybrid")) return "HYBRID";
  if (text.includes("جزئي") || text.includes("part-time") || text.includes("part time")) return "PART_TIME";
  if (text.includes("تدريب") || text.includes("internship") || text.includes("intern")) return "INTERNSHIP";
  if (text.includes("مؤقت") || text.includes("temporary") || text.includes("consultant")) return "TEMPORARY";
  if (text.includes("ورديات") || text.includes("شيفت") || text.includes("shift")) return "SHIFT";
  return "FULL_TIME";
}

async function fetchJobDetail(url: string): Promise<{ description: string; requirements: string }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
    if (!res.ok) return { description: "", requirements: "" };
    
    const html = await res.text();
    const lines = html.split("\n");
    
    let description = "";
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("<dt>الوصف ومتطلبات الوظيفة</dt>")) {
        const nextLine = lines[i + 1] || "";
        description = nextLine
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, "&")
          .replace(/\s+/g, " ")
          .trim();
        break;
      }
    }
    
    if (!description) {
      const metaMatch = html.match(/<meta content='([^']+?)' name='description'/i) || html.match(/<meta name="description" content="([^"]+?)"/i);
      if (metaMatch) description = metaMatch[1];
    }
    
    return {
      description: description || "تفاصيل الوظيفة متوفرة بالضغط على زر التقديم الخارجي.",
      requirements: "يرجى مراجعة متطلبات الوظيفة بالضغط على زر التقديم الخارجي."
    };
  } catch (err) {
    return { description: "", requirements: "" };
  }
}

const sourceUrls = [
  "https://www.akhtaboot.com/ar/jordan/jobs",
  "https://www.akhtaboot.com/ar/jordan/jobs?page=2",
  "https://www.akhtaboot.com/ar/%D8%A7%D9%84%D8%B4%D8%B1%D9%82-%D8%A7%D9%84%D8%A7%D9%88%D8%B3%D8%B7/%D8%B9%D9%85%D9%84-%D9%88%D8%B8%D8%A7%D8%A6%D9%81/job_role/%D8%A7%D9%84%D9%85%D8%A8%D9%8A%D8%B9%D8%A7%D8%AA",
  "https://www.akhtaboot.com/ar/%D8%A7%D9%84%D8%B4%D8%B1%D9%82-%D8%A7%D9%84%D8%A7%D9%88%D8%B3%D8%B7/%D8%B9%D9%85%D9%84-%D9%88%D8%B8%D8%A7%D8%A6%D9%81/job_role/%D8%A7%D9%84%D8%A3%D8%B9%D9%85%D8%A7%D9%84%20%D8%A7%D9%84%D8%A5%D8%AF%D8%A7%D8%B1%D9%8A%D8%A9%20%D9%88%20%D8%A7%D9%84%D8%B3%D9%83%D8%B1%D8%AA%D8%A7%D8%B1%D9%8a%D8%A9",
  "https://www.akhtaboot.com/ar/%D8%A7%D9%84%D8%B4%D8%B1%D9%82-%D8%A7%D9%84%D8%A7%D9%88%D8%B3%D8%B7/%D8%B9%D9%85%D9%84-%D9%88%D8%B8%D8%A7%D8%A6%D9%81/job_role/%D8%A7%D9%84%D8%AA%D8%B9%D9%84%D9%8A%D9%85%20%D9%88%20%D8%A7%D9%84%D8%AA%D8%AF%D8%B1%D9%8A%D8%A8",
  "https://www.akhtaboot.com/ar/%D8%A7%D9%84%D8%B4%D8%B1%D9%82-%D8%A7%D9%84%D8%A7%D9%88%D8%B3%D8%B7/%D8%B9%D9%85%D9%84-%D9%88%D8%B8%D8%A7%D8%A6%D9%81/job_role/%D9%87%D9%86%D8%AF%D8%B3%D8%A9%20-%20%D8%A7%D9%84%D8%AD%D8%A7%D8%B3%D8%A8%D8%A7%D8%AA"
];

export async function syncAllJobSources(): Promise<{ success: boolean; importedCount: number; logs: string[] }> {
  const logs: string[] = [];
  let importedCount = 0;

  logs.push(`Starting job synchronization task at ${new Date().toISOString()}`);

  try {
    for (const pageUrl of sourceUrls) {
      logs.push(`Fetching page: ${pageUrl}`);
      try {
        const res = await fetch(pageUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          }
        });
        if (!res.ok) {
          logs.push(`⚠️ Failed to fetch page. Status: ${res.status}`);
          continue;
        }

        const html = await res.text();
        const lines = html.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.includes("/%D8%B9%D9%85%D9%84-%D9%88%D8%B8%D8%A7%D8%A6%D9%81/") && line.includes("jordan")) {
            const hrefMatch = line.match(/href='([^']+?)'/i) || line.match(/href="([^"]+?)"/i);
            if (hrefMatch) {
              const relativeUrl = hrefMatch[1];
              
              const jobIdMatch = relativeUrl.match(/\/(\d+)-/);
              if (!jobIdMatch) continue;
              if (relativeUrl.includes("?") || relativeUrl.includes("mailto:") || relativeUrl.includes("<") || relativeUrl.includes("linkedin") || relativeUrl.includes("share")) {
                continue;
              }

              const jobUrl = "https://www.akhtaboot.com" + relativeUrl;
              const textLine = lines[i + 3]?.trim() || "";
              if (textLine.includes("<") || textLine.includes("href=") || textLine.includes("mailto:") || textLine.includes("button")) {
                continue;
              }

              let title = "وظيفة شاغرة";
              let companyName = "شركة أردنية مميزة";

              if (textLine.startsWith("Job Title:") || textLine.includes("Job Title")) {
                const cleanedText = textLine.replace("Job Title:", "").trim();
                const parts = cleanedText.split(" - ");
                title = parts[0]?.trim() || "وظيفة شاغرة";
                companyName = parts[1]?.replace("</a", "")?.replace("</a>", "")?.trim() || "شركة أردنية مميزة";
              } else {
                title = textLine.replace(/<[^>]+>/g, "").trim() || "وظيفة شاغرة";
              }

              if (title.length < 3 || title.includes("class=") || title.includes("href") || title.includes("button")) {
                continue;
              }

              const decodedUrl = decodeURIComponent(relativeUrl);
              const cityParts = decodedUrl.split("/");
              const idx = cityParts.indexOf("عمل-وظائف");
              const rawCity = idx !== -1 && cityParts[idx + 1] ? cityParts[idx + 1] : "عمان";
              const city = mapCity(rawCity);

              const duplicate = await prisma.job.findFirst({
                where: {
                  OR: [
                    { externalUrl: jobUrl },
                    { sourceUrl: jobUrl }
                  ]
                }
              });

              if (duplicate) {
                continue;
              }

              logs.push(`Importing: "${title}" at "${companyName}" in ${city}`);
              const details = await fetchJobDetail(jobUrl);
              const category = classifyCategory(title, details.description);
              const type = classifyJobType(title, details.description);

              let company = await prisma.company.findFirst({
                where: { name: companyName }
              });

              if (!company) {
                const companySlug = uniqueSlug(companyName);
                company = await prisma.company.create({
                  data: {
                    slug: companySlug,
                    name: companyName,
                    city: city,
                    industry: category,
                    description: `شركة أردنية رائدة وموثوقة تعمل في قطاع ${category} ومسجلة رسمياً.`,
                    verificationStatus: "VERIFIED"
                  }
                });
              }

              const slug = uniqueSlug(title);
              await prisma.job.create({
                data: {
                  slug,
                  title,
                  companyId: company.id,
                  companyNameText: companyName,
                  companyRelation: "CURATED_EXTERNAL",
                  city,
                  area: "شاغر وظيفي نشط",
                  jobCategory: category,
                  jobType: type,
                  description: details.description,
                  responsibilities: "موضحة بالكامل في رابط التقديم الخارجي المباشر.",
                  requirements: "يرجى الاطلاع على المتطلبات والتقديم عبر رابط التقديم المصدر بالضغط على زر التقديم.",
                  benefits: "المزايا والمكافآت تخضع للهيكل الإداري للشركة المعلنة.",
                  contactMethod: "EXTERNAL_LINK",
                  externalUrl: jobUrl,
                  sourceType: "COMPANY_CAREERS_PAGE",
                  sourceName: "أخطبوط الأردن",
                  sourceUrl: jobUrl,
                  sourceTrustLevel: "HIGH",
                  status: "PUBLISHED",
                  publishedAt: new Date(),
                  expiresAt: new Date(Date.now() + 30 * 86400000)
                }
              });

              logs.push(`✅ Success: "${title}" saved!`);
              importedCount++;

              await new Promise(r => setTimeout(r, 1000));
            }
          }
        }
      } catch (err: any) {
        logs.push(`❌ Error processing page ${pageUrl}: ${err?.message || err}`);
      }
    }

    logs.push(`\n=== SYNC COMPLETE! Successfully imported ${importedCount} clean live Jordan jobs. ===`);
    return { success: true, importedCount, logs };
  } catch (err: any) {
    logs.push(`❌ Critical error in sync task: ${err?.message || err}`);
    return { success: false, importedCount, logs };
  }
}
