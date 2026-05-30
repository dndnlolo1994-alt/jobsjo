import { env } from "@/lib/env";

export const emailSignature = {
  name: "محمد الشمايلة",
  title: "صاحب منصة Jordan Jobs / وظائف الأردن",
  email: "info@jordan-job.shop",
  phoneDisplay: "+962 79 056 5018",
  whatsapp: "962790565018",
};

type BrandedEmailOptions = {
  preheader?: string;
  title: string;
  subtitle?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function brandedEmailLayout({ preheader, title, subtitle, bodyHtml, ctaLabel, ctaHref }: BrandedEmailOptions) {
  const siteUrl = env.SITE_URL;
  const contactEmail = env.COMPANY_EMAIL || env.CONTACT_EMAIL || emailSignature.email;
  const whatsapp = env.PLATFORM_WHATSAPP || emailSignature.whatsapp;
  const whatsappDisplay = whatsapp === emailSignature.whatsapp ? emailSignature.phoneDisplay : `+${whatsapp}`;
  const whatsappUrl = `https://wa.me/${whatsapp}`;

  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#eef2ff;font-family:'Cairo','Tajawal',Arial,sans-serif;color:#172033;text-align:right;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</div>` : ""}
    <div style="max-width:640px;margin:0 auto;padding:22px 12px;">
      <div style="overflow:hidden;border-radius:22px;border:1px solid #dbe4ff;background:#ffffff;box-shadow:0 18px 45px rgba(15,23,42,0.08);">
        <div style="background:linear-gradient(135deg,#0f172a 0%,#173047 52%,#0a0c16 100%);padding:30px 28px;text-align:center;color:#ffffff;">
          <div style="font-size:24px;font-weight:900;letter-spacing:-0.3px;">وظائف الأردن <span style="color:#d8b86a;">Jordan Jobs</span></div>
          <div style="margin-top:6px;font-size:13px;font-weight:700;color:#d7e3ff;">منصة توظيف أردنية احترافية للباحثين والشركات</div>
          <div style="display:inline-block;margin-top:16px;border:1px solid rgba(216,184,106,0.55);border-radius:999px;background:rgba(216,184,106,0.16);padding:7px 16px;color:#f5df9d;font-size:13px;font-weight:900;">${title}</div>
          ${subtitle ? `<p style="margin:12px auto 0;max-width:500px;color:#dbeafe;font-size:13px;line-height:1.8;">${subtitle}</p>` : ""}
        </div>

        <div style="padding:28px;line-height:1.9;font-size:14px;">
          ${bodyHtml}
          ${ctaLabel && ctaHref ? `
            <div style="text-align:center;margin:28px 0 8px;">
              <a href="${ctaHref}" style="display:inline-block;border-radius:14px;background:linear-gradient(135deg,#c0a368,#8b7340);color:#ffffff;text-decoration:none;font-weight:900;padding:13px 28px;box-shadow:0 10px 24px rgba(139,115,64,0.28);">${ctaLabel}</a>
            </div>
          ` : ""}
        </div>

        <div style="border-top:1px solid #e5e7eb;background:#f8fafc;padding:24px 28px;">
          <div style="border:1px solid #e0d9c5;border-radius:18px;background:#ffffff;padding:18px;">
            <div style="font-size:12px;font-weight:900;color:#8b7340;letter-spacing:.2px;margin-bottom:8px;">تواصل رسمي من إدارة وظائف الأردن</div>
            <div style="font-size:15px;color:#0f172a;line-height:1.8;">
              مع الاحترام،<br />
              <strong style="font-size:18px;color:#0f172a;">${emailSignature.name}</strong><br />
              <span style="color:#475569;font-weight:700;">${emailSignature.title}</span>
            </div>
            <div style="margin-top:14px;border-top:1px solid #eef2f7;padding-top:14px;display:block;font-size:13px;line-height:2;">
              <div>
                <span style="display:inline-block;min-width:86px;color:#64748b;font-weight:800;">الإيميل:</span>
                <a href="mailto:${contactEmail}" style="color:#1B4FDB;text-decoration:none;font-weight:900;">${contactEmail}</a>
              </div>
              <div>
                <span style="display:inline-block;min-width:86px;color:#64748b;font-weight:800;">واتساب:</span>
                <a href="${whatsappUrl}" style="color:#047857;text-decoration:none;font-weight:900;" dir="ltr">${whatsappDisplay}</a>
              </div>
              <div>
                <span style="display:inline-block;min-width:86px;color:#64748b;font-weight:800;">الموقع:</span>
                <a href="${siteUrl}" style="color:#1B4FDB;text-decoration:none;font-weight:900;">www.jordan-job.shop</a>
              </div>
            </div>
          </div>
          <p style="margin:14px 0 0;text-align:center;color:#94a3b8;font-size:11px;line-height:1.7;">هذه رسالة رسمية من منصة وظائف الأردن. إذا احتجت مساعدة، تواصل معنا عبر الإيميل أو واتساب أعلاه.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
