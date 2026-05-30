# النشر والدومين و DNS — JoJobs / وظائف الأردن

## الدومين الرسمي

| الاستخدام | الرابط |
|-----------|--------|
| **Production (رسمي)** | `https://www.jordan-job.shop` |
| **Root redirect** | `jordan-job.shop` → `www.jordan-job.shop` (يُضبط في Vercel Domains) |
| **Vercel default** | `https://jojobs-os.vercel.app` — احتياطي/اختبار داخلي فقط |

لا تضبط `NEXT_PUBLIC_SITE_URL` على `*.vercel.app` في بيئة الإنتاج.  
القيمة الصحيحة للإنتاج:

```env
NEXT_PUBLIC_SITE_URL=https://www.jordan-job.shop
```

التطبيق يقرأ هذا المتغير في:

- `metadataBase` و Open Graph (`src/app/layout.tsx`)
- `sitemap.xml` (`src/app/sitemap.ts`)
- `robots.txt` (`src/app/robots.ts`)
- روابط QR للسيرة، رسائل البريد، وإعادة التوجيه بعد تسجيل الخروج

---

## DNS عند Hostinger + استضافة Vercel

> **مهم:** سجلات DNS موجودة عند **Hostinger**. الموقع مربوط بمشروع Vercel.  
> **لا يتم نقل Nameservers إلى Vercel حالياً** لأن البريد الإلكتروني على Hostinger يعتمد على سجلات **MX / SPF / DKIM / DMARC** على نفس الدومين.

### سجلات الويب (Vercel)

| النوع | Name | Value |
|-------|------|-------|
| **A** | `@` | `216.198.79.1` |
| **CNAME** | `www` | `4fe47e569a296a1b.vercel-dns-017.com` |

في لوحة Vercel → Project → **Domains**: أضف `jordan-job.shop` و `www.jordan-job.shop`، وفعّل إعادة التوجيه من الجذر إلى `www` إن رغبت.

### سجلات البريد (Hostinger — لا تحذفها)

| النوع | Name | Priority | Value |
|-------|------|----------|-------|
| **MX** | `@` | 5 | `mx1.hostinger.com` |
| **MX** | `@` | 10 | `mx2.hostinger.com` |
| **TXT** | `@` | — | `v=spf1 include:_spf.mail.hostinger.com ~all` |
| **TXT** | `_dmarc` | — | `v=DMARC1; p=none` |
| **CNAME** | `hostingermail-a._domainkey` | — | `hostingermail-a.dkim.mail.hostinger.com` |
| **CNAME** | `hostingermail-b._domainkey` | — | `hostingermail-b.dkim.mail.hostinger.com` |
| **CNAME** | `hostingermail-c._domainkey` | — | `hostingermail-c.dkim.mail.hostinger.com` |
| **CNAME** | `autodiscover` | — | `autodiscover.mail.hostinger.com` |
| **CNAME** | `autoconfig` | — | `autoconfig.mail.hostinger.com` |

---

## متغيرات البيئة (Production)

انسخ من [`.env.example`](../.env.example) واضبط القيم الحساسة في **Vercel Dashboard** فقط (لا تضع كلمات مرور في Git).

**محلياً:** `cp .env.example .env.local` — كل الأسرار في `.env.local` فقط.

```env
# Site
NEXT_PUBLIC_SITE_URL=https://www.jordan-job.shop
NEXT_PUBLIC_APP_NAME=JoJobs
NEXT_PUBLIC_APP_NAME_AR=وظائف الأردن
NEXT_PUBLIC_SITE_NAME=وظائف الأردن

# Contact
NEXT_PUBLIC_CONTACT_EMAIL=info@jordan-job.shop
NEXT_PUBLIC_SUPPORT_EMAIL=info@jordan-job.shop
NEXT_PUBLIC_COMPANY_EMAIL=info@jordan-job.shop
SUPPORT_EMAIL=info@jordan-job.shop
CONTACT_TO_EMAIL=info@jordan-job.shop
COMPANY_EMAIL=info@jordan-job.shop

# SMTP (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@jordan-job.shop
SMTP_PASS=change_me_in_vercel
SMTP_FROM=JoJobs <info@jordan-job.shop>

# Database & auth (see .env.example)
DATABASE_URL=...
DIRECT_URL=...
SESSION_SECRET=...
SESSION_PASSWORD=...
ADMIN_EMAILS=info@jordan-job.shop
CRON_SECRET=...
```

اختبار البريد بعد الضبط:

```bash
npm run test:email -- info@jordan-job.shop
```

---

## التشغيل المحلي

```bash
npm install
cp .env.example .env.local
# عدّل .env.local: DATABASE_URL, SESSION_*, SMTP_*, NEXT_PUBLIC_SITE_URL=http://localhost:3000
npm run prisma:generate
npm run prisma:validate
npm run seed          # اختياري
npm run dev
```

> Prisma والسكربتات تقرأ `.env.local` عبر `scripts/load-env.cjs`. لا تضع أسراراً في `.env`.

---

## النشر على Vercel (مرجع)

1. ربط المستودع `jobsjo` بالمشروع.
2. ضبط كل متغيرات الإنتاج أعلاه في **Production**.
3. التأكد من `NEXT_PUBLIC_SITE_URL=https://www.jordan-job.shop`.
4. `npm run vercel-build` (Prisma migrate + Next build) يعمل تلقائياً على Vercel.
5. لا تنشر أسرار SMTP في README أو commits.

### تجنب BOM (Windows)

لا تستخدم `echo "value" | vercel env add` من PowerShell بدون حماية UTF-8 — قد يكسر `DATABASE_URL`.  
استخدم لوحة Vercel أو `vercel env pull`.

---

## فحوصات ما قبل الإطلاق

```bash
npm run lint
npm run typecheck
npm run build
```

راجع أيضاً [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md).
