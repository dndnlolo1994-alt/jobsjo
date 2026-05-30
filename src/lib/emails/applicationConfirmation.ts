import { getNotifier } from "@/lib/notifications";
import { env } from "@/lib/env";
import { formatDateArabic } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo/site";
import { brandedEmailLayout, emailSignature } from "./layout";

// Job Type Arabic labels helper
const JOB_TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "دوام كامل",
  PART_TIME: "دوام جزئي",
  SHIFT: "ورديات / شفتات",
  TEMPORARY: "عمل مؤقت",
  INTERNSHIP: "تدريب مهني",
  REMOTE: "عمل عن بعد",
  HYBRID: "دوام هجين",
};

interface SeekerEmailOptions {
  to: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  city: string;
  jobType: string;
  salary: string | null;
  applicationId: string;
  appliedAt: Date;
}

export async function sendApplicationConfirmation(opts: SeekerEmailOptions) {
  const notifier = getNotifier();
  const dateStr = formatDateArabic(opts.appliedAt);
  const typeStr = JOB_TYPE_LABEL[opts.jobType] || opts.jobType;
  const salaryStr = opts.salary || "غير محدد / طبقاً للمقابلة";
  const boardUrl = `${env.SITE_URL}/me/applications/board`;
  const contactEmail = env.COMPANY_EMAIL || env.CONTACT_EMAIL || emailSignature.email;
  const whatsapp = env.PLATFORM_WHATSAPP || emailSignature.whatsapp;
  const whatsappDisplay = whatsapp === emailSignature.whatsapp ? emailSignature.phoneDisplay : `+${whatsapp}`;
  const whatsappUrl = `https://wa.me/${whatsapp}`;

  const subject = `تم استلام طلبك — ${opts.jobTitle} في ${opts.companyName}`;

  const html = `
    <div dir="rtl" style="font-family: 'Cairo', 'Readex Pro', Arial, sans-serif; background-color: #f8fafc; padding: 20px; text-align: right; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(15,23,42,0.03);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669, #047857); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold; font-family: 'Cairo', sans-serif;">جوبز الأردن — JoJobs</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #a7f3d0; font-weight: bold;">بوابة التوظيف المحلية والأقرب إليك</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 0;">مرحباً ${opts.applicantName} 👋</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">لقد تم استلام طلب التقديم الخاص بك بنجاح. إليك تفاصيل الوظيفة التي قدمت عليها:</p>

          <!-- Job Details Box -->
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b; width: 100px;">💼 الوظيفة:</td>
                <td style="padding: 6px 0; font-weight: 800; font-size: 14px; color: #0f172a;">${opts.jobTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b;">🏢 الشركة:</td>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #059669;">${opts.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b;">📍 المدينة:</td>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #334155;">${opts.city}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b;">🕐 نوع الدوام:</td>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #334155;">${typeStr}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b;">💰 الراتب:</td>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #334155;">${salaryStr}</td>
              </tr>
            </table>
          </div>

          <div style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 24px;">
            <div>📋 <strong>رقم الطلب:</strong> #${opts.applicationId}</div>
            <div style="margin-top: 4px;">📅 <strong>تاريخ التقديم:</strong> ${dateStr}</div>
          </div>

          <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 8px;">ماذا يحدث بعد ذلك؟</h3>
          <p style="font-size: 13px; line-height: 1.6; color: #475569; margin-top: 0; margin-bottom: 24px;">
            طلبك الآن معروض في لوحة تحكم الشركة لمراجعته. ستتلقى إشعارات تحديث الحالة مباشرة عبر المنصة أو البريد الإلكتروني عند اتخاذ أي إجراء من صاحب العمل.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 28px 0 10px 0;">
            <a href="${boardUrl}" style="background-color: #059669; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 10px rgba(5,150,105,0.15);">
              عرض ومتابعة طلباتي 📥
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-t: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.7;">
          <p style="margin: 0;">هذا إشعار تلقائي لتأكيد استلام طلبك. الرجاء عدم الرد على هذه الرسالة.</p>
          <p style="margin: 4px 0 0 0;">جوبز الأردن — منصة التوظيف المحلية الموثوقة وباني السيرة الذاتية مجاناً.</p>
          <p style="margin: 8px 0 0 0; color:#334155;">${emailSignature.name} — ${emailSignature.title}</p>
          <p style="margin: 4px 0 0 0;">
            <a href="mailto:${contactEmail}" style="color:#059669;text-decoration:none;font-weight:bold;">${contactEmail}</a>
            <span style="color:#94a3b8;"> | </span>
            <a href="${whatsappUrl}" style="color:#059669;text-decoration:none;font-weight:bold;" dir="ltr">${whatsappDisplay}</a>
          </p>
          <p style="margin: 4px 0 0 0;"><a href="${env.SITE_URL}" style="color: #059669; text-decoration: none; font-weight: bold;">www.jordan-job.shop</a></p>
        </div>
      </div>
    </div>
  `;

  return notifier.send({
    to: opts.to,
    subject,
    html,
    text: `مرحباً ${opts.applicantName}، تم استلام طلبك بنجاح لوظيفة ${opts.jobTitle} في ${opts.companyName}. رقم الطلب: #${opts.applicationId}. تابع طلباتك في: ${boardUrl}`
  });
}

