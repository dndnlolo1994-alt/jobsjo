import { getNotifier } from "@/lib/notifications";
import { env } from "@/lib/env";
import { formatDateArabic } from "@/lib/utils";

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
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-t: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
          <p style="margin: 0;">هذا إشعار تلقائي لتأكيد استلام طلبك. الرجاء عدم الرد على هذه الرسالة.</p>
          <p style="margin: 4px 0 0 0;">جوبز الأردن — منصة التوظيف المحلية الموثوقة وباني السيرة الذاتية مجاناً.</p>
          <p style="margin: 4px 0 0 0;"><a href="${env.SITE_URL}" style="color: #059669; text-decoration: none; font-weight: bold;">jojobs-os.vercel.app</a></p>
        </div>
      </div>
    </div>
  `;

  await notifier.send({
    to: opts.to,
    subject,
    html,
    text: `مرحباً ${opts.applicantName}، تم استلام طلبك بنجاح لوظيفة ${opts.jobTitle} في ${opts.companyName}. رقم الطلب: #${opts.applicationId}. تابع طلباتك في: ${boardUrl}`
  });
}

interface EmployerEmailOptions {
  to: string;
  jobTitle: string;
  applicantFirstName: string;
  appliedAt: Date;
  reviewUrl: string;
}

export async function sendNewApplicationAlert(opts: EmployerEmailOptions) {
  const notifier = getNotifier();
  const dateStr = formatDateArabic(opts.appliedAt);

  const subject = `طلب جديد على وظيفة: ${opts.jobTitle}`;

  const html = `
    <div dir="rtl" style="font-family: 'Cairo', 'Readex Pro', Arial, sans-serif; background-color: #f8fafc; padding: 20px; text-align: right; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(15,23,42,0.03);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 20px; font-weight: bold; font-family: 'Cairo', sans-serif;">بوابة الشركات — جوبز الأردن</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #94a3b8; font-weight: bold;">تنبيه طلب توظيف جديد</p>
        </div>

        <!-- Body -->
        <div style="padding: 24px;">
          <h2 style="font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 0;">لديك طلب جديد على وظيفتك! ⚡</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #475569;">لقد تقدم باحث عن عمل جديد لشغل وظيفتك الشاغرة عبر المنصة. تفاصيل الطلب:</p>

          <!-- Details Box -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; text-align: right;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b; width: 110px;">💼 الوظيفة:</td>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #0f172a;">${opts.jobTitle}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b;">👤 المتقدم:</td>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #059669;">${opts.applicantFirstName} (الاسم الأول محمي)</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b;">📅 وقت التقديم:</td>
                <td style="padding: 6px 0; font-weight: bold; font-size: 12px; color: #334155;">${dateStr}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin-bottom: 24px;">
            ⚠️ لحماية خصوصية بيانات الباحثين عن عمل، يرجى مراجعة تفاصيل السيرة الذاتية المهنية الكاملة للمرشح، وفتح بيانات الاتصال أو تنزيل الـ PDF الرسمي مباشرة من لوحة التحكم الخاصة بك.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 28px 0 10px 0;">
            <a href="${opts.reviewUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 10px rgba(15,23,42,0.15);">
              🔍 مراجعة وفحص طلب التقديم
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-t: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
          <p style="margin: 0;">هذا الإشعار مرسل تلقائياً لإدارة شواغر التوظيف الخاصة بفرع شركتك.</p>
          <p style="margin: 4px 0 0 0;">جميع الحقوق محفوظة © 2026 منصة جوبز الأردن.</p>
        </div>
      </div>
    </div>
  `;

  await notifier.send({
    to: opts.to,
    subject,
    html,
    text: `لديك طلب جديد على وظيفتك "${opts.jobTitle}". المتقدم: ${opts.applicantFirstName}. لمراجعة الطلب يرجى تسجيل الدخول إلى لوحة التحكم: ${opts.reviewUrl}`
  });
}
