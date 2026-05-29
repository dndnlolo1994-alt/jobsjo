// مركزية للوصول لمتغيرات البيئة بأمان

/** Strip BOM and whitespace from env values */
function clean(value: string): string {
  return value.replace(/^\uFEFF/, "").trim();
}

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required env: ${name}`);
    }
    return "";
  }
  return clean(v);
}

export const env = {
  DATABASE_URL: required("DATABASE_URL", "postgresql://localhost:5432/jojobs"),
  SITE_URL: clean(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  SITE_NAME:
    process.env.NEXT_PUBLIC_SITE_NAME ??
    process.env.NEXT_PUBLIC_APP_NAME_AR ??
    "جوبز الأردن",
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "JoJobs",
  SESSION_PASSWORD: required(
    "SESSION_PASSWORD",
    process.env.SESSION_SECRET ??
    "dev-only-please-change-this-secret-32chars"
  ),
  SESSION_SECRET: process.env.SESSION_SECRET ?? process.env.SESSION_PASSWORD ?? "dev-only-please-change-this-secret-32chars",
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  DEV_MODE: process.env.DEV_MODE === "true",
  ALLOW_FREE_CV_PDF: process.env.ALLOW_FREE_CV_PDF === "true",
  REQUIRE_CV_PAYMENT: (process.env.REQUIRE_CV_PAYMENT ?? "true") === "true",
  ENABLE_EXTERNAL_JOB_SOURCES: process.env.ENABLE_EXTERNAL_JOB_SOURCES === "true",
  DEFAULT_CITY: process.env.DEFAULT_CITY ?? "إربد",
  SUPPORT_WHATSAPP: process.env.SUPPORT_WHATSAPP ?? "962790000000",
  PLATFORM_WHATSAPP: process.env.PLATFORM_WHATSAPP ?? process.env.SUPPORT_WHATSAPP ?? "962790000000",
  SUPPORT_EMAIL:
    process.env.SUPPORT_EMAIL ??
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ??
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
    "support@example.com",
  CONTACT_EMAIL:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
    process.env.SUPPORT_EMAIL ??
    "info@example.com",
  COMPANY_EMAIL:
    process.env.COMPANY_EMAIL ??
    process.env.NEXT_PUBLIC_COMPANY_EMAIL ??
    process.env.SUPPORT_EMAIL ??
    "info@example.com",
  /** عنوان استقبال رسائل نموذج التواصل والإبلاغ */
  CONTACT_TO_EMAIL:
    process.env.CONTACT_TO_EMAIL ??
    process.env.SUPPORT_EMAIL ??
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ??
    "info@example.com",
};
