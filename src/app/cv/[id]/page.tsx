import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getSessionUser } from "@/lib/session";
import { fromCsv, formatDateArabic } from "@/lib/utils";
import { cleanEnglishText, getCvEnglishMissing, isCvEnglishReady, parseCvEnglishVersion } from "@/lib/cv-english";

export const metadata: Metadata = {
  title: "السيرة الذاتية الموثقة | جوبز الأردن",
  description: "عرض السيرة الذاتية الموثقة والتحقق من صحة البيانات المهنية للباحث عن عمل.",
  robots: { index: false, follow: false },
};

export default async function CvVerifyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const lang = sp.lang === "en" ? "en" : "ar";
  const isEn = lang === "en";

  // Fetch complete CV details
  const cv = await prisma.cVProfile.findFirst({
    where: { OR: [{ userId: id }, { id }] },
    include: {
      user: { include: { jobSeekerProfile: true } },
      experiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
    },
  });

  if (!cv) {
    return (
      <section className="container-jo py-16 max-w-lg">
        <div className="card card-pad text-center space-y-4 shadow-lg border border-red-100 dark:border-red-950/20 bg-white dark:bg-gray-900">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl mx-auto border border-rose-100 dark:border-rose-900/30">
            ✕
          </div>
          <h1 className="text-xl font-extrabold text-[var(--color-text-title)]">رابط التحقق غير صالح</h1>
          <p className="text-sm text-gray-500 leading-7">
            لم نتمكن من العثور على سيرة ذاتية مرتبطة بهذا الرمز. قد يكون الرابط منتهي الصلاحية أو غير صحيح.
          </p>
          <Link href="/" className="btn-primary inline-block py-2.5 px-6">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </section>
    );
  }

  // Get current session user to check ownership
  const currentUser = await getSessionUser();
  const isOwner = currentUser && (currentUser.id === cv.userId || currentUser.role === "ADMIN");
  const seeker = cv.user.jobSeekerProfile;
  const isVerifiedPublicCv = Boolean(
    cv.qrEnabled &&
    (cv.paymentStatus === "PAID" || cv.paymentStatus === "WAIVED" || seeker?.plan === "PLUS")
  );

  const updated = formatDateArabic(cv.updatedAt);
  const englishVersion = parseCvEnglishVersion(cv.englishVersion);
  const englishReady = isCvEnglishReady(englishVersion, cv);
  const englishMissing = getCvEnglishMissing(englishVersion, cv);
  const showEnglish = isEn && englishReady;
  const labels = showEnglish
    ? {
        invalidTitle: "CV page is not ready in English yet",
        invalidBody: "The Arabic version is available, but the English version still needs review before it can be shown publicly.",
        edit: "Edit CV",
        ownerTitle: "You are viewing your public CV page",
        ownerText: "You can update Arabic, English, PDF, and QR content from your dashboard.",
        verified: isVerifiedPublicCv ? "Verified active CV" : "Private owner preview",
        fullNameFallback: "English name missing",
        jobTitleFallback: "Job title translation missing",
        updated: `Last updated: ${updated}`,
        status: "Page status",
        active: isVerifiedPublicCv ? "QR active" : "Private preview",
        sync: "Updates",
        syncValue: "Synced from candidate dashboard",
        code: "Verification ID",
        phone: "Phone",
        email: "Email",
        links: "External links",
        personalSite: "Personal site",
        summary: "Professional Summary",
        experience: "Work Experience",
        noExperience: "No work experience recorded.",
        current: "Present",
        education: "Education",
        noEducation: "No education recorded.",
        skills: "Professional Skills",
        noSkills: "No skills recorded.",
        certifications: "Certifications",
        noCerts: "No certifications recorded.",
        unknownIssuer: "Issuer not specified",
        portfolio: "Portfolio Links",
        stamp: "Verified Digital CV",
        stampBody: `This public CV page was issued by the candidate through ${env.SITE_NAME}.`,
        home: `Visit ${env.SITE_NAME}`,
      }
    : {
        invalidTitle: "النسخة الإنجليزية غير جاهزة بعد",
        invalidBody: "النسخة العربية متاحة، لكن English تحتاج مراجعة قبل عرضها للزوار.",
        edit: "تعديل السيرة الذاتية",
        ownerTitle: "أنت تشاهد ملف سيرتك الذاتية",
        ownerText: "يمكنك التحكم وتعديل العربية والإنجليزية والـ PDF والـ QR من لوحة التحكم.",
        verified: isVerifiedPublicCv ? "سيرة موثّقة ومفعلة" : "معاينة خاصة بصاحب الحساب",
        fullNameFallback: cv.fullName,
        jobTitleFallback: "باحث عن عمل",
        updated: `آخر تحديث: ${updated}`,
        status: "حالة الصفحة",
        active: isVerifiedPublicCv ? "مفعلة عبر QR" : "معاينة خاصة",
        sync: "قابلية التحديث",
        syncValue: "تتحدث من لوحة الباحث",
        code: "رقم التحقق",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        links: "روابط خارجية",
        personalSite: "موقع شخصي",
        summary: "النبذة المهنية",
        experience: "الخبرات العملية",
        noExperience: "لا توجد خبرات مسجلة.",
        current: "الحالي",
        education: "التعليم والدراسة",
        noEducation: "لا يوجد مؤهل تعليمي مسجل.",
        skills: "المهارات المهنية",
        noSkills: "لا توجد مهارات مسجلة.",
        certifications: "الشهادات والدورات التدريبية",
        noCerts: "لا توجد دورات أو شهادات مسجلة.",
        unknownIssuer: "جهة مانحة غير محددة",
        portfolio: "أعمال وروابط مهنية",
        stamp: "تحقق رقمي موثق",
        stampBody: `تم إصدار هذه الصفحة الرقمية بطلب من الباحث عن عمل عبر منصة ${env.SITE_NAME}. جميع البيانات محمية وموثقة وفقاً لأحكام حماية البيانات.`,
        home: `زيارة بوابة ${env.SITE_NAME} الرئيسية`,
      };
  const displayCv = showEnglish
    ? {
        fullName: cleanEnglishText(englishVersion?.fullName, labels.fullNameFallback),
        jobTitle: cleanEnglishText(englishVersion?.jobTitle, labels.jobTitleFallback),
        city: cleanEnglishText(englishVersion?.city),
        country: cleanEnglishText(englishVersion?.country, "Jordan"),
        summary: cleanEnglishText(englishVersion?.summary),
        experiences: cv.experiences.map((item, idx) => {
          const eng = englishVersion?.experiences?.[idx] || {};
          return {
            ...item,
            position: cleanEnglishText(eng.position),
            company: cleanEnglishText(eng.company),
            city: cleanEnglishText(eng.city),
            description: cleanEnglishText(eng.description),
          };
        }),
        educations: cv.educations.map((item, idx) => {
          const eng = englishVersion?.educations?.[idx] || {};
          return {
            ...item,
            degree: cleanEnglishText(eng.degree),
            institution: cleanEnglishText(eng.institution),
            city: cleanEnglishText(eng.city),
            description: cleanEnglishText(eng.description),
          };
        }),
        skills: cv.skills.map((item, idx) => ({ ...item, name: cleanEnglishText(englishVersion?.skills?.[idx]?.name) })).filter((item) => item.name),
        certifications: cv.certifications.map((item, idx) => {
          const eng = englishVersion?.certifications?.[idx] || {};
          return { ...item, name: cleanEnglishText(eng.name), issuer: cleanEnglishText(eng.issuer) };
        }).filter((item) => item.name),
      }
    : cv;
  const seekerSkills = fromCsv(seeker?.skills);
  const preferredCities = showEnglish ? [] : fromCsv(seeker?.preferredCities);
  const languages = showEnglish ? [] : fromCsv(seeker?.languages);
  const portfolioLinks = fromCsv(seeker?.portfolioLinks);

  if (!isVerifiedPublicCv && !isOwner) {
    return (
      <section className="container-jo py-16 max-w-lg">
        <div className="card card-pad text-center space-y-4 shadow-lg border border-amber-100 bg-white">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-3xl mx-auto border border-amber-100">
            !
          </div>
          <h1 className="text-xl font-extrabold text-[var(--color-text-title)]">صفحة التعريف غير مفعلة بعد</h1>
          <p className="text-sm text-gray-500 leading-7">
            هذه السيرة موجودة، لكن رابط QR العام لا يظهر للزوار إلا بعد تفعيل الدفع أو الإعفاء من الإدارة.
          </p>
          <Link href="/" className="btn-primary inline-block py-2.5 px-6">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </section>
    );
  }

  if (isEn && !englishReady) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] py-10 text-[var(--color-text-main)]" dir="ltr">
        <div className="container-jo max-w-2xl">
          <div className="mb-4 flex justify-end gap-2">
            <Link href={`/cv/${id}?lang=ar`} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700">العربية</Link>
            <Link href={`/cv/${id}?lang=en`} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white">English</Link>
          </div>
          <div className="card card-pad border border-amber-200 bg-white text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-2xl text-amber-700">!</div>
            <h1 className="text-xl font-extrabold text-slate-950">{labels.invalidTitle}</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">{labels.invalidBody}</p>
            {isOwner && (
              <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-900">
                Missing fields: {englishMissing.slice(0, 10).join(", ")}{englishMissing.length > 10 ? "..." : ""}
              </div>
            )}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href={`/cv/${id}?lang=ar`} className="btn-primary text-sm">View Arabic</Link>
              {isOwner && <Link href="/me/cv" className="btn-outline text-sm">{labels.edit}</Link>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen text-[var(--color-text-main)] py-8 md:py-12" dir={showEnglish ? "ltr" : "rtl"}>
      <div className="container-jo max-w-3xl">
        <div className="mb-4 flex justify-end gap-2">
          <Link href={`/cv/${id}?lang=ar`} className={`rounded-lg px-4 py-2 text-xs font-extrabold ${!showEnglish ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>العربية</Link>
          <Link href={`/cv/${id}?lang=en`} className={`rounded-lg px-4 py-2 text-xs font-extrabold ${showEnglish ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>English</Link>
        </div>
        
        {/* ── Owner Controls Banner ── */}
        {isOwner && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className={showEnglish ? "text-left" : "text-right"}>
              <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm">{labels.ownerTitle}</h3>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">{labels.ownerText}</p>
            </div>
            <Link href="/me/cv" className="btn-primary py-2 px-5 text-sm font-semibold shrink-0">
              {labels.edit}
            </Link>
          </div>
        )}

        {/* ── CV Profile Header Card ── */}
        <div className="card overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 mb-8">
          {/* Cover Accent Gradient */}
          <div className="h-32 md:h-40 w-full relative" style={{ background: "var(--gradient-hero)" }}>
            <div className="absolute right-6 top-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8b7340] bg-[#f8f5ec] border border-[#e0d9c5] px-3.5 py-1.5 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#c0a368] animate-pulse" />
                {labels.verified}
              </span>
            </div>
          </div>

          {/* Header Content */}
          <div className="px-6 md:px-10 pb-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12">
            {/* Photo Avatar */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 shadow-md overflow-hidden shrink-0 relative flex items-center justify-center text-5xl">
              {cv.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cv.photo} alt={displayCv.fullName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span>🧑</span>
              )}
            </div>

            {/* Info details */}
            <div className={`flex-1 text-center ${showEnglish ? "md:text-left" : "md:text-right"}`}>
              <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-title)]">{displayCv.fullName}</h1>
              {displayCv.jobTitle && (
                <p className="text-base md:text-lg font-bold text-primary-500 mt-1">{displayCv.jobTitle}</p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-gray-500 mt-3">
                {displayCv.city && <span className="flex items-center gap-1">📍 {displayCv.city}</span>}
                {displayCv.country && <span className="flex items-center gap-1">🇯🇴 {displayCv.country}</span>}
                <span className="flex items-center gap-1">🗓 {labels.updated}</span>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-10 pb-5 grid sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[#e0d9c5] bg-[#f8f5ec]/50 p-3 text-center">
              <span className="block text-[11px] text-[#8b7340] font-bold">{labels.status}</span>
              <strong className="text-sm text-[#6b5a30]">{labels.active}</strong>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 text-center">
              <span className="block text-[11px] text-blue-700 font-bold">{labels.sync}</span>
              <strong className="text-sm text-blue-950">{labels.syncValue}</strong>
            </div>
            <div className="rounded-2xl border border-slate-150 bg-slate-50 p-3 text-center">
              <span className="block text-[11px] text-slate-500 font-bold">{labels.code}</span>
              <strong className="text-xs text-slate-800 break-all">{cv.id.slice(0, 10)}</strong>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className={`border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 px-6 md:px-10 py-5 grid sm:grid-cols-3 gap-4 text-sm text-center ${showEnglish ? "sm:text-left" : "sm:text-right"}`}>
            <div>
              <span className="block text-xs text-gray-400 mb-0.5">📞 {labels.phone}</span>
              {cv.phone ? (
                <a href={`tel:${cv.phone}`} className="font-bold text-[var(--color-text-title)] hover:text-primary-500 transition-colors">
                  {cv.phone}
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
            <div>
              <span className="block text-xs text-gray-400 mb-0.5">✉️ {labels.email}</span>
              {cv.email ? (
                <a href={`mailto:${cv.email}`} className="font-bold text-[var(--color-text-title)] hover:text-primary-500 transition-colors break-words">
                  {cv.email}
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
            <div>
              <span className="block text-xs text-gray-400 mb-0.5">🌐 {labels.links}</span>
              <div className="flex justify-center sm:justify-start gap-3 mt-1">
                {cv.linkedin && (
                  <a href={cv.linkedin.startsWith("http") ? cv.linkedin : `https://${cv.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    LinkedIn
                  </a>
                )}
                {cv.website && (
                  <a href={cv.website.startsWith("http") ? cv.website : `https://${cv.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline font-medium">
                    {labels.personalSite}
                  </a>
                )}
                {!cv.linkedin && !cv.website && <span className="text-gray-400">—</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main CV Content ── */}
        <div className="space-y-6">
          {!showEnglish && (seeker?.headline || seeker?.summary || preferredCities.length > 0 || languages.length > 0) && (
            <div className="card card-pad border border-gray-100 bg-white shadow-sm">
              <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-4 flex items-center gap-2">
                <span className="text-xl">👤</span> بطاقة تعريف الباحث
              </h2>
              {seeker?.headline && <p className="font-extrabold text-primary-600 mb-2">{seeker.headline}</p>}
              {seeker?.summary && <p className="text-sm text-gray-600 leading-8 whitespace-pre-wrap mb-4">{seeker.summary}</p>}
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {seeker?.city && <div className="rounded-xl bg-gray-50 p-3"><span className="text-gray-400 block text-xs">المدينة</span><strong>{seeker.city}</strong></div>}
                {typeof seeker?.yearsOfExperience === "number" && <div className="rounded-xl bg-gray-50 p-3"><span className="text-gray-400 block text-xs">سنوات الخبرة</span><strong>{seeker.yearsOfExperience.toLocaleString("ar-JO")}</strong></div>}
                {preferredCities.length > 0 && <div className="rounded-xl bg-gray-50 p-3"><span className="text-gray-400 block text-xs">مدن مفضلة</span><strong>{preferredCities.join("، ")}</strong></div>}
                {languages.length > 0 && <div className="rounded-xl bg-gray-50 p-3"><span className="text-gray-400 block text-xs">اللغات</span><strong>{languages.join("، ")}</strong></div>}
              </div>
            </div>
          )}
          
          {/* Summary / Noba */}
          {displayCv.summary && (
            <div className="card card-pad border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-3 flex items-center gap-2">
                <span className="text-xl">📄</span> {labels.summary}
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed text-justify whitespace-pre-wrap">
                {displayCv.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          <div className="card card-pad border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-5 flex items-center gap-2">
              <span className="text-xl">💼</span> {labels.experience}
            </h2>
            {displayCv.experiences.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">{labels.noExperience}</p>
            ) : (
              <div className={`relative space-y-6 ${showEnglish ? "border-l-2 border-gray-100 pl-5 ml-3" : "border-r-2 border-gray-100 dark:border-gray-800 pr-5 mr-3"}`}>
                {displayCv.experiences.map((exp) => (
                  <div key={exp.id} className="relative">
                    {/* Time indicator bullet */}
                    <span className={`absolute top-1.5 h-3.5 w-3.5 rounded-full border-4 border-white bg-primary-500 dark:border-gray-900 ${showEnglish ? "-left-[27px]" : "-right-[27px]"}`} />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-2">
                      <h3 className="font-bold text-base text-[var(--color-text-title)]">{exp.position}</h3>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded font-medium">
                        🗓️ {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : `– ${labels.current}`}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-primary-500 mb-2">
                      {exp.company} {exp.city ? `· ${exp.city}` : ""}
                    </div>

                    {exp.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="card card-pad border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-5 flex items-center gap-2">
              <span className="text-xl">🎓</span> {labels.education}
            </h2>
            {displayCv.educations.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">{labels.noEducation}</p>
            ) : (
              <div className="space-y-6">
                {displayCv.educations.map((edu) => (
                  <div key={edu.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-1">
                      <h3 className="font-bold text-base text-[var(--color-text-title)]">{edu.degree}</h3>
                      <span className="text-xs text-gray-400 font-medium">
                        {edu.startDate} – {edu.endDate || labels.current}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">
                      {edu.institution} {edu.city ? `· ${edu.city}` : ""}
                    </div>
                    {edu.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="card card-pad border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-4 flex items-center gap-2">
              <span className="text-xl">⚡</span> {labels.skills}
            </h2>
            {displayCv.skills.length === 0 ? (
              seekerSkills.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">{labels.noSkills}</p>
              ) : null
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {displayCv.skills.map((skill) => (
                  <span key={skill.id} className="bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 px-3.5 py-1.5 rounded-xl text-sm font-semibold border border-primary-100 dark:border-primary-900/30">
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
            {seekerSkills.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-3">
                {seekerSkills.map((skill) => (
                  <span key={skill} className="bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-xl text-sm font-semibold border border-slate-150">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="card card-pad border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-4 flex items-center gap-2">
              <span className="text-xl">📜</span> {labels.certifications}
            </h2>
            {displayCv.certifications.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">{labels.noCerts}</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {displayCv.certifications.map((cert) => (
                  <div key={cert.id} className="p-3 bg-gray-50/50 dark:bg-gray-950/30 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <h3 className="font-bold text-sm text-[var(--color-text-title)]">{cert.name}</h3>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                      <span>{cert.issuer || labels.unknownIssuer}</span>
                      {cert.year && <span className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded shadow-sm text-gray-400">{cert.year}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {portfolioLinks.length > 0 && (
            <div className="card card-pad border border-gray-100 bg-white shadow-sm">
              <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-4 flex items-center gap-2">
                <span className="text-xl">🔗</span> {labels.portfolio}
              </h2>
              <div className="grid gap-2">
                {portfolioLinks.map((link) => {
                  const href = link.startsWith("http") ? link : `https://${link}`;
                  return (
                    <a key={link} href={href} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-150 bg-slate-50 px-3 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50 break-all" dir="ltr">
                      {link}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Verification Stamp Footer ── */}
        <div className="mt-12 text-center text-xs text-gray-400 space-y-2 border-t border-gray-200/50 dark:border-gray-800/50 pt-6">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-base text-[#c0a368]">🛡️</span>
            <span className="font-bold text-gray-500 dark:text-gray-400">{labels.stamp}</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            {labels.stampBody}
          </p>
          <div className="pt-2">
            <Link href="/" className="btn-outline py-2 px-6 inline-block text-xs font-semibold">
              {labels.home}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
