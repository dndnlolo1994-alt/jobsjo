import type { Metadata } from "next";
import { CvPreview } from "@/components/cv/CvPreview";
import { cvSampleData, cvSampleUserSkills } from "@/lib/cv-sample-data";

export const metadata: Metadata = {
  title: "معاينة نموذج السيرة",
  robots: { index: false, follow: false },
};

/** صفحة عامة لالتقاط لقطة شاشة حقيقية من قالب السيرة (Plus + صورة). */
export default async function CvSamplePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const sp = await searchParams;
  const lang = sp.lang === "en" ? "en" : "ar";
  return (
    <div id="cv-sample-root" className="min-h-screen bg-slate-200 py-8 px-4 flex justify-center">
      <div id="cv-sample-capture" className="shadow-2xl">
        <CvPreview cv={cvSampleData} userSkills={cvSampleUserSkills} lang={lang} isPlus />
      </div>
    </div>
  );
}
