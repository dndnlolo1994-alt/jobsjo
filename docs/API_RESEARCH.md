# بحث الخيارات التقنية المفتوحة

## توليد PDF للسيرة الذاتية

الخيارات التي تمت مراجعتها:

- Playwright `page.pdf()`: يعطي أعلى دقة لأنه يطبع HTML/CSS كما يظهر في المتصفح، لكنه ثقيل على Serverless ويحتاج Chromium.
- Puppeteer `Page.pdf()`: رسميًا يدعم توليد PDF وينتظر تحميل الخطوط افتراضيًا، لكنه يضيف اعتمادًا ثقيلًا ومشاكل cold start على Vercel.
- `@react-pdf/renderer`: مناسب لبناء PDF برندر خاص، لكنه لا يستخدم CSS العادي بالكامل، وقد يقيّد تصميم RTL العربي.
- `pdf-lib`: ممتاز لتعديل ملفات PDF موجودة، وليس الأفضل لتصميم CV كامل من الصفر.
- طباعة المتصفح عبر CSS: أخف خيار للـ MVP، يعمل بلا API مدفوعة، ويدعم RTL والخطوط وA4 عبر CSS.

القرار الحالي:

استخدام HTML/CSS print-first مع صفحة `/me/cv/download` وتعليمات حفظ كـ PDF من المتصفح. هذا يحقق شرط عمل PDF محليًا بدون خدمات مدفوعة أو Chromium على السيرفر.

مسار الترقية:

إضافة Playwright أو Puppeteer لاحقًا كخدمة server PDF اختيارية بعد اختبار حجم الحزمة على Vercel، أو تشغيلها في worker منفصل.

## البحث

الخيارات:

- Prisma `contains`: أبسط حل، يعمل فورًا مع PostgreSQL وSQLite نظريًا، لا يحتاج خدمة إضافية.
- PostgreSQL Full Text Search: قوي ومجاني، لكن Prisma PostgreSQL FTS ما زال يحتاج إعدادات وقيود خاصة.
- Meilisearch: سريع ومفتوح المصدر، لكنه خدمة إضافية تحتاج تشغيل وفهرسة.
- Typesense: ممتاز للبحث التجاري، لكنه خدمة إضافية.
- Fuse.js: جيد لبيانات صغيرة على العميل، لكنه غير مناسب وحده لمنصة وظائف عامة قابلة للنمو.

القرار الحالي:

استخدام بحث server-side عبر Prisma مع URL query params في `src/lib/search/jobs.ts`.

مسار الترقية:

إضافة واجهة `searchJobsAdvanced` كطبقة عزل، ثم استبدال التنفيذ لاحقًا بـ PostgreSQL FTS أو Meilisearch/Typesense دون تغيير الواجهات.

## مصادر الوظائف

القرار:

الاعتماد على إدخال يدوي وأرشيف مصادر موثوقة. لا يوجد scraping خلف تسجيل دخول، ولا مجموعات خاصة، ولا تجاوز robots.txt.

مصادر مسموحة:

- صاحب عمل مباشر
- مصدر حكومي عام
- NGO عام
- صفحة مهن شركة عامة
- برنامج تدريب عام
- منشور اجتماعي عام يتم إدخاله يدويًا مع التحقق

## JobPosting SEO

تم الاعتماد على `schema.org/JobPosting` وإرشادات Google: JSON-LD فقط على صفحة الوظيفة المفردة، مع `datePosted`, `description`, `hiringOrganization`, `jobLocation`, و`validThrough` عند توفرها.

## تصميم CV عربي

تم اختيار قالب RTL بسيط، أقسام واضحة، A4، فواصل قوية، وتجنب زخرفة تعطل ATS.

## الأمن والخصوصية

القرارات:

- حماية الصفحات الخاصة عبر session role guards.
- noindex للصفحات الخاصة.
- منع تكرار التقديم عبر unique constraint.
- rate-limit موجود كأداة MVP في الذاكرة، ومسار الترقية Redis.
- لا تعرض CV عام افتراضيًا.

## بيانات الأردن

تم تثبيت مدن وتصنيفات أردنية أساسية في `src/lib/utils.ts`، مع تطبيع رقم الهاتف الأردني في `src/lib/phone.ts`.

## روابط مرجعية

- Next.js sitemap/metadata: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- Next.js metadataBase: https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata
- Prisma full-text search: https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search
- PostgreSQL Full Text Search: https://www.postgresql.org/docs/current/textsearch.html
- Schema.org JobPosting: https://schema.org/JobPosting
- Google JobPosting structured data: https://developers.google.com/search/docs/appearance/structured-data/job-posting
- Puppeteer PDF: https://github.com/puppeteer/puppeteer/blob/main/docs/guides/pdf-generation.md
- React PDF: https://react-pdf.org/
- Fuse.js: https://www.fusejs.io/
