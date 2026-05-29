import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CSV = /,/g;
export function toCsv(arr: string[] | null | undefined): string {
  if (!arr || !arr.length) return "";
  return arr.map((s) => s.replace(CSV, " ")).join(",");
}
export function fromCsv(s: string | null | undefined): string[] {
  if (!s) return [];
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s‏‎]+/g, "-")
    .replace(/[^a-z0-9؀-ۿ-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function uniqueSlug(base: string): string {
  const s = slugify(base);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${s || "item"}-${suffix}`;
}

export function formatJod(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat("ar-JO", {
      style: "currency",
      currency: "JOD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(n);
  } catch (e) {
    console.error("formatJod error:", e);
    return `${n} د.أ`;
  }
}

export function formatRelativeArabic(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "قبل لحظات";
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `قبل ${Math.floor(diff / 86400)} يوم`;
  if (diff < 2592000) return `قبل ${Math.floor(diff / 604800)} أسبوع`;
  if (diff < 31536000) return `قبل ${Math.floor(diff / 2592000)} شهر`;
  return `قبل ${Math.floor(diff / 31536000)} سنة`;
}

export function formatDateArabic(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("ar-JO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch (e) {
    console.error("formatDateArabic error:", e);
    try {
      return d.toLocaleDateString("ar") || d.toISOString().split("T")[0];
    } catch (_) {
      return d.toISOString().split("T")[0];
    }
  }
}

export const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  SHIFT: "ورديات",
  TEMPORARY: "مؤقت",
  INTERNSHIP: "تدريب",
  REMOTE: "عن بُعد",
  HYBRID: "هجين",
};

export const JOB_STATUS_LABEL: Record<string, string> = {
  DRAFT: "مسودة",
  PENDING_REVIEW: "بانتظار المراجعة",
  PUBLISHED: "منشورة",
  EXPIRED: "منتهية",
  REJECTED: "مرفوضة",
};

export const APP_STATUS_LABEL: Record<string, string> = {
  SUBMITTED: "مُقدّم",
  VIEWED: "تمت المشاهدة",
  SHORTLISTED: "قائمة قصيرة",
  INTERVIEW: "مقابلة",
  REJECTED: "مرفوض",
  HIRED: "تم التوظيف",
  WITHDRAWN: "تم السحب",
};

export const EXPERIENCE_LEVEL_LABEL: Record<string, string> = {
  NO_EXPERIENCE: "بدون خبرة",
  ENTRY: "مبتدئ",
  JUNIOR: "خبرة قليلة",
  MID: "متوسط",
  SENIOR: "خبير",
  MANAGER: "إداري/قائد",
};

export const EDUCATION_LEVEL_LABEL: Record<string, string> = {
  NONE: "غير محدد",
  SCHOOL: "مدرسة",
  HIGH_SCHOOL: "ثانوية عامة",
  DIPLOMA: "دبلوم",
  BACHELOR: "بكالوريوس",
  MASTER: "ماجستير",
  PHD: "دكتوراه",
};

export const BILLING_STATUS_LABEL: Record<string, string> = {
  UNPAID: "غير مدفوع",
  PAID: "مدفوع",
  EXPIRED: "منتهي",
  CANCELLED: "ملغي",
  WAIVED: "مُعفى",
};

export const BILLING_TYPE_LABEL: Record<string, string> = {
  CV_PDF: "تنزيل CV PDF",
  JOB_SEEKER_PLUS: "اشتراك Plus للباحث",
  JOB_POST_STANDARD: "نشر وظيفة عادية",
  JOB_POST_FEATURED: "نشر وظيفة مميزة",
  JOB_POST_URGENT: "نشر وظيفة عاجلة/مثبتة",
  EMPLOYER_BASIC: "اشتراك Basic للشركات",
  EMPLOYER_PRO: "اشتراك Pro للشركات",
  EMPLOYER_BUSINESS: "اشتراك Business للشركات",
  SHORTLISTING_SERVICE: "خدمة فلترة المرشحين",
};

export const SOURCE_TYPE_LABEL: Record<string, string> = {
  EMPLOYER_DIRECT: "صاحب عمل مباشر",
  ADMIN_MANUAL: "إدخال يدوي من الإدارة",
  COMPANY_CAREERS_PAGE: "صفحة وظائف شركة",
  PUBLIC_GOVERNMENT_SOURCE: "مصدر حكومي عام",
  PUBLIC_NGO_SOURCE: "مصدر منظمة عام",
  PUBLIC_TRAINING_PROGRAM: "برنامج تدريب عام",
  PUBLIC_SOCIAL_POST_MANUAL: "منشور عام مدخل يدويًا",
  REFERRAL: "إحالة",
  OTHER: "أخرى",
};

export const SOURCE_TRUST_LABEL: Record<string, string> = {
  HIGH: "عالية",
  MEDIUM: "متوسطة",
  LOW: "منخفضة",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  CASH: "نقد",
  CLIQ: "CliQ",
  BANK_TRANSFER: "حوالة بنكية",
  WALLET: "محفظة إلكترونية",
  OTHER: "أخرى",
};

export const JORDAN_CITIES = [
  "إربد",
  "الرمثا",
  "الحصن",
  "عجلون",
  "جرش",
  "المفرق",
  "عمّان",
  "الزرقاء",
  "السلط",
  "مادبا",
  "الكرك",
  "الطفيلة",
  "معان",
  "العقبة",
];

export const JOB_CATEGORIES = [
  "مطاعم وضيافة",
  "مبيعات",
  "كاشير",
  "توصيل وسائقين",
  "مصانع وإنتاج",
  "مستودعات",
  "محاسبة",
  "خدمة عملاء",
  "تقنية المعلومات",
  "تعليم وتدريب",
  "صيدليات وعيادات",
  "تصميم وتسويق",
  "أعمال منزلية",
];