interface CvExperience { position: string; company: string; startDate: string; endDate?: string | null; description?: string | null; }
interface CvEducation  { degree: string; institution: string; startDate?: string | null; endDate?: string | null; }

interface EmployerEmailOptions {
  to: string;
  jobTitle: string;
  applicantName: string;
  applicantPhone?: string | null;
  applicantEmail?: string | null;
  applicantCity?: string | null;
  applicantHeadline?: string | null;
  applicantSummary?: string | null;
  skills?: string | null;
  educationLevel?: string | null;
  experiences?: CvExperience[];
  educations?: CvEducation[];
  coverNote?: string | null;
  cvId?: string | null;
  cvUrl?: string | null;
  appliedAt: Date;
  reviewUrl: string;
}

const EDU_LABEL: Record<string, string> = {
  NONE: "—", HIGH_SCHOOL: "ثانوية عامة", DIPLOMA: "دبلوم", BACHELOR: "بكالوريوس", MASTER: "ماجستير", PHD: "دكتوراه",
};

export async function sendNewApplicationAlert(opts: EmployerEmailOptions) {
  const notifier = getNotifier();
  const dateStr = formatDateArabic(opts.appliedAt);
  const siteUrl = absoluteUrl("/");
  const contactEmail = env.COMPANY_EMAIL || env.CONTACT_EMAIL || emailSignature.email;
  const whatsapp = env.PLATFORM_WHATSAPP || emailSignature.whatsapp;
  const whatsappDisplay = whatsapp === emailSignature.whatsapp ? emailSignature.phoneDisplay : `+${whatsapp}`;
  const whatsappUrl = `https://wa.me/${whatsapp}`;

  const subject = `⚡ متقدم جديد على وظيفة "${opts.jobTitle}" — جوبز الأردن`;

  const skillBadges = opts.skills
    ? opts.skills.split(",").filter(Boolean).slice(0, 8)
        .map(s => `<span style="display:inline-block;background:#EBF0FF;color:#1340B5;border:1px solid #C7D6FF;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:bold;margin:2px;">${s.trim()}</span>`)
        .join("")
    : "";

  const experienceRows = (opts.experiences ?? []).slice(0, 3).map(ex => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">
        <div style="font-weight:bold;font-size:13px;color:#0f172a;">${ex.position}</div>
        <div style="font-size:12px;color:#64748b;">${ex.company} &nbsp;·&nbsp; ${ex.startDate}${ex.endDate ? ` – ${ex.endDate}` : " – الحالي"}</div>
        ${ex.description ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px;line-height:1.5;">${ex.description.slice(0, 120)}${ex.description.length > 120 ? "…" : ""}</div>` : ""}
      </td>
    </tr>`).join("");

  const educationRows = (opts.educations ?? []).slice(0, 2).map(ed => `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid #f1f5f9;">
        <div style="font-weight:bold;font-size:12px;color:#0f172a;">${ed.degree}</div>
        <div style="font-size:11px;color:#64748b;">${ed.institution}${ed.endDate ? ` · ${ed.endDate}` : ""}</div>
      </td>
    </tr>`).join("");

  const cvLink = opts.cvUrl || (opts.cvId ? absoluteUrl(`/cv/${opts.cvId}`) : "");
  const whatsappLink = opts.applicantPhone ? `https://wa.me/${opts.applicantPhone.replace(/\D/g, "")}` : "";

  const html = `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
  <body style="margin:0;padding:0;background:#EDF1FF;font-family:'Cairo','Readex Pro',Arial,sans-serif;direction:rtl;">
  <div style="max-width:620px;margin:0 auto;padding:20px 0;">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#1B4FDB 0%,#4F79FF 50%,#7C3AED 100%);border-radius:20px 20px 0 0;padding:32px 28px;text-align:center;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-30px;left:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.08);"></div>
      <div style="position:absolute;bottom:-20px;right:-20px;width:80px;height:80px;border-radius:50%;background:rgba(255,107,53,0.15);"></div>
      <div style="position:relative;z-index:1;">
        <div style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">جوبز الأردن <span style="color:#FFB347;">JoJobs</span></div>
        <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px;font-weight:600;">www.jordan-job.shop — منصة التوظيف المحلية #1 في الأردن</div>
        <div style="display:inline-block;background:rgba(255,107,53,0.25);border:1px solid rgba(255,107,53,0.5);border-radius:20px;padding:6px 18px;margin-top:14px;color:#FFD0A0;font-size:13px;font-weight:bold;">
          ⚡ طلب توظيف جديد وصلك الآن
        </div>
      </div>
    </div>

    <!-- ALERT BANNER -->
    <div style="background:#FF6B35;padding:14px 28px;text-align:center;">
      <span style="color:#ffffff;font-size:15px;font-weight:900;">متقدم جديد على وظيفة: &quot;${opts.jobTitle}&quot;</span>
    </div>

    <!-- MAIN CARD -->
    <div style="background:#ffffff;padding:28px;border:1px solid #e2e8f0;border-top:none;">

      <!-- Applicant Profile Header -->
      <div style="background:linear-gradient(135deg,#f8fafc,#EDF1FF);border-radius:14px;padding:20px;margin-bottom:22px;border:1px solid #e2e8f0;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#1B4FDB,#7C3AED);display:flex;align-items:center;justify-content:center;font-size:22px;color:#ffffff;font-weight:bold;flex-shrink:0;">
            ${opts.applicantName ? opts.applicantName.charAt(0) : "م"}
          </div>
          <div>
            <div style="font-size:17px;font-weight:900;color:#0f172a;">${opts.applicantName}</div>
            ${opts.applicantHeadline ? `<div style="font-size:13px;color:#4F79FF;font-weight:bold;margin-top:2px;">${opts.applicantHeadline}</div>` : ""}
            <div style="font-size:12px;color:#64748b;margin-top:3px;">
              ${opts.applicantCity ? `📍 ${opts.applicantCity}` : ""}
              ${opts.educationLevel && EDU_LABEL[opts.educationLevel] ? ` &nbsp;·&nbsp; 🎓 ${EDU_LABEL[opts.educationLevel]}` : ""}
            </div>
          </div>
        </div>

        <!-- Contact Row -->
        <div style="margin-top:16px;padding-top:14px;border-top:1px solid #e2e8f0;display:flex;flex-wrap:wrap;gap:10px;">
          ${opts.applicantPhone ? `<a href="tel:${opts.applicantPhone}" style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:bold;text-decoration:none;">📞 ${opts.applicantPhone}</a>` : ""}
          ${opts.applicantEmail ? `<a href="mailto:${opts.applicantEmail}" style="background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:bold;text-decoration:none;">✉️ ${opts.applicantEmail}</a>` : ""}
          ${whatsappLink ? `<a href="${whatsappLink}" style="background:#f0fdf4;color:#166534;border:1px solid #86efac;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:bold;text-decoration:none;">💬 واتساب</a>` : ""}
        </div>
      </div>

      <!-- Skills -->
      ${skillBadges ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:8px;">🛠️ المهارات</div>
        <div>${skillBadges}</div>
      </div>` : ""}

      ${opts.applicantSummary ? `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-right:4px solid #1B4FDB;border-radius:10px;padding:14px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:800;color:#1e3a8a;margin-bottom:6px;">🧾 نبذة مختصرة عن المتقدم</div>
        <div style="font-size:13px;color:#334155;line-height:1.7;">${opts.applicantSummary.slice(0, 500)}${opts.applicantSummary.length > 500 ? "…" : ""}</div>
      </div>` : ""}

      <!-- Cover Note -->
      ${opts.coverNote ? `
      <div style="background:#fffbeb;border:1px solid #fde68a;border-right:4px solid #F59E0B;border-radius:10px;padding:14px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:800;color:#92400e;margin-bottom:6px;">💬 رسالة التقديم</div>
        <div style="font-size:13px;color:#78350f;line-height:1.7;">${opts.coverNote.slice(0, 400)}${opts.coverNote.length > 400 ? "…" : ""}</div>
      </div>` : ""}

      <!-- Experience -->
      ${experienceRows ? `
      <div style="margin-bottom:20px;">
        <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:8px;">💼 الخبرات العملية</div>
        <table style="width:100%;border-collapse:collapse;">${experienceRows}</table>
      </div>` : ""}

      <!-- Education -->
      ${educationRows ? `
      <div style="margin-bottom:24px;">
        <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:8px;">🎓 التعليم</div>
        <table style="width:100%;border-collapse:collapse;">${educationRows}</table>
      </div>` : ""}

      <!-- Meta -->
      <div style="background:#f8fafc;border-radius:10px;padding:12px 16px;margin-bottom:24px;font-size:12px;color:#64748b;">
        <span>📅 تاريخ التقديم: <strong style="color:#334155;">${dateStr}</strong></span>
        &nbsp;·&nbsp;
        <span>🔒 مرسل عبر منصة <strong style="color:#1B4FDB;">جوبز الأردن</strong></span>
      </div>

      <!-- CTA Buttons -->
      <div style="text-align:center;margin:28px 0 10px;">
        <a href="${opts.reviewUrl}" style="display:inline-block;background:linear-gradient(135deg,#1B4FDB,#4F79FF);color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:12px;font-weight:900;font-size:15px;box-shadow:0 6px 20px rgba(27,79,219,0.30);margin:0 6px 10px;">
          🔍 مراجعة الطلب كاملاً بدون تسجيل دخول
        </a>
        ${cvLink ? `<a href="${cvLink}" style="display:inline-block;background:linear-gradient(135deg,#059669,#10B981);color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:12px;font-weight:900;font-size:14px;box-shadow:0 6px 20px rgba(5,150,105,0.25);margin:0 6px 10px;">
          📄 عرض السيرة الذاتية وطباعتها PDF
        </a>` : ""}
        ${cvLink ? `<div style="font-size:11px;color:#64748b;margin-top:4px;">يمكن لصاحب العمل فتح السيرة وطباعتها أو حفظها PDF مباشرة من المتصفح.</div>` : ""}
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:linear-gradient(135deg,#1A1D2E,#0F1120);border-radius:0 0 20px 20px;padding:20px 28px;text-align:center;">
      <div style="font-size:16px;font-weight:900;color:#ffffff;margin-bottom:6px;">جوبز الأردن</div>
      <div style="font-size:11px;color:#64748b;line-height:1.7;">
        هذا إشعار تلقائي أُرسل من منصة جوبز الأردن بإشراف ${emailSignature.name} — ${emailSignature.title}. للتواصل أو الاستفسار:
        <a href="mailto:${contactEmail}" style="color:#4F79FF;text-decoration:none;font-weight:bold;">${contactEmail}</a>
        &nbsp;|&nbsp;
        <a href="${whatsappUrl}" style="color:#4F79FF;text-decoration:none;font-weight:bold;" dir="ltr">${whatsappDisplay}</a>
        <br/>
        <a href="${siteUrl}" style="color:#4F79FF;text-decoration:none;font-weight:bold;">www.jordan-job.shop</a>
        &nbsp;·&nbsp; جميع الحقوق محفوظة © 2026
      </div>
    </div>

  </div>
  </body>
  </html>`;

  return notifier.send({
    to: opts.to,
    subject,
    html,
    text: `متقدم جديد على وظيفتك "${opts.jobTitle}": ${opts.applicantName}${opts.applicantPhone ? ` — ${opts.applicantPhone}` : ""}${opts.coverNote ? `\n\nرسالته: ${opts.coverNote.slice(0, 200)}` : ""}\n\nراجع الطلب بدون تسجيل دخول: ${opts.reviewUrl}${cvLink ? `\nعرض السيرة وطباعتها PDF: ${cvLink}` : ""}`,
  });
}

interface StatusUpdateEmailOptions {
  to: string;
  applicantName: string;
  jobTitle: string;
  companyName: string;
  status: string;
  statusLabel: string;
  updatedAt: Date;
}

export async function sendApplicationStatusUpdate(opts: StatusUpdateEmailOptions) {
  const notifier = getNotifier();
  const boardUrl = `${env.SITE_URL}/me/applications/board`;
  const updatedAt = formatDateArabic(opts.updatedAt);
  const subject = `تحديث على طلبك — ${opts.statusLabel} | ${opts.jobTitle}`;

  const tone = opts.status === "HIRED"
    ? { bg: "#ecfdf5", border: "#a7f3d0", color: "#065f46", title: "مبروك، طلبك وصل لمرحلة متقدمة." }
    : opts.status === "REJECTED"
      ? { bg: "#fff1f2", border: "#fecdd3", color: "#9f1239", title: "تم تحديث حالة الطلب." }
      : opts.status === "INTERVIEW"
        ? { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", title: "صاحب العمل نقل طلبك لمرحلة المقابلة." }
        : { bg: "#fffbeb", border: "#fde68a", color: "#92400e", title: "طلبك يتحرك داخل مسار المراجعة." };

  const text = `مرحباً ${opts.applicantName}، تم تحديث حالة طلبك لوظيفة ${opts.jobTitle} في ${opts.companyName} إلى: ${opts.statusLabel}. تابع الطلب من: ${boardUrl}`;
  const html = brandedEmailLayout({
    title: "تحديث حالة طلب التقديم",
    subtitle: "نرسل لك هذا التحديث فور تغيير حالة طلبك من صاحب العمل أو إدارة المنصة.",
    preheader: text,
    ctaLabel: "فتح لوحة تتبع الطلبات",
    ctaHref: boardUrl,
    bodyHtml: `
      <p style="margin:0 0 12px;">مرحباً <strong>${opts.applicantName}</strong>،</p>
      <p style="margin:0 0 16px;">تم تحديث حالة طلبك على وظيفة <strong>${opts.jobTitle}</strong> لدى <strong>${opts.companyName}</strong>.</p>
      <div style="background:${tone.bg};border:1px solid ${tone.border};border-radius:16px;padding:18px;margin:18px 0;color:${tone.color};">
        <div style="font-size:13px;font-weight:900;margin-bottom:6px;">${tone.title}</div>
        <div style="font-size:22px;font-weight:900;">${opts.statusLabel}</div>
        <div style="font-size:12px;margin-top:6px;color:#64748b;">تاريخ التحديث: ${updatedAt}</div>
      </div>
      <p style="margin:16px 0 0;color:#64748b;font-size:13px;">يمكنك متابعة كل طلباتك من لوحة التتبع داخل حسابك.</p>
    `,
  });

  return notifier.send({ to: opts.to, subject, text, html });
}
