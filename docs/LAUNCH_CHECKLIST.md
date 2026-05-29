# قائمة إطلاق وظائف الأردن — JoJobs

## الدومين والـ SEO

- [ ] `NEXT_PUBLIC_SITE_URL=https://www.jordan-job.shop` على Vercel (Production).
- [ ] `jordan-job.shop` يعيد التوجيه إلى `www.jordan-job.shop`.
- [ ] عدم استخدام `jojobs-os.vercel.app` في canonical / sitemap / Open Graph (يعتمد التطبيق على env).
- [ ] مراجعة DNS عند Hostinger (A + CNAME لـ Vercel) مع الإبقاء على MX/SPF/DKIM للبريد — انظر [`DEPLOYMENT.md`](DEPLOYMENT.md).
- [ ] SMTP Hostinger مضبوط على Vercel (`SMTP_*`) واختبار `npm run test:email`.

## التشغيل

- إعداد قاعدة البيانات وتشغيل migrations.
- تعبئة `.env` بالقيم الحقيقية (محلياً: localhost؛ إنتاج: Vercel فقط).
- ضبط `ADMIN_EMAILS`.
- تغيير أسرار الجلسات.
- إزالة أو فصل بيانات seed التجريبية عن الإنتاج.
- مراجعة سياسة الخصوصية والشروط.
- مراجعة سياسة المصادر.
- مراجعة قانونية محلية قبل الإطلاق التجاري.
- تحديد رقم واتساب الدعم.
- توثيق عملية الدفع اليدوي.
- اختبار أول 100 وظيفة منسّقة.
- التواصل مع أول 25 صاحب عمل.
- اختبار بناء CV وتنزيل PDF.
- اختبار تقديم داخلي وخارجي وواتساب.
- اختبار لوحة المرشحين للشركة.
- اختبار sitemap وrobots.
- اختبار SEO وJobPosting schema.
- اختبار كامل على الهاتف.
- إعداد خطة نسخ احتياطي وتصدير بيانات.
- إعداد آلية إزالة إعلان بطلب صاحب الإعلان.
