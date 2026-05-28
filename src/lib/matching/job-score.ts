// خوارزمية حساب درجة التطابق بين باحث ووظيفة
// نتيجة من 0 إلى 100. تستخدم في عرض "نسبة المطابقة" للوظائف
// وفلترة المرشحين لأصحاب العمل.

import { fromCsv } from "../utils";

export type JobLike = {
  city: string;
  area?: string | null;
  jobType: string;
  skills?: string | null;
  experienceLevel?: string | null;
  educationLevel?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  requiresDrivingLicense?: boolean | null;
  requiresOwnCar?: boolean | null;
  jobCategory?: string | null;
};

export type SeekerLike = {
  city?: string | null;
  area?: string | null;
  preferredJobTypes?: string | null; // CSV
  preferredCities?: string | null;   // CSV
  skills?: string | null;            // CSV
  educationLevel?: string | null;
  experienceLevel?: string | null;
  expectedSalaryMin?: number | null;
  expectedSalaryMax?: number | null;
  availableImmediately?: boolean | null;
  hasDrivingLicense?: boolean | null;
  ownsCar?: boolean | null;
  hasCv?: boolean;
  preferredCategory?: string | null;
};

export type MatchBreakdown = {
  score: number;
  reasons: { positive: boolean; key: string; weight: number }[];
};

const EXP_RANK: Record<string, number> = {
  NO_EXPERIENCE: 0,
  ENTRY: 1,
  JUNIOR: 2,
  MID: 3,
  SENIOR: 4,
  MANAGER: 5,
};

const EDU_RANK: Record<string, number> = {
  NONE: 0,
  SCHOOL: 1,
  HIGH_SCHOOL: 2,
  DIPLOMA: 3,
  BACHELOR: 4,
  MASTER: 5,
  PHD: 6,
};

function lower(s: string | null | undefined) {
  return (s ?? "").toString().trim().toLowerCase();
}

export function computeMatch(job: JobLike, seeker: SeekerLike): MatchBreakdown {
  const reasons: MatchBreakdown["reasons"] = [];
  let score = 0;

  // 1) نفس المدينة +20
  const seekerCities = [
    lower(seeker.city),
    ...fromCsv(seeker.preferredCities).map(lower),
  ].filter(Boolean);

  if (seekerCities.includes(lower(job.city))) {
    score += 20;
    reasons.push({ positive: true, key: "نفس المدينة", weight: 20 });
  }

  // 2) نفس المنطقة +10
  if (job.area && seeker.area && lower(job.area) === lower(seeker.area)) {
    score += 10;
    reasons.push({ positive: true, key: "نفس المنطقة", weight: 10 });
  }

  // 3) نوع الدوام يطابق المفضّل +15
  const preferredTypes = fromCsv(seeker.preferredJobTypes);
  if (preferredTypes.length === 0 || preferredTypes.includes(job.jobType)) {
    score += 15;
    reasons.push({ positive: true, key: "نوع الدوام مناسب", weight: 15 });
  }

  if (job.jobCategory && seeker.preferredCategory && lower(job.jobCategory) === lower(seeker.preferredCategory)) {
    score += 10;
    reasons.push({ positive: true, key: "التصنيف يناسب اهتمامك", weight: 10 });
  }

  // 4) المهارات (حتى +25)
  const jobSkills = fromCsv(job.skills).map(lower);
  const seekerSkills = fromCsv(seeker.skills).map(lower);
  if (jobSkills.length && seekerSkills.length) {
    const matched = jobSkills.filter((s) => seekerSkills.includes(s)).length;
    const ratio = matched / jobSkills.length;
    const sk = Math.min(25, Math.round(ratio * 25));
    if (sk > 0) {
      score += sk;
      reasons.push({ positive: true, key: "مهاراتك مناسبة", weight: sk });
    }
  } else if (!jobSkills.length) {
    score += 10;
  }

  // 5) مستوى الخبرة يطابق +15
  if (job.experienceLevel && seeker.experienceLevel) {
    const jr = EXP_RANK[job.experienceLevel] ?? 0;
    const sr = EXP_RANK[seeker.experienceLevel] ?? 0;
    const diff = Math.abs(jr - sr);
    if (diff === 0) {
      score += 15;
      reasons.push({ positive: true, key: "مستوى الخبرة مطابق", weight: 15 });
    } else if (diff === 1) {
      score += 8;
      reasons.push({ positive: true, key: "خبرتك قريبة من المطلوب", weight: 8 });
    }
  }

  // 6) الراتب يتقاطع مع التوقعات +10
  const jMin = job.salaryMin ?? null;
  const jMax = job.salaryMax ?? null;
  const sMin = seeker.expectedSalaryMin ?? null;
  const sMax = seeker.expectedSalaryMax ?? null;
  if ((jMin || jMax) && (sMin || sMax)) {
    const aLo = jMin ?? 0;
    const aHi = jMax ?? Number.POSITIVE_INFINITY;
    const bLo = sMin ?? 0;
    const bHi = sMax ?? Number.POSITIVE_INFINITY;
    const overlap = aLo <= bHi && bLo <= aHi;
    if (overlap) {
      score += 10;
      reasons.push({ positive: true, key: "الراتب قريب من توقعك", weight: 10 });
    }
  }

  // 7) جاهز فوراً +5
  if (seeker.availableImmediately) {
    score += 5;
    reasons.push({ positive: true, key: "جاهز للالتحاق فوراً", weight: 5 });
  }

  // 8) رخصة قيادة عند الطلب +10
  if (job.requiresDrivingLicense) {
    if (seeker.hasDrivingLicense) {
      score += 10;
      reasons.push({ positive: true, key: "تملك رخصة قيادة كما هو مطلوب", weight: 10 });
    } else {
      reasons.push({ positive: false, key: "الوظيفة تتطلب رخصة قيادة", weight: 0 });
    }
  }

  if (job.requiresOwnCar) {
    if (seeker.ownsCar) {
      score += 10;
      reasons.push({ positive: true, key: "تملك سيارة كما هو مطلوب", weight: 10 });
    } else {
      reasons.push({ positive: false, key: "الوظيفة تتطلب امتلاك سيارة", weight: 0 });
    }
  }

  // 9) المستوى التعليمي +10
  if (job.educationLevel && seeker.educationLevel) {
    const jr = EDU_RANK[job.educationLevel] ?? 0;
    const sr = EDU_RANK[seeker.educationLevel] ?? 0;
    if (sr >= jr && jr > 0) {
      score += 10;
      reasons.push({ positive: true, key: "مستواك التعليمي مناسب", weight: 10 });
    }
  }

  // 10) عقوبة CV غير مكتمل −10
  if (seeker.hasCv === false) {
    score -= 10;
    reasons.push({ positive: false, key: "أكمل سيرتك الذاتية لزيادة فرصك", weight: -10 });
  }

  const profileSignals = [
    seeker.city,
    seeker.skills,
    seeker.experienceLevel,
    seeker.educationLevel,
    seeker.preferredJobTypes,
  ].filter(Boolean).length;
  if (profileSignals < 3) {
    score -= 10;
    reasons.push({ positive: false, key: "تحتاج لإكمال بيانات ملفك", weight: -10 });
  }

  score = Math.max(0, Math.min(100, score));

  return { score, reasons };
}
