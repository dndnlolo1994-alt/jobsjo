import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") || "sajjil";

  let items = "";
  const now = new Date().toUTCString();

  if (source === "sajjil") {
    items = `
      <item>
        <title>مهندس اتصالات مبتدئ - وزارة الرقمية</title>
        <link>https://www.sajjil.gov.jo/jobs/eng-telecom-${Date.now().toString().slice(-4)}</link>
        <description>مطلوب مهندس اتصالات للعمل في عمان، حي العبدلي. المهام: تشغيل شبكات، إدارة فروع، ومتابعة خوادم. الراتب 450 دينار.</description>
        <pubDate>${now}</pubDate>
        <guid>sajjil-eng-telecom-${Date.now().toString().slice(-4)}</guid>
        <category>تقنية المعلومات</category>
        <city>عمّان</city>
        <type>FULL_TIME</type>
      </item>
      <item>
        <title>موظف استقبال - مستشفى إربد الحكومي</title>
        <link>https://www.sajjil.gov.jo/jobs/rec-irbid-${Date.now().toString().slice(-4)}</link>
        <description>مطلوب موظف استقبال طبي للعمل في مستشفى إربد الحكومي. المهارات المطلوبة: تواصل، خدمة عملاء، إدخال بيانات. الراتب 320 دينار.</description>
        <pubDate>${now}</pubDate>
        <guid>sajjil-rec-irbid-${Date.now().toString().slice(-4)}</guid>
        <category>خدمة عملاء</category>
        <city>إربد</city>
        <type>SHIFT</type>
      </item>
    `;
  } else if (source === "tanqeeb") {
    items = `
      <item>
        <title>محاسب تكاليف - شركة الأردنية للألبان</title>
        <link>https://jordan.tanqeeb.com/jobs/accountant-dairy-${Date.now().toString().slice(-4)}</link>
        <description>مطلوب محاسب تكاليف للعمل في مصنع الألبان في الزرقاء. المتطلبات: بكالوريوس محاسبة، إتقان Excel. الراتب 400 دينار.</description>
        <pubDate>${now}</pubDate>
        <guid>tanqeeb-accountant-dairy-${Date.now().toString().slice(-4)}</guid>
        <category>محاسبة</category>
        <city>الزرقاء</city>
        <type>FULL_TIME</type>
      </item>
      <item>
        <title>كاشير - سوبرماركت باب المندب العقبة</title>
        <link>https://jordan.tanqeeb.com/jobs/cashier-aqaba-${Date.now().toString().slice(-4)}</link>
        <description>مطلوب كاشير ومحاسب صندوق للعمل في العقبة، السوق التجاري. دوام مسائي، راتب 300 دينار مع ضمان اجتماعي.</description>
        <pubDate>${now}</pubDate>
        <guid>tanqeeb-cashier-aqaba-${Date.now().toString().slice(-4)}</guid>
        <category>كاشير</category>
        <city>العقبة</city>
        <type>SHIFT</type>
      </item>
    `;
  } else {
    items = `
      <item>
        <title>مصمم جرافيك سوشيال ميديا - وكالة إبداع عمان</title>
        <link>https://www.linkedin.com/jobs/designer-creative-${Date.now().toString().slice(-4)}</link>
        <description>فرصة عمل لمصمم جرافيك مبدع لتصميم منشورات وهويات بصرية. العمل هجين من عمان، الراتب 500 دينار.</description>
        <pubDate>${now}</pubDate>
        <guid>linkedin-designer-creative-${Date.now().toString().slice(-4)}</guid>
        <category>تصميم وتسويق</category>
        <city>عمّان</city>
        <type>HYBRID</type>
      </item>
      <item>
        <title>سائق ديليفري دراجة نارية - طلبات عمان</title>
        <link>https://www.linkedin.com/jobs/driver-talabat-${Date.now().toString().slice(-4)}</link>
        <description>مطلوب سائقين دراجات نارية لتوصيل طرود لدى طلبات في عمان، تلاع العلي. دخل أسبوعي ممتاز وبدل بنزين.</description>
        <pubDate>${now}</pubDate>
        <guid>linkedin-driver-talabat-${Date.now().toString().slice(-4)}</guid>
        <category>توصيل وسائقين</category>
        <city>عمّان</city>
        <type>PART_TIME</type>
      </item>
    `;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>وظائف الأردن المزامنة</title>
    <link>http://localhost:3000</link>
    <description>خلاصة وظائف تجريبية</description>
    <lastBuildDate>${now}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
