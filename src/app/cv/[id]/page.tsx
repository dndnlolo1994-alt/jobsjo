import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { getSessionUser } from "@/lib/session";
import { EXPERIENCE_LEVEL_LABEL, EDUCATION_LEVEL_LABEL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "السيرة الذاتية الموثقة | جوبز الأردن",
  description: "عرض السيرة الذاتية الموثقة والتحقق من صحة البيانات المهنية للباحث عن عمل.",
  robots: { index: false, follow: false },
};

export default async function CvVerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch complete CV details
  const cv = await prisma.cVProfile.findFirst({
    where: { OR: [{ userId: id }, { id }] },
    include: {
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

  const updated = new Intl.DateTimeFormat("ar-JO", { dateStyle: "long" }).format(cv.updatedAt);

  return (
    <div className="bg-[var(--color-bg)] min-h-screen text-[var(--color-text-main)] py-8 md:py-12">
      <div className="container-jo max-w-3xl">
        
        {/* ── Owner Controls Banner ── */}
        {isOwner && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="text-right">
              <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm">أنت تشاهد ملف سيرتك الذاتية</h3>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">يمكنك التحكم وتعديل كافة هذه المعلومات والخبرات من لوحة التحكم.</p>
            </div>
            <Link href="/me/cv" className="btn-primary py-2 px-5 text-sm font-semibold shrink-0">
              ✏️ تعديل السيرة الذاتية
            </Link>
          </div>
        )}

        {/* ── CV Profile Header Card ── */}
        <div className="card overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 mb-8">
          {/* Cover Accent Gradient */}
          <div className="h-32 md:h-40 w-full relative" style={{ background: "var(--gradient-hero)" }}>
            <div className="absolute right-6 top-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                سيرة موثّقة ومتحقق منها
              </span>
            </div>
          </div>

          {/* Header Content */}
          <div className="px-6 md:px-10 pb-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12">
            {/* Photo Avatar */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 shadow-md overflow-hidden shrink-0 relative flex items-center justify-center text-5xl">
              {cv.photo ? (
                <Image src={cv.photo} alt={cv.fullName} fill className="object-cover" />
              ) : (
                <span>🧑</span>
              )}
            </div>

            {/* Info details */}
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-title)]">{cv.fullName}</h1>
              {cv.jobTitle && (
                <p className="text-base md:text-lg font-bold text-primary-500 mt-1">{cv.jobTitle}</p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-xs text-gray-500 mt-3">
                {cv.city && <span className="flex items-center gap-1">📍 {cv.city}</span>}
                <span className="flex items-center gap-1">🗓 آخر تحديث: {updated}</span>
              </div>
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 px-6 md:px-10 py-5 grid sm:grid-cols-3 gap-4 text-sm text-center sm:text-right">
            <div>
              <span className="block text-xs text-gray-400 mb-0.5">📞 الهاتف</span>
              {cv.phone ? (
                <a href={`tel:${cv.phone}`} className="font-bold text-[var(--color-text-title)] hover:text-primary-500 transition-colors">
                  {cv.phone}
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
            <div>
              <span className="block text-xs text-gray-400 mb-0.5">✉️ البريد الإلكتروني</span>
              {cv.email ? (
                <a href={`mailto:${cv.email}`} className="font-bold text-[var(--color-text-title)] hover:text-primary-500 transition-colors break-words">
                  {cv.email}
                </a>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
            <div>
              <span className="block text-xs text-gray-400 mb-0.5">🌐 روابط خارجية</span>
              <div className="flex justify-center sm:justify-start gap-3 mt-1">
                {cv.linkedin && (
                  <a href={cv.linkedin.startsWith("http") ? cv.linkedin : `https://${cv.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                    LinkedIn
                  </a>
                )}
                {cv.website && (
                  <a href={cv.website.startsWith("http") ? cv.website : `https://${cv.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline font-medium">
                    موقع شخصي
                  </a>
                )}
                {!cv.linkedin && !cv.website && <span className="text-gray-400">—</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main CV Content ── */}
        <div className="space-y-6">
          
          {/* Summary / Noba */}
          {cv.summary && (
            <div className="card card-pad border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-3 flex items-center gap-2">
                <span className="text-xl">📄</span> النبذة المهنية
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed text-justify whitespace-pre-wrap">
                {cv.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          <div className="card card-pad border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-5 flex items-center gap-2">
              <span className="text-xl">💼</span> الخبرات العملية
            </h2>
            {cv.experiences.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">لا توجد خبرات مسجلة.</p>
            ) : (
              <div className="relative border-r-2 border-gray-100 dark:border-gray-800 pr-5 mr-3 space-y-6">
                {cv.experiences.map((exp, idx) => (
                  <div key={exp.id} className="relative">
                    {/* Time indicator bullet */}
                    <span className="absolute -right-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary-500 border-4 border-white dark:border-gray-900" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-2">
                      <h3 className="font-bold text-base text-[var(--color-text-title)]">{exp.position}</h3>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded font-medium">
                        🗓️ {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : "– الحالي"}
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
              <span className="text-xl">🎓</span> التعليم والدراسة
            </h2>
            {cv.educations.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">لا يوجد مؤهل تعليمي مسجل.</p>
            ) : (
              <div className="space-y-6">
                {cv.educations.map((edu) => (
                  <div key={edu.id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mb-1">
                      <h3 className="font-bold text-base text-[var(--color-text-title)]">{edu.degree}</h3>
                      <span className="text-xs text-gray-400 font-medium">
                        {edu.startDate} – {edu.endDate || "الحالي"}
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
              <span className="text-xl">⚡</span> المهارات المهنية
            </h2>
            {cv.skills.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">لا توجد مهارات مسجلة.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {cv.skills.map((skill) => (
                  <span key={skill.id} className="bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 px-3.5 py-1.5 rounded-xl text-sm font-semibold border border-primary-100 dark:border-primary-900/30">
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="card card-pad border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--color-text-title)] mb-4 flex items-center gap-2">
              <span className="text-xl">📜</span> الشهادات والدورات التدريبية
            </h2>
            {cv.certifications.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">لا توجد دورات أو شهادات مسجلة.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {cv.certifications.map((cert) => (
                  <div key={cert.id} className="p-3 bg-gray-50/50 dark:bg-gray-950/30 rounded-xl border border-gray-100 dark:border-gray-800/80">
                    <h3 className="font-bold text-sm text-[var(--color-text-title)]">{cert.name}</h3>
                    <div className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                      <span>{cert.issuer || "جهة مانحة غير محددة"}</span>
                      {cert.year && <span className="bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded shadow-sm text-gray-400">{cert.year}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Verification Stamp Footer ── */}
        <div className="mt-12 text-center text-xs text-gray-400 space-y-2 border-t border-gray-200/50 dark:border-gray-800/50 pt-6">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-base text-emerald-500">🛡️</span>
            <span className="font-bold text-gray-500 dark:text-gray-400">تحقق رقمي موثق</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            تم إصدار هذه الصفحة الرقمية بطلب من الباحث عن عمل عبر منصة {env.SITE_NAME}. جميع البيانات محمية وموثقة وفقاً لأحكام حماية البيانات.
          </p>
          <div className="pt-2">
            <Link href="/" className="btn-outline py-2 px-6 inline-block text-xs font-semibold">
              زيارة بوابة {env.SITE_NAME} الرئيسية
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
