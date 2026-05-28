import { prisma } from "@/lib/prisma";
import { uniqueSlug, JOB_CATEGORIES, JORDAN_CITIES } from "@/lib/utils";

function extractTagContent(itemXml: string, tagName: string): string {
  const match = itemXml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  if (match && match[1]) {
    return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/i, "$1").trim();
  }
  return "";
}

function classifyCategory(title: string, desc: string): string {
  const text = `${title} ${desc}`.toLowerCase();
  
  if (text.includes("محاسب") || text.includes("محاسبة") || text.includes("تدقيق") || text.includes("accountant")) return "محاسبة";
  if (text.includes("كاشير") || text.includes("صندوق") || text.includes("cashier")) return "كاشير";
  if (text.includes("مبيعات") || text.includes("تسويق") || text.includes("sales") || text.includes("marketing")) return "مبيعات";
  if (text.includes("سائق") || text.includes("توصيل") || text.includes("سياقة") || text.includes("driver") || text.includes("delivery")) return "توصيل وسائقين";
  if (text.includes("مستودع") || text.includes("مخزن") || text.includes("warehouse")) return "مستودعات";
  if (text.includes("إنتاج") || text.includes("مصنع") || text.includes("فني تشغيل") || text.includes("factory") || text.includes("production")) return "مصانع وإنتاج";
  if (text.includes("ممرض") || text.includes("تمريض") || text.includes("طبيب") || text.includes("صيدلاني") || text.includes("صيدلية") || text.includes("أسنان") || text.includes("nurse") || text.includes("clinic")) return "صيدليات وعيادات";
  if (text.includes("معلم") || text.includes("مدرس") || text.includes("تعليم") || text.includes("تدريب") || text.includes("teacher") || text.includes("school")) return "تعليم وتدريب";
  if (text.includes("خدمة عملاء") || text.includes("استقبال") || text.includes("كول سنتر") || text.includes("reception") || text.includes("customer")) return "خدمة عملاء";
  if (text.includes("شيف") || text.includes("طباخ") || text.includes("ويتر") || text.includes("مطعم") || text.includes("مقهى") || text.includes("باريستا") || text.includes("chef") || text.includes("restaurant")) return "مطاعم وضيافة";
  if (text.includes("برمجيات") || text.includes("مطور") || text.includes("اتصالات") || text.includes("شبكات") || text.includes("برمجة") || text.includes("developer") || text.includes("it ") || text.includes("telecom")) return "تقنية المعلومات";
  if (text.includes("مصمم") || text.includes("تصميم") || text.includes("designer") || text.includes("سوشيال")) return "تصميم وتسويق";
  if (text.includes("تنظيف") || text.includes("تدبير") || text.includes("cleaning")) return "أعمال منزلية";

  return "مبيعات"; // افتراضي
}

function classifyCity(title: string, desc: string): string {
  const text = `${title} ${desc}`.toLowerCase();
  
  if (text.includes("عمان") || text.includes("عمّان") || text.includes("amman")) return "عمّان";
  if (text.includes("اربد") || text.includes("إربد") || text.includes("irbid")) return "إربد";
  if (text.includes("الزرقاء") || text.includes("zarqa")) return "الزرقاء";
  if (text.includes("العقبة") || text.includes("aqaba")) return "العقبة";
  if (text.includes("السلط") || text.includes("salt")) return "السلط";
  if (text.includes("الرمثا") || text.includes("ramtha")) return "الرمثا";
  if (text.includes("مادبا") || text.includes("madaba")) return "مادبا";
  if (text.includes("جرش") || text.includes("jerash")) return "جرش";
  if (text.includes("عجلون") || text.includes("ajloun")) return "عجلون";
  if (text.includes("المفرق") || text.includes("mafraq")) return "المفرق";
  if (text.includes("الكرك") || text.includes("karak")) return "الكرك";
  if (text.includes("الطفيلة") || text.includes("tafilah")) return "الطفيلة";
  if (text.includes("معان") || text.includes("ma'an")) return "معان";

  return "عمّان"; // افتراضي
}

function classifyJobType(title: string, desc: string): "FULL_TIME" | "PART_TIME" | "SHIFT" | "TEMPORARY" | "INTERNSHIP" | "REMOTE" | "HYBRID" {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes("عن بعد") || text.includes("عن بعد") || text.includes("remote")) return "REMOTE";
  if (text.includes("هجين") || text.includes("hybrid")) return "HYBRID";
  if (text.includes("جزئي") || text.includes("part-time") || text.includes("part time")) return "PART_TIME";
  if (text.includes("تدريب") || text.includes("internship") || text.includes("intern")) return "INTERNSHIP";
  if (text.includes("مؤقت") || text.includes("temporary")) return "TEMPORARY";
  if (text.includes("ورديات") || text.includes("شيفت") || text.includes("shift")) return "SHIFT";
  
  return "FULL_TIME";
}

