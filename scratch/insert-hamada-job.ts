import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function uniqueSlug(title: string) {
  const clean = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `${clean}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function main() {
  console.log("Inserting Hamada cashier job...");
  
  const title = "كاشير ومحاسب زبائن سوبرماركت";
  const slug = uniqueSlug(title);
  
  const job = await prisma.job.create({
    data: {
      slug,
      title,
      companyNameText: "مطاعم حمادة (Hamada)",
      companyRelation: "DIRECT_EMPLOYER",
      city: "عمّان",
      area: "الجبيهة",
      jobCategory: "مبيعات وتسويق",
      jobType: "FULL_TIME",
      description: "تعلن مطاعم حمادة (Hamada) عن توفر فرصة عمل شاغرة بمسمى (كاشير ومحاسب زبائن سوبرماركت) للعمل في فرعنا بمدينة عمّان (الجبيهة) - تم تصحيح الموقع الجغرافي. مطلوب كاشير للعمل الفوري في فروع التجزئة أو المطاعم. الوظيفة تشمل مسح المنتجات، جرد الصندوق ومحاسبة العملاء وخدمتهم ولباقتهم.",
      responsibilities: "1. محاسبة العملاء وتلقي الدفعات النقدية والبطاقات.\n2. مسح المنتجات وجرد صندوق الكاش يومياً وبدقة.\n3. الترحيب بالزبائن وتقديم خدمة عملاء ودودة ولائقة.\n4. مساعدة العملاء في تعبئة البضائع وتسهيل عملية محاسبتهم.",
      requirements: "1. خبرة سابقة في مجال الكاش أو خدمة العملاء (سوبرماركت أو مطاعم).\n2. مهارات اتصال ولباقة ممتازة مع الزبائن.\n3. القدرة على التعامل مع الضغط والعمل الفوري.\n4. شهادة عدم محكومية سارية المفعول.",
      benefits: "1. رواتب مجزية وحوافز مبيعات دورية.\n2. ضمان اجتماعي وتأمين صحي.\n3. بيئة عمل مهنية وداعمة ومستقرة.\n4. وجبة طعام يومية مجانية.",
      status: "PUBLISHED",
      sourceType: "ADMIN_MANUAL",
      sourceTrustLevel: "HIGH",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(),
      contactMethod: "WHATSAPP",
      contactWhatsapp: "0790000000", // placeholder phone for application
    }
  });

  console.log("Successfully inserted Hamada cashier job!", job.id, "Slug:", job.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
