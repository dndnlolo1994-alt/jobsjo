import QRCode from "qrcode";
import { formatJordanPhoneDisplay } from "@/lib/phone";

interface CvPreviewProps {
  cv: any;
  userSkills?: string[];
  lang?: string;
}

export async function CvPreview({ cv, userSkills = [], lang }: CvPreviewProps) {
  const langMode = lang || cv.language || "ar";
  const isEn = langMode === "en";

  const t = (label: string) => {
    if (!isEn) return label;
    const trans: Record<string, string> = {
      "النبذة المهنية": "Professional Summary",
      "نبذة مهنية": "Professional Summary",
      "الملخص المهني": "Professional Summary",
      "الملخص التنفيذي": "Professional Summary",
      "الخبرات العملية": "Work Experience",
      "الخبرة المهنية": "Work Experience",
      "التعليم والدراسة": "Education",
      "التعليم والمؤهلات": "Education",
      "المهارات": "Skills",
      "الشهادات والدورات": "Certifications",
      "الشهادات المهنية": "Certifications",
      "الشهادات": "Certifications",
      "رمز التحقق": "Verification QR",
      "سيرة موثقة إلكترونياً": "Verified CV",
      "سيرة موثقة": "Verified CV",
      "الاتصال": "Contact",
      "الأردن": "Jordan",
      "حتى الآن": "Present",
      "باحث عن عمل": "Job Seeker",
      "رمز الاستجابة": "Verification QR",
    };
    return trans[label] || label;
  };

  // Generate QR Code dynamically
  let qrCodeDataUrl = "";
  try {
    // Point to a simulated verification page
    qrCodeDataUrl = await QRCode.toDataURL(`https://jojobs.jo/cv/${cv.userId || cv.id}`);
  } catch (err) {
    console.error("Error generating QR code:", err);
  }

  const activeTemplate = cv.template || "modern-emerald";

  let fullName = cv.fullName;
  let jobTitle = cv.jobTitle;
  let summary = cv.summary;
  let experiences = cv.experiences ?? [];
  let educations = cv.educations ?? [];
  let skills = cv.skills ?? [];
  let certifications = cv.certifications ?? [];

  if (isEn && cv.englishVersion) {
    try {
      const eng = JSON.parse(cv.englishVersion);
      if (eng.fullName) fullName = eng.fullName;
      if (eng.jobTitle) jobTitle = eng.jobTitle;
      if (eng.summary) summary = eng.summary;
      if (eng.experiences?.length > 0) {
        experiences = eng.experiences.map((ex: any, idx: number) => ({
          ...cv.experiences?.[idx],
          position: ex.position || cv.experiences?.[idx]?.position,
          company: ex.company || cv.experiences?.[idx]?.company,
          description: ex.description || cv.experiences?.[idx]?.description,
          city: ex.city || cv.experiences?.[idx]?.city,
          startDate: ex.startDate || cv.experiences?.[idx]?.startDate,
          endDate: ex.endDate || cv.experiences?.[idx]?.endDate,
        }));
      }
      if (eng.educations?.length > 0) {
        educations = eng.educations.map((ed: any, idx: number) => ({
          ...cv.educations?.[idx],
          degree: ed.degree || cv.educations?.[idx]?.degree,
          institution: ed.institution || cv.educations?.[idx]?.institution,
          description: ed.description || cv.educations?.[idx]?.description,
          city: ed.city || cv.educations?.[idx]?.city,
          startDate: ed.startDate || cv.educations?.[idx]?.startDate,
          endDate: ed.endDate || cv.educations?.[idx]?.endDate,
        }));
      }
    } catch (e) {}
  }

  const allSkills = [...(skills ?? []).map((s: any) => s.name), ...userSkills].filter(Boolean);

  // Render Template: Minimalist
  if (activeTemplate === "minimalist") {
    return (
      <div className="cv-print cv-print-padded bg-white text-slate-900 mx-auto max-w-[794px] min-h-[1123px] p-8 md:p-12 shadow-card border border-slate-200" dir={isEn ? "ltr" : "rtl"}>
        <div className="cv-header flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
          <div className="flex gap-4 items-start">
            {cv.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cv.photo} alt={fullName} className="w-20 h-20 rounded-lg object-cover border border-slate-300" />
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">{fullName}</h1>
              <p className="text-lg text-slate-600 font-medium mt-1">{jobTitle || t("باحث عن عمل")}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                {cv.email && <span>{cv.email}</span>}
                {cv.phone && <span>{formatJordanPhoneDisplay(cv.phone)}</span>}
                {cv.city && <span>{cv.city}, {t("الأردن")}</span>}
                {cv.website && <span dir="ltr">{cv.website}</span>}
              </div>
            </div>
          </div>
          {qrCodeDataUrl && (
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeDataUrl} alt="QR Verification" className="w-14 h-14 border border-slate-200 p-0.5 rounded" />
              <span className="text-[9px] text-slate-400 block mt-1">{t("رمز التحقق")}</span>
            </div>
          )}
        </div>

        {summary && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">{t("النبذة المهنية")}</h2>
            <p className="text-xs text-slate-700 leading-6">{summary}</p>
          </section>
        )}

        {experiences?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">{t("الخبرات العملية")}</h2>
            <div className="space-y-4">
              {experiences.map((e: any) => (
                <div key={e.id} className="break-inside-avoid">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-900">{e.position}</span>
                    <span className="text-slate-500 font-normal">{e.startDate} - {e.endDate || t("حتى الآن")}</span>
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">{e.company} {e.city ? `• ${e.city}` : ""}</div>
                  {e.description && <p className="text-[11px] text-slate-600 mt-1 leading-5 whitespace-pre-line">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {educations?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-3">{t("التعليم والدراسة")}</h2>
            <div className="space-y-3">
              {educations.map((e: any) => (
                <div key={e.id} className="break-inside-avoid">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-900">{e.degree}</span>
                    <span className="text-slate-500 font-normal">{e.startDate} - {e.endDate || t("حتى الآن")}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">{e.institution} {e.city ? `• ${e.city}` : ""}</div>
                  {e.description && <p className="text-[11px] text-slate-500 mt-1 leading-5">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-6">
          {allSkills.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">{t("المهارات")}</h2>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map((s) => (
                  <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-semibold text-slate-700" key={s}>{s}</span>
                ))}
              </div>
            </section>
          )}

          {certifications?.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">{t("الشهادات والدورات")}</h2>
              <div className="space-y-2">
                {certifications.map((c: any) => (
                  <div key={c.id} className="text-xs">
                    <div className="font-bold text-slate-950">{c.name}</div>
                    <div className="text-slate-600 text-[10px]">{c.issuer} {c.year ? `• ${c.year}` : ""}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Render Template: Classic Navy
  if (activeTemplate === "classic-navy") {
    return (
      <div className="cv-print cv-print-sidebar bg-white text-navy-900 mx-auto max-w-[794px] min-h-[1123px] shadow-card border border-navy-100 flex flex-row overflow-hidden" dir={isEn ? "ltr" : "rtl"}>
        {/* Sidebar (Personal info) */}
        <aside className="w-[240px] bg-slate-100 p-6 flex flex-col items-center gap-6 border-x border-navy-100">
          {cv.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cv.photo} alt={fullName} className="w-28 h-28 rounded-full object-cover border-2 border-navy-800 shadow" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white border-2 border-navy-800 shadow" />
          )}

          <div className="w-full space-y-4">
            <div>
              <h3 className="text-xs font-bold text-navy-950 uppercase border-b border-navy-300 pb-1 mb-2">{t("الاتصال")}</h3>
              <ul className="text-[11px] text-navy-700 space-y-2 break-all">
                {cv.phone && <li>📞 {formatJordanPhoneDisplay(cv.phone)}</li>}
                {cv.email && <li>✉ {cv.email}</li>}
                {cv.city && <li>📍 {cv.city}, {t("الأردن")}</li>}
                {cv.website && <li className="font-semibold" dir="ltr">🔗 {cv.website}</li>}
              </ul>
            </div>

            {allSkills.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-navy-950 uppercase border-b border-navy-300 pb-1 mb-2">{t("المهارات")}</h3>
                <div className="flex flex-wrap gap-1">
                  {allSkills.map((s) => (
                    <span className="px-2 py-0.5 rounded bg-white text-[10px] font-semibold text-navy-700 border border-navy-100" key={s}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {qrCodeDataUrl && (
              <div className="pt-6 mt-auto text-center border-t border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeDataUrl} alt="QR Verification" className="w-16 h-16 mx-auto border border-slate-200 p-0.5 rounded bg-white" />
                <span className="text-[9px] text-slate-500 block mt-1">{t("سيرة موثقة")}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Left main area */}
        <div className="flex-1 p-8">
          <div className="cv-header border-b-2 border-navy-800 pb-4 mb-6">
            <h1 className="text-3xl font-extrabold text-navy-950">{fullName}</h1>
            <p className="text-lg text-blue-800 font-bold mt-1">{jobTitle || t("باحث عن عمل")}</p>
          </div>

          {summary && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-navy-950 border-r-4 border-navy-800 pr-2 mb-2">{t("الملخص المهني")}</h2>
              <p className="text-xs text-navy-700 leading-6">{summary}</p>
            </section>
          )}

          {experiences?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-navy-950 border-r-4 border-navy-800 pr-2 mb-3">{t("الخبرات العملية")}</h2>
              <div className="space-y-4">
                {experiences.map((e: any) => (
                  <div key={e.id} className="break-inside-avoid">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-navy-900">{e.position}</span>
                      <span className="text-navy-500 font-normal">{e.startDate} - {e.endDate || t("حتى الآن")}</span>
                    </div>
                    <div className="text-xs text-blue-800 font-semibold mt-0.5">{e.company} {e.city ? `• ${e.city}` : ""}</div>
                    {e.description && <p className="text-[11px] text-navy-600 mt-1 leading-5 whitespace-pre-line">{e.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {educations?.length > 0 && (
            <section className="mb-6">
              <h2 className="text-sm font-bold text-navy-950 border-r-4 border-navy-800 pr-2 mb-3">{t("التعليم والدراسة")}</h2>
              <div className="space-y-3">
                {educations.map((e: any) => (
                  <div key={e.id} className="break-inside-avoid">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-navy-950">{e.degree}</span>
                      <span className="text-navy-500 font-normal">{e.startDate} - {e.endDate || t("حتى الآن")}</span>
                    </div>
                    <div className="text-xs text-blue-800 mt-0.5">{e.institution} {e.city ? `• ${e.city}` : ""}</div>
                    {e.description && <p className="text-[11px] text-navy-600 mt-1 leading-5">{e.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications?.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-sm font-bold text-navy-950 border-r-4 border-navy-800 pr-2 mb-3">{t("الشهادات المهنية")}</h2>
              <div className="grid grid-cols-2 gap-3">
                {certifications.map((c: any) => (
                  <div key={c.id} className="text-xs p-2 bg-slate-50 border border-slate-100 rounded">
                    <div className="font-bold text-navy-950">{c.name}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">{c.issuer} {c.year ? `• ${c.year}` : ""}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Render Template: Executive Gold
  if (activeTemplate === "executive-gold") {
    return (
      <div className="cv-print cv-print-gold bg-white text-slate-800 mx-auto max-w-[794px] min-h-[1123px] shadow-card border border-amber-100 overflow-hidden" dir={isEn ? "ltr" : "rtl"}>
        {/* Top Banner */}
        <div className="cv-header bg-slate-900 text-white p-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-b-8 border-amber-600">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {cv.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cv.photo} alt={fullName} className="w-24 h-24 rounded-full object-cover border-2 border-amber-500 shadow" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white border-2 border-amber-500 shadow" />
            )}
            <div className="text-center sm:text-right">
              <h1 className="text-3xl font-extrabold tracking-wide text-amber-500">{fullName}</h1>
              <p className="text-lg text-slate-300 font-semibold mt-1">{jobTitle || t("باحث عن عمل")}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-400 mt-3">
                {cv.phone && <span>📞 {formatJordanPhoneDisplay(cv.phone)}</span>}
                {cv.email && <span>✉ {cv.email}</span>}
                {cv.city && <span>📍 {cv.city}</span>}
                {cv.website && <span dir="ltr">🔗 {cv.website}</span>}
              </div>
            </div>
          </div>
          {qrCodeDataUrl && (
            <div className="bg-white p-1.5 rounded shadow flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeDataUrl} alt="QR Verification" className="w-14 h-14" />
            </div>
          )}
        </div>

        <div className="p-8 space-y-6">
          {summary && (
            <section className="break-inside-avoid">
              <h2 className="text-sm font-extrabold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>✦</span> {t("الملخص التنفيذي")}
              </h2>
              <p className="text-xs text-slate-700 leading-6">{summary}</p>
            </section>
          )}

          <div className="grid md:grid-cols-[1fr_220px] gap-8">
            <div className="space-y-6">
              {experiences?.length > 0 && (
                <section>
                  <h2 className="text-sm font-extrabold text-amber-700 uppercase tracking-wider border-b-2 border-amber-200 pb-1 mb-3 flex items-center gap-2">
                    <span>✦</span> {t("الخبرة المهنية")}
                  </h2>
                  <div className="space-y-4">
                    {experiences.map((e: any) => (
                      <div key={e.id} className="break-inside-avoid">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-900">{e.position}</span>
                          <span className="text-amber-700 font-normal">{e.startDate} - {e.endDate || t("حتى الآن")}</span>
                        </div>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">{e.company} {e.city ? `• ${e.city}` : ""}</div>
                        {e.description && <p className="text-[11px] text-slate-600 mt-1 leading-5 whitespace-pre-line">{e.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {educations?.length > 0 && (
                <section>
                  <h2 className="text-sm font-extrabold text-amber-700 uppercase tracking-wider border-b-2 border-amber-200 pb-1 mb-3 flex items-center gap-2">
                    <span>✦</span> {t("التعليم والمؤهلات")}
                  </h2>
                  <div className="space-y-3">
                    {educations.map((e: any) => (
                      <div key={e.id} className="break-inside-avoid">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-900">{e.degree}</span>
                          <span className="text-amber-700 font-normal">{e.startDate} - {e.endDate || t("حتى الآن")}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{e.institution} {e.city ? `• ${e.city}` : ""}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              {allSkills.length > 0 && (
                <section className="break-inside-avoid">
                  <h2 className="text-sm font-extrabold text-amber-700 uppercase tracking-wider border-b-2 border-amber-200 pb-1 mb-2">{t("المهارات")}</h2>
                  <div className="flex flex-wrap gap-1">
                    {allSkills.map((s) => (
                      <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700" key={s}>{s}</span>
                    ))}
                  </div>
                </section>
              )}

              {certifications?.length > 0 && (
                <section className="break-inside-avoid">
                  <h2 className="text-sm font-extrabold text-amber-700 uppercase tracking-wider border-b-2 border-amber-200 pb-1 mb-2">{t("الشهادات")}</h2>
                  <div className="space-y-2">
                    {certifications.map((c: any) => (
                      <div key={c.id} className="text-xs">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-slate-500 text-[10px] mt-0.5">{c.issuer} {c.year ? `• ${c.year}` : ""}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Template: Modern Emerald
  const skillsWithLevels = [
    ...(skills ?? []).map((s: any) => ({ name: s.name || s, level: s.level || 4 })),
    ...userSkills.map((s: any) => ({ name: s, level: 4 }))
  ].filter(s => s.name);

  // Content counting to check if we need 1 or 2 pages
  const totalContentCount = experiences.length + educations.length + certifications.length;
  const isTwoPages = totalContentCount > 3 || skillsWithLevels.length > 5;

  let page1Exps = experiences;
  let page2Exps: any[] = [];
  let page1Edus = educations;
  let page2Edus: any[] = [];
  let page1Skills = skillsWithLevels;
  let page2Skills: any[] = [];
  let page1Certs = certifications;
  let page2Certs: any[] = [];

  if (isTwoPages) {
    page1Exps = experiences.slice(0, 2);
    page2Exps = experiences.slice(2);
    
    page1Edus = [];
    page2Edus = educations;
    
    page1Skills = skillsWithLevels.slice(0, 5);
    page2Skills = skillsWithLevels.slice(5);
    
    page1Certs = certifications.slice(0, 2);
    page2Certs = certifications.slice(2);
  }

  const renderPage = (
    pageNum: number,
    pageExps: any[],
    pageEdus: any[],
    pageSkills: any[],
    pageCerts: any[],
    showSummary: boolean,
    showFooter: boolean
  ) => {
    return (
      <div 
        className="cv-print bg-white text-navy-950 mx-auto max-w-[794px] h-[1123px] min-h-[1123px] max-h-[1123px] relative overflow-hidden shadow-card border border-navy-100 mb-8 flex flex-col" 
        dir={isEn ? "ltr" : "rtl"}
        key={pageNum}
      >
        {/* Header */}
        <div className="cv-header bg-[#084c41] text-white h-[160px] min-h-[160px] px-10 flex items-center relative overflow-hidden">
          {/* Ambient background decoration */}
          <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          
          <div className={`flex items-center justify-between w-full z-10 ${isEn ? "flex-row" : "flex-row-reverse"}`}>
            {/* Name and Job Title */}
            <div className={`flex flex-col ${isEn ? "text-left" : "text-right"}`}>
              <h1 className="text-3xl font-extrabold tracking-wide text-white leading-tight">{fullName}</h1>
              <p className="text-sm text-[#c2a06c] font-bold mt-1.5">{jobTitle || t("باحث عن عمل")}</p>
            </div>
            
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-[102px] h-[102px] rounded-full border-2 border-[#c2a06c] flex items-center justify-center p-[2px] bg-transparent">
                {cv.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={cv.photo} 
                    alt={fullName} 
                    className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-sm" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white border-[3px] border-white shadow-sm" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columns Container - Forced LTR to keep Left column on Left and Right column on Right */}
        <div className="flex-1 flex flex-row overflow-hidden" dir="ltr">
          {/* Main Body */}
          <div className="w-[67%] bg-white p-8 border-l-[16px] border-[#084c41] flex flex-col justify-between overflow-hidden" dir={isEn ? "ltr" : "rtl"}>
            <div className="space-y-5">
              {/* Summary */}
              {showSummary && summary && (
                <section>
                  <h2 className="text-sm font-extrabold text-[#084c41] mb-1.5 flex items-center gap-2">
                    {t("نبذة مهنية")}
                  </h2>
                  <div className="w-10 h-0.5 bg-[#c2a06c] mb-2" />
                  <p className="text-[11px] text-slate-700 leading-relaxed text-justify">{summary}</p>
                </section>
              )}

              {/* Experience */}
              {pageExps.length > 0 && (
                <section>
                  <h2 className="text-sm font-extrabold text-[#084c41] mb-1.5">
                    {t("الخبرات العملية")}
                  </h2>
                  <div className="w-10 h-0.5 bg-[#c2a06c] mb-4" />
                  
                  <div className="relative">
                    {/* Continuous vertical timeline line */}
                    <div className="absolute left-[100px] top-2 bottom-2 w-[1px] bg-[#c2a06c]/30" />
                    
                    <div className="space-y-4">
                      {pageExps.map((exp) => (
                        <div key={exp.id} className="flex flex-row gap-3 items-start relative text-[11px]" dir="ltr">
                          {/* Left: Date */}
                          <div className="w-[80px] text-right font-bold text-slate-500 text-[10px] pt-0.5 shrink-0">
                            {exp.startDate}
                            <span className="block text-[9px] font-semibold text-[#c2a06c] mt-0.5">{exp.endDate || t("حتى الآن")}</span>
                          </div>
                          
                          {/* Middle: Dot */}
                          <div className="w-4 flex justify-center pt-1.5 shrink-0 z-10">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#c2a06c] border-2 border-white shadow-sm" />
                          </div>
                          
                          {/* Right: Content */}
                          <div className="flex-1 min-w-0 text-right pr-2" dir={isEn ? "ltr" : "rtl"}>
                            <h4 className="font-extrabold text-[#084c41] text-[12px]">{exp.position}</h4>
                            <div className="text-[10px] text-slate-700 font-bold mt-0.5">
                              {exp.company} {exp.city ? `• ${exp.city}` : ""}
                            </div>
                            {exp.description && (
                              <p className="text-[9.5px] text-slate-500 mt-1 leading-relaxed whitespace-pre-line">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Education */}
              {pageEdus.length > 0 && (
                <section>
                  <h2 className="text-sm font-extrabold text-[#084c41] mb-1.5">
                    {t("التعليم والدراسة")}
                  </h2>
                  <div className="w-10 h-0.5 bg-[#c2a06c] mb-4" />
                  
                  <div className="relative">
                    {/* Continuous vertical timeline line */}
                    <div className="absolute left-[100px] top-2 bottom-2 w-[1px] bg-[#c2a06c]/30" />
                    
                    <div className="space-y-4">
                      {pageEdus.map((edu) => (
                        <div key={edu.id} className="flex flex-row gap-3 items-start relative text-[11px]" dir="ltr">
                          {/* Left: Date */}
                          <div className="w-[80px] text-right font-bold text-slate-500 text-[10px] pt-0.5 shrink-0">
                            {edu.startDate}
                            <span className="block text-[9px] font-semibold text-[#c2a06c] mt-0.5">{edu.endDate || t("حتى الآن")}</span>
                          </div>
                          
                          {/* Middle: Dot */}
                          <div className="w-4 flex justify-center pt-1.5 shrink-0 z-10">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#c2a06c] border-2 border-white shadow-sm" />
                          </div>
                          
                          {/* Right: Content */}
                          <div className="flex-1 min-w-0 text-right pr-2" dir={isEn ? "ltr" : "rtl"}>
                            <h4 className="font-extrabold text-[#084c41] text-[12px]">{edu.degree}</h4>
                            <div className="text-[10px] text-slate-700 font-bold mt-0.5">
                              {edu.institution} {edu.city ? `• ${edu.city}` : ""}
                            </div>
                            {edu.description && (
                              <p className="text-[9.5px] text-slate-500 mt-1 leading-relaxed">
                                {edu.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* Footer inside main column */}
            {showFooter && (
              <div className="border-t border-slate-100 pt-3 mt-auto text-center">
                <span className="text-[10px] font-extrabold text-[#084c41]">
                  {fullName}
                </span>
                <span className="mx-1.5 text-slate-300">|</span>
                <span className="text-[9px] text-slate-500">
                  {jobTitle || t("باحث عن عمل")}
                </span>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-[33%] bg-[#f4f6f5] p-5 flex flex-col justify-between border-x border-[#084c41]/5 overflow-hidden" dir={isEn ? "ltr" : "rtl"}>
            <div className="space-y-5">
              {/* Contact Info */}
              {pageNum === 1 && (
                <section>
                  <h3 className="text-[11px] font-bold text-[#084c41] uppercase tracking-wider mb-2 pb-1 border-b border-[#c2a06c]/30">
                    {t("الاتصال")}
                  </h3>
                  <ul className="text-[10px] text-slate-700 space-y-2">
                    {cv.phone && (
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#084c41] text-white flex items-center justify-center text-[9px]">📞</span>
                        <span dir="ltr">{formatJordanPhoneDisplay(cv.phone)}</span>
                      </li>
                    )}
                    {cv.email && (
                      <li className="flex items-center gap-2 break-all">
                        <span className="w-4 h-4 rounded-full bg-[#084c41] text-white flex items-center justify-center text-[8.5px]">✉</span>
                        <span>{cv.email}</span>
                      </li>
                    )}
                    {cv.city && (
                      <li className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#084c41] text-white flex items-center justify-center text-[9px]">📍</span>
                        <span>{cv.city}, {t("الأردن")}</span>
                      </li>
                    )}
                    {cv.website && (
                      <li className="flex items-center gap-2 break-all">
                        <span className="w-4 h-4 rounded-full bg-[#084c41] text-white flex items-center justify-center text-[9px]">🔗</span>
                        <span dir="ltr">{cv.website}</span>
                      </li>
                    )}
                  </ul>
                </section>
              )}

              {/* Skills */}
              {pageSkills.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-bold text-[#084c41] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#c2a06c]/30">
                    {t("المهارات")}
                  </h3>
                  <div className="space-y-2">
                    {pageSkills.map((s, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[9.5px] font-bold text-slate-800">
                          <span>{s.name}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[#084c41]" 
                            style={{ width: `${s.level * 20}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {pageCerts.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-bold text-[#084c41] uppercase tracking-wider mb-2 pb-1 border-b border-[#c2a06c]/30">
                    {t("الشهادات")}
                  </h3>
                  <div className="space-y-1.5">
                    {pageCerts.map((c) => (
                      <div key={c.id} className="text-[9px] p-1.5 bg-white rounded border border-[#084c41]/5">
                        <div className="font-bold text-slate-900 leading-tight">{c.name}</div>
                        <div className="text-slate-500 text-[8px] mt-0.5 leading-none">{c.issuer} {c.year ? `• ${c.year}` : ""}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* QR Code Verification */}
            {pageNum === 1 && qrCodeDataUrl && (
              <div className="pt-3 mt-auto border-t border-slate-200 text-center flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Verification" 
                  className="w-14 h-14 border border-emerald-100 p-0.5 rounded bg-white shadow-sm" 
                />
                <span className="text-[8.5px] text-[#084c41] font-bold block mt-1">
                  {t("سيرة موثقة")}
                </span>
                <span className="text-[8px] text-slate-400 block">
                  jojobs.jo/cv/verify
                </span>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-0 print:space-y-0">
      {renderPage(1, page1Exps, page1Edus, page1Skills, page1Certs, true, !isTwoPages)}
      {isTwoPages && renderPage(2, page2Exps, page2Edus, page2Skills, page2Certs, false, true)}
    </div>
  );
}