export async function syncAllJobSources(): Promise<{ success: boolean; importedCount: number; logs: string[] }> {
  const logs: string[] = [];
  let importedCount = 0;

  logs.push(`Starting job synchronization task at ${new Date().toISOString()}`);
  
  try {
    const activeSources = await prisma.jobSource.findMany({ where: { active: true } });
    logs.push(`Found ${activeSources.length} active job sources to process.`);

    for (const source of activeSources) {
      logs.push(`Processing source: "${source.sourceName}" (${source.sourceUrl})`);
      
      try {
        if (!source.sourceUrl) {
          logs.push(`⚠️ Skipped source "${source.sourceName}" because it has no sourceUrl.`);
          continue;
        }
        const response = await fetch(source.sourceUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/xml, text/xml, */*"
          },
          next: { revalidate: 0 } // تعطيل التخزين المؤقت
        });

        if (!response.ok) {
          logs.push(`⚠️ Failed to fetch feed for "${source.sourceName}". Status code: ${response.status}`);
          continue;
        }

        const xmlText = await response.text();
        const items = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];
        
        logs.push(`Found ${items.length} job items in feed for "${source.sourceName}".`);
        
        let sourceImported = 0;
        
        for (const itemXml of items) {
          const title = extractTagContent(itemXml, "title");
          const link = extractTagContent(itemXml, "link");
          const description = extractTagContent(itemXml, "description");
          
          if (!title || !link) {
            logs.push(`⚠️ Skipped item due to missing title or link.`);
            continue;
          }

          // فحص التكرار بناءً على الرابط الخارجي
          const duplicate = await prisma.job.findFirst({
            where: {
              OR: [
                { externalUrl: link },
                { sourceUrl: link }
              ]
            }
          });

          if (duplicate) {
            continue; // مكررة، نتجاهلها
          }

          // استخلاص البيانات الإضافية أو الفلترة التلقائية
          const category = extractTagContent(itemXml, "category") || classifyCategory(title, description);
          const city = extractTagContent(itemXml, "city") || classifyCity(title, description);
          const type = extractTagContent(itemXml, "type") || classifyJobType(title, description);
          
          // البحث عن شركة مناسبة أو استخدام اسم المصدر
          const companyNameText = source.organizationName || source.sourceName.replace(" (خلاصة تجريبية)", "");
          
          // إيجاد شركة بنفس الاسم أو ربطها باسم المصدر
          let companyId: string | null = null;
          const matchedCompany = await prisma.company.findFirst({
            where: { name: { contains: companyNameText } }
          });
          if (matchedCompany) {
            companyId = matchedCompany.id;
          }

          // إدراج الوظيفة
          const slug = uniqueSlug(title);
          await prisma.job.create({
            data: {
              slug,
              title,
              companyId,
              companyNameText,
              companyRelation: "CURATED_EXTERNAL",
              city,
              area: "مزامنة تلقائية",
              jobCategory: category,
              jobType: type as any,
              description: description || "تفاصيل الوظيفة متوفرة عبر رابط التقديم الخارجي.",
              responsibilities: "موضحة في رابط التقديم المصدر.",
              requirements: "يرجى مراجعة متطلبات الوظيفة بالضغط على زر التقديم الخارجي.",
              benefits: "حسب سياسة الشركة المعلنة في المصدر الرئيسي.",
              contactMethod: "EXTERNAL_LINK",
              externalUrl: link,
              sourceType: "COMPANY_CAREERS_PAGE",
              sourceName: source.sourceName.replace(" (خلاصة تجريبية)", ""),
              sourceUrl: link,
              sourceTrustLevel: source.trustLevel,
              jobSourceId: source.id,
              status: "PUBLISHED",
              publishedAt: new Date(),
              expiresAt: new Date(Date.now() + 30 * 86400000), // صالحة لـ 30 يوم
            }
          });

          sourceImported++;
          importedCount++;
        }

        // تحديث تاريخ التدقيق على المصدر
        await prisma.jobSource.update({
          where: { id: source.id },
          data: { lastCheckedAt: new Date() }
        });

        logs.push(`Successfully imported ${sourceImported} new jobs from "${source.sourceName}".`);
      } catch (err: any) {
        logs.push(`❌ Error processing source "${source.sourceName}": ${err?.message || err}`);
      }
    }

    logs.push(`Job synchronization complete. Imported a total of ${importedCount} jobs.`);
    return { success: true, importedCount, logs };
  } catch (err: any) {
    logs.push(`❌ Critical error in sync task: ${err?.message || err}`);
    return { success: false, importedCount, logs };
  }
}
