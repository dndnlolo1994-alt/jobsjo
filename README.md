<![CDATA[<div align="center">

# 🇯🇴 جوبز الأردن — JobsJO

**منصة وظائف الأردن الأولى | Jordan's Premier Job Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://prisma.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ المميزات

- 🔍 **بحث وظائف متقدم** — فلترة حسب المدينة، القطاع، نوع العمل، ومستوى الخبرة
- 📄 **باني سيرة ذاتية** — إنشاء سيرة ذاتية احترافية باللغتين العربية والإنجليزية
- 🏢 **صفحات الشركات** — عرض الشركات الأردنية وفرص العمل المتاحة
- 📱 **تصميم متجاوب** — تجربة مثالية على الموبايل والديسكتوب
- 🌙 **وضع داكن** — واجهة أنيقة مريحة للعين
- 🔄 **تحديث تلقائي** — مزامنة الوظائف الجديدة تلقائياً
- 👔 **لوحة أصحاب العمل** — نشر وإدارة الوظائف
- 🛡️ **لوحة الإدارة** — إدارة كاملة للمنصة

## 🛠️ التقنيات

| التقنية | الاستخدام |
|---------|----------|
| **Next.js 15** | إطار العمل الأساسي (App Router) |
| **React 19 RC** | واجهة المستخدم |
| **TypeScript** | أمان الأنواع |
| **Prisma ORM** | إدارة قاعدة البيانات |
| **Supabase** | قاعدة بيانات PostgreSQL |
| **Tailwind CSS** | التصميم والأنماط |
| **Vercel** | الاستضافة والنشر |

## 🚀 التشغيل المحلي

```bash
# 1. استنساخ المشروع
git clone https://github.com/dndnlolo1994-alt/jobsjo.git
cd jobsjo

# 2. تثبيت الحزم
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env
# عدّل ملف .env بمعلوماتك

# 4. توليد Prisma Client
npx prisma generate

# 5. تشغيل المشروع
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 📁 هيكل المشروع

```
src/
├── app/                  # صفحات التطبيق (App Router)
│   ├── jobs/             # صفحات الوظائف
│   ├── companies/        # صفحات الشركات
│   ├── me/               # لوحة الباحث عن عمل
│   ├── employer/         # لوحة صاحب العمل
│   ├── admin/            # لوحة الإدارة
│   ├── cv-builder/       # باني السيرة الذاتية
│   └── api/              # API Routes
├── components/           # المكونات المشتركة
├── lib/                  # الأدوات والمكتبات
└── prisma/               # قاعدة البيانات
```

## 🌐 النشر

المشروع مُعد للنشر على **Vercel** مباشرة. تأكد من إعداد متغيرات البيئة في إعدادات Vercel.

## 📄 الرخصة

جميع الحقوق محفوظة © 2026 جوبز الأردن
]]>
