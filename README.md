# JoJobs OS / جوبز الأردن

منصة وظائف عربية أولًا موجهة للسوق الأردني، تجمع الوظائف المحلية، حسابات الباحثين والشركات، باني CV، تقديم داخلي وخارجي، فوترة يدوية، ولوحة أدمن لتنسيق الوظائف من مصادر موثوقة.

## التشغيل المحلي

```bash
npm install
npm run prisma:generate
npm run prisma:validate
npm run seed
npm run dev
```

## أهم المسارات

- `/jobs`
- `/jobs/[slug]`
- `/companies`
- `/me`
- `/me/cv`
- `/me/applications`
- `/employer`
- `/admin`
- `/admin/jobs/new`
- `/admin/sources`
- `/admin/payments`

## قرارات MVP

- البحث يعمل عبر Prisma وفلاتر URL.
- CV PDF يعمل عبر صفحة HTML/CSS print-ready.
- الدفع يدوي فقط.
- المصادر الخارجية قانونية/يدوية فقط.
- الصفحات الخاصة noindex ومحميّة بالأدوار.

راجع ملفات `docs/` لتفاصيل الإطلاق والسياسات.
