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

> **SEO و canonical و sitemap و Open Graph:** تُبنى من `NEXT_PUBLIC_SITE_URL`. في الإنتاج يجب أن تكون `https://www.jordan-job.shop` — لا تستخدم `*.vercel.app`.

تفاصيل DNS والبريد وVercel: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 🔐 متغيرات البيئة (مهم — اقرأ قبل التشغيل)

### القاعدة الذهبية

| الملف | الغرض | Git |
|-------|--------|-----|
| **`.env.local`** | **كل** متغيرات التطوير المحلي (أسرار + DB + SMTP) | ❌ لا يُرفع |
| **`.env.example`** | قالب آمن بقيم وهمية — انسخه للبدء | ✅ يُرفع |
| **`.env`** | ملف فارغ/توجيهي فقط — **لا تضع أسرار فيه** | ❌ لا يُرفع |
| **Vercel Dashboard** | متغيرات الإنتاج الحقيقية | — |

### إعداد محلي (خطوة بخطوة)

```bash
git clone https://github.com/dndnlolo1994-alt/jobsjo.git jojobs-os
cd jojobs-os
npm install
cp .env.example .env.local
```

عدّل **`.env.local` فقط** — املأ على الأقل:

| المتغير | ملاحظة |
|---------|--------|
| `DATABASE_URL` / `DIRECT_URL` | من Supabase (Pooler 6543 + Direct 5432) |
| `SESSION_SECRET` / `SESSION_PASSWORD` | 32 حرفاً على الأقل — **نفس القيمتين** |
| `NEXT_PUBLIC_SITE_URL` | محلياً: `http://localhost:3000` |
| `SMTP_*` | Hostinger — مطلوب لـ OTP والبريد |
| `ADMIN_EMAILS` | بريدك كأدمن، مثل `info@jordan-job.shop` |
| `CRON_SECRET` | أي سر قوي (محلي يمكن `dev_secret_key_123`) |
| `ANTHROPIC_API_KEY` أو `ANTHROPIC_AUTH_TOKEN` | اختياري — لتوليد نسخة CV إنجليزية بالذكاء الاصطناعي |
| `ANTHROPIC_BASE_URL` | اختياري — لمزوّد Anthropic-compatible مثل `https://api.synterolink.com` |

> Next.js يقرأ `.env.local` تلقائياً.  
> Prisma والسكربتات (`seed`, `test:email`, …) تقرأه عبر `scripts/load-env.cjs`.

### قائمة المتغيرات الكاملة

انظر [`.env.example`](.env.example) — يحتوي **كل** المفاتيح المستخدمة في المشروع.

---

## 🚀 التشغيل المحلي

```bash
npm run prisma:generate
npm run prisma:validate
npm run prisma:push    # أو: npm run prisma:migrate
npm run seed           # اختياري — بيانات تجريبية
npm run dev
```

