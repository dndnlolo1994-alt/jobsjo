// قوالب الواتساب — جميعها بالعربية وبأسلوب أردني محلي ومحترم.
// تنتج رابط wa.me جاهز للنقر.

import { normalizeJordanPhone } from "./phone";

function buildLink(phone: string | null | undefined, message: string): string {
  const norm = normalizeJordanPhone(phone ?? "") ?? "";
  const encoded = encodeURIComponent(message.trim());
  if (!norm) return `https://wa.me/?text=${encoded}`;
  return `https://wa.me/${norm}?text=${encoded}`;
}

export type ApplyToJobInput = {
  phone: string;
  seekerName: string;
  jobTitle: string;
  city?: string;
};
export function tplApplyToJob(i: ApplyToJobInput) {
  const msg =
`السلام عليكم،
معكم ${i.seekerName} من خلال منصة جوبز الأردن.
أرغب بالتقديم على وظيفة: ${i.jobTitle}${i.city ? ` في ${i.city}` : ""}.
هل بالإمكان إرسال تفاصيل أكثر أو موعد للمقابلة؟
شكراً لكم.`;
  return buildLink(i.phone, msg);
}

export type EmployerContactsApplicantInput = {
  phone: string;
  applicantName: string;
  companyName: string;
  jobTitle: string;
};
export function tplEmployerContactsApplicant(i: EmployerContactsApplicantInput) {
  const msg =
`السلام عليكم ${i.applicantName}،
تواصلكم شركة ${i.companyName} بخصوص طلبكم على وظيفة: ${i.jobTitle}.
نرغب بالتعرّف عليكم أكثر، فهل يناسبكم إجراء مقابلة قصيرة؟
شكراً لكم.`;
  return buildLink(i.phone, msg);
}

export type AdminClaimRequestInput = {
  phone: string;
  companyName: string;
};
export function tplAdminClaimRequest(i: AdminClaimRequestInput) {
  const msg =
`مرحباً،
معكم فريق إدارة منصة جوبز الأردن.
لاحظنا أنّ شركتكم "${i.companyName}" مدرجة عندنا من مصادر عامة.
يسعدنا تسليمكم إدارة صفحة الشركة وإعلاناتها بشكل رسمي ومجاني.
أرسلوا لنا اسم الشخص المسؤول وصفته للتأكيد.`;
  return buildLink(i.phone, msg);
}

export type CVPaymentInfoInput = { phone: string; amount: number };
export function tplCvPaymentInfo(i: CVPaymentInfoInput) {
  const msg =
`السلام عليكم،
أرغب بدفع رسوم تنزيل السيرة الذاتية (${i.amount} دينار).
الرجاء إرشادي إلى طريقة الدفع المناسبة (نقد / CliQ / حوالة).`;
  return buildLink(i.phone, msg);
}

export type JobPostPaymentInput = { phone: string; amount: number; jobTitle: string };
export function tplJobPostPayment(i: JobPostPaymentInput) {
  const msg =
`السلام عليكم،
أرغب بنشر/ترقية إعلان وظيفة: ${i.jobTitle}.
المبلغ المطلوب: ${i.amount} دينار.
ما طريقة الدفع المناسبة؟`;
  return buildLink(i.phone, msg);
}

export type InterviewInvitationInput = {
  phone: string;
  applicantName: string;
  companyName: string;
  jobTitle: string;
  whenText: string; // مثل "غداً الساعة 11 صباحاً"
  where?: string;
};
export function tplInterviewInvitation(i: InterviewInvitationInput) {
  const msg =
`مرحباً ${i.applicantName}،
نشكركم على تقديمكم لوظيفة ${i.jobTitle} في ${i.companyName}.
يسعدنا دعوتكم لمقابلة ${i.whenText}${i.where ? `، المكان: ${i.where}` : ""}.
الرجاء تأكيد الحضور.`;
  return buildLink(i.phone, msg);
}

export type RejectionInput = {
  phone: string;
  applicantName: string;
  companyName: string;
  jobTitle: string;
};
export function tplRejection(i: RejectionInput) {
  const msg =
`مرحباً ${i.applicantName}،
شكراً لاهتمامكم بوظيفة ${i.jobTitle} في ${i.companyName}.
نقدّر تقديمكم، وبعد المراجعة لم يتم اختياركم لهذه الفرصة.
نتمنى لكم التوفيق ونحتفظ ببياناتكم لأي فرصة مستقبلية مناسبة.`;
  return buildLink(i.phone, msg);
}

export type ShortlistInput = {
  phone: string;
  applicantName: string;
  companyName: string;
  jobTitle: string;
};
export function tplShortlist(i: ShortlistInput) {
  const msg =
`مرحباً ${i.applicantName}،
يسعدنا إعلامكم بأنّكم ضمن القائمة القصيرة لوظيفة ${i.jobTitle} في ${i.companyName}.
سنتواصل معكم قريباً لتحديد المقابلة، وفي حال لديكم استفسار يمكنكم الرد على هذه الرسالة.`;
  return buildLink(i.phone, msg);
}
