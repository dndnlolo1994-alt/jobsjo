import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { CvPreview } from "@/components/cv/CvPreview";
import { fromCsv } from "@/lib/utils";

export const metadata: Metadata = { title: "معاينة السيرة", robots: { index: false, follow: false } };

export default async function CvPreviewPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const user = await requireJobSeeker();
  const sp = await searchParams;
  const lang = sp.lang || "ar";

  const [cv, seeker] = await Promise.all([
    prisma.cVProfile.findUnique({
      where: { userId: user.id },
      include: {
        experiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } }
      }
    }),
    prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } }),
  ]);

  if (!cv) {
    return (
      <section className="container-jo py-10">
        <div className="card-pad">
          ابدأ ببناء سيرتك أولاً. <Link className="link" href="/me/cv">فتح باني السيرة</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-jo py-8">
      <div className="no-print flex flex-wrap justify-between gap-3 mb-5 items-center border-b border-navy-100 pb-4">
        <div>
          <h1 className="section-title">معاينة السيرة الذاتية</h1>
          <p className="section-sub">هذه هي نسخة A4 التي ستظهر عند الطباعة. يمكنك التبديل بين اللغتين للتأكد من المراجعة.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Link className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${lang === "ar" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`} href="/me/cv/preview?lang=ar">العربية (Arabic)</Link>
          <Link className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${lang === "en" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800 hover:bg-slate-200"}`} href="/me/cv/preview?lang=en">الإنجليزية (English)</Link>
          <span className="mx-2 text-slate-300">|</span>
          <Link className="btn-outline text-xs" href="/me/cv">تعديل البيانات</Link>
          <Link className="btn-primary text-xs" href={`/me/cv/download?lang=${lang}`}>تنزيل نسخة PDF</Link>
        </div>
      </div>
      <CvPreview cv={cv} userSkills={fromCsv(seeker?.skills)} lang={lang} />
    </section>
  );
}
