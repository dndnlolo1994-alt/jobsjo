const ARABIC_RE = /[\u0600-\u06FF]/;

export type CvEnglishVersion = {
  fullName?: string;
  jobTitle?: string;
  city?: string;
  country?: string;
  summary?: string;
  experiences?: Array<Record<string, any>>;
  educations?: Array<Record<string, any>>;
  skills?: Array<Record<string, any>>;
  certifications?: Array<Record<string, any>>;
  extras?: Record<string, string>;
  arExtras?: Record<string, string>;
};

export function hasArabicText(value: unknown) {
  return ARABIC_RE.test(String(value || ""));
}

export function cleanEnglishText(value: unknown, fallback = "") {
  const text = String(value || "").trim();
  if (!text || hasArabicText(text)) return fallback;
  return text;
}

export function parseCvEnglishVersion(value?: string | null): CvEnglishVersion | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function englishTextReady(value: unknown) {
  return cleanEnglishText(value).length > 0;
}

export function getCvEnglishMissing(version: CvEnglishVersion | null | undefined, source?: any) {
  const missing: string[] = [];
  const eng = version || {};

  if (!englishTextReady(eng.fullName)) missing.push("Full name");
  if (!englishTextReady(eng.jobTitle)) missing.push("Job title");
  if (!englishTextReady(eng.summary)) missing.push("Professional summary");

  const sourceExperiences = source?.experiences ?? [];
  sourceExperiences.forEach((_: unknown, idx: number) => {
    const item = eng.experiences?.[idx] || {};
    if (!englishTextReady(item.position)) missing.push(`Experience ${idx + 1} position`);
    if (!englishTextReady(item.company)) missing.push(`Experience ${idx + 1} company`);
    if (!englishTextReady(item.description)) missing.push(`Experience ${idx + 1} description`);
  });

  const sourceEducations = source?.educations ?? [];
  sourceEducations.forEach((_: unknown, idx: number) => {
    const item = eng.educations?.[idx] || {};
    if (!englishTextReady(item.degree)) missing.push(`Education ${idx + 1} degree`);
    if (!englishTextReady(item.institution)) missing.push(`Education ${idx + 1} institution`);
  });

  const sourceSkills = source?.skills ?? [];
  sourceSkills.forEach((_: unknown, idx: number) => {
    const item = eng.skills?.[idx] || {};
    if (!englishTextReady(item.name)) missing.push(`Skill ${idx + 1}`);
  });

  return missing;
}

export function isCvEnglishReady(version: CvEnglishVersion | null | undefined, source?: any) {
  return getCvEnglishMissing(version, source).length === 0;
}