محلياً: [http://localhost:3000](http://localhost:3000)

### اختبار البريد

```bash
npm run test:email -- info@jordan-job.shop
```

---

## 🔑 بيانات الدخول التجريبية (بعد seed)

| نوع الحساب | البريد | كلمة المرور |
|------------|--------|-------------|
| أدمن (seed) | `admin@jojobs.local` | `Password123!` |
| أدمن (إنتاج) | `info@jordan-job.shop` | يُضبط عبر `scripts/bootstrap-admin.ts` |
| صاحب عمل | `employer1@jojobs.local` | `Password123!` |
| باحث | `seeker1@jojobs.local` | `Password123!` |

> **بعد seed** تظهر أرقام وهمية في الأدمن (مثل 60 باحث). امسحها من `/admin/settings` → «حذف البيانات التجريبية».

---

## ⚠️ مشاكل شائعة (لا تتكرر)

### 1. وضعت المتغيرات في `.env` بدل `.env.local`
**الحل:** كل الأسرار في `.env.local` فقط. انسخ من `.env.example`.

### 2. OTP / البريد لا يصل
**السبب:** `SMTP_*` ناقصة أو خاطئة.  
**الحل:** املأ `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` في `.env.local` ثم `npm run test:email`.

### 3. `NEXT_PUBLIC_SITE_URL` خاطئ
| البيئة | القيمة الصحيحة |
|--------|----------------|
| محلي | `http://localhost:3000` |
| Vercel إنتاج | `https://www.jordan-job.shop` |

❌ لا تستخدم `jojobs-os.vercel.app` في الإنتاج — يكسر SEO وروابط QR والبريد.

### 4. BOM يكسر `DATABASE_URL` على Windows/Vercel
**السبب:** `echo "..." | vercel env add` من PowerShell يضيف BOM.  
**الحل:** لوحة Vercel، أو `vercel env pull .env.vercel.pull` ثم انسخ يدوياً إلى `.env.local`.

### 5. أرقام وهمية في لوحة الأدمن (61 باحث، إلخ)
**السبب:** `npm run seed` ينشئ 60 باحثاً + 10 أصحاب عمل + وظائف.  
**الحل:** `/admin/settings` → اكتب `حذف-التجريبي` أو من الطرفية:
```bash
npx tsx scripts/purge-platform-data.ts demo
```

### 6. لا أستطيع الدخول كأدمن
**الحل:**
- تأكد `ADMIN_EMAILS` في `.env.local` يحتوي بريدك.
- أو أنشئ/حدّث الأدمن:
```bash
npx tsx scripts/bootstrap-admin.ts info@jordan-job.shop "YourPassword"
```

### 7. Prisma لا يرى قاعدة البيانات
**الحل:** تأكد `DATABASE_URL` في `.env.local` واستخدم أوامر npm (`npm run prisma:push`) — لا تشغّل `prisma` مباشرة بدون `load-env`.

### 8. نشر Vercel نجح لكن قاعدة البيانات غير محدثة
سكريبت `vercel-build` يكمل بناء Next.js حتى لو فشل `prisma migrate deploy` مؤقتاً. بعد كل نشر راجع Build Logs في Vercel وتأكد أن migrations اكتملت، أو شغّل `npm run prisma:validate` محلياً قبل النشر.

### 9. زر توليد English في السيرة لا يعمل
**السبب:** متغيرات AI غير مفعلة في بيئة التشغيل.  
**الحل:** استخدم `ANTHROPIC_API_KEY` للرابط الرسمي، أو `ANTHROPIC_AUTH_TOKEN` مع `ANTHROPIC_BASE_URL` إذا كنت تستخدم مزوداً متوافقاً مع Anthropic. بدون المفتاح يمكن تعبئة تبويب English يدوياً، ولن تُعرض العربية في النسخة الإنجليزية غير المكتملة.

---

## 💳 المدفوعات اليدوية

1. طلب ترقية Plus أو خدمة مدفوعة → `BillingRecord` بحالة UNPAID.
2. تحويل + إثبات عبر واتساب.
3. الأدمن يفعّل من لوحة **طلبات المدفوعات**.

---

## 📁 هيكل المجلدات

```
src/
├── app/          # App Router (وظائف، شركات، me، employer، admin، api)
├── components/
├── lib/
└── prisma/
scripts/
├── load-env.cjs  # يحمّل .env.local لـ Prisma والسكربتات
docs/             # توثيق التشغيل، النشر، DNS
.env.example      # قالب — انسخ إلى .env.local
.env.local        # أسرارك المحلية (لا يُرفع)
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

## 🌐 مهام Cron بعد النشر

اضبط `CRON_SECRET` في Vercel Production، ثم شغّل المهام من Vercel Cron أو أي مزود خارجي:

```bash
GET /api/cron/sync-jobs?secret=YOUR_CRON_SECRET
GET /api/cron/scrape-jobs?secret=YOUR_CRON_SECRET
GET /api/cron/job-alerts
Authorization: Bearer YOUR_CRON_SECRET
```

> في الإنتاج، غياب `CRON_SECRET` يوقف مهام الكرون المحمية. محلياً استخدم القيمة الموجودة في `.env.local`.

### عند طلب النشر

عند قول "انشر"، المقصود تنفيذ المسار الكامل: فحص سريع (`lint`/`typecheck` عند الحاجة)، ثم `git commit` للتغييرات المطلوبة، ثم `git push` إلى الفرع المرتبط بـ Vercel، وبعدها متابعة نشر Vercel Production والتأكد من نجاحه.

---

## 📄 الرخصة

جميع الحقوق محفوظة © 2026 وظائف الأردن — JoJobs 🇯🇴
