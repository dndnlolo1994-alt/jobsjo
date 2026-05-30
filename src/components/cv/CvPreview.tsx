import QRCode from "qrcode";
import { formatJordanPhoneDisplay } from "@/lib/phone";
import { env } from "@/lib/env";
import { cleanEnglishText, parseCvEnglishVersion } from "@/lib/cv-english";

interface CvPreviewProps {
  cv: any;
  userSkills?: string[];
  lang?: string;
  /** Personal photo is a Plus-only feature; free CVs are generated without a photo. */
  isPlus?: boolean;
}

export async function CvPreview({ cv, userSkills = [], lang, isPlus = false }: CvPreviewProps) {
  const langMode = lang || cv.language || "ar";
  const isEn = langMode === "en";

  // Free CV = no personal photo. Plus CV = photo shown (if uploaded).
  const showPhoto = Boolean(isPlus && cv.photo);

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
      "المؤهلات": "Education",
      "الأردن": "Jordan",
      "حتى الآن": "Present",
      "باحث عن عمل": "Job Seeker",
      "رمز الاستجابة": "Verification QR",
      "اللغات": "Languages",
      "الأدوات والبرامج": "Tools",
      "إنجازات مختصرة": "Achievements",
      "مشاريع وأعمال": "Projects",
      "تطوع ونشاطات": "Volunteer Work",
      "اهتمامات مهنية": "Professional Interests",
      "المراجع": "References",
    };
    return trans[label] || label;
  };

  // Generate QR Code dynamically, pointing to the real public verification page.
  const siteBase = env.SITE_URL.replace(/\/$/, "");
  const verifyId = cv.userId || cv.id;
  const hasPublicQr = cv.qrEnabled !== false;
  const verifyUrl = `${siteBase}/cv/${verifyId}`;
  const verifyLabel = `${siteBase.replace(/^https?:\/\//, "")}/cv`;
  let qrCodeDataUrl = "";
  try {
    if (hasPublicQr) {
      qrCodeDataUrl = await QRCode.toDataURL(verifyUrl);
    }
  } catch (err) {
    console.error("Error generating QR code:", err);
  }

  const activeTemplate = cv.template || "modern-emerald";

  const parsedVersion = parseCvEnglishVersion(cv.englishVersion);
  const sourceExperiences = cv.experiences ?? [];
  const sourceEducations = cv.educations ?? [];
  const sourceSkills = cv.skills ?? [];
  const sourceCertifications = cv.certifications ?? [];

  let fullName = cv.fullName;
  let jobTitle = cv.jobTitle;
  let summary = cv.summary;
  let experiences = sourceExperiences;
  let educations = sourceEducations;
  let skills = sourceSkills;
  let certifications = sourceCertifications;
  let displayCity = cv.city;
  let displayCountry = t("الأردن");

  if (isEn) {
    const eng = parsedVersion || {};
    fullName = cleanEnglishText(eng.fullName, "English name missing");
    jobTitle = cleanEnglishText(eng.jobTitle, "Job title translation missing");
    summary = cleanEnglishText(eng.summary, "English professional summary is not ready yet.");
    displayCity = cleanEnglishText(eng.city, "");
    displayCountry = cleanEnglishText(eng.country, "Jordan");

    experiences = sourceExperiences.map((src: any, idx: number) => {
      const ex = eng.experiences?.[idx] || {};
      return {
        ...src,
        position: cleanEnglishText(ex.position, "Position translation missing"),
        company: cleanEnglishText(ex.company, "Company translation missing"),
        description: cleanEnglishText(ex.description, ""),
        city: cleanEnglishText(ex.city, ""),
        startDate: src.startDate,
        endDate: src.endDate,
      };
    });
    educations = sourceEducations.map((src: any, idx: number) => {
      const ed = eng.educations?.[idx] || {};
      return {
        ...src,
        degree: cleanEnglishText(ed.degree, "Degree translation missing"),
        institution: cleanEnglishText(ed.institution, "Institution translation missing"),
        description: cleanEnglishText(ed.description, ""),
        city: cleanEnglishText(ed.city, ""),
        startDate: src.startDate,
        endDate: src.endDate,
      };
    });
    skills = sourceSkills.map((src: any, idx: number) => {
      const skill = eng.skills?.[idx] || {};
      return {
        ...src,
        name: cleanEnglishText(skill.name, ""),
        level: skill.level || src.level,
      };
    }).filter((skill: any) => skill.name);
    certifications = sourceCertifications.map((src: any, idx: number) => {
      const cert = eng.certifications?.[idx] || {};
      return {
        ...src,
        name: cleanEnglishText(cert.name, "Certificate translation missing"),
        issuer: cleanEnglishText(cert.issuer, ""),
        year: cert.year || src.year,
      };
    });
  }

  const extras = isEn ? parsedVersion?.extras ?? {} : parsedVersion?.arExtras ?? parsedVersion?.extras ?? {};
  const clampText = (value: unknown, max = 650) => {
    const text = String(value || "").trim();
    return text.length > max ? `${text.slice(0, max).trim()}...` : text;
  };
  summary = clampText(summary, 760);
  experiences = (experiences ?? []).map((item: any) => ({ ...item, description: clampText(item.description, 430) }));
  educations = (educations ?? []).map((item: any) => ({ ...item, description: clampText(item.description, 220) }));
  const toLines = (value?: string | null) =>
    String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => (isEn ? cleanEnglishText(line) : line))
      .filter(Boolean)
      .slice(0, 8);
  const extraSections = [
    { title: t("اللغات"), lines: toLines(extras.languages) },
    { title: t("الأدوات والبرامج"), lines: toLines(extras.tools) },
    { title: t("إنجازات مختصرة"), lines: toLines(extras.achievements) },
    { title: t("مشاريع وأعمال"), lines: toLines(extras.projects) },
    { title: t("تطوع ونشاطات"), lines: toLines(extras.volunteer) },
    { title: t("اهتمامات مهنية"), lines: toLines(extras.interests) },
    { title: t("المراجع"), lines: toLines(extras.references) },
  ].filter((section) => section.lines.length > 0);

  const allSkills = Array.from(
    new Map(
      [...(skills ?? []).map((s: any) => s.name), ...(isEn ? [] : userSkills)]
        .map((skill) => String(skill || "").trim())
        .filter(Boolean)
        .map((skill) => [skill.toLowerCase(), skill])
    ).values()
  );
  const compactUrl = (value?: string | null) => {
    if (!value) return "";
    try {
      const parsed = new URL(value.startsWith("http") ? value : `https://${value}`);
      const cleanedPath = parsed.pathname.replace(/\/$/, "");
      const display = `${parsed.hostname.replace(/^www\./, "")}${cleanedPath}`;
      return display.length > 42 ? `${display.slice(0, 39)}...` : display;
    } catch {
      return value.length > 42 ? `${value.slice(0, 39)}...` : value;
    }
  };

  // Render Template: Minimalist
  if (activeTemplate === "minimalist") {
    return (
      <div className="cv-print cv-print-padded bg-white text-slate-900 mx-auto max-w-[794px] min-h-[1123px] p-8 md:p-12 shadow-card border border-slate-200" dir={isEn ? "ltr" : "rtl"}>
        <div className="cv-header flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
          <div className="flex gap-4 items-start">
            {showPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cv.photo} alt={fullName} className="w-20 h-20 rounded-lg object-cover border border-slate-300" />
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{fullName}</h1>
              <p className="text-lg text-slate-600 font-medium mt-1">{jobTitle || t("باحث عن عمل")}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                {cv.email && <span>{cv.email}</span>}
                {cv.phone && <span>{formatJordanPhoneDisplay(cv.phone)}</span>}
                {displayCity && <span>{displayCity}, {displayCountry}</span>}
                {cv.linkedin && <span dir="ltr">{compactUrl(cv.linkedin)}</span>}
                {cv.website && <span dir="ltr">{compactUrl(cv.website)}</span>}
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
            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">{t("النبذة المهنية")}</h2>
            <p className="text-xs text-slate-700 leading-6">{summary}</p>
          </section>
        )}

        {experiences?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-3">{t("الخبرات العملية")}</h2>
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
            <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-3">{t("التعليم والدراسة")}</h2>
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
              <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">{t("المهارات")}</h2>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map((s) => (
                  <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-semibold text-slate-700" key={s}>{s}</span>
                ))}
              </div>
            </section>
          )}

          {certifications?.length > 0 && (
            <section className="break-inside-avoid">
              <h2 className="text-sm font-bold uppercase text-slate-800 border-b border-slate-200 pb-1 mb-2">{t("الشهادات والدورات")}</h2>
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
          {isPlus && (cv.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cv.photo} alt={fullName} className="w-28 h-28 rounded-full object-cover border-2 border-navy-800 shadow" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-white border-2 border-navy-800 shadow" />
          ))}

          <div className="w-full space-y-4">
            <div>
              <h3 className="text-xs font-bold text-navy-950 uppercase border-b border-navy-300 pb-1 mb-2">{t("الاتصال")}</h3>
              <ul className="text-[11px] text-navy-700 space-y-2 break-all">
                {cv.phone && <li>📞 {formatJordanPhoneDisplay(cv.phone)}</li>}
                {cv.email && <li>✉ {cv.email}</li>}
                {displayCity && <li>📍 {displayCity}, {displayCountry}</li>}
                {cv.linkedin && <li className="font-semibold" dir="ltr">in {compactUrl(cv.linkedin)}</li>}
                {cv.website && <li className="font-semibold" dir="ltr">🔗 {compactUrl(cv.website)}</li>}
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
            {isPlus && (cv.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cv.photo} alt={fullName} className="w-24 h-24 rounded-full object-cover border-2 border-amber-500 shadow" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white border-2 border-amber-500 shadow" />
            ))}
            <div className="text-center sm:text-right">
              <h1 className="text-3xl font-extrabold text-amber-500">{fullName}</h1>
              <p className="text-lg text-slate-300 font-semibold mt-1">{jobTitle || t("باحث عن عمل")}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-400 mt-3">
                {cv.phone && <span>📞 {formatJordanPhoneDisplay(cv.phone)}</span>}
                {cv.email && <span>✉ {cv.email}</span>}
                {displayCity && <span>📍 {displayCity}</span>}
                {cv.linkedin && <span dir="ltr">in {compactUrl(cv.linkedin)}</span>}
                {cv.website && <span dir="ltr">🔗 {compactUrl(cv.website)}</span>}
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
              <h2 className="text-sm font-extrabold text-amber-700 uppercase mb-2 flex items-center gap-2">
                <span>✦</span> {t("الملخص التنفيذي")}
              </h2>
              <p className="text-xs text-slate-700 leading-6">{summary}</p>
            </section>
          )}

          <div className="grid md:grid-cols-[1fr_220px] gap-8">
            <div className="space-y-6">
              {experiences?.length > 0 && (
                <section>
                  <h2 className="text-sm font-extrabold text-amber-700 uppercase border-b-2 border-amber-200 pb-1 mb-3 flex items-center gap-2">
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
                  <h2 className="text-sm font-extrabold text-amber-700 uppercase border-b-2 border-amber-200 pb-1 mb-3 flex items-center gap-2">
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
                  <h2 className="text-sm font-extrabold text-amber-700 uppercase border-b-2 border-amber-200 pb-1 mb-2">{t("المهارات")}</h2>
                  <div className="flex flex-wrap gap-1">
                    {allSkills.map((s) => (
                      <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700" key={s}>{s}</span>
                    ))}
                  </div>
                </section>
              )}

              {certifications?.length > 0 && (
                <section className="break-inside-avoid">
                  <h2 className="text-sm font-extrabold text-amber-700 uppercase border-b-2 border-amber-200 pb-1 mb-2">{t("الشهادات")}</h2>
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
  const skillItems = [
    ...(skills ?? []).map((s: any) => ({ name: String(s.name || s).trim(), level: s.level || 4 })),
    ...(isEn ? [] : userSkills).map((s: any) => ({ name: String(s).trim(), level: 4 }))
  ].filter(s => s.name);
  const skillsWithLevels = Array.from(
    new Map(skillItems.map((s) => [s.name.toLowerCase(), s])).values()
  );

  const cvTextLength = [
    summary,
    ...experiences.map((item: any) => item.description),
    ...educations.map((item: any) => item.description),
    ...certifications.map((item: any) => `${item.name ?? ""} ${item.issuer ?? ""}`),
    ...skillsWithLevels.map((item: any) => item.name),
    ...extraSections.flatMap((section) => [section.title, ...section.lines]),
  ].filter(Boolean).join(" ").length;
  const isTwoPages =
    experiences.length > 5 ||
    educations.length > 3 ||
    certifications.length > 6 ||
    skillsWithLevels.length > 16 ||
    extraSections.length > 7 ||
    cvTextLength > 2800;

  let page1Exps = experiences;
  let page2Exps: any[] = [];
  let page1Edus = educations;
  let page2Edus: any[] = [];
  let page1Skills = skillsWithLevels;
  let page2Skills: any[] = [];
  let page1Certs = certifications;
  let page2Certs: any[] = [];
  let page1Extras = extraSections;
  let page2Extras: typeof extraSections = [];

  if (isTwoPages) {
    page1Exps = experiences.slice(0, 3);
    page2Exps = experiences.slice(3);
    
    page1Edus = educations.slice(0, 1);
    page2Edus = educations.slice(1);
    
    page1Skills = skillsWithLevels.slice(0, 6);
    page2Skills = skillsWithLevels.slice(6);
    
    page1Certs = certifications.slice(0, 2);
    page2Certs = certifications.slice(2);

    page1Extras = extraSections.slice(0, 3);
    page2Extras = extraSections.slice(3);
  }

  const renderPage = (
    pageNum: number,
    pageExps: any[],
    pageEdus: any[],
    pageSkills: any[],
    pageCerts: any[],
    pageExtras: typeof extraSections,
    showSummary: boolean,
    showFooter: boolean
  ) => {
    const pageLabel = isEn ? `Page ${pageNum}` : `الصفحة ${pageNum}`;
    const dash = "–";

    // عنوان قسم هادئ: شرطة ذهبية ناعمة + عنوان حِبري + خيط رفيع
    const SectionTitle = ({ title }: { title: string }) => (
      <div className="mb-2 flex items-center gap-2.5">
        <span className="h-[2px] w-5 shrink-0 rounded-full bg-[#c0a368]" />
        <h2 className="shrink-0 text-[12.5px] font-extrabold text-slate-800">{title}</h2>
        <span className="h-px flex-1 bg-[#edece6]" />
      </div>
    );

    return (
      <div
        className="cv-print relative mx-auto mb-8 flex h-[1123px] w-[794px] max-w-none flex-col overflow-hidden border border-[#eeede7] bg-[#fdfcfa] text-slate-700 shadow-card"
        dir={isEn ? "ltr" : "rtl"}
        key={pageNum}
      >
        <div className="flex flex-1 flex-col p-6">
          {/* ترويسة فاتحة هادئة — div وليس header كي تُطبع دائماً. المجاني بدون صورة (سادة) */}
          <div className="cv-header mb-3 flex items-start justify-between gap-5 border-b border-[#edece6] pb-3">
            <div className="min-w-0">
              <div className="mb-2 text-[8px] font-bold uppercase tracking-[0.3em] text-[#b3a380]" dir="ltr">Curriculum Vitae</div>
              <h1 className="break-words text-[32px] font-extrabold leading-[1.05] text-slate-800">{fullName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                <span className="h-[2px] w-7 rounded-full bg-[#c0a368]" />
                <p className="text-[14px] font-bold text-[#a07f4e]">{jobTitle || t("باحث عن عمل")}</p>
                {pageNum > 1 && <span className="text-[9.5px] font-bold text-slate-400">· {pageLabel}</span>}
              </div>
            </div>
            {pageNum === 1 && showPhoto && (
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cv.photo} alt={fullName} className="h-[82px] w-[82px] rounded-2xl object-cover ring-1 ring-[#e7e3d8]" />
              </div>
            )}
          </div>

          <div className="grid flex-1 grid-cols-[1fr_210px] gap-5">
            <main className="min-w-0">
              <div className="space-y-3">
                {showSummary && summary && (
                  <section className="break-inside-avoid">
                    <SectionTitle title={t("الملخص التنفيذي")} />
                    <p className="text-[11.2px] font-medium leading-[1.55] text-slate-600">{summary}</p>
                  </section>
                )}

                {pageExps.length > 0 && (
                  <section>
                    <SectionTitle title={t("الخبرات العملية")} />
                    <div className="space-y-2">
                      {pageExps.map((exp, idx) => (
                        <div key={exp.id || `${exp.position}-${idx}`} className="break-inside-avoid border-b border-[#f1f0ea] pb-2 last:border-b-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="text-[13px] font-extrabold leading-snug text-slate-800">{exp.position}</h3>
                              <p className="mt-0.5 text-[11px] font-bold text-slate-500">
                                {exp.company}{exp.city ? ` / ${exp.city}` : ""}
                              </p>
                            </div>
                            <span className="shrink-0 text-[9px] font-bold text-[#a98c5c]" dir="ltr">
                              {exp.startDate} {dash} {exp.endDate || t("حتى الآن")}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="mt-1 whitespace-pre-line text-[10.1px] font-medium leading-[1.45] text-slate-500">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {pageEdus.length > 0 && (
                  <section>
                    <SectionTitle title={t("التعليم والمؤهلات")} />
                    <div className="space-y-2">
                      {pageEdus.map((edu, idx) => (
                        <div key={edu.id || `${edu.degree}-${idx}`} className="break-inside-avoid">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-[12px] font-extrabold text-slate-800">{edu.degree}</h3>
                              <p className="mt-0.5 text-[10.5px] font-bold text-slate-500">
                                {edu.institution}{edu.city ? ` / ${edu.city}` : ""}
                              </p>
                            </div>
                            <span className="shrink-0 text-[9px] font-bold text-[#a98c5c]" dir="ltr">
                              {edu.startDate} {dash} {edu.endDate || t("حتى الآن")}
                            </span>
                          </div>
                          {edu.description && <p className="mt-1 text-[9.8px] font-medium leading-[1.45] text-slate-500">{edu.description}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {pageCerts.length > 0 && pageNum > 1 && (
                  <section>
                    <SectionTitle title={t("الشهادات")} />
                    <div className="grid grid-cols-2 gap-2">
                      {pageCerts.map((cert, idx) => (
                        <div key={cert.id || `${cert.name}-${idx}`} className="rounded-lg border border-[#eeede7] bg-white p-2.5">
                          <p className="text-[10px] font-extrabold leading-snug text-slate-800">{cert.name}</p>
                          <p className="mt-1 text-[8.5px] font-bold text-slate-400">{cert.issuer} {cert.year ? `/ ${cert.year}` : ""}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </main>

            <aside className="flex flex-col border-s border-[#edece6] ps-4">
              <div className="flex-1 space-y-2.5">
                {pageNum === 1 && (
                  <section className="break-inside-avoid">
                    <h2 className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-800">
                      <span className="h-[2px] w-4 rounded-full bg-[#c0a368]" /> {t("الاتصال")}
                    </h2>
                    <dl className="space-y-1.5 text-[9.2px] leading-snug">
                      {cv.phone && (
                        <div>
                          <dt className="font-bold text-[#a98c5c]">{isEn ? "Phone" : "الهاتف"}</dt>
                          <dd className="break-all font-semibold text-slate-600" dir="ltr">{formatJordanPhoneDisplay(cv.phone)}</dd>
                        </div>
                      )}
                      {cv.email && (
                        <div>
                          <dt className="font-bold text-[#a98c5c]">{isEn ? "Email" : "البريد"}</dt>
                          <dd className="break-all font-semibold text-slate-600" dir="ltr">{cv.email}</dd>
                        </div>
                      )}
                      {displayCity && (
                        <div>
                          <dt className="font-bold text-[#a98c5c]">{isEn ? "Location" : "الموقع"}</dt>
                          <dd className="font-semibold text-slate-600">{displayCity}, {displayCountry}</dd>
                        </div>
                      )}
                      {cv.website && (
                        <div>
                          <dt className="font-bold text-[#a98c5c]">{isEn ? "Portfolio" : "الأعمال"}</dt>
                          <dd className="break-all font-semibold text-slate-600" dir="ltr">{compactUrl(cv.website)}</dd>
                        </div>
                      )}
                      {cv.linkedin && (
                        <div>
                          <dt className="font-bold text-[#a98c5c]">LinkedIn</dt>
                          <dd className="break-all font-semibold text-slate-600" dir="ltr">{compactUrl(cv.linkedin)}</dd>
                        </div>
                      )}
                    </dl>
                  </section>
                )}

                {pageSkills.length > 0 && (
                  <section className="break-inside-avoid">
                    <h2 className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-800">
                      <span className="h-[2px] w-4 rounded-full bg-[#c0a368]" /> {t("المهارات")}
                    </h2>
                    <div className="space-y-1.5">
                      {pageSkills.map((skill, idx) => {
                        const lvl = Math.min(5, Math.max(1, Number(skill.level || 4)));
                        return (
                          <div key={`${skill.name}-${idx}`} className="flex items-center justify-between gap-2">
                            <span className="text-[9.5px] font-semibold leading-snug text-slate-600">{skill.name}</span>
                            <span className="flex shrink-0 items-center gap-[3px]" dir="ltr">
                              {[1, 2, 3, 4, 5].map((d) => (
                                <span key={d} className={`h-[5px] w-[5px] rounded-full ${d <= lvl ? "bg-[#c0a368]" : "bg-[#e8e5dc]"}`} />
                              ))}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {pageCerts.length > 0 && pageNum === 1 && (
                  <section className="break-inside-avoid">
                    <h2 className="mb-2 flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-800">
                      <span className="h-[2px] w-4 rounded-full bg-[#c0a368]" /> {t("الشهادات")}
                    </h2>
                    <div className="space-y-1">
                      {pageCerts.map((cert, idx) => (
                        <div key={cert.id || `${cert.name}-${idx}`} className="rounded-md border border-[#efeee8] bg-white p-1.5">
                          <p className="text-[9.2px] font-extrabold leading-snug text-slate-800">{cert.name}</p>
                          <p className="mt-0.5 text-[8.5px] font-bold text-slate-400">{cert.issuer} {cert.year ? `/ ${cert.year}` : ""}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {pageExtras.map((section) => (
                  <section key={section.title} className="break-inside-avoid">
                    <h2 className="mb-2 flex items-center gap-1.5 text-[10.5px] font-extrabold text-slate-800">
                      <span className="h-[2px] w-4 rounded-full bg-[#c0a368]" /> {section.title}
                    </h2>
                    <ul className="space-y-1">
                      {section.lines.slice(0, 5).map((line, idx) => (
                        <li key={idx} className="flex gap-1.5 text-[9px] font-medium leading-[1.35] text-slate-500">
                          <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-[#c0a368]" /> <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>

              <div className="mt-auto space-y-1.5 border-t border-[#edece6] pt-2.5">
                {pageNum === 1 && qrCodeDataUrl && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#e7e1d2] bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCodeDataUrl} alt="QR Verification" className="h-12 w-12 rounded-md border border-[#e7e1d2] bg-white p-0.5" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 text-[8.5px] font-extrabold text-[#9b7b45]"><span>✓</span> {t("سيرة موثقة")}</p>
                      <p className="truncate text-[7.5px] font-bold text-slate-400" dir="ltr">{verifyLabel}</p>
                    </div>
                  </div>
                )}
                <div className="text-[9px] font-bold text-slate-400">{pageLabel}</div>
              </div>
            </aside>
          </div>

          {showFooter && (
            <div className="mt-4 flex items-center justify-between border-t border-[#edece6] pt-2.5 text-[9px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#c0a368]" /> {fullName}</span>
              <span>{jobTitle || t("باحث عن عمل")}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-0 print:space-y-0">
      {renderPage(1, page1Exps, page1Edus, page1Skills, page1Certs, page1Extras, true, !isTwoPages)}
      {isTwoPages && renderPage(2, page2Exps, page2Edus, page2Skills, page2Certs, page2Extras, false, true)}
    </div>
  );
}
