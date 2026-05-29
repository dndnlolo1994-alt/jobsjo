# 🇯🇴 وظائف الأردن — JoJobs (JobsJO)

**منصة وظائف الأردن | Jordan Job Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

منصة تجمع الوظائف المحلية في الأردن، تساعد الباحثين في عمل سيرة ذاتية احترافية باللغتين العربية والإنجليزية وتنزيلها PDF، وتوفر للشركات لوحة متكاملة لنشر وتتبع طلبات التوظيف.

---

## 🌐 الدومين الرسمي (Production)

| البيئة | الرابط |
|--------|--------|
| **الدومين الرسمي للإنتاج** | [https://www.jordan-job.shop](https://www.jordan-job.shop) |
| **الجذر (redirect)** | `https://jordan-job.shop` → يُحوَّل إلى `https://www.jordan-job.shop` |
| **Vercel (احتياطي / داخلي)** | `https://jojobs-os.vercel.app` — للاختبار والنشر فقط، **ليس** الدومين العام للمستخدمين |

> **SEO و canonical و sitemap و Open Graph:** تُبنى من `NEXT_PUBLIC_SITE_URL` في الإنتاج. يجب أن تكون القيمة `https://www.jordan-job.shop` — لا تستخدم `*.vercel.app` في الإنتاج.

تفاصيل DNS والبريد وVercel: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 🚀 التشغيل المحلي (Local Setup)

### 1. استنساخ المشروع وتثبيت الاعتماديات

```bash
git clone https://github.com/dndnlolo1994-alt/jobsjo.git
cd jobsjo
npm install
```

### 2. إعداد ملف البيئة

```bash
cp .env.example .env
```

**محلياً** استخدم `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.  
**على Vercel (إنتاج)** استخدم `NEXT_PUBLIC_SITE_URL=https://www.jordan-job.shop` — انظر [`.env.example`](.env.example) و[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

أهم المتغيرات:

- `DATABASE_URL` / `DIRECT_URL` — PostgreSQL (Supabase).
- `SESSION_SECRET` / `SESSION_PASSWORD` — بحد أدنى 32 حرفاً.
- `NEXT_PUBLIC_SITE_URL` — عنوان الموقع حسب البيئة (محلي vs إنتاج).
- `SMTP_*` — إرسال OTP والبريد (Hostinger SMTP في الإنتاج).

### 3. قاعدة البيانات و Prisma

```bash
npx prisma generate
npx prisma db push
```

### 4. بذور البيانات (تجنب 404)

```bash
npx prisma db seed
```

### 5. تشغيل التطوير

```bash
npm run dev
```

محلياً: [http://localhost:3000](http://localhost:3000)

---

## 🔑 بيانات الدخول التجريبية (Seed)

| نوع الحساب | البريد | كلمة المرور |
|------------|--------|-------------|
| أدمن | `admin@jojobs.local` | `Password123!` |
| صاحب عمل | `employer1@jojobs.local` | `Password123!` |
| باحث | `seeker1@jojobs.local` | `Password123!` |

---

## 💳 المدفوعات اليدوية

1. طلب ترقية Plus أو خدمة مدفوعة → `BillingRecord` بحالة UNPAID.
2. تحويل + إثبات عبر واتساب.
3. الأدمن يفعّل من لوحة **طلبات المدفوعات**.

---

## ⚠️ BOM على Vercel (Windows)

عند إضافة متغيرات عبر PowerShell `echo ... | vercel env add` قد يُضاف BOM ويكسر `DATABASE_URL`.  
**الأفضل:** لوحة Vercel، أو `vercel env pull`، أو سكربت UTF-8.

---

## 📁 هيكل المجلدات

```
src/
├── app/          # App Router (وظائف، شركات، me، employer، admin، api)
├── components/
├── lib/
└── prisma/
docs/             # توثيق التشغيل، النشر، DNS، السياسات
```

---

## 📚 وثائق إضافية

| الملف | المحتوى |
|-------|---------|
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | نشر Vercel، DNS، بريد Hostinger، متغيرات الإنتاج |
| [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) | قائمة إطلاق |
| [`docs/MONETIZATION.md`](docs/MONETIZATION.md) | الأسعار والباقات |
| [`docs/CV_PDF_SYSTEM.md`](docs/CV_PDF_SYSTEM.md) | نظام السيرة PDF |

---

## 🌐 مزامنة RSS (Cron)

`GET /api/cron/sync-jobs?secret=YOUR_CRON_SECRET`

---

## 📄 الرخصة

جميع الحقوق محفوظة © 2026 وظائف الأردن — JoJobs 🇯🇴
