import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyApplicationReviewToken } from "@/lib/application-review-token";
import { APP_STATUS_LABEL, formatDateArabic, fromCsv } from "@/lib/utils";
import { normalizeJordanPhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مراجعة طلب التقديم | جوبز الأردن",
  robots: { index: false, follow: false },
};

export default async function PublicApplicationReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: { include: { company: true } },
      jobSeeker: {
        include: {
          jobSeekerProfile: true,
          cvProfile: {
            include: {
              experiences: { orderBy: { order: "asc" } },
              educations: { orderBy: { order: "asc" } },
              skills: { orderBy: { order: "asc" } },
              certifications: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!application) notFound();
  const employerEmail = application.employerNotificationTo ?? application.job.contactEmail;
  if (!verifyApplicationReviewToken(application.id, employerEmail, sp.token)) notFound();

  const seeker = application.jobSeeker.jobSeekerProfile;
  const cv = application.jobSeeker.cvProfile;
  const companyName = application.job.company?.name ?? application.job.companyNameText ?? "صاحب عمل خاص";
  const skills = fromCsv(seeker?.skills).length > 0 ? fromCsv(seeker?.skills) : cv?.skills.map((skill) => skill.name) ?? [];
  const phone = seeker?.phone || cv?.phone || application.jobSeeker.phone || "";
  const normalizedPhone = phone ? normalizeJordanPhone(phone) : null;
  const whatsappUrl = normalizedPhone ? `https://wa.me/${normalizedPhone}` : null;
  const cvUrl = cv ? `/applications/review/${application.id}/cv?token=${encodeURIComponent(sp.token ?? "")}` : null;

  return (
    <main className="min-h-screen bg-slate-950 py-8 text-slate-100" dir="rtl">
      <section className="container-jo max-w-4xl space-y-5">
        <header className="rounded-lg border border-primary-400/30 bg-slate-900 p-5 shadow-xl">
          <p className="mb-2 text-xs font-extrabold text-primary-200">مراجعة طلب توظيف بدون تسجيل دخول</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">{application.job.title}</h1>
              <p className="mt-1 text-sm font-bold text-slate-300">{companyName} · {application.job.city}</p>
            </div>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-extrabold text-emerald-200">
              {APP_STATUS_LABEL[application.status]}
            </span>
          </div>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-xs font-extrabold text-primary-700">بيانات المتقدم</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{application.jobSeeker.fullName}</h2>
              {(seeker?.headline || cv?.jobTitle) && (
                <p className="mt-1 text-sm font-extrabold text-primary-700">{seeker?.headline || cv?.jobTitle}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                {(seeker?.city || cv?.city) && <span className="rounded-lg bg-slate-100 px-2.5 py-1">📍 {seeker?.city || cv?.city}</span>}
                <span className="rounded-lg bg-slate-100 px-2.5 py-1">📅 {formatDateArabic(application.createdAt)}</span>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1">نسبة المطابقة: {application.matchScore}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {phone && <a className="btn-outline rounded-lg px-3 py-2 text-xs" href={`tel:${phone}`}>اتصال مباشر</a>}
              {whatsappUrl && <a className="btn-primary rounded-lg px-3 py-2 text-xs" href={whatsappUrl} target="_blank" rel="noopener noreferrer">واتساب</a>}
              {application.jobSeeker.email && <a className="btn-outline rounded-lg px-3 py-2 text-xs" href={`mailto:${application.jobSeeker.email}`}>إيميل</a>}
              {cvUrl && <Link className="btn-primary rounded-lg px-3 py-2 text-xs" href={cvUrl}>عرض السيرة / PDF</Link>}
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-extrabold text-slate-500">الهاتف</p>
              <p className="mt-1 break-all text-sm font-black text-slate-900">{phone || "غير مدخل"}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-extrabold text-slate-500">البريد</p>
              <p className="mt-1 break-all text-sm font-black text-slate-900" dir="ltr">{application.jobSeeker.email}</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-extrabold text-slate-500">التعليم</p>
              <p className="mt-1 text-sm font-black text-slate-900">{seeker?.educationLevel ?? "غير محدد"}</p>
            </div>
          </div>
        </section>

        {application.coverNote && (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
            <p className="mb-2 text-xs font-extrabold text-amber-700">رسالة التقديم</p>
            <p className="whitespace-pre-wrap text-sm font-bold leading-7">{application.coverNote}</p>
          </section>
        )}

        {(seeker?.summary || cv?.summary) && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
            <p className="mb-2 text-xs font-extrabold text-primary-700">نبذة مختصرة</p>
            <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-slate-700">{seeker?.summary || cv?.summary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
            <p className="mb-3 text-xs font-extrabold text-primary-700">المهارات</p>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 18).map((skill) => (
                <span key={skill} className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-extrabold text-primary-700">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {cv && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
              <p className="mb-3 text-xs font-extrabold text-primary-700">آخر الخبرات</p>
              <div className="space-y-3">
                {cv.experiences.slice(0, 3).map((experience) => (
                  <div key={experience.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-black text-slate-950">{experience.position}</p>
                    <p className="text-xs font-bold text-slate-500">{experience.company} · {experience.startDate} - {experience.endDate || "الحالي"}</p>
                  </div>
                ))}
                {cv.experiences.length === 0 && <p className="text-sm font-bold text-slate-400">لا توجد خبرات مدخلة.</p>}
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-900 shadow-sm">
              <p className="mb-3 text-xs font-extrabold text-primary-700">التعليم</p>
              <div className="space-y-3">
                {cv.educations.slice(0, 3).map((education) => (
                  <div key={education.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-black text-slate-950">{education.degree}</p>
                    <p className="text-xs font-bold text-slate-500">{education.institution}</p>
                  </div>
                ))}
                {cv.educations.length === 0 && <p className="text-sm font-bold text-slate-400">لا يوجد تعليم مدخل.</p>}
              </div>
            </div>
          </section>
        )}

        <footer className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-center text-xs font-bold text-slate-400">
          هذا الرابط خاص وصل لصاحب العمل عبر الإيميل. لا يحتاج تسجيل دخول، ولا يظهر في محركات البحث.
        </footer>
      </section>
    </main>
  );
}
