# ملاحظات التشغيل والنشر

لا يتم النشر في هذه المرحلة.

للتشغيل المحلي:

```bash
npm install
npm run prisma:generate
npm run prisma:validate
npm run seed
npm run dev
```

متطلبات الإنتاج لاحقًا:

- PostgreSQL.
- `NEXT_PUBLIC_SITE_URL` حقيقي.
- `SESSION_SECRET` قوي.
- `ADMIN_EMAILS` حقيقي.
- مراجعة إعدادات cookies وHTTPS.
