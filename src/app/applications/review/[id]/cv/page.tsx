import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyApplicationReviewToken } from "@/lib/application-review-token";
import { CvPreview } from "@/components/cv/CvPreview";
import { PrintButton } from "@/components/cv/PrintButton";
import { fromCsv, formatDateArabic } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "سيرة المتقدم PDF | جوبز الأردن",
  robots: { index: false, follow: false },
};

export default async function PublicApplicationCvPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; lang?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: { select: { title: true, contactEmail: true } },
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

  if (!application?.jobSeeker.cvProfile) notFound();
  const employerEmail = application.employerNotificationTo ?? application.job.contactEmail;
  if (!verifyApplicationReviewToken(application.id, employerEmail, sp.token)) notFound();

  const cv = application.jobSeeker.cvProfile;
  const seeker = application.jobSeeker.jobSeekerProfile;
  const lang = sp.lang === "en" ? "en" : "ar";
  const isPlus = seeker?.plan === "PLUS" || cv.paymentStatus === "PAID" || cv.paymentStatus === "WAIVED";
  const backUrl = `/applications/review/${application.id}?token=${encodeURIComponent(sp.token ?? "")}`;
  const alternateLangUrl = `/applications/review/${application.id}/cv?token=${encodeURIComponent(sp.token ?? "")}&lang=${lang === "ar" ? "en" : "ar"}`;

  return (
    <main className="min-h-screen bg-slate-100 py-6" dir={lang === "en" ? "ltr" : "rtl"}>
      <section className="container-jo">
        <div className="no-print mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-xs font-extrabold text-primary-700">سيرة المتقدم جاهزة للطباعة أو الحفظ PDF</p>
              <h1 className="text-xl font-black text-slate-950">{cv.fullName}</h1>
              <p className="mt-1 text-sm font-bold text-slate-500">
                وظيفة: {application.job.title} · تاريخ التقديم: {formatDateArabic(application.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link className="btn-outline rounded-lg px-3 py-2 text-xs" href={backUrl}>رجوع للطلب</Link>
              <Link className="btn-outline rounded-lg px-3 py-2 text-xs" href={alternateLangUrl}>{lang === "ar" ? "English" : "العربية"}</Link>
              <PrintButton />
            </div>
          </div>
        </div>

        <CvPreview cv={cv} userSkills={fromCsv(seeker?.skills)} lang={lang} isPlus={isPlus} />
      </section>
    </main>
  );
}
